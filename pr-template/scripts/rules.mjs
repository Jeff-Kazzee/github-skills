// The rules for a PR body. pr-body.mjs is the command line. Everything here but render() is offline.

import { execFileSync } from 'node:child_process'
import { extname } from 'node:path'

export const SECTIONS = ['ELI5', 'What Changed', 'Why', 'Linked Issue', 'Proof', 'Testing', 'Risk', 'AI Disclosure',
  'Review', 'Checklist']
const LABELS = {
  'What Changed': ['Before', 'After', 'Mechanism'],
  Risk: ['Level', 'Rationale', 'Verification', 'Rollback', 'Unresolved concerns'],
  Review: ['Impact'],
}
const ANY_LABEL = new RegExp(`\\*\\*(?:${Object.values(LABELS).flat().join('|')}):\\*\\*`)
export const VIDEOS = new Set(['.mp4', '.webm', '.mov'])
const PIN = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/blob\/([0-9a-f]{40})\/([^?#]+)\?raw=true$/
const GITHUB_HOSTED = /^https:\/\/(github\.com\/user-attachments\/|github\.com\/[\w.-]+\/[\w.-]+\/assets\/|(private-)?user-images\.githubusercontent\.com\/|github\.githubassets\.com\/images\/icons\/emoji\/)/
const EM_DASH = String.fromCharCode(0x2014)
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s/

export function run(cmd, args, input) {
  return execFileSync(cmd, args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

// Throws, so a cleanup in a finally block still runs. The command line prints it.
export function fail(message) {
  throw new Error(message)
}

function isBare(text) {
  return /^\W*(n\/?a|none)\W*$/i.test(text)
}

// Sorts a body into what a reader sees: comments gone, fenced code apart, headings found. Offline, so it
// follows the common Markdown cases and is a format check, not a renderer.
function parse(raw) {
  const lines = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let fence
  let comment = false
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i]
    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/)
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = undefined
      else blocks.push({ kind: 'code', text: line })
      continue
    }
    if (comment) {
      const end = line.indexOf('-->')
      if (end < 0) continue
      comment = false
      line = line.slice(end + 3)
    }
    line = line.replace(/<!--.*?-->/g, '')
    const start = line.indexOf('<!--')
    if (start >= 0) {
      comment = true
      line = line.slice(0, start)
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (open) {
      fence = open[1]
      continue
    }
    const atx = line.match(/^ {0,3}(#{1,6})(?:[ \t]+(.*?))??(?:[ \t]+#+)?[ \t]*$/)
    if (atx) {
      blocks.push({ kind: 'heading', level: atx[1].length, text: (atx[2] ?? '').trim() })
      continue
    }
    const underline = lines[i + 1]?.match(/^ {0,3}(=+|-{2,})\s*$/)
    if (underline && line.trim() && !LIST_ITEM.test(line)) {
      blocks.push({ kind: 'heading', level: underline[1][0] === '=' ? 1 : 2, text: line.trim() })
      i += 1
      continue
    }
    blocks.push({ kind: 'text', text: line })
  }
  return blocks
}

function hasContent(blocks) {
  if (blocks.some(block => block.kind === 'code' && block.text.trim())) return true
  const text = blocks.filter(block => block.kind === 'text').map(block => block.text).join(' ')
  if (/!\[|<img\b/.test(text)) return true
  const plain = text.replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim()
  return plain !== '' && !isBare(plain)
}

function sectionsOf(blocks) {
  const sections = []
  let current
  for (const block of blocks) {
    if (block.kind === 'heading' && block.level === 2) {
      current = { heading: block.text === 'Visual Proof' ? 'Proof' : block.text, blocks: [] }
      sections.push(current)
    } else if (current) current.blocks.push(block)
  }
  return sections
}

// A label's value runs to the next label or heading. In a list it also ends at the next item.
function labelValue(section, label) {
  const mark = `**${label}:**`
  const at = section.blocks.findIndex(block => block.kind === 'text' && block.text.includes(mark))
  if (at < 0) return undefined
  const first = section.blocks[at].text
  const value = [{ kind: 'text', text: first.slice(first.indexOf(mark) + mark.length) }]
  for (const block of section.blocks.slice(at + 1)) {
    if (block.kind === 'heading' || (block.kind === 'text' && ANY_LABEL.test(block.text))) break
    if (LIST_ITEM.test(first) && block.kind === 'text' && LIST_ITEM.test(block.text)) break
    value.push(block)
  }
  return value
}

function firstParagraph(value) {
  const end = value.findIndex((block, i) => i > 0 && block.kind === 'text' && !block.text.trim())
  return (end < 0 ? value : value.slice(0, end)).map(block => block.text).join(' ')
}

// Problems in a body, from its source. It proves the format, never that the claims are true. `head` is
// the full SHA the proof must name, in Testing or in Verification, so a stale body fails after a push.
export function lintSource(raw, head) {
  const problems = []
  const blocks = parse(raw)
  const sections = sectionsOf(blocks)
  const known = sections.filter(section => SECTIONS.includes(section.heading))
  const found = known.map(section => section.heading)
  for (const section of known) {
    if (!hasContent(section.blocks)) problems.push(`empty section: ${section.heading}`)
  }
  for (const section of SECTIONS) {
    if (!found.includes(section)) problems.push(`missing section: ${section}`)
  }
  const present = SECTIONS.filter(section => found.includes(section))
  if (found.join('|') !== present.join('|')) problems.push(`sections out of order: ${found.join(', ')}`)
  const inSection = name => known.find(section => section.heading === name)
  for (const [name, labels] of Object.entries(LABELS)) {
    const section = inSection(name)
    if (!section) continue
    for (const label of labels) {
      const value = labelValue(section, label)
      if (label === 'Level') {
        if (!value) problems.push('missing **Level:**')
        else if (!/\b(low|medium|high)\b/i.test(firstParagraph(value))) problems.push('**Level:** must say Low, Medium or High')
      } else if (!value) problems.push(`missing **${label}:**`)
      else if (!hasContent(value)) problems.push(`empty **${label}:**`)
      else if (label === 'Rollback' && !/\b(one|two)-way\b/i.test(value.map(block => block.text).join(' '))) {
        problems.push('**Rollback:** must say one-way or two-way door')
      }
    }
  }
  const testing = inSection('Testing')
  if (testing) {
    const text = testing.blocks.map(block => block.text).join('\n')
    if (/^\s*- \[x\] I manually tested/im.test(text) && !/manual run:/i.test(text)) {
      problems.push('manual test box is checked with no Manual run line')
    }
  }
  const prose = blocks.filter(block => block.kind === 'text').map(block => block.text.replace(/`[^`]*`/g, '')).join('\n')
  if (prose.includes('{{')) problems.push('unfilled {{field}}')
  if (raw.includes(EM_DASH)) problems.push('em dash')
  if (!/\n\s*Task: (\d+|none)\s*$/.test(raw)) problems.push('last line is not Task: <id or none>')
  if (head) {
    const proof = [testing, inSection('Risk')].filter(Boolean).flatMap(section => section.blocks).map(block => block.text).join('\n')
    if (!new RegExp(`\\b${head}\\b`).test(proof)) problems.push(`Testing or Verification does not name the full head ${head}`)
  }
  return problems
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]?.replace(/&amp;/g, '&')
}

// Sorts what a reader will load, from rendered HTML: pins on this repo to look up, and problems found on sight.
export function classifyMedia(html, repo) {
  const wanted = repo.toLowerCase()
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(m => attribute(m[0], 'data-canonical-src') ?? attribute(m[0], 'src'))
  const links = [...html.matchAll(/<a\b[^>]*>/g)].map(m => attribute(m[0], 'href'))
    .filter(url => url?.match(PIN)?.[1].toLowerCase() === wanted && VIDEOS.has(extname(url.match(PIN)[3]).toLowerCase()))
  const pins = []
  const problems = []
  for (const url of new Set([...images, ...links])) {
    if (GITHUB_HOSTED.test(url)) continue
    const pin = url?.match(PIN)
    if (pin?.[1].toLowerCase() === wanted) pins.push({ url, sha: pin[2], path: pin[3] })
    else problems.push(`not on an evidence ref: ${url}`)
  }
  return { pins, problems }
}

// Sends the whole body to GitHub. Only an explicit --render or an already posted PR reaches this.
export async function render(text, repo, online) {
  const request = JSON.stringify({ text, mode: 'gfm', context: repo })
  if (online) return run('gh', ['api', 'markdown', '--input', '-'], request)
  const response = await fetch('https://api.github.com/markdown', { method: 'POST', body: request })
    .catch(error => fail(`could not reach GitHub to render this body: ${error.message}`))
  if (!response.ok) fail(`GitHub would not render this body: HTTP ${response.status}`)
  return response.text()
}
