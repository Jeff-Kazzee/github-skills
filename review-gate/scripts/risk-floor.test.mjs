import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ciState, floor, MAX_LINES } from './risk-rules.mjs'

const file = (path, additions = 5, deletions = 5, patch) => ({ path, additions, deletions, ...(patch === undefined ? {} : { patch }) })
const judge = (files, overrides = {}) => floor({ files, trusted: true, ci: 'green', ...overrides })
let serial = 0
const actions = (conclusion, status = 'completed', name = `job ${serial++}`, started_at = '2026-11-06T10:00:00Z') =>
  ({ app: { slug: 'github-actions' }, conclusion, status, name, started_at })
const bot = conclusion => ({ app: { slug: 'coderabbitai' }, conclusion, status: 'completed', name: 'CodeRabbit' })
const at = hour => `2026-11-06T${hour}:00:00Z`
const workflow = (conclusion, created_at, name = 'ci', status = 'completed', event = 'pull_request') => ({ name, conclusion, status, created_at, event })

test('the level follows the change, and no result carries merge authority', () => {
  assert.equal(judge([file('docs/guide.md')]).level, 'Low')
  assert.equal(judge([file('src/app.test.ts')]).level, 'Low')
  assert.equal(judge([file('src/app.ts')]).level, 'Medium')
  assert.equal(judge([file('src/app.ts'), file('README.md')]).level, 'Medium')
  assert.equal(judge([file('.github/workflows/ci.yml')]).level, 'High')
  for (const key of Object.keys(judge([file('docs/guide.md')]))) assert.ok(!/merge|lane|approve/i.test(key), key)
})

for (const [path, reason] of [
  ['.github/workflows/ci.yml', 'CI or release config'],
  ['plugins/github/skills/commit/SKILL.md', 'the rules agents follow'],
  ['AGENTS.md', 'the rules agents follow'],
  ['plugins/x/hooks/hooks.json', 'the rules agents follow'],
  ['prompts/system.md', 'the rules agents follow'],
  ['plugins/x/commands/deploy.md', 'the rules agents follow'],
  ['.cursor/rules/style.md', 'the rules agents follow'],
  ['.gitmodules', 'dependencies'],
  ['plugins/github/skills/review-gate/scripts/risk-rules.mjs', 'the rules agents follow'],
  ['plugins/github/skills/review-gate/scripts/risk-floor.test.mjs', 'the rules agents follow'],
  ['plugins/peanut-gallery/hooks/register.tsx', 'the rules agents follow'],
  ['skills/commit/SKILL.md', 'the rules agents follow'],
  ['.clinerules/rules.md', 'the rules agents follow'],
  ['.roo/rules/style.md', 'the rules agents follow'],
  ['.windsurf/rules/style.md', 'the rules agents follow'],
  ['.kiro/steering/style.md', 'the rules agents follow'],
  ['.junie/guidelines.md', 'the rules agents follow'],
  ['CLAUDE.local.md', 'the rules agents follow'],
  ['.mcp.json', 'the rules agents follow'],
  ['.claude-plugin/marketplace.json', 'the rules agents follow'],
  ['plugins/x/.claude-plugin/plugin.json', 'the rules agents follow'],
  ['.pre-commit-config.yaml', 'the rules agents follow'],
  ['lefthook.yml', 'the rules agents follow'],
  ['.githooks/pre-commit', 'the rules agents follow'],
  ['db/migrate/20261106_drop_users.rb', 'saved data'],
  ['alembic/versions/x.py', 'saved data'],
  ['.env.schema', 'secrets or permissions'],
  ['src/auth/session.ts', 'secrets or permissions'],
  ['src/lib/oauth-client.ts', 'secrets or permissions'],
  ['src/billing/plan.ts', 'money'],
  ['db/migrations/0042_add.sql', 'saved data'],
  ['prisma/schema.prisma', 'saved data'],
  ['pyproject.toml', 'dependencies'],
  ['pnpm-lock.yaml', 'dependencies'],
  ['Dockerfile', 'deploy or infrastructure'],
  ['wrangler.toml', 'deploy or infrastructure'],
  ['infra/main.tf', 'deploy or infrastructure'],
]) {
  test(`High: ${path}`, () => {
    const found = judge([file(path)])
    assert.equal(found.level, 'High')
    assert.ok(found.reasons.some(line => line.startsWith(reason)), found.reasons.join())
  })
}

for (const path of ['src/tokenizer.ts', 'src/hooks/useAuthorName.ts', 'src/components/Checkbox.tsx', 'src/authors.ts',
  'src/license.ts', 'src/notice.ts', 'src/changelog.ts', 'docs/app/page.tsx', 'wiki/build.py', 'src/design-tokens.css', 'package.json', 'CMakeLists.txt', 'robots.txt', 'src/commands/build.ts', 'src/agents/list.ts',
  'spec/openapi.yaml', 'spec/schema.json', 'fixtures/default-config.json']) {
  test(`code is never prose, and this is no trigger: ${path}`, () => assert.equal(judge([file(path)]).level, 'Medium'))
}

for (const path of ['LICENSE', 'docs/CHANGELOG', 'notes/plan.md', 'CHANGELOG.md']) {
  test(`prose: ${path}`, () => assert.equal(judge([file(path)]).level, 'Low'))
}

test('a spec or test file by name is still a test', () => {
  assert.equal(judge([file('spec/models/user_spec.rb')]).level, 'Low')
  assert.equal(judge([file('tests/fixtures/sample.json')]).level, 'Low')
})

test('a change that removes test lines is never Low', () => {
  assert.equal(judge([file('src/app.test.ts', 0, 40)]).level, 'Medium')
  assert.equal(judge([file('tests/test_api.py', 2, 3)]).level, 'Medium')
  assert.equal(judge([file('src/app.test.ts', 40, 40)]).level, 'Low')
  assert.equal(judge([file('docs/old.md', 0, 40)]).level, 'Low')
})

for (const [name, path, patch, reason] of [
  ['an install script with no lockfile', 'package.json', '@@ -1 +1 @@\n+    "postinstall": "node setup.js",', 'an install script in the diff'],
  ['a removed prepare script', 'packages/a/package.json', '@@ -1 +1 @@\n-    "prepare": "husky",', 'an install script in the diff'],
  ['a new dependency with no lockfile', 'package.json', '@@ -1 +1 @@\n+    "left-pad": "^1.3.0",', 'a dependency change in the diff'],
  ['a scoped dependency', 'package.json', '@@ -1 +1 @@\n+    "@acme/x": "workspace:*",', 'a dependency change in the diff'],
  ['a shell call in an ordinary file', 'src/utils.ts', "@@ -1 +1 @@\n+import { execSync } from 'node:child_process'", 'a risky call in the diff'],
  ['eval in an ordinary file', 'src/format.js', '@@ -1 +1 @@\n+  return eval(text)', 'a risky call in the diff'],
  ['raw HTML in a component', 'src/Card.tsx', '@@ -1 +1 @@\n+  <div dangerouslySetInnerHTML={html} />', 'a risky call in the diff'],
  ['data loss in plain code', 'src/cleanup.py', '@@ -1 +1 @@\n+    db.run("DELETE FROM users")', 'a risky call in the diff'],
]) {
  test(`content raises the level: ${name}`, () => {
    const found = judge([file(path, 1, 1, patch)])
    assert.equal(found.level, 'High')
    assert.ok(found.reasons.some(line => line.startsWith(reason)), found.reasons.join())
  })
}

test('harmless content stays where it was', () => {
  assert.equal(judge([file('package.json', 1, 1, '@@ -1 +1 @@\n+  "version": "1.2.3",')]).level, 'Medium')
  assert.equal(judge([file('package.json', 1, 1, '@@ -1 +1 @@\n+    "test": "node --test",')]).level, 'Medium')
  assert.equal(judge([file('docs/guide.md', 1, 0, '@@ -1 +1 @@\n+Never run rm -rf here.')]).level, 'Low')
  assert.equal(judge([file('src/app.ts', 0, 1, '@@ -1 +1 @@\n-  eval(text)')]).level, 'Medium')
})

test('a diff GitHub would not show counts as High, and a binary change does not', () => {
  assert.equal(judge([file('src/huge.ts', 400, 0, null)]).level, 'High')
  assert.equal(judge([file('public/logo.png', 0, 0, null)]).level, 'Medium')
})

test('a repo can mark more paths High', () => {
  const found = judge([file('src/ledger.ts')], { extra: [/ledger/i] })
  assert.equal(found.level, 'High')
  assert.equal(found.reasons[0], 'a path this repo marks High: src/ledger.ts')
})

test('a rename counts under both of its names', () => {
  const moved = (path, previous) => ({ ...file(path), previous })
  assert.equal(judge([moved('src/helpers.ts', 'src/auth/helpers.ts')]).level, 'High')
  assert.equal(judge([moved('notes/app.md', 'src/app.ts')]).level, 'Medium')
  assert.equal(judge([moved('docs/old.md', 'docs/new.md')]).level, 'Low')
})

test('size can raise a level, and generated files do not count toward it', () => {
  assert.equal(judge([file('src/app.ts', MAX_LINES, 0)]).level, 'Medium')
  assert.equal(judge([file('src/app.ts', MAX_LINES, 1)]).level, 'High')
  assert.equal(judge([file('docs/long.md', MAX_LINES + 1, 0)]).level, 'High')
  assert.equal(judge([file('src/app.ts'), file('scripts/golden.json', 9000, 0)]).level, 'Medium')
})

test('an outside author or a promotion is High, and a base branch name decides nothing', () => {
  assert.equal(judge([file('docs/guide.md')], { trusted: false }).level, 'High')
  assert.equal(judge([file('docs/guide.md')], { promotion: true }).level, 'High')
  assert.equal(judge([file('docs/guide.md')], { base: 'main' }).level, 'Low')
})

for (const [name, overrides, blocker] of [
  ['a draft', { draft: true }, 'still a draft'],
  ['CI that never ran', { ci: 'did not run' }, 'CI did not run'],
  ['failed CI', { ci: 'failed' }, 'CI failed'],
  ['running CI', { ci: 'still running' }, 'CI still running'],
]) {
  test(`${name} blocks even a docs change`, () => {
    const found = judge([file('docs/guide.md')], overrides)
    assert.equal(found.level, 'Low')
    assert.equal(found.ready, false)
    assert.ok(found.blockers.some(line => line.startsWith(blocker)), found.blockers.join())
  })
}

test('no reported files blocks', () => assert.equal(judge([]).ready, false))
test('a clean High change is ready for review, which is not approval', () => {
  const found = judge([file('.github/workflows/ci.yml')])
  assert.equal(found.ready, true)
  assert.equal(found.level, 'High')
})

test('CI is green only when the named workflow succeeded', () => {
  assert.equal(ciState([], [workflow('success', at(10))]), 'green')
  assert.equal(ciState([actions('skipped')], [workflow('success', at(10))]), 'green')
  assert.equal(ciState([actions('failure')], [workflow('success', at(10))]), 'failed')
  assert.equal(ciState([], [workflow(null, at(10), 'ci', 'in_progress')]), 'still running')
  assert.equal(ciState([], [workflow('success', at(10), 'test suite')], { required: 'test suite' }), 'green')
})

test('a labeler passing proves nothing', () => {
  const labeler = workflow('success', at(10), 'Labeler')
  assert.equal(ciState([actions('success', 'completed', 'label')], [labeler]), 'did not run')
  assert.equal(ciState([], [labeler], { required: 'test suite' }), 'did not run')
  assert.equal(ciState([], [workflow('success', at(10))], { required: 'test suite' }), 'did not run')
})

test('a superseded run of one workflow and event does not count, as on GitHub', () => {
  assert.equal(ciState([], [workflow('cancelled', at(10)), workflow('success', at(11))]), 'green')
  assert.equal(ciState([], [workflow('failure', at(10)), workflow('cancelled', at(11)), workflow('success', at(12))]), 'green')
  assert.equal(ciState([actions('failure', 'completed', 'lint', at(10)), actions('success', 'completed', 'lint', at(11))], [workflow('success', at(10))]), 'green')
})

test('a push run cannot hide a failed pull_request run of the same workflow', () => {
  const push = workflow('success', at(11), 'ci', 'completed', 'push')
  assert.equal(ciState([], [workflow('failure', at(10)), push]), 'failed')
  assert.equal(ciState([], [workflow('success', at(10)), push]), 'green')
})

test('an older pass cannot hide a newer failure, and a newer run still going is not green', () => {
  const green = workflow('success', at(10))
  assert.equal(ciState([], [green, workflow('failure', at(11))]), 'failed')
  assert.equal(ciState([], [green, workflow('cancelled', at(11))]), 'failed')
  assert.equal(ciState([], [green, workflow(null, at(11), 'ci', 'in_progress')]), 'still running')
  assert.equal(ciState([actions('success', 'completed', 'lint', at(10)), actions('failure', 'completed', 'lint', at(11))], [green]), 'failed')
  assert.equal(ciState([{ ...actions(null, 'queued', 'lint'), started_at: null }], [green]), 'still running')
})

test('the named workflow passing does not excuse a different one that failed', () => {
  assert.equal(ciState([], [workflow('success', at(12)), workflow('failure', at(10), 'review gate')]), 'failed')
})

test('two apps can share a check name, and a failure in either counts', () => {
  const vercel = conclusion => ({ app: { slug: 'vercel' }, conclusion, status: 'completed', name: 'build', started_at: at(11) })
  assert.equal(ciState([actions('failure', 'completed', 'build', at(10)), vercel('success')], [workflow('success', at(10))]), 'failed')
})

test('a conclusion this code has never seen, or a blank one, fails closed', () => {
  const green = workflow('success', at(10))
  assert.equal(ciState([actions('some_new_state')], [green]), 'failed')
  assert.equal(ciState([actions(null)], [green]), 'failed')
  assert.equal(ciState([], [green, workflow('weird', at(11), 'other')]), 'failed')
})

test('legacy commit statuses count, and required contexts must have passed', () => {
  const green = workflow('success', at(10))
  const status = (context, state) => ({ context, state })
  assert.equal(ciState([], [green], { statuses: [status('deploy/preview', 'failure')] }), 'failed')
  assert.equal(ciState([], [green], { statuses: [status('deploy/preview', 'error')] }), 'failed')
  assert.equal(ciState([], [green], { statuses: [status('deploy/preview', 'pending')] }), 'still running')
  assert.equal(ciState([], [green], { contexts: ['legacy/test'] }), 'did not run')
  assert.equal(ciState([], [green], { contexts: ['legacy/test'], statuses: [status('legacy/test', 'success')] }), 'green')
  assert.equal(ciState([actions('success', 'completed', 'lint')], [green], { contexts: ['lint'] }), 'green')
  assert.equal(ciState([actions('skipped', 'completed', 'lint')], [green], { contexts: ['lint'] }), 'did not run')
})

test('a failed third-party check counts, and a passing one proves nothing', () => {
  const codeql = conclusion => ({ app: { slug: 'github-advanced-security' }, conclusion, status: 'completed', name: 'CodeQL' })
  assert.equal(ciState([codeql('failure')], [workflow('success', at(10))]), 'failed')
  assert.equal(ciState([codeql('success')], []), 'did not run')
})

test('the false green from PRs 6 and 7: a skipped bot and a run that never started', () => {
  const neverStarted = { status: 'completed', conclusion: 'startup_failure' }
  assert.equal(ciState([bot('skipped')], [neverStarted]), 'failed')
  assert.equal(ciState([bot('skipped')], []), 'did not run')
  assert.equal(ciState([bot('success')], []), 'did not run')
  assert.equal(ciState([], []), 'did not run')
})

// The command line, with every gh call answered by a stub loaded before the script, so nothing leaves the machine.
const SCRIPT = fileURLToPath(new URL('./risk-floor.mjs', import.meta.url))
const STUB = `import cp from 'node:child_process'
import { syncBuiltinESMExports } from 'node:module'
const replies = JSON.parse(process.env.GH_STUB)
cp.execFileSync = (cmd, args) => {
  const call = [cmd, ...args].join(' ')
  const reply = replies.find(([part]) => call.includes(part))
  if (!reply) throw Object.assign(new Error('Command failed: ' + call), { stderr: 'not stubbed: ' + call })
  if (reply.length < 3) return reply[1]
  const failure = typeof reply[2] === 'string' ? { stderr: reply[2] } : reply[2]
  throw Object.assign(new Error('Command failed: ' + call), { stdout: reply[1] }, failure)
}
syncBuiltinESMExports()
`

function floorCli(settings) {
  const dir = mkdtempSync(join(tmpdir(), 'risk-floor-'))
  const stub = join(dir, 'stub.mjs')
  writeFileSync(stub, STUB)
  const sha = 'a'.repeat(40)
  const pr = { baseRefName: 'dev', headRefName: 'task/1-x', headRefOid: sha, author: { login: 'Jeff-Kazzee' }, isCrossRepository: false, isDraft: false, changedFiles: 1 }
  const replies = [
    ...settings,
    ['repo view o/r', 'PRIVATE'],
    ['pulls/5/files', JSON.stringify([[{ filename: 'docs/guide.md', additions: 1, deletions: 0, patch: '+a line' }]])],
    ['check-runs', JSON.stringify([{ check_runs: [] }])],
    ['actions/runs', JSON.stringify([{ workflow_runs: [workflow('success', at('10'))] }])],
    [`commits/${sha}/status`, JSON.stringify({ statuses: [] })],
    ['pr view 5', JSON.stringify(pr)],
  ]
  try {
    return spawnSync(process.execPath, ['--import', pathToFileURL(stub).href, SCRIPT, '5', '--repo', 'o/r'], {
      encoding: 'utf8', env: { ...process.env, GH_STUB: JSON.stringify(replies) },
    })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const absent = what => `gh: Not Found (HTTP 404)\n${what}`
test('unset repository rules answer 404, and the PR is judged without them', () => {
  const run = floorCli([['protection/required_status_checks', '', absent('Branch not protected')], ['contents/.github/risk-paths', '', absent('')]])
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /level Low, nothing blocks it/)
})

test('a plan without branch protection answers 403 with an upgrade message, and counts as no required checks', () => {
  const plan = 'gh: Upgrade to GitHub Pro or make this repository public to enable this feature. (HTTP 403)'
  const run = floorCli([['protection/required_status_checks', '', plan], ['contents/.github/risk-paths', '', absent('')]])
  assert.equal(run.status, 0, run.stderr)
})

test('a 403 that forbids reading repository rules fails closed', () => {
  const forbidden = 'gh: Resource not accessible by integration (HTTP 403)'
  for (const settings of [
    [['protection/required_status_checks', '', forbidden], ['contents/.github/risk-paths', '', forbidden]],
    [['protection/required_status_checks', '', absent('Branch not protected')], ['contents/.github/risk-paths', '', forbidden]],
    [['protection/required_status_checks', '', 'gh: Must have admin rights to Repository. (HTTP 403)'], ['contents/.github/risk-paths', '', absent('')]],
  ]) {
    const run = floorCli(settings)
    assert.equal(run.status, 2, run.stdout)
    assert.doesNotMatch(run.stdout, /nothing blocks it/)
    assert.match(run.stderr, /treat it as blocked/)
  }
})

test('a rule read that fails for any reason but 404 or the plan limit fails closed', () => {
  for (const said of ['gh: Server Error (HTTP 500)', 'gh: Bad credentials (HTTP 401)']) {
    for (const settings of [
      [['protection/required_status_checks', '', said], ['contents/.github/risk-paths', '', absent('')]],
      [['protection/required_status_checks', '', absent('Branch not protected')], ['contents/.github/risk-paths', '', said]],
    ]) {
      const run = floorCli(settings)
      assert.equal(run.status, 2, `${said}: ${run.stdout}`)
      assert.doesNotMatch(run.stdout, /nothing blocks it/)
      assert.match(run.stderr, /treat it as blocked/)
    }
  }
})

test('a plan limit is read from the status and an upgrade message, however GitHub words it', () => {
  for (const plan of ['gh: Upgrade to GitHub Team to enable this feature. (HTTP 403)', 'gh: Upgrade your plan to use protected branches. (HTTP 403)']) {
    const run = floorCli([['protection/required_status_checks', '', plan], ['contents/.github/risk-paths', '', absent('')]])
    assert.equal(run.status, 0, `${plan}: ${run.stderr}`)
  }
})

test('gh answers 404 in the body it prints when its error line says nothing', () => {
  const body = JSON.stringify({ message: 'Branch not protected', status: '404' })
  const run = floorCli([['protection/required_status_checks', body, { stderr: undefined }], ['contents/.github/risk-paths', '', absent('')]])
  assert.equal(run.status, 0, run.stderr)
})

test('a plan message counts only on the protection read of a private repo', () => {
  const plan = 'gh: Upgrade to GitHub Pro or make this repository public to enable this feature. (HTTP 403)'
  for (const settings of [
    [['protection/required_status_checks', '', absent('Branch not protected')], ['contents/.github/risk-paths', '', plan]],
    [['repo view o/r', 'PUBLIC'], ['protection/required_status_checks', '', plan], ['contents/.github/risk-paths', '', absent('')]],
  ]) {
    const run = floorCli(settings)
    assert.equal(run.status, 2, run.stdout)
    assert.match(run.stderr, /treat it as blocked/)
  }
})

test('a failed rule read with no error text fails closed and names the cause', () => {
  for (const failure of [{ stderr: undefined, code: 'ENOENT' }, { stderr: '', code: 'ENOENT' }, { stderr: '', status: 1 }]) {
    const run = floorCli([['protection/required_status_checks', '', failure], ['contents/.github/risk-paths', '', absent('')]])
    assert.equal(run.status, 2, run.stdout)
    assert.match(run.stderr, /gh printed no error/, JSON.stringify(failure))
  }
})
