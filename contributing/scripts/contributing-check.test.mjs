import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { after, before, test } from 'node:test'

import { commands, findRoot, lint, online, runSetup, sections, setupScript } from './contributing-check.mjs'

const dirs = []
const fresh = () => {
  const dir = mkdtempSync(join(tmpdir(), 'contributing-test-'))
  dirs.push(dir)
  return dir
}
after(() => dirs.forEach(dir => rmSync(dir, { recursive: true, force: true })))

const good = () => `# Contributing to Lantern

Thank you for helping with Lantern. This guide takes you from a fresh clone to a merged pull request.

## Getting help

Ask questions in [GitHub Discussions](https://github.com/example/lantern/discussions).

## Reporting issues

Search open and closed issues first. Do not report a vulnerability in a public issue. Follow [SECURITY.md](SECURITY.md) instead.

## Setting up

You need Node 22.

\`\`\`sh
git clone https://github.com/example/lantern.git
cd lantern
echo built > out.txt
\`\`\`

## Making a change

1. Pick an issue.
2. Follow the [style guide](docs/style.md#naming).

## Running tests

\`\`\`sh
test -f out.txt
\`\`\`

## Commit messages

Write the subject in the imperative.

## Pull requests

Open a pull request against \`main\`. See [Running tests](#running-tests).

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
`

const repoDir = () => {
  const dir = fresh()
  mkdirSync(join(dir, 'docs'))
  writeFileSync(join(dir, 'SECURITY.md'), 'x')
  writeFileSync(join(dir, 'CODE_OF_CONDUCT.md'), 'x')
  writeFileSync(join(dir, 'docs/style.md'), '# Style\n\n## Naming\n')
  return dir
}

test('the good fixture passes', () => {
  assert.deepEqual(lint(good(), repoDir()), [])
})

test('the template, once filled, passes', () => {
  const template = readFileSync(new URL('../references/template.md', import.meta.url), 'utf8').split('\n---\n')[1]
  const filled = template
    .replace('git clone {{repo URL}}', 'git clone https://github.com/example/lantern.git')
    .replace(/\{\{[^{}]*\{\{[^}]*\}\}[^}]*\}\}/g, 'Plain words here')
    .replace(/\]\(\{\{[^}]*\}\}\)/g, '](https://example.test)')
    .replace(/\{\{[^}]*\}\}/g, 'Plain words here')
  assert.deepEqual(lint(filled, repoDir()), [])
})

for (const [name, change, expected] of [
  ['an unfilled field', t => t.replace('Lantern\n', '{{Project}}\n'), /unfilled/],
  ['no title', t => t.replace('# Contributing to Lantern\n', ''), /no title/],
  ['no help section', t => t.replace(/## Getting help\n\n.*\n/, ''), /no "getting help" section/],
  ['a help section with no channel', t => t.replace('[GitHub Discussions](https://github.com/example/lantern/discussions)', 'the usual place'), /names no channel/],
  ['no tests section', t => t.replace(/## Running tests\n\n```sh\ntest -f out.txt\n```\n/, ''), /no "running tests" section/],
  ['an empty section', t => t.replace('Write the subject in the imperative.', '').replace('Open a pull request against `main`. See [Running tests](#running-tests).', ''), /"pull requests" section is empty/],
  ['sections out of order', t => t.replace('## Getting help', '## Code of conduct x').replace(/## Code of conduct\n/, '## Getting help\n'), /out of order/],
  ['a setup section with no commands', t => t.replace(/```sh\ngit clone[\s\S]*?```\n/, 'Run the installer.\n'), /no sh block/],
  ['a setup block that never clones', t => t.replace('git clone https://github.com/example/lantern.git\ncd lantern\n', ''), /does not clone/],
  ['too many setup commands', t => t.replace('echo built > out.txt', 'a\nb\nc\nd\ne\nf\ng\nh'), /10 setup commands/],
  ['a tests section with prose only', t => t.replace('```sh\ntest -f out.txt\n```', 'Run the tests.'), /tests section has no sh block/],
  ['no security link', t => t.replace(' Follow [SECURITY.md](SECURITY.md) instead.', ''), /security policy/],
  ['a code of conduct with no link', t => t.replace('the [Contributor Covenant](CODE_OF_CONDUCT.md)', 'the Contributor Covenant'), /code of conduct section has no link/],
  ['a missing linked file', t => t.replace('docs/style.md#naming', 'docs/gone.md'), /missing file docs\/gone\.md/],
  ['a broken anchor in this file', t => t.replace('#running-tests', '#nowhere'), /broken anchor #nowhere/],
  ['a broken anchor in a linked file', t => t.replace('#naming', '#casing'), /broken anchor docs\/style\.md#casing/],
  ['an em dash', t => t.replace('You need Node 22.', 'You need Node 22 \u2014 or newer.'), /em dash/],
  ['an en dash', t => t.replace('You need Node 22.', 'You need Node 20\u201322.'), /en dash/],
  ['a semicolon in prose', t => t.replace('You need Node 22.', 'You need Node 22; or newer.'), /semicolon/],
  ['a marketing word', t => t.replace('You need Node 22.', 'Setup is seamless.'), /marketing word "seamless"/],
  ['a file over the word limit', t => t.replace('Write the subject in the imperative.', 'word '.repeat(2600)), /words, the limit is 2500/],
]) {
  test(`fails on ${name}`, () => {
    assert.match(lint(change(good()), repoDir()).join('\n'), expected)
  })
}

test('the repo SUPPORT.md must be linked when it exists', () => {
  const dir = repoDir()
  writeFileSync(join(dir, 'SUPPORT.md'), 'x')
  assert.match(lint(good(), dir).join(), /SUPPORT\.md/)
  assert.deepEqual(lint(good().replace('## Reporting issues', 'See [SUPPORT.md](SUPPORT.md).\n\n## Reporting issues'), dir), [])
})

test('a file in .github resolves links from its own folder and from the root', () => {
  const root = repoDir()
  mkdirSync(join(root, '.github'))
  const text = good().replace('(SECURITY.md)', '(/SECURITY.md)').replace('(docs/style.md#naming)', '(../docs/style.md#naming)').replace('(CODE_OF_CONDUCT.md)', '(../CODE_OF_CONDUCT.md)')
  assert.deepEqual(lint(text, join(root, '.github'), root), [])
  assert.match(lint(good(), join(root, '.github'), root).join(), /missing file SECURITY\.md/)
})

test('a security advisories URL counts as a security policy', () => {
  const text = good().replace('[SECURITY.md](SECURITY.md)', '[the advisory form](https://github.com/example/lantern/security/advisories/new)')
  assert.deepEqual(lint(text, repoDir()), [])
})

test('headings that use other words still count as the section', () => {
  const text = good().replace('## Getting help', '## Questions').replace('## Setting up', '## Development environment').replace('## Pull requests', '## Submitting a pull request')
  assert.deepEqual(lint(text, repoDir()), [])
  assert.deepEqual(sections(text).filter(s => s.name).map(s => s.name).slice(0, 3), ['getting help', 'reporting issues', 'setting up'])
})

test('code blocks are not prose', () => {
  const text = good().replace('echo built > out.txt', 'echo built > out.txt; echo seamless \u2014 done')
  assert.deepEqual(lint(text, repoDir()), [])
})

test('inline code and link targets are not prose', () => {
  const text = good().replace('You need Node 22.', 'Run `a; b` and read [this](https://example.test/a;b).')
  assert.deepEqual(lint(text, repoDir()), [])
})

test('reads commands, dropping prompts and comments and joining continued lines', () => {
  assert.deepEqual(commands('```sh\n# install\n$ pnpm install \\\n  --frozen-lockfile\npnpm build\n```\n'), ['pnpm install \\\n--frozen-lockfile', 'pnpm build'])
})

test('the setup script drops the clone and the cd into it', () => {
  assert.equal(setupScript(good()), 'echo built > out.txt\ntest -f out.txt')
})

test('findRoot walks up to the folder that holds .git', () => {
  const root = fresh()
  mkdirSync(join(root, '.git'))
  mkdirSync(join(root, '.github'))
  assert.equal(findRoot(join(root, '.github')), root)
})

const repo = () => {
  const dir = fresh()
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.test', ...args], { cwd: dir, stdio: 'pipe' })
  git('init', '-q')
  writeFileSync(join(dir, 'package.txt'), 'ready')
  git('add', '.')
  git('commit', '-qm', 'one')
  return dir
}

test('setup and tests run on a fresh clone', () => {
  const text = good().replace('echo built > out.txt', 'test -f package.txt\necho built > out.txt')
  assert.deepEqual(runSetup(text, repo()), [])
})

test('a setup step that needs a file the clone lacks fails', () => {
  const text = good().replace('echo built > out.txt', 'test -f only-on-my-laptop.txt')
  assert.match(runSetup(text, repo()).join(), /failed on a fresh clone/)
})

test('a clone that cannot start fails', () => {
  assert.match(runSetup(good(), 'file:///no/such/repo').join(), /could not clone/)
})

let server
let base
before(async () => {
  server = createServer((request, response) => response.writeHead(request.url.includes('gone') ? 404 : 200).end('ok'))
  await new Promise(done => server.listen(0, '127.0.0.1', done))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())

test('online passes when every link resolves and fails on a dead one', async () => {
  const text = good().replace('https://github.com/example/lantern/discussions', `${base}/discussions`)
  assert.deepEqual(await online(text), [])
  assert.match((await online(text.replace(`${base}/discussions`, `${base}/gone`))).join(), /HTTP 404/)
})

test('a heredoc body stays verbatim inside the command that opens it', () => {
  const body = "server:\n\n# note\n  port: 8080\nEOF"
  assert.deepEqual(commands("```sh\n$ cat > config.yml <<'EOF'\n" + body + "\npnpm build\n```\n"), ["cat > config.yml <<'EOF'\n" + body, 'pnpm build'])
})

test('a heredoc writes the indented file the guide shows', () => {
  const text = good()
    .replace('echo built > out.txt', "cat > config.yml <<'EOF'\nserver:\n  port: 8080\nEOF")
    .replace('test -f out.txt', () => "grep -q '^  port: 8080$' config.yml")
  assert.deepEqual(runSetup(text, repo()), [])
})

test('commands chained after the clone still run', () => {
  const text = good().replace('git clone https://github.com/example/lantern.git\ncd lantern\n', 'git clone https://github.com/example/lantern.git && cd lantern && false\n').replace('test -f out.txt', 'true')
  assert.match(setupScript(text), /^false\n/)
  assert.match(runSetup(text, repo()).join(), /failed on a fresh clone/)
})

const pointer = () => `# Contributing to Lantern

Thank you for helping with Lantern. The contributor guide lives at [lantern.dev/contributing](https://lantern.dev/contributing).

Do not report a vulnerability in a public issue. Follow [SECURITY.md](SECURITY.md) instead.
`

test('a pointer file under 250 words that links the hosted guide passes', () => {
  assert.deepEqual(lint(pointer(), repoDir()), [])
})

test('a pointer file must link a hosted guide', () => {
  assert.match(lint(pointer().replace('[lantern.dev/contributing](https://lantern.dev/contributing)', 'our site'), repoDir()).join('\n'), /hosted guide/)
})

test('a file with no sections over 250 words is held to the full guide', () => {
  const text = pointer().replace('Thank you', 'word '.repeat(260) + 'Thank you')
  assert.match(lint(text, repoDir()).join('\n'), /no "setting up" section/)
})

test('the command line passes a pointer file and skips the clone', () => {
  const dir = repoDir()
  writeFileSync(join(dir, 'CONTRIBUTING.md'), pointer())
  const script = new URL('./contributing-check.mjs', import.meta.url)
  const run = spawnSync(process.execPath, [fileURLToPath(script), join(dir, 'CONTRIBUTING.md'), '--root', dir, '--clone', 'file:///no/such/repo'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /^ok: .*pointer/)
})

test('a GitHub Actions expression is not an unfilled field', () => {
  const dir = mkdtempSync(join(tmpdir(), 'contrib-'))
  const text = good().replace('You need Node 22.', 'CI reads `${{ github.token }}`. You need Node 22.')
  assert.ok(text.includes('${{'))
  assert.doesNotMatch(lint(text, dir).join('\n'), /unfilled/)
  assert.match(lint(text.replace('Lantern\n', '{{Project}}\n'), dir).join('\n'), /unfilled/)
  rmSync(dir, { recursive: true, force: true })
})
