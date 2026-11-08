import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { anchors, checkTree, lintPage, links, proseLines } from './docs-check.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const made = []
after(() => made.forEach(dir => rmSync(dir, { recursive: true, force: true })))

const V = 'Last verified: 2026-11-07 against v1.0.0.'
const page = (title, body = '') => `# ${title}\n\nIntro.\n\n${V}\n\n${body}\n`

function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'docs-check-'))
  made.push(root)
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  return root
}
const problems = (files, options) => checkTree(tree(files), options).problems

test('a linked, titled, verified tree passes', () => {
  assert.deepEqual(problems({
    'README.md': page('Docs', '- [Install](how-to/install.md)\n- [Concepts](concepts/)'),
    'how-to/install.md': page('Install the tool', 'See [the options](../reference/cli.md#options).'),
    'concepts/README.md': page('Concepts', '- [Cache](cache.md)'),
    'concepts/cache.md': page('About the cache'),
    'reference/cli.md': page('CLI reference', '## Options\n\nText. Back to [the index](../README.md).'),
  }), [])
})

test('a bare name without .md breaks on GitHub, and --site accepts it', () => {
  const files = { 'README.md': page('Docs', '[Cache](cache)'), 'cache.md': page('Cache') }
  assert.deepEqual(problems(files), ['README.md:7: broken link cache', 'cache.md:1: orphan: no link path from README.md'])
  assert.deepEqual(problems(files, { site: true }), [])
})

test('a link to a missing file is reported with its line', () => {
  const found = problems({ 'README.md': page('Docs', '[Gone](gone.md)') })
  assert.deepEqual(found, ['README.md:7: broken link gone.md'])
})

test('a link whose case differs from the file fails, as it would on GitHub', () => {
  const found = problems({ 'README.md': page('Docs', '[Guide](Guide.md)'), 'guide.md': page('Guide') })
  assert.ok(found.some(p => p.includes('the case differs')), found.join('\n'))
})

test('anchors follow GitHub slugs, repeats and custom ids', () => {
  const text = '# Title\n\n## Set up `uv` (fast)\n\n## Usage\n\n## Usage\n\n## Binding {#binding-classes}\n\n<a id="manual"></a>'
  const found = anchors(text)
  for (const id of ['title', 'set-up-uv-fast', 'usage', 'usage-1', 'binding-classes', 'binding', 'manual']) assert.ok(found.has(id), id)
  const bad = problems({ 'README.md': page('Docs', '[a](#docs) [b](#nope) [c](other.md#missing)'), 'other.md': page('Other', '## Here\n\n[up](README.md)') })
  assert.deepEqual(bad, ['README.md:7: broken anchor #nope', 'README.md:7: broken anchor other.md#missing'])
})

test('a page no link path reaches is an orphan, and nested pages are reached through their section index', () => {
  const found = problems({
    'README.md': page('Docs', '[Guides](guides/README.md)'),
    'guides/README.md': page('Guides', '[One](one.md)'),
    'guides/one.md': page('One'),
    'lost.md': page('Lost'),
  })
  assert.deepEqual(found, ['lost.md:1: orphan: no link path from README.md'])
})

test('--site skips the root and .html links a site generator resolves', () => {
  const files = { 'README.md': page('Docs', '[api](/rubydoc/Formula.html) [ch](ch01.html#intro) [real](gone.md)') }
  assert.deepEqual(problems(files, { site: true }), ['README.md:7: broken link gone.md'])
  assert.equal(problems(files).length, 3)
})

test('a folder with no index page is reported', () => {
  assert.ok(problems({ 'a.md': page('A') }).some(p => p.includes('no index page')))
  assert.deepEqual(problems({ 'start.md': page('Start', '[A](a.md)'), 'a.md': page('A') }, { index: 'start.md' }), [])
})

test('a page needs a title and a verified line, in any form real projects use', () => {
  assert.deepEqual(lintPage('Some text.\n').map(p => p.problem).sort(), [
    'no title: add a "# " heading or a frontmatter title',
    'no verified line: add "Last verified: YYYY-MM-DD", a review_date, or a source',
  ].sort())
  for (const ok of [
    '---\ntitle: Data sources\nreview_date: 2026-08-10\n---\nText.',
    '---\ntitle: add\nlast_modified: 2026-06-25\n---\nText.',
    '# Title\n\nText.\n\n<!-- source: https://example.com/spec -->',
    '# Title\n\n_Last reviewed: 2026-01-02_',
    '# 0001. Use Markdown\n\nDate: 2026-11-07',
  ]) assert.deepEqual(lintPage(ok), [], ok)
  assert.equal(lintPage('# T\n\nUse `<!-- source: url -->`.').length, 1)
  assert.deepEqual(lintPage('# Changelog\n\n## [1.0.0] - 2026-11-07\n', { name: 'CHANGELOG.md' }), [])
  assert.equal(lintPage('# Process\n\n## 2026-11-07\n', { name: 'release-process.md' }).length, 1)
})

test('the Writing law is checked in prose only', () => {
  const text = [
    '---', 'title: A; B', '---', '# Title', V,
    'Fast — and wide.', 'Pages 1–3.', 'Run it; then stop.', 'A powerful tool.',
    'Code `a; b` stays.', '<!-- a; b -->', 'import X from "y";',
    '````md', '```js', 'a; b — c', '```', 'still code; here', '````', 'After.',
  ].join('\n')
  const found = lintPage(text).map(p => `${p.line}: ${p.problem}`)
  assert.deepEqual(found, ['6: em dash', '7: en dash', '8: semicolon in prose', '9: marketing word "powerful"'])
})

test('an unfilled placeholder is reported, but not one shown as code', () => {
  assert.deepEqual(lintPage(`# T\n\n${V}\n\nHi {{name}}.`).map(p => p.problem), ['an unfilled {{field}} remains'])
  assert.deepEqual(lintPage(`# T\n\n${V}\n\nFill each \`{{field}}\`.`), [])
})

test('link parsing skips code and reads every link form', () => {
  const text = '[a](a.md) ![i](img.png "t") <a href="b.md">b</a>\n[r]: c.md\n`[x](x.md)`\n```\n[y](y.md)\n```\n[s](<with space.md>)'
  assert.deepEqual(links(text).map(l => l.target).sort(), ['a.md', 'b.md', 'c.md', 'img.png', 'with space.md'])
  assert.equal(proseLines('---\na: b\n---\ntext').join('|'), '|||text')
})

test('decision records must be numbered NNNN-title.md', () => {
  const found = problems({
    'README.md': page('Docs', '[ADRs](adr/README.md)'),
    'adr/README.md': page('Decisions', '[1](0001-use-markdown.md) [2](use-yaml.md)'),
    'adr/0001-use-markdown.md': '# 1. Use Markdown\n\nDate: 2026-11-07\n',
    'adr/use-yaml.md': '# 2. Use YAML\n\nDate: 2026-11-07\n',
  })
  assert.deepEqual(found, ['adr/use-yaml.md:1: decision record name: use NNNN-short-title.md'])
})

test('wiki mode resolves [[Page]] links, roots at Home and _Sidebar, and needs no h1', () => {
  const wiki = {
    'Home.md': `Intro.\n\n${V}\n\n- [[Getting Started]]\n- [[the FAQ|FAQ]]`,
    '_Sidebar.md': '* [[Home]]\n* [[Getting Started]]\n* [[FAQ]]\n* [[Build Notes]]',
    '_Footer.md': 'Edit with write access.',
    'Getting-Started.md': `${V}\n\nSee [[Missing Page]] and [[Nim for D|https://example.com]].`,
    'FAQ.md': `${V}`,
    'Build-Notes.md': `${V}`,
  }
  assert.deepEqual(problems(wiki, { wiki: true }), ['Getting-Started.md:3: broken wiki link [[Missing Page]]'])
  const { ['_Sidebar.md']: _, ...noSidebar } = wiki
  assert.ok(problems(noSidebar, { wiki: true }).some(p => p.includes('no _Sidebar')))
})

test('every template in page-templates.md passes the page check once filled', () => {
  const doc = readFileSync(join(here, '..', 'references', 'page-templates.md'), 'utf8').replace(/\r\n/g, '\n')
  const blocks = [...doc.matchAll(/^## (.+)\n[\s\S]*?^````md\n([\s\S]*?)^````$/gm)]
  assert.ok(blocks.length >= 13, `found ${blocks.length} templates`)
  for (const [, heading, body] of blocks) {
    const filled = body.replace(/\{\{([^}]+)\}\}/g, (_, field) => (/YYYY-MM-DD/.test(field) ? '2026-11-07' : 'x'))
    const name = /`([^`]+)`/.exec(heading)[1].split('/').pop()
    const wiki = /in the wiki/.test(heading)
    assert.deepEqual(lintPage(filled, { name, wiki }), [], heading)
  }
})

test('the command line exits 1 on a problem and 0 when clean', () => {
  const script = join(here, 'docs-check.mjs')
  const bad = spawnSync(process.execPath, [script, tree({ 'README.md': '# Docs\n' })], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stderr, /no verified line/)
  const good = spawnSync(process.execPath, [script, tree({ 'README.md': page('Docs') })], { encoding: 'utf8' })
  assert.equal(good.status, 0, good.stderr)
})
