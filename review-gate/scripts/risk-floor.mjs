#!/usr/bin/env node
// Prints the lowest risk level and the lane for a PR, from its diff and its checks.
// Exit 0: ship or show. Exit 1: ask Jeff. Exit 2: could not tell, so treat it as ask.

import { execFileSync } from 'node:child_process'
import { ciState, floor } from './risk-rules.mjs'

const TRUSTED = new Set(['Jeff-Kazzee'])

function gh(...args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 })
}

// Every page, because a failure past the first hundred results still counts.
function pages(path, key) {
  return JSON.parse(gh('api', '--paginate', '--slurp', path)).flatMap(page => key ? page[key] : page)
}

// Read from the base branch, so a PR cannot weaken the rules that judge it.
function repoRules(repo, base) {
  let text
  try {
    text = gh('api', '-H', 'Accept: application/vnd.github.raw+json', `repos/${repo}/contents/.github/risk-paths?ref=${base}`)
  } catch (error) {
    if (/HTTP 404/.test(`${error.stderr}`)) return { extra: [] }
    throw error
  }
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  const named = lines.find(line => line.startsWith('ci:'))
  return {
    required: named?.slice(3).trim(),
    extra: lines.filter(line => line !== named).map(line => new RegExp(line, 'i')),
  }
}

async function main([number, flag, repo]) {
  if (!/^\d+$/.test(number ?? '') || flag !== '--repo' || !repo) {
    throw new Error('usage: risk-floor.mjs <pr number> --repo <owner/name>')
  }
  const pr = JSON.parse(gh('pr', 'view', number, '-R', repo, '--json',
    'baseRefName,headRefOid,author,isCrossRepository,isDraft,changedFiles'))
  const files = pages(`repos/${repo}/pulls/${number}/files?per_page=100`).map(file => ({
    path: file.filename, previous: file.previous_filename, additions: file.additions, deletions: file.deletions,
  }))
  if (files.length !== pr.changedFiles) throw new Error(`saw ${files.length} of ${pr.changedFiles} changed files`)
  const head = pr.headRefOid
  const checks = pages(`repos/${repo}/commits/${head}/check-runs?per_page=100`, 'check_runs')
  const runs = pages(`repos/${repo}/actions/runs?head_sha=${head}&per_page=100`, 'workflow_runs')
  const rules = repoRules(repo, pr.baseRefName)
  const result = floor({
    files,
    base: pr.baseRefName,
    trusted: TRUSTED.has(pr.author.login) && !pr.isCrossRepository,
    draft: pr.isDraft,
    ci: ciState(checks, runs, rules.required),
    extra: rules.extra,
  })
  console.log(`PR #${number} at ${head.slice(0, 7)}: level ${result.level}, lane ${result.lane}`)
  for (const line of [...result.reasons, ...result.blockers]) console.log(`- ${line}`)
  process.exitCode = result.lane === 'ask' ? 1 : 0
}

main(process.argv.slice(2)).catch(error => {
  console.error(`could not judge this PR, so treat it as ask: ${error.message}`)
  process.exitCode = 2
})
