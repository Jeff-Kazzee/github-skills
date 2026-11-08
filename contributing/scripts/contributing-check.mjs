#!/usr/bin/env node
// Checks a CONTRIBUTING.md against the contributing skill's rules.
//
//   node contributing-check.mjs CONTRIBUTING.md                 rules that need no network
//   node contributing-check.mjs CONTRIBUTING.md --online        also every http link
//   node contributing-check.mjs CONTRIBUTING.md --clone <repo>  also runs setup and tests on a fresh clone
//   --root <dir>   the repo root, when the file is not under a .git folder
//
// Exits 1 with one line per problem.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Each section, in order, with the headings that count as it. Required ones must appear.
export const SECTIONS = [
  { name: 'getting help', match: /help|question|support/, required: true },
  { name: 'reporting issues', match: /issue|bug|report/, required: true },
  { name: 'setting up', match: /set(ting)? ?up|development environment|getting started|prerequisite/, required: true },
  { name: 'making a change', match: /making a change|making changes|workflow/, required: false },
  { name: 'running tests', match: /test/, required: true },
  { name: 'commit messages', match: /commit/, required: false },
  { name: 'pull requests', match: /pull request|submitting/, required: true },
  { name: 'ai-assisted contributions', match: /\bai\b|llm|generative/, required: false },
  { name: 'code of conduct', match: /conduct/, required: true },
  { name: 'signing your work', match: /sign|dco|cla\b|license agreement/, required: false },
]
const MAX_WORDS = 2500
const MAX_SETUP_COMMANDS = 8
const MAX_POINTER_WORDS = 250
const HYPE = /\b(blazing(ly)?|revolutionary|world-class|seamless(ly)?|powerful|robust|cutting-edge|best-in-class|game-changing|effortless(ly)?|next-generation|stunning|amazing|awesome|delightful|supercharge[sd]?)\b/i
const SHELL = /^(sh|bash|shell|console|zsh)$/i
const CLONE = /^(git clone|gh repo (clone|fork))\b/
const GIT_BASH = 'C:/Program Files/Git/bin/bash.exe'
const HEALTH_DIRS = ['', '.github', 'docs']

const withoutCode = text => text.replace(/^```[\s\S]*?^```\s*$/gm, match => match.replace(/[^\n]/g, ''))
const withoutComments = text => text.replace(/<!--[\s\S]*?-->/g, '')
const strip = text => text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

// The ## sections, each tagged with the skill section its heading matches.
export function sections(text) {
  const lines = withoutCode(text).split('\n')
  const raw = text.split('\n')
  const found = []
  lines.forEach((line, index) => {
    const heading = /^## +(.+?)\s*#*\s*$/.exec(line)
    if (heading) found.push({ heading: heading[1], start: index + 1 })
  })
  const claimed = new Set()
  return found.map((section, i) => {
    const end = found[i + 1] ? found[i + 1].start - 1 : raw.length
    const lower = section.heading.toLowerCase()
    const exact = SECTIONS.find(s => s.name === lower && !claimed.has(s.name))
    const kind = exact ?? SECTIONS.find(s => s.match.test(lower) && !claimed.has(s.name))
    if (kind) claimed.add(kind.name)
    return { ...section, name: kind?.name ?? null, body: raw.slice(section.start, end).join('\n') }
  })
}

const blocks = body => [...body.matchAll(/^```(\w*)[^\n]*\n([\s\S]*?)^```\s*$/gm)].map(m => ({ lang: m[1], code: m[2] }))

// The commands in a section's shell blocks. A continued line belongs to the command that opened it,
// and so does a heredoc body, kept verbatim because it is data.
export function commands(body) {
  const out = []
  let continued = false
  for (const block of blocks(body).filter(b => SHELL.test(b.lang))) {
    let heredoc = null
    for (const raw of block.code.split('\n')) {
      if (heredoc) {
        out[out.length - 1] += `\n${raw}`
        if ((heredoc.stripTabs ? raw.replace(/^\t+/, '') : raw) === heredoc.tag) heredoc = null
        continue
      }
      const line = raw.replace(/^\s*\$ +/, '').trim()
      if (!line || line.startsWith('#')) continue
      if (continued) out[out.length - 1] += `\n${line}`
      else out.push(line)
      continued = line.endsWith('\\')
      const opener = /(?<!<)<<(-?)\s*(['"]?)([\w.-]+)\2/.exec(line)
      if (opener) heredoc = { stripTabs: opener[1] === '-', tag: opener[3] }
    }
  }
  return out
}

export function links(text) {
  const plain = withoutComments(withoutCode(text))
  const refs = new Map([...plain.matchAll(/^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)/gm)].map(m => [m[1].toLowerCase(), m[2]]))
  return [
    ...[...plain.matchAll(/\]\(\s*<?([^)\s>]+)/g), ...plain.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(m => m[1]),
    ...refs.values(),
  ]
}

const anchor = heading => heading.toLowerCase().trim().replace(/[^\p{L}\p{N} _-]/gu, '').replace(/ /g, '-')

function anchors(text) {
  const seen = new Map()
  const found = new Set()
  for (const line of withoutCode(text).split('\n')) {
    const heading = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)
    if (heading) {
      const base = anchor(heading[1].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'))
      const count = seen.get(base) ?? 0
      seen.set(base, count + 1)
      found.add(count ? `${base}-${count}` : base)
    }
    for (const match of line.matchAll(/\b(?:id|name)="([^"]+)"/g)) found.add(match[1])
  }
  return found
}

// The repo root: the nearest folder above the file that holds .git.
export function findRoot(dir) {
  for (let at = resolve(dir); ; at = dirname(at)) {
    if (existsSync(join(at, '.git'))) return at
    if (dirname(at) === at) return resolve(dir)
  }
}

const healthFile = (root, name) => HEALTH_DIRS.map(d => join(root, d, name)).find(p => existsSync(p))

// Resolves a relative link the way GitHub does: from the file's folder, or from the root for a leading slash.
function target(url, dir, root) {
  const [path] = url.split('#')
  const clean = decodeURIComponent(path.split('?')[0])
  return clean.startsWith('/') ? join(root, clean) : join(dir, clean)
}

const wordCount = text => strip(withoutComments(withoutCode(text))).split(' ').filter(Boolean).length

// A pointer file stands in for a guide hosted elsewhere: no ## sections and under 250 words.
export const isPointer = text => sections(text).length === 0 && wordCount(text) < MAX_POINTER_WORDS

export function lint(text, dir, root = dir) {
  const problems = []
  const plain = withoutComments(withoutCode(text))

  if (/(?<!\$)\{\{/.test(text)) problems.push('an unfilled {{field}} remains')
  if (!/^#\s+\S/m.test(plain)) problems.push('no title as an h1')
  const words = wordCount(text)
  if (words > MAX_WORDS) problems.push(`${words} words, the limit is ${MAX_WORDS}. Move detail into docs/ and link it`)

  const found = sections(text)
  const pointer = isPointer(text)
  if (pointer && !links(text).some(url => /^https?:/i.test(url))) problems.push('the pointer file has no http link to the hosted guide')
  for (const spec of pointer ? [] : SECTIONS.filter(s => s.required)) {
    const section = found.find(s => s.name === spec.name)
    if (!section) problems.push(`no "${spec.name}" section`)
    else if (!strip(section.body)) problems.push(`the "${spec.name}" section is empty`)
  }
  const order = found.filter(s => s.name).map(s => SECTIONS.findIndex(spec => spec.name === s.name))
  if (order.some((value, i) => i > 0 && value < order[i - 1])) problems.push('sections are out of order')

  const setup = found.find(s => s.name === 'setting up')
  if (setup) {
    const steps = commands(setup.body)
    if (steps.length === 0) problems.push('the setup section has no sh block of commands')
    else {
      if (!steps.some(step => CLONE.test(step))) problems.push('the setup block does not clone the repo')
      if (steps.length > MAX_SETUP_COMMANDS) problems.push(`${steps.length} setup commands, the limit is ${MAX_SETUP_COMMANDS}`)
    }
  }
  const tests = found.find(s => s.name === 'running tests')
  if (tests && commands(tests.body).length === 0) problems.push('the tests section has no sh block of commands')

  const all = links(text)
  const help = found.find(s => s.name === 'getting help')
  if (help && links(help.body).length === 0 && !/discussions|discord|slack|zulip|matrix|forum|mailing list|irc/i.test(help.body)) {
    problems.push('the help section names no channel')
  }
  if (root && healthFile(root, 'SUPPORT.md') && !all.some(url => /support\.md$/i.test(url.split('#')[0]))) {
    problems.push('the repo has SUPPORT.md, and this file does not link it')
  }
  if (!all.some(url => /security\.md$/i.test(url.split('#')[0]) || /\/security(\/policy|\/advisories)/.test(url))) {
    problems.push('no link to a security policy')
  }
  const conduct = found.find(s => s.name === 'code of conduct')
  if (conduct && links(conduct.body).length === 0) problems.push('the code of conduct section has no link')

  const headings = anchors(text)
  for (const url of new Set(all)) {
    if (url.startsWith('#')) {
      if (!headings.has(decodeURIComponent(url.slice(1)))) problems.push(`broken anchor ${url}`)
      continue
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) continue
    const path = target(url, dir, root)
    const fragment = url.split('#')[1]
    if (!existsSync(path)) problems.push(`missing file ${url}`)
    else if (fragment && statSync(path).isFile() && /\.(md|markdown)$/i.test(path)
      && !anchors(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).has(decodeURIComponent(fragment))) {
      problems.push(`broken anchor ${url}`)
    }
  }

  withoutCode(text).split('\n').forEach((line, index) => {
    const at = `line ${index + 1}`
    const bare = withoutComments(line)
    if (bare.includes('\u2014')) problems.push(`${at}: em dash`)
    if (bare.includes('\u2013')) problems.push(`${at}: en dash`)
    const words = bare.replace(/`[^`]*`/g, '').replace(/<[^>]+>/g, '').replace(/\]\([^)]*\)/g, ']').replace(/&[a-z#0-9]+;/gi, '')
    if (words.includes(';')) problems.push(`${at}: semicolon in prose`)
    const hype = HYPE.exec(words.replace(/[*_~[\]]/g, ''))
    if (hype) problems.push(`${at}: marketing word "${hype[0]}"`)
  })
  return problems
}

export async function online(text) {
  const problems = []
  for (const url of new Set(links(text).filter(u => /^https?:/i.test(u)))) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'contributing-check' } })
      if (response.status >= 400) problems.push(`${url}: HTTP ${response.status}`)
    } catch (error) {
      problems.push(`${url}: ${error.cause?.code ?? error.name}`)
    }
  }
  return problems
}

// The setup and test commands as one script, minus the clone and the cd into it, which the runner has done.
export function setupScript(text) {
  const found = sections(text)
  const lines = []
  let skipCd = false
  for (const name of ['setting up', 'running tests']) {
    const section = found.find(s => s.name === name)
    for (const step of section ? commands(section.body) : []) {
      if (CLONE.test(step)) {
        // A clone chained with && or a semicolon keeps what follows it, minus a cd straight after the clone.
        // Join backslash continuations first, so a wrapped clone line reads as one command.
        const joined = step.replace(/\\\r?\n\s*/g, ' ')
        const rest = joined.replace(/^[^;&|]*(?:&&|;)\s*/, '')
        if (rest === joined) { skipCd = true; continue }
        const tail = rest.replace(/^cd\s+[^\s;&|]+\s*(?:(?:&&|;)\s*|$)/, '')
        // A clone that ends its line with && leaves no command, so the cd may be the next step.
        if (tail) lines.push(tail)
        skipCd = !rest.trim()
        continue
      }
      if (skipCd && /^cd\s+\S+$/.test(step)) { skipCd = false; continue }
      skipCd = false
      lines.push(step)
    }
  }
  return lines.join('\n')
}

export function runSetup(text, source, timeoutMs = 600000) {
  const dir = mkdtempSync(join(tmpdir(), 'contributing-clone-'))
  try {
    execFileSync('git', ['clone', '--quiet', '--depth', '1', source, dir], { stdio: 'pipe' })
    const shell = existsSync(GIT_BASH) ? GIT_BASH : 'bash'
    const run = spawnSync(shell, ['-c', `set -e\n${setupScript(text)}`], { cwd: dir, stdio: 'pipe', timeout: timeoutMs, encoding: 'utf8' })
    if (run.status === 0) return []
    return [`setup or tests failed on a fresh clone, exit ${run.status}: ${(run.stderr || run.stdout || '').trim().split('\n').at(-1)}`]
  } catch (error) {
    return [`could not clone ${source}: ${error.message.split('\n')[0]}`]
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function main() {
  const args = process.argv.slice(2)
  const valueOf = flag => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined)
  const values = new Set([valueOf('--clone'), valueOf('--root')])
  const file = args.find(arg => !arg.startsWith('--') && !values.has(arg))
  if (!file || (args.includes('--clone') && !valueOf('--clone')) || (args.includes('--root') && !valueOf('--root'))) {
    console.error('usage: contributing-check.mjs CONTRIBUTING.md [--online] [--clone <repo>] [--root <dir>]')
    process.exit(2)
  }
  const path = resolve(file)
  const text = readFileSync(path, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const dir = dirname(path)
  const root = valueOf('--root') ? resolve(valueOf('--root')) : findRoot(dir)
  const problems = lint(text, dir, root)
  if (args.includes('--online')) problems.push(...await online(text))
  const pointer = isPointer(text)
  if (valueOf('--clone') && problems.length === 0 && !pointer) problems.push(...runSetup(text, valueOf('--clone')))
  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exit(1)
  }
  if (pointer) {
    console.log(`ok: ${file}, a pointer file, so no setup was run`)
    return
  }
  const found = sections(text).filter(s => s.name).length
  console.log(`ok: ${file}, ${found} sections, ${commands(sections(text).find(s => s.name === 'setting up').body).length} setup commands`)
}

if (realpathSync(fileURLToPath(import.meta.url)) === (process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null)) await main()
