import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { fragmentOf, lintCases, mediaCases, repo, template } from './cases.mjs'
import { classifyMedia, lintSource, renderedProblems } from './rules.mjs'

const golden = JSON.parse(readFileSync(new URL('./golden.json', import.meta.url), 'utf8'))

for (const [name, { body, head, problems, has, hasPrefix }] of Object.entries(lintCases)) {
  test(`lint: ${name}`, () => {
    const found = lintSource(body, head)
    if (problems) assert.deepEqual(found, problems)
    for (const line of has ?? []) assert.ok(found.includes(line), line)
    if (hasPrefix) assert.ok(found.some(line => line.startsWith(hasPrefix)), hasPrefix)
  })
}

// Recorded GitHub output, kept so these run with no network. make-golden.mjs refreshes it and sends
// the fixture bodies to GitHub, so it needs approval.
for (const [name, { body, pins, off, names }] of Object.entries(mediaCases)) {
  test(`media: ${name}`, () => {
    const sha256 = createHash('sha256').update(fragmentOf(body)).digest('hex')
    assert.equal(golden[name].sha256, sha256, `${name} changed, so its recorded render is stale`)
    const found = classifyMedia(golden[name].html, repo)
    assert.equal(found.pins.length, pins, 'pins')
    assert.equal(found.problems.length, off, 'refused on sight')
    if (names) assert.equal(found.problems[0], `not on an evidence ref: ${names}`)
  })
}

test('every recorded GitHub render of the filled template shows all sections in order', () => {
  for (const [name, { html }] of Object.entries(golden)) assert.deepEqual(renderedProblems(html), [], name)
})

test('the skill template keeps its fields, so a filled copy means something', () => {
  assert.ok(template.includes('{{'))
})

function cli(script, ...args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' })
}

test('the command line runs and refuses, directly and through a link as installed copies do', () => {
  const folder = fileURLToPath(new URL('.', import.meta.url))
  const scratch = mkdtempSync(join(tmpdir(), 'pr-body-link-'))
  const link = join(scratch, 'scripts')
  try {
    symlinkSync(folder, link, 'junction')
    for (const script of [join(folder, 'pr-body.mjs'), join(link, 'pr-body.mjs')]) {
      const usage = cli(script)
      assert.equal(usage.status, 1, script)
      assert.match(usage.stderr, /usage: pr-body\.mjs attach\|check/, script)
      const refused = cli(script, 'attach', '--task', 'x', '--upload-approved', 'nope.png')
      assert.equal(refused.status, 1, script)
      assert.match(refused.stderr, /nope\.png: no such file/, script)
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
})

// With no gh on the PATH and fetch rigged to throw, any network or gh use fails the run.
function sealed(script, ...args) {
  const trap = join(mkdtempSync(join(tmpdir(), 'pr-body-seal-')), 'trap.mjs')
  writeFileSync(trap, "globalThis.fetch = () => { throw new Error('network used') }\n")
  return spawnSync(process.execPath, ['--import', `file:///${trap.replace(/\\/g, '/')}`, script, ...args], {
    encoding: 'utf8', env: { PATH: '', SystemRoot: process.env.SystemRoot },
  })
}

const script = fileURLToPath(new URL('./pr-body.mjs', import.meta.url))
function bodyFile(text) {
  const file = join(mkdtempSync(join(tmpdir(), 'pr-body-file-')), 'body.md')
  writeFileSync(file, text)
  return file
}

test('check passes and fails with no network and no gh', () => {
  const good = lintCases['filled template'].body
  const passed = sealed(script, 'check', bodyFile(good))
  assert.equal(passed.status, 0, passed.stderr)
  assert.match(passed.stdout, /head not bound, images not checked/)
  const failed = sealed(script, 'check', bodyFile(good.replace('## Risk', '## Hazards')))
  assert.equal(failed.status, 1)
  assert.match(failed.stderr, /missing section: Risk/)
})

test('check binds to a full head, and refuses a short one', () => {
  const head = 'a'.repeat(40)
  const { body } = lintCases['full head in Testing']
  assert.equal(sealed(script, 'check', bodyFile(body), '--head', head).status, 0)
  const other = sealed(script, 'check', bodyFile(body), '--head', 'b'.repeat(40))
  assert.match(other.stderr, /does not name the full head/)
  assert.match(sealed(script, 'check', bodyFile(body), '--head', head.slice(0, 7)).stderr, /full 40-character SHA/)
})

test('rendering happens only when asked, and says it sent the body', () => {
  const file = bodyFile(lintCases['filled template'].body)
  assert.equal(sealed(script, 'check', file).stderr, '')
  const rendered = sealed(script, 'check', file, '--render')
  assert.equal(rendered.status, 1)
  assert.match(rendered.stderr, /sent the whole body|network used/)
})

test('attach refuses before any network or git use without upload approval', () => {
  const image = join(mkdtempSync(join(tmpdir(), 'pr-body-img-')), 'a.png')
  writeFileSync(image, 'not really an image')
  const refused = sealed(script, 'attach', '--task', 'x', image)
  assert.equal(refused.status, 1)
  assert.match(refused.stderr, /--upload-approved/)
})

// Every gh and git call answered by a stub loaded before the script, so nothing leaves the machine.
const STUB = `import cp from 'node:child_process'
import { syncBuiltinESMExports } from 'node:module'
const replies = JSON.parse(process.env.GH_STUB)
cp.execFileSync = (cmd, args) => {
  const call = [cmd, ...args].join(' ')
  const reply = replies.find(([part]) => call.includes(part))
  if (!reply) throw Object.assign(new Error('not stubbed: ' + call), { stderr: 'not stubbed: ' + call })
  return reply[1]
}
syncBuiltinESMExports()
`

function postedCheck(body, html, args = ['--pr', '7']) {
  const dir = mkdtempSync(join(tmpdir(), 'pr-body-stub-'))
  const stub = join(dir, 'stub.mjs')
  writeFileSync(stub, STUB)
  const replies = [
    ['gh auth status', ''],
    ['git remote get-url origin', `https://github.com/${repo}.git`],
    ['gh pr view 7', JSON.stringify({ body, headRefOid: 'a'.repeat(40) })],
    ['gh api markdown', html],
  ]
  try {
    return spawnSync(process.execPath, ['--import', pathToFileURL(stub).href, script, 'check', ...args], {
      encoding: 'utf8', env: { ...process.env, GH_STUB: JSON.stringify(replies) },
    })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const h2 = names => names.map(name => `<h2 dir="auto">${name}</h2>\n<p dir="auto">filled in abc1234</p>`).join('\n')
const ALL = ['ELI5', 'What Changed', 'Why', 'Linked Issue', 'Visual Proof', 'Testing', 'Risk', 'AI Disclosure', 'Review', 'Checklist']

test('check --pr passes a body whose rendered sections all appear', () => {
  const { body } = lintCases['full head in Testing']
  const run = postedCheck(body, h2(ALL))
  assert.equal(run.status, 0, run.stderr)
})

// Written by hand in the shape GitHub gives the list fence fixture: the column-zero fence opens a code
// block that swallows every heading after it.
test('check --pr fails when GitHub renders sections away that the offline parser finds', () => {
  const body = lintCases['full head in Testing'].body.replace('## Risk', '- item\n\n  ```\n  code\n```\n\n## Risk')
  assert.deepEqual(lintSource(body, 'a'.repeat(40)), [])
  const html = `${h2(ALL.slice(0, 6))}\n<ul dir="auto">\n<li>item</li>\n</ul>\n<pre class="notranslate"><code>## Risk\n</code></pre>`
  const run = postedCheck(body, html)
  assert.equal(run.status, 1, run.stdout)
  for (const name of ['Risk', 'AI Disclosure', 'Review', 'Checklist']) assert.match(run.stderr, new RegExp(`missing section on GitHub: ${name}`))
  const rendered = postedCheck(body, html, [bodyFile(body), '--render'])
  assert.equal(rendered.status, 1, rendered.stdout)
  assert.match(rendered.stderr, /missing section on GitHub: Risk/)
})

test('check --pr reads headings GitHub wraps in anchors, and catches an order GitHub changed', () => {
  const { body } = lintCases['full head in Testing']
  const wrapped = ALL.map(name => `<div class="markdown-heading" dir="auto"><h2 tabindex="-1" class="heading-element" dir="auto">${name}</h2><a id="user-content-x" class="anchor" href="#x"><svg></svg></a></div>`).join('\n')
  assert.equal(postedCheck(body, wrapped).status, 0)
  const swapped = h2(['Why', ...ALL.filter(name => name !== 'Why')])
  assert.match(postedCheck(body, swapped).stderr, /sections out of order on GitHub/)
})
