#!/usr/bin/env node
// Checks a docs folder or a GitHub wiki checkout against the repo-docs skill.
//
//   node docs-check.mjs docs                  a docs folder, rooted at its index page
//   node docs-check.mjs docs --index start.md name the index page yourself
//   node docs-check.mjs my-repo.wiki --wiki   a wiki checkout, rooted at Home and _Sidebar
//   node docs-check.mjs docs --site           skip /root and .html links a site generator resolves
//
// Reports broken relative links and anchors, pages the index cannot reach, pages with no
// title or no verified line, decision records named out of pattern, and Writing law
// violations. Exits 1 with one "path:line: problem" line per problem.

import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const PAGE = /\.(md|mdx|markdown)$/i
const INDEXES = ['index.md', 'README.md', '_index.md', 'SUMMARY.md', 'index.mdx']
const WIKI_CHROME = /^_(sidebar|footer)\.(md|mdx|markdown)$/i
const HYPE = /\b(blazing(?:ly)?|revolutionary|world-class|seamless(?:ly)?|powerful|robust|cutting-edge|best-in-class|game-changing|effortless(?:ly)?|next-generation|stunning|state-of-the-art|industry-leading|unparalleled|lightning-fast)\b/i
const DATE = /\d{4}-\d{2}-\d{2}/
const FRESH_KEY = /^(last_?verified|last_?review(?:ed)?(?:_date)?|review_?date|last_?modified|last_?updated|lastmod|date)\s*:\s*['"]?\d{4}-\d{2}-\d{2}/im
const FRESH_LINE = /^\s*[_*]*(last verified|last reviewed|last updated|date)[_*]*\s*:?[_*]*\s+.*\d{4}-\d{2}-\d{2}/im
const SOURCE = /<!--\s*source:\s*\S+\s*-->|^\s*[_*]*sources?[_*]*\s*:[_*]*\s+.*(https?:\/\/|\]\()/im
const DECISION_DIR = /(^|\/)(adr|adrs|decisions|architecture-decisions)\//i
const DECISION_NAME = /^\d{4}-[a-z0-9]+(-[a-z0-9]+)*\.mdx?$/

// Splits off YAML frontmatter. Line numbers stay those of the whole file.
export function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---(\n|$)/.exec(text)
  if (!match) return { front: '', lines: text.split('\n'), skip: 0 }
  const skip = match[0].split('\n').length - (match[2] ? 1 : 0)
  return { front: match[1], lines: text.split('\n'), skip }
}

// Blanks every line inside a fenced code block. A fence closes only on the same
// character, at least as long, with nothing after it, so a four-backtick fence can
// hold a three-backtick one.
export function maskCode(lines) {
  let open = null
  return lines.map(line => {
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
    if (open) {
      if (fence && fence[1][0] === open[0] && fence[1].length >= open.length && !fence[2].trim()) open = null
      return ''
    }
    if (fence && !(fence[1][0] === '`' && fence[2].includes('`'))) {
      open = fence[1]
      return ''
    }
    return line
  })
}

// The lines a reader sees as prose, with code, frontmatter, comments and MDX lines blanked.
export function proseLines(text) {
  const { lines, skip } = frontmatter(text)
  const masked = maskCode(lines).map((line, i) => (i < skip ? '' : line))
  let comment = false
  return masked.map(line => {
    let out = ''
    let rest = line
    while (rest) {
      if (comment) {
        const end = rest.indexOf('-->')
        if (end < 0) { rest = ''; break }
        comment = false
        rest = rest.slice(end + 3)
      } else {
        const start = rest.indexOf('<!--')
        if (start < 0) { out += rest; break }
        out += rest.slice(0, start)
        comment = true
        rest = rest.slice(start + 4)
      }
    }
    if (/^\s*(import|export)\s/.test(out)) return ''
    return out
  })
}

const visibleText = line => line
  .replace(/(`+)[\s\S]*?\1/g, '')
  .replace(/\]\([^)]*\)/g, ']')
  .replace(/^\s*\[[^\]]+\]:\s*\S+.*$/, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&[a-z#0-9]+;/gi, '')
  .replace(/https?:\/\/\S+/g, '')

// GitHub's heading anchor: lowercase, punctuation dropped, spaces to hyphens.
export function slug(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .replace(/ /g, '-')
}

export function anchors(text) {
  const seen = new Map()
  const found = new Set()
  for (const line of proseLines(text)) {
    const heading = /^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)
    if (heading) {
      let title = heading[1]
      const custom = /\s*\{#([\w-]+)\}\s*$/.exec(title)
      if (custom) {
        found.add(custom[1])
        title = title.slice(0, custom.index)
      }
      const base = slug(title)
      const count = seen.get(base) ?? 0
      seen.set(base, count + 1)
      found.add(count ? `${base}-${count}` : base)
    }
    for (const match of line.matchAll(/\b(?:id|name)="([^"]+)"/g)) found.add(match[1])
  }
  return found
}

// Every link target on the page, with its line number.
export function links(text, { wiki = false } = {}) {
  const found = []
  proseLines(text).forEach((raw, index) => {
    const line = raw.replace(/(`+)[\s\S]*?\1/g, '')
    const add = target => found.push({ target: target.trim(), line: index + 1 })
    for (const m of line.matchAll(/\]\(\s*<([^>]+)>/g)) add(m[1])
    for (const m of line.matchAll(/\]\(\s*([^)\s<]+)/g)) add(m[1])
    for (const m of line.matchAll(/\b(?:href|src)="([^"]+)"/g)) add(m[1])
    const def = /^ {0,3}\[[^\]]+\]:\s*<?([^\s>]+)/.exec(line)
    if (def) add(def[1])
    if (wiki) {
      for (const m of line.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const parts = m[1].split('|')
        found.push({ target: parts.at(-1).trim(), line: index + 1, wiki: true })
      }
    }
  })
  return found
}

// Checks one page on its own: title, verified line, placeholders, the Writing law.
export function lintPage(text, { name = 'page.md', wiki = false } = {}) {
  const problems = []
  const add = (line, problem) => problems.push({ line, problem })
  const { front } = frontmatter(text)
  const prose = proseLines(text)
  const chrome = WIKI_CHROME.test(name)

  if (!chrome && !wiki) {
    const titled = /^title\s*:\s*\S/im.test(front) || prose.some(line => /^ {0,3}#\s+\S/.test(line) || /<h1\b/i.test(line))
    if (!titled) add(1, 'no title: add a "# " heading or a frontmatter title')
  }
  if (!chrome) {
    const body = prose.join('\n')
    const released = /^(changelog|history|releases?|release-notes)\.(md|mdx|markdown)$/i.test(name) && prose.some(line => /^ {0,3}#{2,3}\s/.test(line) && DATE.test(line))
    const visible = maskCode(text.split('\n')).map(line => line.replace(/(`+)[\s\S]*?\1/g, '')).join('\n')
    const dated = FRESH_KEY.test(front) || FRESH_LINE.test(body) || SOURCE.test(visible) || released
    if (!dated) add(1, 'no verified line: add "Last verified: YYYY-MM-DD", a review_date, or a source')
  }

  prose.forEach((line, i) => {
    const at = i + 1
    const words = visibleText(line)
    if (/\{\{[^}]+\}\}/.test(words)) add(at, 'an unfilled {{field}} remains')
    if (words.includes('\u2014')) add(at, 'em dash')
    if (words.includes('\u2013')) add(at, 'en dash')
    if (words.includes(';')) add(at, 'semicolon in prose')
    const hype = HYPE.exec(words.replace(/[*_~[\]]/g, ''))
    if (hype) add(at, `marketing word "${hype[0]}"`)
  })
  return problems
}

function walk(root) {
  const files = []
  const visit = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) visit(full)
      else if (PAGE.test(entry.name)) files.push(relative(root, full).split(sep).join('/'))
    }
  }
  visit(root)
  return files.sort()
}

// Walks the path one segment at a time against directory listings, so the answer is the
// same on a case-sensitive and a case-insensitive file system. Returns 'exact' when every
// segment matches the disk's spelling, as GitHub requires, 'case' when a segment differs
// only in case, { unlisted: dir } when a folder on the path cannot be listed, and null
// when the path does not exist. A folder above the docs root came from the command line,
// not from a link, so its listing is not needed, and a path under the root keeps the root's
// spelling.
const listing = new Map()
const above = (dir, root) => dir !== root && (root + sep).startsWith(dir.endsWith(sep) ? dir : dir + sep)
function lookup(path, root) {
  let dir = resolve(path)
  const parts = []
  const inside = relative(root, dir)
  if (inside !== '..' && !inside.startsWith(`..${sep}`) && !isAbsolute(inside)) {
    parts.push(...inside.split(sep).filter(Boolean))
    dir = root
  } else {
    while (dirname(dir) !== dir) {
      parts.unshift(basename(dir))
      dir = dirname(dir)
    }
  }
  let found = 'exact'
  for (const part of parts) {
    if (!listing.has(dir)) {
      // A file or a missing folder lists nothing. Any other failure, such as EACCES or EIO, leaves the listing unknown.
      try { listing.set(dir, readdirSync(dir)) } catch (error) { listing.set(dir, ['ENOENT', 'ENOTDIR'].includes(error.code) ? [] : null) }
    }
    const names = listing.get(dir)
    if (!names && !above(dir, root)) return { unlisted: dir }
    if (names && !names.includes(part)) {
      const other = names.find(name => name.toLowerCase() === part.toLowerCase())
      if (!other) return null
      found = 'case'
      dir = join(dir, other)
    } else dir = join(dir, part)
  }
  return existsSync(dir) ? found : null
}
// GitHub renders a link only when it names the file or folder exactly. A site generator
// also resolves a bare name to its .md file or folder index, so --site allows those.
function resolveTarget(from, target, root, site) {
  const existsExact = path => lookup(path, root) === 'exact'
  const base = target.startsWith('/') ? join(root, target) : join(dirname(from), target)
  const tries = [base, ...(site ? [`${base}.md`, `${base}.mdx`, join(base, 'index.md'), join(base, 'index.mdx')] : [])]
  for (const candidate of tries) {
    if (!existsExact(candidate)) continue
    if (statSync(candidate).isFile()) return candidate
    if (candidate === base) {
      const indexes = ['README.md', 'index.md', '_index.md', 'index.mdx', 'SUMMARY.md'].map(name => join(base, name))
      const index = indexes.find(existsExact)
      if (index) return index
      return indexes.some(path => lookup(path, root) === 'case') ? { wrongCase: true } : base
    }
  }
  const looks = tries.map(candidate => lookup(candidate, root))
  if (looks.includes('case')) return { wrongCase: true }
  return looks.find(look => look?.unlisted) ?? null
}

const wikiName = name => name.replace(/\.(md|mdx|markdown)$/i, '').replace(/[ -]+/g, '-').toLowerCase()

// Checks the whole tree. Returns "path:line: problem" strings.
export function checkTree(root, { wiki = false, index, site = false } = {}) {
  root = resolve(root)
  listing.clear()
  const files = walk(root)
  const problems = []
  const report = (file, line, problem) => problems.push(`${file}:${line}: ${problem}`)
  const texts = new Map(files.map(f => [f, readFileSync(join(root, f), 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n')]))
  const anchorCache = new Map()
  const anchorsOf = file => {
    if (!anchorCache.has(file)) anchorCache.set(file, anchors(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')))
    return anchorCache.get(file)
  }
  const byWikiName = new Map(files.map(f => [wikiName(basename(f)), f]))
  const graph = new Map(files.map(f => [f, new Set()]))

  for (const [file, text] of texts) {
    for (const { line, problem } of lintPage(text, { name: basename(file), wiki })) report(file, line, problem)
    if (!wiki && DECISION_DIR.test(file)) {
      const name = basename(file)
      if (!/^(index|readme|template|adr-template)\.mdx?$/i.test(name) && !DECISION_NAME.test(name)) {
        report(file, 1, 'decision record name: use NNNN-short-title.md')
      }
    }
    const full = join(root, file)
    for (const link of links(text, { wiki })) {
      const { target } = link
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) continue
      if (site && (target.startsWith('/') || /\.html?(#|$)/i.test(target))) {
        // The route is not checked, but the page it names still counts as reached.
        let route = target.split('#')[0].split('?')[0]
        try { route = decodeURIComponent(route) } catch {}
        const hit = resolveTarget(full, route.replace(/\.html?$/i, ''), root, true)
        if (typeof hit === 'string') {
          const rel = relative(root, hit).split(sep).join('/')
          if (graph.has(rel)) graph.get(file).add(rel)
        }
        continue
      }
      if (link.wiki) {
        const [page, fragment] = target.split('#')
        const hit = byWikiName.get(wikiName(page))
        if (!hit) report(file, link.line, `broken wiki link [[${target}]]`)
        else {
          graph.get(file).add(hit)
          if (fragment && !anchorsOf(join(root, hit)).has(fragment.toLowerCase())) report(file, link.line, `broken anchor [[${target}]]`)
        }
        continue
      }
      const [rawPath, fragment] = target.split('#')
      let path
      try { path = decodeURIComponent(rawPath.split('?')[0]) } catch { path = rawPath }
      if (!path) {
        if (fragment && !anchorsOf(full).has(decodeURIComponent(fragment))) report(file, link.line, `broken anchor #${fragment}`)
        continue
      }
      let hit = resolveTarget(full, path, root, site)
      if (!hit && wiki) {
        const page = byWikiName.get(wikiName(basename(path)))
        if (page) hit = join(root, page)
      }
      if (!hit) { report(file, link.line, `broken link ${target}`); continue }
      if (hit.wrongCase) { report(file, link.line, `broken link ${target}: the case differs from the file on disk`); continue }
      if (hit.unlisted) { report(file, link.line, `cannot check ${target}: the folder ${relative(root, hit.unlisted).split(sep).join('/')} cannot be listed to compare the case`); continue }
      const rel = relative(root, hit).split(sep).join('/')
      if (graph.has(rel)) graph.get(file).add(rel)
      if (fragment && PAGE.test(hit) && !anchorsOf(hit).has(decodeURIComponent(fragment))) {
        report(file, link.line, `broken anchor ${target}`)
      } else if (fragment && statSync(hit).isDirectory()) {
        report(file, link.line, `broken anchor ${target}: the folder has no index page to hold it`)
      }
    }
  }

  const roots = wiki
    ? files.filter(f => /^(home|_sidebar|_footer)\.(md|mdx|markdown)$/i.test(f))
    : [index ?? INDEXES.find(name => texts.has(name))].filter(Boolean)
  if (wiki && !files.some(f => /^home\./i.test(f))) report('Home.md', 1, 'no Home page')
  if (wiki && !files.some(f => /^_sidebar\./i.test(f))) report('_Sidebar.md', 1, 'no _Sidebar: add one that lists every page')
  if (!wiki && roots.length === 0) report('.', 1, `no index page: add one of ${INDEXES.slice(0, 2).join(' or ')}`)
  if (!wiki && index && !texts.has(index)) report(index, 1, 'the named index page does not exist')
  if (roots.length > 0) {
    const reached = new Set(roots)
    const queue = [...roots]
    while (queue.length) for (const next of graph.get(queue.shift()) ?? []) if (!reached.has(next)) { reached.add(next); queue.push(next) }
    for (const file of files) if (!reached.has(file)) report(file, 1, `orphan: no link path from ${roots.join(' or ')}`)
  }
  return { problems, pages: files.length }
}

function main() {
  const args = process.argv.slice(2)
  const dir = args.find((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--index')
  if (!dir || (args.includes('--index') && args.at(-1) === '--index')) {
    console.error('usage: docs-check.mjs <docs folder> [--index <page>] [--wiki] [--site]')
    process.exit(2)
  }
  const index = args.includes('--index') ? args[args.indexOf('--index') + 1] : undefined
  const { problems, pages } = checkTree(dir, { wiki: args.includes('--wiki'), index, site: args.includes('--site') })
  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exit(1)
  }
  console.log(`ok: ${dir}, ${pages} pages`)
}

// import.meta.main (Node 22.18 or later on the 22 line, or 24.2 or later) also covers an entry path a loader maps here.
// Without it, the realpath check covers a direct `node <file>` run and a symlink, but not a loader-mapped entry.
if (import.meta.main ?? realpathSync(fileURLToPath(import.meta.url)) === (process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null)) main()
