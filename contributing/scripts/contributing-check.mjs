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
import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync } from 'node:fs'
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
// A simple `|| command` guard after a cd: no pipe, redirect, group or quotes, up to the next && or ; or the end.
const GUARD = /^\s*\|\|[^;&|{}()'"]*(?=\s*(?:&&|;|$))/
const GIT_BASH = 'C:/Program Files/Git/bin/bash.exe'
const HEALTH_DIRS = ['', '.github', 'docs']

// A fence closes on a line of at least as many backticks, so a four-backtick fence can hold a three-backtick one.
const withoutCode = text => text.replace(/^(`{3,})(?!`)[\s\S]*?^\1`*[ \t]*$/gm, match => match.replace(/[^\n]/g, ''))
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

// The heredocs a line opens, in order: each << outside quotes, comments and arithmetic, where the shell reads one.
// A $( ) inside double quotes is a command again, so a << there opens a heredoc.
function heredocOpeners(line) {
  const open = []
  const found = []
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    const top = open.at(-1)
    if (c === '\\') i++
    else if (top === '"') {
      if (c === '"') open.pop()
      else if (line.startsWith('$((', i)) { open.push('(('); i += 2 }
      else if (line.startsWith('$(', i)) { open.push('$('); i++ }
    }
    else if (c === "'") i = line.indexOf("'", i + 1)
    else if (c === '"') open.push('"')
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return found
    else if (line.startsWith('((', i)) { open.push('(('); i++ }
    else if (top === '((' && line.startsWith('))', i)) { open.pop(); i++ }
    else if (line.startsWith('$(', i) && line[i + 2] !== '(') { open.push('$('); i++ }
    else if (top === '$(' && c === ')') open.pop()
    else if (line.startsWith('<<<', i)) i += 2
    else if (top !== '((' && line.startsWith('<<', i)) {
      const opener = /^<<(-?)\s*(?:'([^']*)'|"([^"]*)"|([\w.-]+))/.exec(line.slice(i))
      if (opener) {
        found.push({ stripTabs: opener[1] === '-', tag: opener[2] ?? opener[3] ?? opener[4] })
        i += opener[0].length - 1
      } else i++
    }
    if (i < 0) return found
  }
  return found
}

const blocks = body => [...body.matchAll(/^(`{3,})(?!`)(\w*)[^\n]*\n([\s\S]*?)^\1`*[ \t]*$/gm)].map(m => ({ lang: m[2], code: m[3] }))

// The commands in a section's shell blocks. A continued line belongs to the command that opened it,
// and so does a heredoc body, kept verbatim because it is data.
export function commands(body) {
  const out = []
  let continued = false
  for (const block of blocks(body).filter(b => SHELL.test(b.lang))) {
    let heredocs = []
    for (const raw of block.code.split('\n')) {
      if (heredocs.length > 0) {
        out[out.length - 1] += `\n${raw}`
        if ((heredocs[0].stripTabs ? raw.replace(/^\t+/, '') : raw) === heredocs[0].tag) heredocs.shift()
        continue
      }
      const line = raw.replace(/^\s*\$ +/, '').trim()
      if (!line || line.startsWith('#')) continue
      if (continued) out[out.length - 1] += `\n${line}`
      else out.push(line)
      continued = line.endsWith('\\')
      heredocs = heredocOpeners(line)
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

const decode = text => {
  try { return decodeURIComponent(text) } catch { return text }
}

// GitHub shows a folder's README, so an anchor on a folder lands in it. The anchor passes
// when any Markdown README in the folder holds it, so the answer does not depend on which
// README the OS lists first. A README in another format, such as README.rst, holds the
// anchor but is not parsed. A failure to read the folder or a README is reported, never
// thrown, so one bad folder cannot stop the run.
function folderAnchor(folder, anchor, url) {
  let names
  try { names = readdirSync(folder) } catch { return `cannot check ${url}: the folder cannot be listed` }
  try {
    const readmes = names.filter(name => /^readme(\.\w+)?$/i.test(name) && statSync(join(folder, name), { throwIfNoEntry: false })?.isFile())
    if (!readmes.length) return `broken anchor ${url}: the folder has no README to hold it`
    const markdown = readmes.filter(name => /\.(md|markdown|mdown|mkdn)$/i.test(name))
    if (!markdown.length) return null
    const holds = name => anchors(readFileSync(join(folder, name), 'utf8').replace(/\r\n/g, '\n')).has(anchor)
    return markdown.some(holds) ? null : `broken anchor ${url}`
  } catch (error) {
    return `cannot check ${url}: ${error.code ?? error.message}`
  }
}

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
  const clean = decode(path.split('?')[0])
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
      if (!headings.has(decode(url.slice(1)))) problems.push(`broken anchor ${url}`)
      continue
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) continue
    const path = target(url, dir, root)
    const fragment = url.split('#')[1]
    if (!existsSync(path)) problems.push(`missing file ${url}`)
    else if (fragment && statSync(path).isFile() && /\.(md|markdown)$/i.test(path)
      && !anchors(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).has(decode(fragment))) {
      problems.push(`broken anchor ${url}`)
    } else if (fragment && statSync(path).isDirectory()) {
      const problem = folderAnchor(path, decode(fragment), url)
      if (problem) problems.push(problem)
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

// A shell word without the quotes around it.
const unquote = word => word.replace(/^(["'])(.*)\1$/, '$2')

// A clone option that takes the next word as its value, such as --branch build.
const VALUE_OPTION = /^(-[bcjou]|--(branch|origin|config|depth|reference|reference-if-able|separate-git-dir|template|jobs|filter|upload-pack|shallow-since|shallow-exclude|server-option|bundle-uri|ref-format|remote-name|fork-name|org))$/

// The folder names a clone command can create: each word's last path part, minus .git.
// A quoted word is one word. Options and their values name no folder.
function cloneNames(clone) {
  const words = clone.match(/"[^"]*"|'[^']*'|\S+/g) ?? []
  return new Set(words.filter((word, i) => !word.startsWith('-') && !VALUE_OPTION.test(words[i - 1] ?? ''))
    .map(word => unquote(word).replace(/\/+$/, '').split(/[/:]/).pop().replace(/\.git$/, '')))
}

// A command line without its trailing comment: a # that starts a word outside quotes.
function withoutComment(line) {
  for (let i = 0, quote = null; i < line.length; i++) {
    const c = line[i]
    if (c === '\\' && quote !== "'") i++
    else if (quote) { if (c === quote) quote = null }
    else if (c === "'" || c === '"') quote = c
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i).trimEnd()
  }
  return line
}

// What is left of a cd into the clone once the runner is inside it: the path under the clone, in the same quotes.
function cdBelow(word) {
  const below = unquote(word).replace(/^\.\//, '').split('/').slice(1).join('/').replace(/\/+$/, '')
  const quote = /^["']/.test(word) ? word[0] : ''
  return below ? `cd ${quote}${below}${quote}` : ''
}

// The setup and test commands as one script, minus the clone and the cd into it, which the runner has done.
// A pointer file has no sections, so its commands come from the whole file.
export function setupScript(text) {
  const found = sections(text)
  const steps = found.length === 0 ? commands(text) : ['setting up', 'running tests'].flatMap(name => {
    const section = found.find(s => s.name === name)
    return section ? commands(section.body) : []
  })
  const lines = []
  let skipCd = false
  let cloneDirs = new Set()
  for (const step of steps) {
    if (CLONE.test(step)) {
      // A clone chained with && or a semicolon keeps what follows it, minus the first cd into the clone.
      // Join backslash continuations first, so a wrapped clone line reads as one command, and drop its comment.
      // A heredoc body comes after the command lines and stays as it is.
      const parts = step.split('\n')
      let commandLines = 1
      while (commandLines < parts.length && parts[commandLines - 1].endsWith('\\')) commandLines++
      const command = withoutComment(parts.slice(0, commandLines).join('\n').replace(/\\\r?\n\s*/g, ' '))
      const joined = [command, ...parts.slice(commandLines)].join('\n')
      const rest = joined.replace(/^[^;&|]*(?:&&|;)\s*/, '')
      const names = cloneNames(/^[^;&|]*/.exec(joined)[0])
      cloneDirs = names
      if (rest === joined) { skipCd = true; continue }
      // Only the first line holds the chain. Any later line is a heredoc body, kept as it is.
      const chain = rest.split('\n')[0]
      // A guard such as `|| exit 1` belongs to the cd, so it is dropped or kept with it. A guard with
      // a pipe, a redirect, a group or quotes is not parsed, and that cd stays as written.
      const guardOf = after => /^\s*\|\|/.test(after) ? GUARD.exec(after)?.[0] ?? null : ''
      const cd = [...chain.matchAll(/(^|\s*(?:&&|;)\s*)cd\s+("[^"]*"|'[^']*'|[^\s;&|'"]+)(?=\s*(?:&&|\|\||;|$))/g)]
        .find(m => names.has(unquote(m[2]).replace(/^\.\//, '').split('/')[0])
          && guardOf(chain.slice(m.index + m[0].length)) !== null)
      let tail = rest
      if (cd) {
        const guard = guardOf(rest.slice(cd.index + cd[0].length))
        const end = cd.index + cd[0].length + guard.length
        // A cd below the clone, such as lantern/packages/core, keeps the part under the clone in the same quotes.
        const below = cdBelow(cd[2])
        if (below) tail = `${rest.slice(0, cd.index)}${cd[1]}${below}${guard}${rest.slice(end)}`
        else tail = cd[1] ? rest.slice(0, cd.index) + rest.slice(end) : rest.slice(end).replace(/^\s*(?:&&|;)\s*/, '')
      }
      if (tail.trim()) lines.push(tail)
      // With no cd into the clone in the chain, as when the clone line ends with &&, the cd may be the next step.
      skipCd = !cd
      continue
    }
    const standalone = skipCd && /^cd\s+(\S+)(\s*\|\|[^;&|{}()'"]*)?$/.exec(step)
    if (standalone) {
      skipCd = false
      // A cd below the clone keeps the part under it, and its guard. A cd by another path, such as ~/src/lantern, is dropped whole.
      const [, word, guard = ''] = standalone
      const below = cloneDirs.has(unquote(word).replace(/^\.\//, '').split('/')[0]) ? cdBelow(word) : ''
      if (below) lines.push(below + guard)
      continue
    }
    skipCd = false
    lines.push(step)
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
  const runs = Boolean(valueOf('--clone')) && (!pointer || commands(text).length > 0)
  if (runs && problems.length === 0) problems.push(...runSetup(text, valueOf('--clone')))
  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exit(1)
  }
  if (pointer) {
    console.log(runs ? `ok: ${file}, a pointer file, and its commands ran on a fresh clone` : `ok: ${file}, a pointer file, so no setup was run`)
    return
  }
  const found = sections(text).filter(s => s.name).length
  console.log(`ok: ${file}, ${found} sections, ${commands(sections(text).find(s => s.name === 'setting up').body).length} setup commands`)
}

// import.meta.main (Node 22.18 or later on the 22 line, or 24.2 or later) also covers an entry path a loader maps here.
// Without it, the realpath check covers a direct `node <file>` run and a symlink, but not a loader-mapped entry.
if (import.meta.main ?? realpathSync(fileURLToPath(import.meta.url)) === (process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null)) await main()
