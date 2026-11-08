#!/usr/bin/env node
// Checks a drafted GitHub Discussions post or reply against the discussions skill.
//
//   node discussion-check.mjs <draft.md> --kind <kind>
//   node discussion-check.mjs .github/DISCUSSION_TEMPLATE/<slug>.yml --kind form
//
// Kinds: question, idea, rfc, announcement, breaking, answer, status, to-issue, form.
// Exits 1 with one line per problem.

import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HYPE = /\b(blazing(ly)?|revolutionary|world-class|seamless(ly)?|powerful|robust|cutting-edge|best-in-class|game-changing|effortless(ly)?|next-generation|stunning|amazing|awesome|supercharge[sd]?)\b/i

// Each kind lists headings that must appear, as alternatives a heading may match.
export const HEADINGS = {
  idea: [['problem', 'motivation', 'background', 'user story'], ['proposal', 'solution', 'design'], ['alternative']],
  rfc: [
    ['summary'],
    ['motivation', 'background'],
    ['detailed design', 'design', 'proposal'],
    ['drawback'],
    ['alternative'],
    ['unresolved', 'open question'],
  ],
  breaking: [['what changed', 'what you get'], ['who is affected'], ['no action'], ['migration']],
}

const withoutFences = (text) => text.replace(/^```[\s\S]*?^```[ \t]*$/gm, (m) => m.replace(/[^\n]/g, ''))
const withoutCode = (text) => withoutFences(text).replace(/`[^`\n]*`/g, '')
const withoutComments = (text) => text.replace(/<!--[\s\S]*?-->/g, '')
const prose = (text) => withoutCode(withoutComments(text))

export function headings(text) {
  return prose(text)
    .split('\n')
    .map((l) => /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(l))
    .filter(Boolean)
    .map((m) => m[1].toLowerCase())
}

const hasLink = (text) => /https?:\/\/\S+/.test(text)
const hasFence = (text) => /^```/m.test(text)

// Checks every kind shares: the Writing law and leftover placeholders.
export function common(text) {
  const out = []
  const p = prose(text)
  if (/[\u2013\u2014]/.test(text)) out.push('contains an em dash or en dash')
  // Placeholders can sit inside fences, so check the whole text. `${{ }}` is an Actions expression.
  if (/(?<!\$)\{\{[^}]*\}\}/.test(text)) out.push('unfilled {{field}} placeholder')
  else if (/(?<!\$)\{\{|\}\}/.test(withoutCode(text))) out.push('stray {{ or }} left from a placeholder')
  p.split('\n').forEach((line, i) => {
    if (/^\s*(\||<|---)/.test(line)) return
    if (/[a-z)]\s*;\s+[a-z]/i.test(line)) out.push(`line ${i + 1}: semicolon in prose`)
    const hype = HYPE.exec(line)
    if (hype) out.push(`line ${i + 1}: marketing word "${hype[0]}"`)
  })
  return out
}

export function checkPost(text, kind) {
  const out = common(text)
  const hs = headings(text)
  for (const group of HEADINGS[kind] || []) {
    if (!hs.some((h) => group.some((g) => h.includes(g)))) out.push(`missing a heading for ${group[0]}`)
  }
  if (kind === 'question') {
    if (!hasFence(text)) out.push('a question needs a fenced block with the code, config or exact error')
    // A version written as inline code counts. One inside the error fence does not.
    if (!/\bv?\d+\.\d+(\.\d+)?\b/.test(withoutFences(withoutComments(text)))) out.push('a question needs the version it runs on, such as 15.2.1')
  }
  if (kind === 'answer') {
    if (!hasFence(text) && !hasLink(text)) out.push('an answer needs a code block or a link to the doc, issue or PR behind it')
    const first = prose(text).trim().split('\n')[0] || ''
    if (/^(hi|hey|hello|thanks|thank you)\b/i.test(first)) out.push('lead with the cause or the fix, not a greeting')
  }
  if (kind === 'announcement' || kind === 'breaking') {
    if (!hasLink(text)) out.push('an announcement needs a link to the release notes, docs or PR')
  }
  if (kind === 'status' && !/(\/issues\/\d+|\/pull\/\d+|#\d+)/.test(text)) out.push('a status reply needs a link to the issue or PR it reports on')
  if (kind === 'to-issue' && !/\/issues\/\d+|#\d+/.test(text)) out.push('a conversion reply needs the new issue link')
  return out
}

// A category form. The file name must be the category slug, so check what a file can show.
export function checkForm(text, file) {
  const out = common(text)
  const name = basename(file)
  if (!/^[a-z0-9-]+\.ya?ml$/.test(name)) out.push(`file name "${name}" must be a lowercase category slug ending in .yml`)
  if (/poll/.test(name)) out.push('discussion category forms do not support polls')
  if (!/^body:/m.test(text)) out.push('a form needs a top-level body key')
  const types = [...text.matchAll(/^\s*-\s*type:\s*(\w+)/gm)].map((m) => m[1])
  if (!types.some((t) => t !== 'markdown')) out.push('the body needs at least one field that is not markdown')
  // A validations key belongs to an input field, never a markdown element.
  const blocks = text.split(/^\s*-\s*type:\s*/m).slice(1)
  blocks.forEach((b) => {
    if (/^markdown\b/.test(b) && /^\s*validations:/m.test(b)) out.push('a markdown element carries validations, which applies only to input fields')
  })
  return out
}

function main(argv) {
  const file = argv[0]
  const k = argv.indexOf('--kind')
  const kind = k >= 0 ? argv[k + 1] : null
  const kinds = ['question', 'idea', 'rfc', 'announcement', 'breaking', 'answer', 'status', 'to-issue', 'form']
  if (!file || !kinds.includes(kind)) {
    console.error(`usage: discussion-check.mjs <file> --kind <${kinds.join('|')}>`)
    return 2
  }
  const text = readFileSync(file, 'utf8')
  const problems = kind === 'form' ? checkForm(text, file) : checkPost(text, kind)
  for (const p of problems) console.log(`${file}: ${p}`)
  if (!problems.length) console.log(`${file}: ok (${kind})`)
  return problems.length ? 1 : 0
}

if (realpathSync(fileURLToPath(import.meta.url)) === (process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null)) process.exitCode = main(process.argv.slice(2))
