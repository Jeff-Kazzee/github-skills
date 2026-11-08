import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkForm, checkPost, common, headings } from './discussion-check.mjs'

const rfc = `# Summary

Add a \`cache\` option to routes.

# Motivation

Pages rebuild on every request.

# Detailed design

\`\`\`js
export const cache = { maxAge: 60 }
\`\`\`

# Drawbacks

One more option to learn.

# Alternatives

A CDN rule. It cannot see route data.

# Unresolved questions

Should the key include cookies?
`

test('a complete RFC passes', () => {
  assert.deepEqual(checkPost(rfc, 'rfc'), [])
})

test('an RFC without alternatives fails', () => {
  const out = checkPost(rfc.replace('# Alternatives', '# Other'), 'rfc')
  assert.ok(out.some((p) => p.includes('alternative')))
})

test('headings inside code fences do not count', () => {
  assert.deepEqual(headings('```\n# Summary\n```\n## Real'), ['real'])
})

test('a question needs a code block and a version', () => {
  const out = checkPost('How do I set the base path?', 'question')
  assert.equal(out.length, 2)
  assert.deepEqual(checkPost('On vite 5.4.2:\n\n```js\nexport default {}\n```', 'question'), [])
})

test('an answer that opens with a greeting fails', () => {
  const out = checkPost('Hi there\n\nSet `base` to `./`. See https://vite.dev/config/#base', 'answer')
  assert.deepEqual(out, ['lead with the cause or the fix, not a greeting'])
})

test('an answer needs code or a link', () => {
  assert.equal(checkPost('Set base to a relative path.', 'answer').length, 1)
})

test('a conversion reply needs an issue link', () => {
  assert.equal(checkPost('Moved to an issue.', 'to-issue').length, 1)
  assert.deepEqual(checkPost('Tracked in https://github.com/o/r/issues/12.', 'to-issue'), [])
})

test('a breaking-change announcement needs its sections and a link', () => {
  const ok = '## What changed\nx\n## Who is affected\nx\n## What happens if you take no action\nx\n## Migration steps\nhttps://example.com/guide'
  assert.deepEqual(checkPost(ok, 'breaking'), [])
  assert.ok(checkPost('## What changed\nx', 'breaking').length >= 3)
})

test('the Writing law catches dashes, semicolons, hype and placeholders', () => {
  const out = common('A fast tool \u2014 truly.\nIt works; it ships.\nA powerful option.\n{{name}}')
  assert.equal(out.length, 4)
})

test('a stray brace pair left by a nested placeholder fails', () => {
  assert.deepEqual(common('Nothing changes until 2.0."}}'), ['stray {{ or }} left from a placeholder'])
  assert.deepEqual(common('Use `${{ secrets.TOKEN }}` in the workflow.'), [])
})

test('semicolons inside code do not count', () => {
  assert.deepEqual(common('Run `a; b` first.\n\n```js\nlet x = 1;\nlet y = 2;\n```'), [])
})

test('a valid category form passes', () => {
  const form = 'body:\n  - type: markdown\n    attributes:\n      value: Read the docs first.\n  - type: textarea\n    attributes:\n      label: Summary\n    validations:\n      required: true\n'
  assert.deepEqual(checkForm(form, '.github/DISCUSSION_TEMPLATE/q-a.yml'), [])
})

test('a form with only markdown, validations on markdown, or a bad name fails', () => {
  const form = 'body:\n  - type: markdown\n    attributes:\n      value: hi\n    validations:\n      required: true\n'
  const out = checkForm(form, '.github/DISCUSSION_TEMPLATE/Ideas Form.yml')
  assert.equal(out.length, 3)
})

test('a poll form fails', () => {
  const form = 'body:\n  - type: input\n    attributes:\n      label: Q\n'
  assert.deepEqual(checkForm(form, 'polls.yml'), ['discussion category forms do not support polls'])
})
