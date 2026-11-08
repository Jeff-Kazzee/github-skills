#!/usr/bin/env node
// Prints the lowest risk level for a PR, and what blocks it, from its diff and its checks.
// Exit 0: nothing blocks it. Exit 1: blocked. Exit 2: could not tell, so treat it as blocked.
// No exit code grants merge approval.

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

// A rule that is not set answers 404, and a plan without branch protection answers 403 with an upgrade
// message. Any other 403 means the token cannot read the rule, so the rule is unknown and the check stops.
function optional(read, fallback) {
  try {
    return read()
  } catch (error) {
    const said = `${error.stderr}`
    if (/HTTP 404/.test(said) || (/HTTP 403/.test(said) && /upgrade to github pro|make this repository public/i.test(said))) return fallback
    if (/HTTP 403/.test(said)) throw new Error(`no access to read the repository rules: ${said.trim()}`)
    throw error
  }
}

// Read from the base branch, so a PR cannot weaken the rules that judge it.
function repoRules(repo, base) {
  const text = optional(() => gh('api', '-H', 'Accept: application/vnd.github.raw+json', `repos/${repo}/contents/.github/risk-paths?ref=${base}`), '')
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  const named = lines.find(line => line.startsWith('ci:'))
  return {
    required: named?.slice(3).trim(),
    extra: lines.filter(line => line !== named).map(line => new RegExp(line, 'i')),
  }
}

function view(number, repo) {
  return JSON.parse(gh('pr', 'view', number, '-R', repo, '--json',
    'baseRefName,headRefName,headRefOid,author,isCrossRepository,isDraft,changedFiles'))
}

async function main([number, flag, repo]) {
  if (!/^\d+$/.test(number ?? '') || flag !== '--repo' || !repo) {
    throw new Error('usage: risk-floor.mjs <pr number> --repo <owner/name>')
  }
  const pr = view(number, repo)
  const head = pr.headRefOid
  const files = pages(`repos/${repo}/pulls/${number}/files?per_page=100`).map(file => ({
    path: file.filename, previous: file.previous_filename, additions: file.additions, deletions: file.deletions, patch: file.patch ?? null,
  }))
  if (files.length !== pr.changedFiles) throw new Error(`saw ${files.length} of ${pr.changedFiles} changed files`)
  const checks = pages(`repos/${repo}/commits/${head}/check-runs?per_page=100`, 'check_runs')
  const runs = pages(`repos/${repo}/actions/runs?head_sha=${head}&per_page=100`, 'workflow_runs')
  const statuses = JSON.parse(gh('api', `repos/${repo}/commits/${head}/status`)).statuses
  const contexts = optional(() => JSON.parse(gh('api', `repos/${repo}/branches/${pr.baseRefName}/protection/required_status_checks`)).contexts, [])
  const rules = repoRules(repo, pr.baseRefName)
  const result = floor({
    files,
    trusted: TRUSTED.has(pr.author.login) && !pr.isCrossRepository,
    draft: pr.isDraft,
    promotion: pr.headRefName === 'dev',
    ci: ciState(checks, runs, { required: rules.required, statuses, contexts }),
    extra: rules.extra,
  })
  if (view(number, repo).headRefOid !== head) throw new Error(`the head moved from ${head.slice(0, 7)} during this check`)
  console.log(`PR #${number} at ${head}: level ${result.level}, ${result.ready ? 'nothing blocks it' : 'blocked'}`)
  for (const line of [...result.reasons, ...result.blockers]) console.log(`- ${line}`)
  console.log('Merge approval stays with Jeff at every level.')
  process.exitCode = result.ready ? 0 : 1
}

main(process.argv.slice(2)).catch(error => {
  console.error(`could not judge this PR, so treat it as blocked: ${error.message}`)
  process.exitCode = 2
})
