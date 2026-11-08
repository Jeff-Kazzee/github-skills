// What makes a change risky, judged from the diff and the checks. risk-floor.mjs is the command line.
// Nothing here reads the PR description, so nothing written there can lower a level.

// A path that matches puts the change at High. A lockfile stands for a dependency change, since a
// package.json edit without one changed no dependency.
export const TRIGGERS = [
  ['CI or release config', /(^|\/)\.github\/|(^|\/)(\.gitlab-ci\.yml|\.circleci\/|Jenkinsfile|\.goreleaser)/i],
  ['the rules agents follow', /(^|\/)(AGENTS|CLAUDE|CLAUDE\.local|GEMINI|SKILL)\.md$|(^|\/)CODEOWNERS$|(^|\/)\.(claude|claude-plugin|clinerules|codex|cursor|entire|githooks|husky|junie|kiro|roo|windsurf)(\/|$)|(^|\/)(\.mcp\.json|plugin\.json|\.pre-commit-config\.yaml|lefthook\.ya?ml)$|(^|\/)hooks\/hooks\.json$|(^|\/)(prompts?|skills)\/|(^|\/)plugins\/[^/]+\/(hooks|commands|agents)\/|(^|\/)(commands|agents)\/.*\.md$/i],
  ['secrets or permissions', /(^|\/)\.env(\.|$)|(^|[/._-])(auth|oauth|saml|sso|login|sessions?|permissions?|rbac|acl|secrets?|credentials?|crypto|security)([/._-]|$)/i],
  ['money', /(^|[/._-])(billing|payments?|stripe|invoices?|checkout|subscriptions?|pricing)([/._-]|$)/i],
  ['saved data', /(^|\/)(migrat(e|ions?)|alembic\/versions)(\/|[._-])|\.sql$|(^|\/)schema\.(prisma|rb)$|(^|\/)drizzle\//i],
  ['dependencies', /(^|\/)(\.gitmodules|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?|requirements[^/]*\.txt|pyproject\.toml|poetry\.lock|uv\.lock|go\.(mod|sum)|Cargo\.(toml|lock)|Gemfile(\.lock)?|composer\.(json|lock))$/i],
  ['deploy or infrastructure', /(^|\/)(Dockerfile[^/]*|docker-compose[^/]*|compose\.ya?ml|wrangler\.(toml|jsonc?)|vercel\.json|netlify\.toml|fly\.toml)$|\.tf$|(^|\/)(k8s|helm|terraform|deploy|infra)\//i],
]

// Google's guide calls 1000 lines usually too large. Size can raise a level. Smallness never lowers one.
export const MAX_LINES = 1000

const PROSE = /\.(md|rst)$|(^|\/)(LICENSE|NOTICE|CHANGELOG|AUTHORS)$/
const TESTS = /(^|\/)(tests?|__tests__)\/|\.(test|spec)\.[cm]?[jt]sx?$|_(test|spec)\.(go|py|rb)$|(^|\/)test_[^/]+\.py$/i
const GENERATED = /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?|poetry\.lock|uv\.lock|go\.sum|Cargo\.lock|Gemfile\.lock|composer\.lock|golden\.json)$|\.snap$/i

const BROKEN = new Set(['failure', 'startup_failure', 'timed_out', 'cancelled', 'action_required', 'stale'])

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

// CI is green only when the repo's named workflow succeeded on this commit. A review bot, a skipped
// check, an unrelated workflow, or a run that never started proves nothing. Runs are kept per event,
// because a pull_request run tests the merge and can fail while the push run passes.
export function ciState(checkRuns, workflowRuns, required = 'ci') {
  const runs = newest(workflowRuns, run => `${run.name}|${run.event}`)
  const all = [...newest(checkRuns, run => run.name), ...runs]
  if (all.some(run => BROKEN.has(run.conclusion))) return 'failed'
  if (all.some(run => run.status !== 'completed')) return 'still running'
  return runs.some(run => run.name === required && run.conclusion === 'success') ? 'green' : 'did not run'
}

// A rename counts under both names, so moving a file out of auth/ does not hide it.
function paths(file) {
  return file.previous ? [file.path, file.previous] : [file.path]
}

function named(paths) {
  return paths.length > 1 ? `${paths[0]} and ${paths.length - 1} more` : paths[0]
}

// The lowest level this change can have and the lane it takes. A reviewer can raise either, never lower it.
export function floor({ files, base, trusted, draft = false, ci, extra = [] }) {
  const reasons = []
  for (const [label, pattern] of [...TRIGGERS, ...extra.map(pattern => ['a path this repo marks High', pattern])]) {
    const hits = files.flatMap(paths).filter(path => pattern.test(path))
    if (hits.length) reasons.push(`${label}: ${named(hits)}`)
  }
  const lines = files.filter(file => !GENERATED.test(file.path))
    .reduce((sum, file) => sum + file.additions + file.deletions, 0)
  if (lines > MAX_LINES) reasons.push(`${lines} changed lines, over ${MAX_LINES}`)

  const blockers = []
  if (!files.length) blockers.push('no changed files reported')
  if (base !== 'dev') blockers.push(`base is ${base}, and only a task PR into dev can skip Jeff`)
  if (!trusted) blockers.push('the author is outside this team')
  if (draft) blockers.push('still a draft')
  if (ci !== 'green') blockers.push(`CI ${ci}`)

  const onlyProse = files.flatMap(paths).every(path => PROSE.test(path) || TESTS.test(path))
  const level = reasons.length ? 'High' : onlyProse ? 'Low' : 'Medium'
  const lane = level === 'High' || blockers.length ? 'ask' : level === 'Low' ? 'ship' : 'show'
  return { level, lane, reasons, blockers }
}
