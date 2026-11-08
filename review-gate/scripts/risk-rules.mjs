// What makes a change risky, judged from the diff and the checks. risk-floor.mjs is the command line.
// Nothing here reads the PR description, so nothing written there can lower a level.
// A level sets review depth. It never grants merge approval.

// A path that matches puts the change at High.
export const TRIGGERS = [
  ['CI or release config', /(^|\/)\.github\/|(^|\/)(\.gitlab-ci\.yml|\.circleci\/|Jenkinsfile|\.goreleaser)/i],
  ['the rules agents follow', /(^|\/)(AGENTS|CLAUDE|CLAUDE\.local|GEMINI|SKILL)\.md$|(^|\/)CODEOWNERS$|(^|\/)\.(claude|claude-plugin|clinerules|codex|cursor|entire|githooks|husky|junie|kiro|roo|windsurf)(\/|$)|(^|\/)(\.mcp\.json|plugin\.json|\.pre-commit-config\.yaml|lefthook\.ya?ml)$|(^|\/)hooks\/hooks\.json$|(^|\/)(prompts?|skills)\/|(^|\/)plugins\/[^/]+\/(hooks|commands|agents)\/|(^|\/)(commands|agents)\/.*\.md$/i],
  ['secrets or permissions', /(^|\/)\.env(\.|$)|(^|[/._-])(auth|oauth|saml|sso|login|sessions?|permissions?|rbac|acl|secrets?|credentials?|crypto|security)([/._-]|$)/i],
  ['money', /(^|[/._-])(billing|payments?|stripe|invoices?|checkout|subscriptions?|pricing)([/._-]|$)/i],
  ['saved data', /(^|\/)(migrat(e|ions?)|alembic\/versions)(\/|[._-])|\.sql$|(^|\/)schema\.(prisma|rb)$|(^|\/)drizzle\//i],
  ['dependencies', /(^|\/)(\.gitmodules|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?|requirements[^/]*\.txt|pyproject\.toml|poetry\.lock|uv\.lock|go\.(mod|sum)|Cargo\.(toml|lock)|Gemfile(\.lock)?|composer\.(json|lock))$/i],
  ['deploy or infrastructure', /(^|\/)(Dockerfile[^/]*|docker-compose[^/]*|compose\.ya?ml|wrangler\.(toml|jsonc?)|vercel\.json|netlify\.toml|fly\.toml)$|\.tf$|(^|\/)(k8s|helm|terraform|deploy|infra)\//i],
]

// A changed line that matches puts the change at High, whatever the file is called. A package.json edit
// can add a dependency or an install script with no lockfile change, so its content is read.
const MANIFEST = /(^|\/)package\.json$/i
const CODE = /^(?!.*\.(md|rst)$)/i
export const CONTENT = [
  ['an install script', MANIFEST, /^[+-]\s*"(preinstall|install|postinstall|prepare|prepublish\w*|prepack)"\s*:/],
  ['a dependency change', MANIFEST, /^[+-]\s*"(?!version"|name"|description"|license"|main"|module"|types"|homepage")[@\w./-]+"\s*:\s*"(\^|~|>|<|=|\*|\d|v\d|workspace:|npm:|git|file:|link:|https?:|latest)/],
  ['a risky call', CODE, /^\+.*(\bchild_process\b|\bexecSync\(|\bspawnSync\(|\beval\(|new Function\(|\bsubprocess\.|\bos\.system\(|dangerouslySetInnerHTML|\bDROP TABLE\b|\bTRUNCATE TABLE\b|\bDELETE FROM\b|\brm -rf\b)/i],
]

// Google's guide calls 1000 lines usually too large. Size can raise a level. Smallness never lowers one.
export const MAX_LINES = 1000

const PROSE = /\.(md|rst)$|(^|\/)(LICENSE|NOTICE|CHANGELOG|AUTHORS)$/
const TESTS = /(^|\/)(tests?|__tests__)\/|\.(test|spec)\.[cm]?[jt]sx?$|_(test|spec)\.(go|py|rb)$|(^|\/)test_[^/]+\.py$/i
const GENERATED = /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?|poetry\.lock|uv\.lock|go\.sum|Cargo\.lock|Gemfile\.lock|composer\.lock|golden\.json)$|\.snap$/i

// Anything else, including a conclusion GitHub adds later or a blank one, counts as a failure.
const PASSED = new Set(['success', 'neutral', 'skipped'])

// A rerun or superseded run shares its key with the one that replaced it, and GitHub counts the newest.
// A run not yet started is newest.
function newest(runs, keyOf) {
  const when = run => run.created_at ?? run.started_at ?? '9999'
  const latest = new Map()
  for (const run of runs) {
    const seen = latest.get(keyOf(run))
    if (!seen || when(run) > when(seen)) latest.set(keyOf(run), run)
  }
  return [...latest.values()]
}

// CI is green only when the repo's named workflow and every required status context passed on this
// commit. A review bot, a skipped check, an unrelated workflow, or a run that never started proves
// nothing. Checks are kept per app, so two apps can share a name, and workflow runs per event, because a
// pull_request run tests the merge and can fail while the push run passes.
export function ciState(checkRuns, workflowRuns, { required = 'ci', statuses = [], contexts = [] } = {}) {
  const checks = newest(checkRuns, run => `${run.app?.slug}|${run.name}`)
  const runs = newest(workflowRuns, run => `${run.name}|${run.event}`)
  const all = [...checks, ...runs]
  const open = all.filter(run => run.status !== 'completed')
  if (all.some(run => run.status === 'completed' && !PASSED.has(run.conclusion))) return 'failed'
  if (statuses.some(status => status.state === 'failure' || status.state === 'error')) return 'failed'
  if (open.length || statuses.some(status => status.state === 'pending')) return 'still running'
  const passedContext = name => checks.some(run => run.name === name && run.conclusion === 'success')
    || statuses.some(status => status.context === name && status.state === 'success')
  if (!runs.some(run => run.name === required && run.conclusion === 'success')) return 'did not run'
  return contexts.every(passedContext) ? 'green' : 'did not run'
}

// A rename counts under both names, so moving a file out of auth/ does not hide it.
function paths(file) {
  return file.previous ? [file.path, file.previous] : [file.path]
}

function named(list) {
  return list.length > 1 ? `${list[0]} and ${list.length - 1} more` : list[0]
}

function contentHits(file) {
  const lines = (file.patch ?? '').split('\n')
  return CONTENT.filter(([, where, what]) => where.test(file.path) && lines.some(line => what.test(line))).map(([label]) => label)
}

// The lowest level this change can have, and what blocks it from reaching Jeff. A reviewer can raise the
// level, never lower it.
export function floor({ files, trusted, draft = false, promotion = false, ci, extra = [] }) {
  const reasons = []
  for (const [label, pattern] of [...TRIGGERS, ...extra.map(pattern => ['a path this repo marks High', pattern])]) {
    const hits = files.flatMap(paths).filter(path => pattern.test(path))
    if (hits.length) reasons.push(`${label}: ${named(hits)}`)
  }
  for (const [label] of CONTENT) {
    const hits = files.filter(file => contentHits(file).includes(label)).map(file => file.path)
    if (hits.length) reasons.push(`${label} in the diff: ${named(hits)}`)
  }
  const unread = files.filter(file => file.patch === null && file.additions + file.deletions > 0).map(file => file.path)
  if (unread.length) reasons.push(`no readable diff: ${named(unread)}`)
  const lines = files.filter(file => !GENERATED.test(file.path))
    .reduce((sum, file) => sum + file.additions + file.deletions, 0)
  if (lines > MAX_LINES) reasons.push(`${lines} changed lines, over ${MAX_LINES}`)
  if (!trusted) reasons.push('the author is outside this team')
  if (promotion) reasons.push('a promotion')

  const blockers = []
  if (!files.length) blockers.push('no changed files reported')
  if (draft) blockers.push('still a draft')
  if (ci !== 'green') blockers.push(`CI ${ci}`)

  // Removing test lines can silence a failure, so it never counts as a safe test change.
  const safe = file => paths(file).every(path => PROSE.test(path) || (TESTS.test(path) && file.deletions <= file.additions))
  const level = reasons.length ? 'High' : files.every(safe) ? 'Low' : 'Medium'
  return { level, reasons, blockers, ready: blockers.length === 0 }
}
