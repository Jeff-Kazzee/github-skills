// A skill installed by symlink must still run its checker, not exit 0 in silence.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

test('the checker runs when started through a symlinked skill folder', t => {
  const dir = mkdtempSync(join(tmpdir(), 'symlink-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const link = join(dir, 'scripts')
  try {
    symlinkSync(dirname(fileURLToPath(import.meta.url)), link, 'dir')
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip(`this OS refused to create a symlink: ${error.code}`)
    throw error
  }
  const run = spawnSync(process.execPath, [join(link, 'contributing-check.mjs')], { encoding: 'utf8' })
  assert.equal(run.status, 2)
  assert.match(run.stderr, /usage/i)
  const guide = join(dir, 'CONTRIBUTING.md')
  writeFileSync(guide, 'No title and no sections.\n')
  const lint = spawnSync(process.execPath, [join(link, 'contributing-check.mjs'), guide, '--root', dir], { encoding: 'utf8' })
  assert.equal(lint.status, 1, lint.stderr)
  assert.match(lint.stderr, /no title as an h1/)
})
