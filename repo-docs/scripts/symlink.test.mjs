// A skill installed by symlink must still run its checker, not exit 0 in silence.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
  const run = spawnSync(process.execPath, [join(link, 'docs-check.mjs')], { encoding: 'utf8' })
  assert.equal(run.status, 2)
  assert.match(run.stderr, /usage/i)
})

test('the checker runs when started through a file symlink with another name', t => {
  const dir = mkdtempSync(join(tmpdir(), 'symlink-file-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const link = join(dir, 'check.mjs')
  try {
    symlinkSync(join(dirname(fileURLToPath(import.meta.url)), 'docs-check.mjs'), link, 'file')
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip(`this OS refused to create a symlink: ${error.code}`)
    throw error
  }
  const run = spawnSync(process.execPath, [link], { encoding: 'utf8' })
  assert.equal(run.status, 2, run.stderr)
  assert.match(run.stderr, /usage/i)
})

test('the checker does not run when another script with the same name imports it', t => {
  const dir = mkdtempSync(join(tmpdir(), 'same-name-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const target = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'docs-check.mjs')).href
  const importer = join(dir, 'docs-check.mjs')
  writeFileSync(importer, `import ${JSON.stringify(target)}\nconsole.log('importer ran')\n`)
  const run = spawnSync(process.execPath, [importer], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.match(run.stdout, /importer ran/)
  assert.doesNotMatch(run.stderr, /usage/i)
})

test('the checker runs when a loader maps a virtual entry path to it', t => {
  const dir = mkdtempSync(join(tmpdir(), 'virtual-entry-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const target = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'docs-check.mjs')).href
  const loader = join(dir, 'loader.mjs')
  writeFileSync(loader, `export const resolve = (specifier, context, next) => next(specifier.endsWith('virtual-entry') ? ${JSON.stringify(target)} : specifier, context)\n`)
  const run = spawnSync(process.execPath, ['--no-warnings', '--experimental-loader', pathToFileURL(loader).href, join(dir, 'virtual-entry')], { encoding: 'utf8' })
  assert.equal(run.status, 2, run.stderr)
  assert.match(run.stderr, /usage/i)
})
