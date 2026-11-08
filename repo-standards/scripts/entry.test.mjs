// A loader can map a virtual entry path to the checker. The checker must still run, not exit 0 in silence.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

test('the checker runs when a loader maps a virtual entry path to it', t => {
  const dir = mkdtempSync(join(tmpdir(), 'virtual-entry-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const target = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'repo-check.mjs')).href
  const empty = mkdtempSync(join(tmpdir(), 'empty-repo-'))
  t.after(() => rmSync(empty, { recursive: true, force: true }))
  const loader = join(dir, 'loader.mjs')
  writeFileSync(loader, `export const resolve = (specifier, context, next) => next(specifier.endsWith('virtual-entry') ? ${JSON.stringify(target)} : specifier, context)` + String.fromCharCode(10))
  const run = spawnSync(process.execPath, ['--no-warnings', '--experimental-loader', pathToFileURL(loader).href, join(dir, 'virtual-entry'), empty], { encoding: 'utf8' })
  assert.equal(run.status, 1, run.stderr)
  assert.match(run.stdout, /readme.present/)
})
