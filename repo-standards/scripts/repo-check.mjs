#!/usr/bin/env node
// Audits a local checkout against the standards in the github-skills repo, and runs the two CI gates.
//
//   node repo-check.mjs [dir]                      audit only, changes nothing
//   node repo-check.mjs [dir] --fix                also copies missing templates, never overwrites
//   node repo-check.mjs [dir] --github <o/r>       also reads branch rules on dev and prod (GET only)
//   node repo-check.mjs [dir] --json               print results as JSON
//   node repo-check.mjs gate <base dir> <changed>  fail when the changed paths touch a gate file
//   node repo-check.mjs pr <base dir> --pr <n>     check a PR body against the base branch's declared shape
//
// The audit prints one line per check with its owning skill and exits 1 when any check fails.
// The gates read their rules from <base dir>, a checkout of the PR's base commit, never from the PR.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const TEMPLATES_DIR = join(HERE, '..', 'references', 'templates')
const PR_BODY = join(HERE, '..', '..', 'pr-template', 'scripts', 'pr-body.mjs')

// Must match SECTIONS in pr-template/scripts/rules.mjs. The test compares them.
export const PR_SECTIONS = ['ELI5', 'What Changed', 'Why', 'Linked Issue', 'Proof', 'Testing', 'Risk',
  'AI Disclosure', 'Review', 'Checklist']

// The per-repo declaration. Gate files include it, so a PR cannot change the rules that judge it.
export const DECLARATION = '.github/repo-standards'
export const GATE_PATHS = ['.github/workflows/', DECLARATION, '.github/risk-paths', '.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']

// A {{field}} a person still has to fill. ${{ expr }} is a GitHub Actions expression, not a field.
export const PLACEHOLDER = /(?<!\$)\{\{\s*[^{}$]+?\s*\}\}/

// Template file, install path, and a test for "the repo already has one", so --fix never adds a second.
export const INSTALLS = [
  { source: 'PULL_REQUEST_TEMPLATE.md', target: '.github/PULL_REQUEST_TEMPLATE.md', present: repo => repo.prTemplate() },
  { source: 'bug.yml', target: '.github/ISSUE_TEMPLATE/bug.yml', present: repo => repo.issueFiles().some(n => /bug/i.test(n)) },
  { source: 'feature.yml', target: '.github/ISSUE_TEMPLATE/feature.yml', present: repo => repo.issueFiles().some(n => FEATURE.test(n)) },
  { source: 'config.yml', target: '.github/ISSUE_TEMPLATE/config.yml', present: repo => repo.issueFiles().some(n => /^config\.ya?ml$/i.test(n)) },
  { source: 'ci.yml', target: '.github/workflows/ci.yml', present: repo => !!repo.ciWorkflow() || repo.workflows().some(w => /^ci\.ya?ml$/i.test(w.name)) },
  { source: 'skills-check.yml', target: '.github/workflows/skills-check.yml', present: repo => repo.workflows().some(w => /repo-check\.mjs\s+gate\b/.test(w.text) || /^skills-check\.ya?ml$/i.test(w.name)) },
  { source: 'SECURITY.md', target: 'SECURITY.md', present: repo => !!repo.find(/^security\.md$/i) },
  { source: 'CODEOWNERS', target: '.github/CODEOWNERS', present: repo => !!repo.find(/^codeowners$/i) },
  { source: 'AGENTS.md', target: 'AGENTS.md', present: repo => !!repo.find(/^agents\.md$/i, ['']) },
]

const FEATURE = /feat|enhanc|request|idea|proposal/i
const HEALTH_DIRS = ['.github', '', 'docs'] // GitHub's order of precedence
const UNTRUSTED = /\$\{\{\s*github\.(event\.(pull_request|issue|comment|review|review_comment|discussion|head_commit|commits|pages)\b[^}]*\b(title|body|message|label|ref|name|email|default_branch)\b|head_ref)[^}]*\}\}/
const EM_DASH = String.fromCharCode(0x2014)

function git(dir, args) {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

// "owner/repo" from a GitHub remote URL, or null.
export function parseRemote(url) {
  const match = /github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url ?? '')
  return match ? { owner: match[1], repo: match[2] } : null
}

// .github/repo-standards: "pr-sections: A, B, C" declares the repo's own PR shape,
// "pr-template: <path>" names the template that holds it, and each "gate: <path>" adds a gate file.
export function parseDeclaration(text) {
  const lines = (text ?? '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  const value = key => lines.find(l => l.startsWith(`${key}:`))?.slice(key.length + 1).trim()
  const sections = value('pr-sections')
  return {
    sections: sections ? sections.split(',').map(s => s.trim()).filter(Boolean) : null,
    template: value('pr-template') ?? null,
    gates: lines.filter(l => l.startsWith('gate:')).map(l => l.slice(5).trim()).filter(Boolean),
  }
}

// A read-only view of the checkout. Every lookup ignores case, as GitHub does.
export function openRepo(dir, { trackedFiles } = {}) {
  const read = path => { try { return readFileSync(join(dir, path), 'utf8') } catch { return null } }
  const list = path => { try { return readdirSync(join(dir, path)) } catch { return [] } }
  const isFile = path => { try { return statSync(join(dir, path)).isFile() } catch { return false } }
  const find = (re, dirs = HEALTH_DIRS) => {
    for (const d of dirs) {
      const hit = list(d).find(n => re.test(n) && isFile(join(d, n)))
      if (hit) return d ? `${d}/${hit}` : hit
    }
    return null
  }
  const issueDir = list('.github').find(n => /^issue_template$/i.test(n))
  const issueFiles = () => (issueDir ? list(`.github/${issueDir}`) : [])
  const workflows = () => list('.github/workflows').filter(n => /\.ya?ml$/i.test(n))
    .map(n => ({ name: n, path: `.github/workflows/${n}`, text: read(`.github/workflows/${n}`) ?? '' }))
  const ciWorkflow = () => {
    const named = /^ci:\s*(.+)$/m.exec(read('.github/risk-paths') ?? '')?.[1]?.trim() ?? 'ci'
    const re = new RegExp(`^name:\\s*['"]?${named.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\s*$`, 'm')
    return workflows().find(w => re.test(w.text)) ?? null
  }
  const prTemplate = () => {
    const file = find(/^pull_request_template\.md$/i)
    if (file) return file
    for (const d of HEALTH_DIRS) {
      const sub = list(d).find(n => /^pull_request_template$/i.test(n))
      if (sub) return d ? `${d}/${sub}/` : `${sub}/`
    }
    return null
  }
  const declaration = () => parseDeclaration(read(DECLARATION))
  const tracked = () => trackedFiles ?? (git(dir, ['ls-files'])?.split('\n').filter(Boolean) ?? null)
  return { dir, read, list, find, issueDir: () => issueDir, issueFiles, workflows, ciWorkflow, prTemplate, declaration, tracked }
}

const ok = (id, owner, message) => ({ id, owner, status: 'pass', message })
const bad = (id, owner, message, fix) => ({ id, owner, status: 'fail', message, fix })
const warn = (id, owner, message, fix) => ({ id, owner, status: 'warn', message, fix })
const pending = (id, owner, message) => ({ id, owner, status: 'pending', message: `${message} (the ${owner} skill is not in the repo yet)` })
const skip = (id, owner, message) => ({ id, owner, status: 'skip', message })

export function headingsOf(markdown) {
  return [...markdown.replace(/<!--[\s\S]*?-->/g, '').replace(/^```[\s\S]*?^```/gm, '').matchAll(/^##\s+(.+?)\s*$/gm)]
    .map(m => (m[1] === 'Visual Proof' ? 'Proof' : m[1]))
}

// The ## sections of a body, skipping headings inside fenced code. A fence left open runs to the end.
function sectionParts(text) {
  const parts = []
  let fence = null
  for (const line of text.split('\n')) {
    const mark = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (fence) {
      if (mark && mark[1][0] === fence[0] && mark[1].length >= fence.length && !mark[2].trim()) fence = null
    } else if (mark) {
      fence = mark[1]
    } else if (heading) {
      parts.push({ name: heading[1], body: [] })
      continue
    }
    parts.at(-1)?.body.push(line)
  }
  return parts
}

// Problems with a PR body against a declared shape: each section present, in order, and not empty.
export function shapeProblems(body, sections) {
  const text = (body ?? '').replace(/\r\n/g, '\n')
  const parts = sectionParts(text.replace(/<!--[\s\S]*?-->/g, ''))
  const found = parts.map(p => p.name)
  const problems = []
  for (const s of sections) if (!found.includes(s)) problems.push(`missing section: ${s}`)
  const order = found.filter(s => sections.includes(s))
  if (order.join('|') !== sections.filter(s => found.includes(s)).join('|')) problems.push(`sections out of order: ${order.join(', ')}`)
  for (const part of parts) {
    if (sections.includes(part.name) && !part.body.join('\n').trim()) problems.push(`empty section: ${part.name}`)
  }
  if (PLACEHOLDER.test(text)) problems.push('unfilled {{field}}')
  if (text.includes(EM_DASH)) problems.push('em dash')
  return problems
}

// Changed paths that are gate files under the base branch's rules.
export function gateHits(changed, declaration) {
  const gates = [...GATE_PATHS, ...declaration.gates]
  return changed.filter(path => gates.some(g => (g.endsWith('/') ? path.startsWith(g) : path === g)))
}

// Lines inside run: steps of a workflow, so an expression there can be checked for injection.
export function runLines(text) {
  const out = []
  let indent = -1
  for (const line of text.split(/\r?\n/)) {
    const start = /^(\s*)(?:-\s+)?run:\s*(.*)$/.exec(line)
    const depth = line.search(/\S/)
    if (start) {
      indent = start[1].length
      out.push(start[2])
    } else if (indent >= 0 && (depth > indent || line.trim() === '')) {
      out.push(line)
    } else {
      indent = -1
    }
  }
  return out
}

function checkWorkflows(repo) {
  const results = []
  const wfs = repo.workflows()
  const injected = wfs.filter(w => runLines(w.text).some(line => UNTRUSTED.test(line))).map(w => w.path)
  results.push(injected.length
    ? bad('workflows.injection', 'repo-standards', `untrusted event text expanded inside run: in ${injected.join(', ')}`, 'Pass the value through env: and read "$VAR" in the script.')
    : ok('workflows.injection', 'repo-standards', 'no event text expanded inside run:'))
  const targetCheckout = wfs.filter(w => /pull_request_target/.test(w.text) && /uses:\s*['"]?actions\/checkout@/.test(w.text)).map(w => w.path)
  results.push(targetCheckout.length
    ? bad('workflows.pr-target', 'repo-standards', `pull_request_target with a checkout in ${targetCheckout.join(', ')}`, 'Use pull_request. Never run PR code under a privileged token.')
    : ok('workflows.pr-target', 'repo-standards', 'no pull_request_target workflow checks out code'))
  const noPerms = wfs.filter(w => !/^permissions:/m.test(w.text)).map(w => w.path)
  results.push(noPerms.length
    ? warn('workflows.permissions', 'repo-standards', `no top-level permissions: in ${noPerms.join(', ')}`, 'Add permissions: contents: read at the top and raise it per job.')
    : ok('workflows.permissions', 'repo-standards', 'every workflow sets top-level permissions'))
  const unpinned = [...new Set(wfs.flatMap(w => [...w.text.matchAll(/^\s*-?\s*uses:\s*['"]?([^\s'"#]+)/gm)].map(m => m[1])))]
    .filter(u => !u.startsWith('./') && !u.startsWith('docker://') && !/@[0-9a-f]{40}$/.test(u))
  results.push(unpinned.length
    ? warn('workflows.pinned', 'repo-standards', `actions not pinned to a commit SHA: ${unpinned.join(', ')}`, 'Pin each to a full SHA with the tag in a comment.')
    : ok('workflows.pinned', 'repo-standards', 'every action is pinned to a commit SHA'))
  return results
}

const GATE_STEP = /repo-check\.mjs\s+gate\b/
const BODY_STEP = /repo-check\.mjs\s+pr\b|pr-body\.mjs\s+check\s+--pr/

function checkCi(repo) {
  const results = []
  const ci = repo.ciWorkflow()
  results.push(ci
    ? ok('ci.workflow', 'review-gate', `${ci.path} is the ci workflow`)
    : bad('ci.workflow', 'review-gate', 'no workflow named "ci" (or the name in .github/risk-paths), so review-gate stays on ask', 'Run --fix to install .github/workflows/ci.yml.'))
  if (ci) {
    results.push(/\b(node --test|npm test|pnpm test|yarn test|bun test|cargo test|go test|pytest|make test)\b/.test(ci.text)
      ? ok('ci.tests', 'repo-standards', `${ci.path} runs the tests`)
      : bad('ci.tests', 'repo-standards', `${ci.path} runs no test command`, 'Run the repo\'s tests in the ci workflow.'))
  }

  // The gates may sit in any workflow. skills-check.yml is the one --fix installs.
  const wfs = repo.workflows()
  const holding = re => wfs.filter(w => re.test(w.text))
  const steps = [
    ['gates.integrity', 'repo-standards', GATE_STEP, 'the gate-integrity check'],
    ['gates.pr-body', 'pr-template', BODY_STEP, 'the PR body check'],
    ['gates.readme', 'readme', /readme-check\.mjs[^\n]*--online/, 'readme-check.mjs --online'],
  ]
  for (const [id, owner, re, what] of steps) {
    const found = holding(re)
    results.push(found.length
      ? ok(id, owner, `${found.map(w => w.path).join(', ')} runs ${what}`)
      : bad(id, owner, `no workflow runs ${what}`, 'Run --fix to install .github/workflows/skills-check.yml.'))
  }
  const fetching = holding(/repository:\s*['"]?Jeff-Kazzee\/github-skills/)
  const unpinned = fetching.filter(w => !/repository:\s*['"]?Jeff-Kazzee\/github-skills['"]?[\s\S]{0,200}?ref:\s*['"]?[0-9a-f]{40}\b/.test(w.text))
  results.push(fetching.length === 0
    ? bad('gates.pinned', 'repo-standards', 'no workflow fetches the checkers from Jeff-Kazzee/github-skills', 'Fetch them at a pinned SHA. Never copy them into the repo.')
    : unpinned.length
      ? bad('gates.pinned', 'repo-standards', `checkers not pinned to a commit SHA in ${unpinned.map(w => w.path).join(', ')}`, 'Set ref: to a full 40-character SHA.')
      : ok('gates.pinned', 'repo-standards', 'the checkers are fetched at a pinned commit SHA'))
  const gates = [...new Set([...holding(GATE_STEP), ...holding(BODY_STEP)])]
  const writes = gates.filter(w => /:\s*write\b/.test(w.text) || /gh\s+pr\s+close|state:\s*['"]?closed/.test(w.text)).map(w => w.path)
  if (gates.length) {
    results.push(writes.length
      ? bad('gates.block-only', 'repo-standards', `${writes.join(', ')} can write to the repo or close PRs`, 'The required check blocks a merge. It never closes, labels or edits a PR.')
      : ok('gates.block-only', 'repo-standards', 'the gates are read-only, so they block and never close'))
    const noEdit = holding(BODY_STEP).filter(w => !/\bedited\b/.test(w.text)).map(w => w.path)
    if (noEdit.length) results.push(warn('gates.on-edit', 'pr-template', `${noEdit.join(', ')} does not rerun when a PR body is edited`, 'Add types: [opened, edited, reopened, synchronize, ready_for_review].'))
  }
  results.push(pending('gates.docs', 'repo-docs', 'docs check'))
  return results
}

function checkIssues(repo) {
  const dir = repo.issueDir()
  const files = repo.issueFiles()
  const form = re => files.find(n => re.test(n) && /\.ya?ml$/i.test(n) && !/^config\./i.test(n))
  const results = []
  const bug = form(/bug/i)
  if (!bug) {
    const md = files.find(n => /bug/i.test(n) && /\.md$/i.test(n))
    results.push(md
      ? warn('issues.bug-form', 'issues-and-releases', `bug template ${md} is Markdown, not a form`, 'Convert it to a YAML issue form with required fields.')
      : bad('issues.bug-form', 'issues-and-releases', 'no bug report form', 'Run --fix to install .github/ISSUE_TEMPLATE/bug.yml.'))
  } else {
    const text = repo.read(`.github/${dir}/${bug}`) ?? ''
    const missing = [
      [/^name:/m, 'name'], [/^description:/m, 'description'], [/^body:/m, 'body'], [/required:\s*true/, 'a required field'],
      [/reproduc|steps|what did you do/i, 'a reproduction'], [/expect/i, 'what was expected'], [/version|commit|sha/i, 'a version'],
    ].filter(([re]) => !re.test(text)).map(([, what]) => what)
    results.push(missing.length
      ? bad('issues.bug-form', 'issues-and-releases', `${bug} lacks ${missing.join(', ')}`, 'Ask the four questions in references/templates/bug.yml.')
      : ok('issues.bug-form', 'issues-and-releases', `${bug} asks the bug questions`))
  }
  const feature = form(FEATURE)
  if (!feature) {
    results.push(bad('issues.feature-form', 'issues-and-releases', 'no feature request form', 'Run --fix to install .github/ISSUE_TEMPLATE/feature.yml.'))
  } else {
    const text = repo.read(`.github/${dir}/${feature}`) ?? ''
    results.push(/required:\s*true/.test(text) && /problem|use case|motivation|why/i.test(text)
      ? ok('issues.feature-form', 'issues-and-releases', `${feature} asks for the problem`)
      : bad('issues.feature-form', 'issues-and-releases', `${feature} has no required problem field`, 'Ask for the problem and who has it before the proposal.'))
  }
  const configName = files.find(n => /^config\.ya?ml$/i.test(n))
  if (!configName) {
    results.push(bad('issues.config', 'issues-and-releases', 'no ISSUE_TEMPLATE/config.yml', 'Run --fix to install it.'))
  } else {
    const text = repo.read(`.github/${dir}/${configName}`) ?? ''
    const gaps = [
      !/blank_issues_enabled:\s*false/.test(text) && 'blank issues are on',
      !/security/i.test(text) && 'no contact link for security reports',
    ].filter(Boolean)
    results.push(gaps.length
      ? warn('issues.config', 'issues-and-releases', `${configName}: ${gaps.join(', ')}`, 'Set blank_issues_enabled: false and link private vulnerability reporting.')
      : ok('issues.config', 'issues-and-releases', 'blank issues off, security reports go private'))
  }
  return results
}

function checkPrTemplate(repo) {
  const pr = repo.prTemplate()
  if (!pr) return [bad('pr-template.present', 'pr-template', 'no pull request template', 'Run --fix to install .github/PULL_REQUEST_TEMPLATE.md.')]
  if (pr.endsWith('/')) return [warn('pr-template.present', 'pr-template', `${pr} holds several templates, so GitHub fills none by default`, 'Add .github/PULL_REQUEST_TEMPLATE.md as the default.')]
  const results = [ok('pr-template.present', 'pr-template', `${pr} found`)]
  const heads = headingsOf(repo.read(pr) ?? '')
  const declared = repo.declaration().sections
  if (declared) {
    results.push(heads.join('|') === declared.join('|')
      ? ok('pr-template.format', 'pr-template', `${pr} matches the shape declared in ${DECLARATION} (${declared.length} sections)`)
      : bad('pr-template.format', 'pr-template', `${pr} differs from the shape declared in ${DECLARATION}`, 'Make the template and pr-sections: list the same headings.'))
  } else {
    results.push(heads.join('|') === PR_SECTIONS.join('|')
      ? ok('pr-template.format', 'pr-template', 'template has the pr-template sections in order')
      : warn('pr-template.format', 'pr-template', `template sections differ: ${heads.join(', ') || 'none'}`,
        `Keep it and declare it with "pr-sections: ${heads.join(', ')}" in ${DECLARATION}, or ask Jeff before replacing it.`))
  }
  return results
}

function checkFiles(repo) {
  const results = []
  const readme = repo.find(/^readme(\.md|\.markdown|\.rst|\.txt)?$/i)
  results.push(readme ? ok('readme.present', 'readme', `${readme} found`) : bad('readme.present', 'readme', 'no README', 'Write it with the readme skill.'))
  const license = repo.find(/^(license|licence|copying)(\..+)?$/i, [''])
  results.push(license ? ok('license.present', 'repo-standards', `${license} found`) : bad('license.present', 'repo-standards', 'no LICENSE at the root', 'Ask Jeff which license. GitHub has no default license file.'))
  const contributing = repo.find(/^contributing(\..+)?$/i)
  results.push(contributing
    ? ok('contributing.present', 'contributing', `${contributing} found`)
    : bad('contributing.present', 'contributing', 'no CONTRIBUTING.md', 'Write it with the contributing skill.'))
  const security = repo.find(/^security\.md$/i)
  if (!security) {
    results.push(bad('security.present', 'repo-standards', 'no SECURITY.md', 'Run --fix to install SECURITY.md, then fill its fields.'))
  } else {
    const text = repo.read(security) ?? ''
    results.push(/https?:\/\//.test(text) && /vulnerab/i.test(text)
      ? ok('security.present', 'repo-standards', `${security} names a private reporting channel`)
      : bad('security.present', 'repo-standards', `${security} gives no link for reporting a vulnerability`, 'Link private vulnerability reporting, as in references/templates/SECURITY.md.'))
  }
  const owners = repo.find(/^codeowners$/i)
  if (!owners) {
    results.push(bad('codeowners.present', 'repo-standards', 'no CODEOWNERS', 'Run --fix to install .github/CODEOWNERS.'))
  } else {
    results.push(/^\s*(\/\.github\/|\/?\*)\s+@/m.test(repo.read(owners) ?? '')
      ? ok('codeowners.present', 'repo-standards', `${owners} covers .github/`)
      : warn('codeowners.present', 'repo-standards', `${owners} gives no owner for .github/`, 'Add "/.github/ @<owner>" so gate changes need the owner.'))
  }
  return [...results, ...checkPrTemplate(repo)]
}

function checkAgents(repo) {
  const results = []
  const agents = repo.find(/^agents\.md$/i, [''])
  if (!agents) {
    results.push(bad('agents.git-law', 'repo-standards', 'no AGENTS.md', 'Run --fix to install AGENTS.md, then fill its fields.'))
  } else {
    results.push(/git law/i.test(repo.read(agents) ?? '')
      ? ok('agents.git-law', 'repo-standards', `${agents} names the Git law`)
      : bad('agents.git-law', 'repo-standards', `${agents} does not name the Git law`, 'Add the Git section from references/templates/AGENTS.md.'))
  }
  const claude = repo.find(/^claude\.md$/i, [''])
  if (claude) {
    const lines = (repo.read(claude) ?? '').split('\n').filter(l => l.trim())
    results.push(lines.length <= 5 && /agents\.md/i.test(lines.join('\n'))
      ? ok('agents.claude-router', 'repo-standards', `${claude} routes to AGENTS.md`)
      : warn('agents.claude-router', 'repo-standards', `${claude} holds policy (${lines.length} lines)`, 'Move policy to AGENTS.md and cut CLAUDE.md to a pointer.'))
  }
  return results
}

function checkSecrets(repo) {
  const tracked = repo.tracked()
  if (!tracked) return [skip('secrets.env-files', 'repo-standards', 'not a git checkout, tracked files unknown')]
  const leaked = tracked.filter(p => /(^|\/)\.env(\.[\w-]+)*$/.test(p) && !/\.(schema|example|sample|template)$/.test(p))
  return [leaked.length
    ? bad('secrets.env-files', 'repo-standards', `env files are tracked: ${leaked.join(', ')}`, 'Remove them from git, rotate what they held, and declare names in .env.schema.')
    : ok('secrets.env-files', 'repo-standards', 'no .env file is tracked')]
}

function checkPlaceholders(repo) {
  const unfilled = INSTALLS.map(i => i.target).filter(t => PLACEHOLDER.test(repo.read(t) ?? ''))
  return [unfilled.length
    ? bad('templates.filled', 'repo-standards', `unfilled {{field}} in ${unfilled.join(', ')}`, 'Fill each field. Ask Jeff for anything you cannot confirm.')
    : ok('templates.filled', 'repo-standards', 'no installed file has an unfilled field')]
}

// Rules recommended per branch. Only dev carries the required checks: prod changes only by promotion.
const WANT = {
  dev: { types: ['pull_request', 'required_status_checks', 'non_fast_forward', 'deletion'], checks: ['skills-check', 'gate-integrity'] },
  prod: { types: ['pull_request', 'non_fast_forward', 'deletion'], checks: [] },
}

function checkBranches(repo, rules) {
  const remote = git(repo.dir, ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin'])
  const results = []
  if (process.env.GITHUB_ACTIONS) {
    results.push(skip('branches.dev-prod', 'repo-standards', 'a CI checkout fetches one branch, so branches are not read here'))
  } else if (remote === null || remote === '') {
    results.push(skip('branches.dev-prod', 'repo-standards', 'no origin remote to read'))
  } else {
    const names = remote.split('\n').map(n => n.replace(/^origin\//, ''))
    const missing = ['dev', 'prod'].filter(b => !names.includes(b) && !(b === 'prod' && names.includes('main')))
    results.push(missing.length
      ? warn('branches.dev-prod', 'repo-standards', `origin has no ${missing.join(' or ')} branch`, 'Ask Jeff to create dev from prod and make prod the default branch.')
      : ok('branches.dev-prod', 'repo-standards', 'origin has dev and prod'))
  }
  if (!rules) {
    results.push(skip('branches.rules', 'repo-standards', 'pass --github <owner/repo> to read branch rules'))
    return results
  }
  for (const [branch, want] of Object.entries(WANT)) {
    const got = rules[branch]
    if (!got) { results.push(skip(`branches.rules.${branch}`, 'repo-standards', `could not read rules for ${branch}`)); continue }
    const gaps = [...want.types.filter(t => !got.types.includes(t)), ...want.checks.filter(c => !got.checks.includes(c)).map(c => `required check ${c}`)]
    results.push(gaps.length
      ? warn(`branches.rules.${branch}`, 'repo-standards', `${branch} rulesets lack ${gaps.join(', ')}`, 'Recommend the ruleset to Jeff. Agents never change it.')
      : ok(`branches.rules.${branch}`, 'repo-standards', `${branch} rules match the recommendation`))
  }
  return results
}

// Active ruleset rules per branch, read with GET only. Classic branch protection is not visible here.
export function readRules(fullName) {
  const out = {}
  for (const branch of Object.keys(WANT)) {
    try {
      const rules = JSON.parse(execFileSync('gh', ['api', `repos/${fullName}/rules/branches/${branch}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
      out[branch] = {
        types: rules.map(r => r.type),
        checks: rules.flatMap(r => r.parameters?.required_status_checks ?? []).map(c => c.context),
      }
    } catch {
      out[branch] = null
    }
  }
  return out
}

export function audit(dir, options = {}) {
  const repo = openRepo(dir, options)
  return [
    ...checkFiles(repo), ...checkIssues(repo), ...checkCi(repo), ...checkWorkflows(repo),
    ...checkAgents(repo), ...checkSecrets(repo), ...checkPlaceholders(repo), ...checkBranches(repo, options.rules),
    pending('discussions.templates', 'discussions', 'discussion category forms'),
  ]
}

// Copies each missing template. Opens with "wx", so an existing file is never touched.
export function fix(dir, fields = {}) {
  const repo = openRepo(dir)
  const created = []
  for (const item of INSTALLS) {
    if (item.present(repo)) continue
    let text = readFileSync(join(TEMPLATES_DIR, item.source), 'utf8')
    for (const [key, value] of Object.entries(fields)) if (value) text = text.replaceAll(`{{${key}}}`, value)
    const issueDir = repo.issueDir()
    const path = issueDir ? item.target.replace('/ISSUE_TEMPLATE/', `/${issueDir}/`) : item.target
    const target = join(dir, path)
    mkdirSync(dirname(target), { recursive: true })
    try {
      writeFileSync(target, text, { flag: 'wx' })
      created.push(path)
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
  }
  return created
}

// Fields --fix can fill from the checkout: the GitHub owner and name, and a pushed commit of these skills.
// The SHA counts only when this script sits in a checkout of Jeff-Kazzee/github-skills, so a copy
// inside another repo never pins that repo's commit.
export function knownFields(dir) {
  const fields = { ...parseRemote(git(dir, ['remote', 'get-url', 'origin'])) }
  const home = parseRemote(git(HERE, ['remote', 'get-url', 'origin']))
  const sha = git(HERE, ['rev-parse', 'HEAD'])
  const official = home?.owner === 'Jeff-Kazzee' && home.repo === 'github-skills'
  if (official && sha && git(HERE, ['branch', '-r', '--contains', sha])) fields.github_skills_sha = sha
  return fields
}

function gateMain([base, changedFile]) {
  if (!base || !changedFile) return usage()
  const changed = readFileSync(changedFile, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const hits = gateHits(changed, openRepo(resolve(base)).declaration())
  if (hits.length === 0) {
    console.log(`ok: ${changed.length} changed paths, no gate file`)
    return 0
  }
  console.log(`gate files changed, so Jeff decides how this lands:\n${hits.map(h => `  ${h}`).join('\n')}`)
  return 1
}

function prMain([base, flag, number]) {
  if (!base || flag !== '--pr' || !/^\d+$/.test(number ?? '')) return usage()
  const declaration = openRepo(resolve(base)).declaration()
  if (!declaration.sections) {
    if (!existsSync(PR_BODY)) {
      console.error(`${PR_BODY} not found. Check out the whole github-skills repo.`)
      return 2
    }
    return spawnSync(process.execPath, [PR_BODY, 'check', '--pr', number], { stdio: 'inherit' }).status ?? 2
  }
  const repoArgs = process.env.GITHUB_REPOSITORY ? ['-R', process.env.GITHUB_REPOSITORY] : []
  let body
  try {
    body = execFileSync('gh', ['pr', 'view', number, ...repoArgs, '--json', 'body', '--jq', '.body'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (error) {
    console.error(`could not read PR ${number} with gh: ${String(error.stderr ?? error.message).trim()}`)
    return 2
  }
  const problems = shapeProblems(body, declaration.sections)
  if (problems.length) {
    console.log(`PR body does not match the shape declared in ${DECLARATION}:\n${problems.map(p => `  ${p}`).join('\n')}`)
    return 1
  }
  console.log(`ok: ${declaration.sections.length} declared sections`)
  return 0
}

function usage() {
  console.error('usage: repo-check.mjs [dir] [--fix] [--github <owner/repo>] [--json]\n       repo-check.mjs gate <base dir> <changed-files>\n       repo-check.mjs pr <base dir> --pr <number>')
  return 2
}

function main(argv) {
  if (argv[0] === 'gate') return gateMain(argv.slice(1))
  if (argv[0] === 'pr') return prMain(argv.slice(1))
  const valueOf = name => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined)
  const github = valueOf('--github')
  if (argv.includes('--github') && !/^[\w.-]+\/[\w.-]+$/.test(github ?? '')) return usage()
  const dir = resolve(argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--github') ?? '.')
  if (!existsSync(dir)) {
    console.error(`${dir}: no such directory`)
    return 2
  }
  if (argv.includes('--fix')) for (const path of fix(dir, knownFields(dir))) console.log(`added ${path}`)
  const results = audit(dir, { rules: github ? readRules(github) : undefined })
  if (argv.includes('--json')) console.log(JSON.stringify(results, null, 2))
  else {
    for (const r of results) {
      console.log(`${r.status.toUpperCase().padEnd(7)} ${r.id.padEnd(22)} [${r.owner}] ${r.message}`)
      if (r.fix && r.status !== 'pass') console.log(`${' '.repeat(31)}fix: ${r.fix}`)
    }
    const count = s => results.filter(r => r.status === s).length
    console.log(`\n${count('pass')} pass, ${count('fail')} fail, ${count('warn')} warn, ${count('pending')} pending, ${count('skip')} skip`)
  }
  return results.some(r => r.status === 'fail') ? 1 : 0
}

// Installed copies are often links, so compare real paths.
const invoked = process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null
if (invoked === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2))
