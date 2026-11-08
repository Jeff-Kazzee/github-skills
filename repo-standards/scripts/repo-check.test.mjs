import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { afterEach, test } from 'node:test'

import { audit, fix, gateHits, headingsOf, INSTALLS, parseDeclaration, parseRemote, PLACEHOLDER, PR_SECTIONS, runLines, shapeProblems, TEMPLATES_DIR } from './repo-check.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCRIPT = join(HERE, 'repo-check.mjs')
const FILLED = { owner: 'octo', repo: 'demo', github_skills_sha: 'a'.repeat(40) }
const dirs = []

function fixture(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'repo-check-'))
  dirs.push(dir)
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), text)
  }
  return dir
}

function snapshot(dir) {
  const out = {}
  const walk = rel => {
    for (const name of readdirSync(join(dir, rel))) {
      const path = rel ? `${rel}/${name}` : name
      if (statSync(join(dir, path)).isDirectory()) walk(path)
      else out[path] = createHash('sha256').update(readFileSync(join(dir, path))).digest('hex')
    }
  }
  walk('')
  return out
}

const status = (results, id) => results.find(r => r.id === id)?.status
const fail = results => results.filter(r => r.status === 'fail').map(r => r.id)

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true })
})

test('an empty folder fails every required file check', () => {
  const results = audit(fixture(), { trackedFiles: [] })
  for (const id of ['readme.present', 'license.present', 'contributing.present', 'security.present', 'codeowners.present',
    'pr-template.present', 'issues.bug-form', 'issues.feature-form', 'issues.config', 'ci.workflow', 'agents.git-law']) {
    assert.equal(status(results, id), 'fail', id)
  }
  assert.equal(status(results, 'discussions.templates'), 'pending')
})

test('the command line changes nothing without --fix', () => {
  const dir = fixture({ 'README.md': '# demo\n', '.github/ISSUE_TEMPLATE/bug_report.yml': 'name: Bug\n' })
  const before = snapshot(dir)
  const run = spawnSync(process.execPath, [SCRIPT, dir], { encoding: 'utf8' })
  assert.equal(run.status, 1)
  assert.match(run.stdout, /FAIL\s+security\.present\s+\[repo-standards\]/)
  assert.deepEqual(snapshot(dir), before)
})

test('--fix adds only missing files and keeps existing bytes', () => {
  const existing = {
    '.github/SECURITY.md': 'Report a vulnerability at https://example.org/report\n',
    '.github/ISSUE_TEMPLATE/bug_report.yml': 'name: Bug\n',
    'docs/CODEOWNERS': '* @someone\n',
  }
  const dir = fixture(existing)
  const before = snapshot(dir)
  const created = fix(dir, FILLED)
  for (const path of Object.keys(existing)) assert.equal(snapshot(dir)[path], before[path], path)
  assert.ok(!existsSync(join(dir, 'SECURITY.md')), 'no second SECURITY.md')
  assert.ok(!existsSync(join(dir, '.github/CODEOWNERS')), 'no second CODEOWNERS')
  assert.ok(!existsSync(join(dir, '.github/ISSUE_TEMPLATE/bug.yml')), 'no second bug form')
  assert.deepEqual(created.sort(), ['.github/ISSUE_TEMPLATE/config.yml', '.github/ISSUE_TEMPLATE/feature.yml',
    '.github/PULL_REQUEST_TEMPLATE.md', '.github/workflows/ci.yml', '.github/workflows/skills-check.yml', 'AGENTS.md'])
  assert.deepEqual(fix(dir, FILLED), [], 'a second run adds nothing')
})

test('--fix never overwrites a file in the target path', () => {
  const dir = fixture({ 'AGENTS.md': 'mine\n', '.github/workflows/ci.yml': 'name: build\n' })
  fix(dir, FILLED)
  assert.equal(readFileSync(join(dir, 'AGENTS.md'), 'utf8'), 'mine\n')
  assert.equal(readFileSync(join(dir, '.github/workflows/ci.yml'), 'utf8'), 'name: build\n')
})

test('installed templates satisfy their own checks once the fields are filled', () => {
  const dir = fixture({ 'README.md': '# demo\n', LICENSE: 'MIT\n', 'CONTRIBUTING.md': 'Steps.\n' })
  fix(dir, FILLED)
  for (const path of ['SECURITY.md', 'AGENTS.md']) {
    const text = readFileSync(join(dir, path), 'utf8').replace(new RegExp(PLACEHOLDER.source, 'g'), '30')
    writeFileSync(join(dir, path), text)
  }
  const results = audit(dir, { trackedFiles: ['README.md'] })
  assert.deepEqual(fail(results), [])
  assert.equal(status(results, 'pr-template.format'), 'pass')
  assert.equal(status(results, 'workflows.pinned'), 'pass')
  assert.equal(status(results, 'workflows.permissions'), 'pass')
})

test('fields left unfilled fail the check', () => {
  const dir = fixture()
  fix(dir, {})
  const result = audit(dir, { trackedFiles: [] }).find(r => r.id === 'templates.filled')
  assert.equal(result.status, 'fail')
  assert.match(result.message, /SECURITY\.md/)
  assert.match(result.message, /skills-check\.yml/)
})

test('a GitHub Actions expression is not a placeholder', () => {
  assert.equal(PLACEHOLDER.test('GH_TOKEN: ${{ github.token }}'), false)
  assert.equal(PLACEHOLDER.test('ref: {{github_skills_sha}}'), true)
})

test('event text inside run: fails, the same text through env: passes', () => {
  const unsafe = 'name: x\npermissions: {}\non: pull_request\njobs:\n  a:\n    steps:\n      - run: |\n          echo "${{ github.event.pull_request.title }}"\n'
  const safe = 'name: x\npermissions: {}\non: pull_request\njobs:\n  a:\n    steps:\n      - env:\n          TITLE: ${{ github.event.pull_request.title }}\n        run: echo "$TITLE"\n'
  assert.equal(status(audit(fixture({ '.github/workflows/a.yml': unsafe }), { trackedFiles: [] }), 'workflows.injection'), 'fail')
  assert.equal(status(audit(fixture({ '.github/workflows/a.yml': safe }), { trackedFiles: [] }), 'workflows.injection'), 'pass')
  assert.deepEqual(runLines('steps:\n  - run: |\n      one\n      two\n  - name: next\n'), ['|', '      one', '      two'])
})

test('pull_request_target with any checkout fails, without one passes', () => {
  const text = 'name: x\npermissions: {}\non: pull_request_target\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@v7\n'
  assert.equal(status(audit(fixture({ '.github/workflows/a.yml': text }), { trackedFiles: [] }), 'workflows.pr-target'), 'fail')
  const label = 'name: x\npermissions: {}\non: pull_request_target\njobs:\n  a:\n    steps:\n      - uses: actions/labeler@v6\n'
  assert.equal(status(audit(fixture({ '.github/workflows/a.yml': label }), { trackedFiles: [] }), 'workflows.pr-target'), 'pass')
})

test('a tracked env file fails and a schema passes', () => {
  assert.equal(status(audit(fixture(), { trackedFiles: ['.env.local'] }), 'secrets.env-files'), 'fail')
  assert.equal(status(audit(fixture(), { trackedFiles: ['.env.schema', '.env.example'] }), 'secrets.env-files'), 'pass')
})

test('a ci name set in .github/risk-paths is honored', () => {
  const dir = fixture({ '.github/risk-paths': 'ci: build\n', '.github/workflows/b.yml': 'name: build\npermissions: {}\n' })
  assert.equal(status(audit(dir, { trackedFiles: [] }), 'ci.workflow'), 'pass')
})

test('remote URLs parse in both forms', () => {
  assert.deepEqual(parseRemote('git@github.com:Jeff-Kazzee/github-skills.git'), { owner: 'Jeff-Kazzee', repo: 'github-skills' })
  assert.deepEqual(parseRemote('https://github.com/o/r'), { owner: 'o', repo: 'r' })
  assert.equal(parseRemote('https://gitlab.com/o/r'), null)
})

test('the PR template has the pr-template sections in order', () => {
  const text = readFileSync(join(TEMPLATES_DIR, 'PULL_REQUEST_TEMPLATE.md'), 'utf8')
  assert.deepEqual(headingsOf(text), PR_SECTIONS)
  assert.match(text, /\nTask: none\n?$/)
})

// The sibling skill holds the source list. Skip when this skill is installed alone.
const RULES = [process.env.GITHUB_SKILLS_ROOT, join(HERE, '..', '..')]
  .filter(Boolean).map(root => join(root, 'pr-template', 'scripts', 'rules.mjs')).find(existsSync)
test('PR_SECTIONS matches pr-template/scripts/rules.mjs', { skip: !RULES && 'pr-template skill not found beside this one' }, async () => {
  const { SECTIONS } = await import(pathToFileURL(RULES).href)
  assert.deepEqual(PR_SECTIONS, SECTIONS)
})

test('templates follow the Writing law', () => {
  for (const { source } of INSTALLS) {
    const text = readFileSync(join(TEMPLATES_DIR, source), 'utf8')
    assert.ok(!/[\u2013\u2014]/.test(text), `${source} has a dash`)
  }
})

test('gate files come from the base declaration and include workflows', () => {
  const declaration = parseDeclaration('# rules\ngate: scripts/gate.mjs\npr-sections: Intent, Size\n')
  assert.deepEqual(declaration.sections, ['Intent', 'Size'])
  const changed = ['src/a.js', '.github/workflows/ci.yml', '.github/repo-standards', 'scripts/gate.mjs', 'docs/guide.md']
  assert.deepEqual(gateHits(changed, declaration), ['.github/workflows/ci.yml', '.github/repo-standards', 'scripts/gate.mjs'])
  assert.deepEqual(gateHits(['src/a.js'], parseDeclaration('')), [])
})

test('the gate command exits 1 on a gate file and 0 otherwise', () => {
  const base = fixture({ '.github/repo-standards': 'gate: Makefile\n' })
  const list = fixture({ 'bad.txt': 'src/x.js\nMakefile\n', 'good.txt': 'src/x.js\n' })
  const bad = spawnSync(process.execPath, [SCRIPT, 'gate', base, join(list, 'bad.txt')], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stdout, /Makefile/)
  assert.equal(spawnSync(process.execPath, [SCRIPT, 'gate', base, join(list, 'good.txt')]).status, 0)
})

test('a body is checked against a declared shape', () => {
  const sections = ['Intent', 'Size', 'Out of Scope']
  assert.deepEqual(shapeProblems('## Intent\nFix it.\n## Size\nSmall.\n## Out of Scope\nNone.\n', sections), [])
  const problems = shapeProblems('## Size\nSmall.\n## Intent\n<!-- say why -->\n', sections)
  assert.ok(problems.includes('missing section: Out of Scope'))
  assert.ok(problems.includes('empty section: Intent'))
  assert.ok(problems.some(p => p.startsWith('sections out of order')))
})

test('a heading inside a fenced example is not a section', () => {
  const sections = ['Intent', 'Proof']
  const example = '## Intent\nFix it.\n## Proof\nRan it:\n\n```markdown\n## Intent\nAn example.\n```\n'
  assert.deepEqual(shapeProblems(example, sections), [])
  const tilde = '## Intent\nFix it.\n## Proof\nRan it:\n\n~~~~\n## Intent\n```\n## Proof\n~~~~\n'
  assert.deepEqual(shapeProblems(tilde, sections), [])
  const unclosed = '## Intent\nFix it.\n\n```\n## Proof\nNot a section.\n'
  assert.ok(shapeProblems(unclosed, sections).includes('missing section: Proof'))
  assert.deepEqual(shapeProblems('## Intent\n```text\nout\n```\n## Proof\nRan it.\n', sections), [])
})

test('a fenced example cannot stand in for the declared sections', () => {
  const problems = shapeProblems('```markdown\n## Intent\nFix it.\n## Size\nSmall.\n```\n', ['Intent', 'Size'])
  assert.ok(problems.includes('missing section: Intent'), problems.join())
  assert.ok(problems.includes('missing section: Size'), problems.join())
})

test('a tracked env file with more than one suffix fails, a schema or example passes', () => {
  for (const path of ['.env.production.local', 'app/.env.development.local', '.env.local']) {
    assert.equal(status(audit(fixture(), { trackedFiles: [path] }), 'secrets.env-files'), 'fail', path)
  }
  for (const path of ['.env.schema', 'app/.env.local.example', '.env.production.sample', 'src/.envrc.md']) {
    assert.equal(status(audit(fixture(), { trackedFiles: [path] }), 'secrets.env-files'), 'pass', path)
  }
})

test('a declared template is kept and checked against its own shape', () => {
  const dir = fixture({
    '.github/pull_request_template.md': '## Intent\n\n## Size\n',
    '.github/repo-standards': 'pr-sections: Intent, Size\n',
  })
  assert.equal(status(audit(dir, { trackedFiles: [] }), 'pr-template.format'), 'pass')
  fix(dir, FILLED)
  assert.equal(readFileSync(join(dir, '.github/pull_request_template.md'), 'utf8'), '## Intent\n\n## Size\n')
  assert.equal(readdirSync(join(dir, '.github')).filter(n => /^pull_request_template\.md$/i.test(n)).length, 1)
  const undeclared = fixture({ '.github/pull_request_template.md': '## Intent\n' })
  assert.equal(status(audit(undeclared, { trackedFiles: [] }), 'pr-template.format'), 'warn')
})

test('a ci workflow that can write or close PRs fails', () => {
  const text = 'name: ci\npermissions:\n  pull-requests: write\non: pull_request\njobs:\n  a:\n    steps:\n      - run: gh pr close 1\n'
  assert.equal(status(audit(fixture({ '.github/workflows/gates.yml': `${text}      - run: node repo-check.mjs gate .base c.txt\n` }), { trackedFiles: [] }), 'gates.block-only'), 'fail')
})

test('a repo with its own ci workflow still gets the gates', () => {
  const dir = fixture({ '.github/workflows/build.yml': 'name: ci\npermissions: {}\non: pull_request\njobs:\n  t:\n    steps:\n      - run: pnpm test\n' })
  assert.deepEqual(fix(dir, FILLED).filter(p => p.includes('workflows')), ['.github/workflows/skills-check.yml'])
  const results = audit(dir, { trackedFiles: [] })
  for (const id of ['ci.workflow', 'ci.tests', 'gates.integrity', 'gates.pr-body', 'gates.readme', 'gates.pinned', 'gates.block-only']) assert.equal(status(results, id), 'pass', id)
})

test('the audit step in skills-check.yml cannot fail the run', () => {
  const text = readFileSync(join(TEMPLATES_DIR, 'skills-check.yml'), 'utf8')
  assert.match(text, /continue-on-error: true\n\s+run: node \.standards\/repo-standards\/scripts\/repo-check\.mjs \./)
  assert.doesNotMatch(text, /pull_request_target|:\s*write\b/)
})
