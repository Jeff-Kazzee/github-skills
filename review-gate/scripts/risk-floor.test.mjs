import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ciState, floor, MAX_LINES } from './risk-rules.mjs'

const file = (path, additions = 5, deletions = 5) => ({ path, additions, deletions })
const judge = (files, overrides = {}) => floor({ files, base: 'dev', trusted: true, ci: 'green', ...overrides })
let serial = 0
const actions = (conclusion, status = 'completed', name = `job ${serial++}`, started_at = '2026-11-06T10:00:00Z') =>
  ({ app: { slug: 'github-actions' }, conclusion, status, name, started_at })
const bot = conclusion => ({ app: { slug: 'coderabbitai' }, conclusion, status: 'completed', name: 'CodeRabbit' })
const at = hour => `2026-11-06T${hour}:00:00Z`
const workflow = (conclusion, created_at, name = 'ci', status = 'completed', event = 'pull_request') => ({ name, conclusion, status, created_at, event })

test('lanes follow the level when nothing blocks', () => {
  assert.equal(judge([file('docs/guide.md')]).lane, 'ship')
  assert.equal(judge([file('src/app.test.ts')]).lane, 'ship')
  assert.equal(judge([file('src/app.ts')]).lane, 'show')
  assert.equal(judge([file('src/app.ts'), file('README.md')]).level, 'Medium')
  assert.equal(judge([file('.github/workflows/ci.yml')]).lane, 'ask')
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

for (const [name, overrides, blocker] of [
  ['a promotion', { base: 'prod' }, 'base is prod'],
  ['a stacked PR', { base: 'task/198-github-plugin' }, 'base is task/198'],
  ['an outside author', { trusted: false }, 'the author'],
  ['a draft', { draft: true }, 'still a draft'],
  ['CI that never ran', { ci: 'did not run' }, 'CI did not run'],
  ['failed CI', { ci: 'failed' }, 'CI failed'],
]) {
  test(`${name} goes to Jeff even as a docs change`, () => {
    const found = judge([file('docs/guide.md')], overrides)
    assert.equal(found.level, 'Low')
    assert.equal(found.lane, 'ask')
    assert.ok(found.blockers.some(line => line.startsWith(blocker)), found.blockers.join())
  })
}

test('no reported files goes to Jeff', () => assert.equal(judge([]).lane, 'ask'))

test('CI is green only when the named workflow succeeded', () => {
  assert.equal(ciState([], [workflow('success', at(10))]), 'green')
  assert.equal(ciState([actions('skipped')], [workflow('success', at(10))]), 'green')
  assert.equal(ciState([actions('failure')], [workflow('success', at(10))]), 'failed')
  assert.equal(ciState([], [workflow(null, at(10), 'ci', 'in_progress')]), 'still running')
  assert.equal(ciState([], [workflow('success', at(10), 'test suite')], 'test suite'), 'green')
})

test('a labeler passing proves nothing', () => {
  const labeler = workflow('success', at(10), 'Labeler')
  assert.equal(ciState([actions('success', 'completed', 'label')], [labeler]), 'did not run')
  assert.equal(ciState([], [labeler], 'test suite'), 'did not run')
  assert.equal(ciState([], [workflow('success', at(10))], 'test suite'), 'did not run')
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
