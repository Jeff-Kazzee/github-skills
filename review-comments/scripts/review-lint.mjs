#!/usr/bin/env node
// Checks a drafted pull request review before it is posted.
// Input: the JSON body for POST /repos/{owner}/{repo}/pulls/{n}/reviews.
// Usage: node review-lint.mjs review.json
// Exit 0 when clean, 1 when a check fails, 2 on bad input.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LABEL = /^(blocking|question|suggestion|nit|praise)(\s*\((blocking|non-blocking)\))?:\s*\S/i;
const EXTREME = /\b(obviously|clearly wrong|terrible|horrible|stupid|insane|no sane|sloppy|ridiculous)\b/i;
const DASHES = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
const EVENTS = new Set(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']);

export function isBlocking(body) {
  const m = body.trim().match(LABEL);
  if (!m) return false;
  return m[1].toLowerCase() === 'blocking' || (m[3] || '').toLowerCase() === 'blocking';
}

export function hasEvidence(body) {
  // A code block, a link, a commit SHA, a line reference, or a shell command line.
  return /```|~~~|https?:\/\/|\b[0-9a-f]{7,40}\b|\blines? \d+|#L\d+|\w:\d+\b|^\s*\$ \S/im.test(body);
}

function fenceProblem(body) {
  // A fence opens with 3+ backticks or tildes and closes with the same run or longer.
  let open = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (!m) continue;
    if (!open) open = { run: m[1], info: m[2].trim() };
    else if (m[1][0] === open.run[0] && m[1].length >= open.run.length && m[2].trim() === '') open = null;
  }
  return open ? `unclosed ${open.info || 'code'} block` : null;
}

export function lint(review) {
  const problems = [];
  if (!review || typeof review !== 'object') return ['review is not a JSON object'];
  const comments = Array.isArray(review.comments) ? review.comments : [];
  const body = typeof review.body === 'string' ? review.body : '';

  if (!EVENTS.has(review.event)) problems.push(`event must be one of ${[...EVENTS].join(', ')}`);
  if (!review.commit_id) problems.push('commit_id is missing, so the review is not pinned to a head');
  if (!/^To merge:/m.test(body)) problems.push('summary has no "To merge:" line');

  const blocking = [];
  comments.forEach((c, i) => {
    const where = `comment ${i + 1}${c && c.path ? ` (${c.path}${c.line ? `:${c.line}` : ''})` : ''}`;
    const text = c && typeof c.body === 'string' ? c.body : '';
    if (!c || !c.path) problems.push(`${where}: path is missing`);
    if (!LABEL.test(text.trim())) problems.push(`${where}: does not start with a label (blocking, question, suggestion, nit, praise) and a colon`);
    if (isBlocking(text)) {
      blocking.push(i);
      if (!hasEvidence(text)) problems.push(`${where}: blocking comment carries no evidence (code, output, link, SHA or line)`);
    }
    const fence = fenceProblem(text);
    if (fence) problems.push(`${where}: ${fence}`);
  });

  if (review.event === 'REQUEST_CHANGES' && blocking.length === 0) problems.push('REQUEST_CHANGES with no blocking comment');
  if (review.event === 'APPROVE' && blocking.length > 0) problems.push(`APPROVE with ${blocking.length} blocking comment(s) open`);
  if (review.event === 'REQUEST_CHANGES' && /^To merge:\s*nothing/im.test(body)) problems.push('REQUEST_CHANGES but "To merge:" says nothing is required');

  for (const [name, text] of [['summary', body], ...comments.map((c, i) => [`comment ${i + 1}`, (c && c.body) || ''])]) {
    if (DASHES.test(text)) problems.push(`${name}: contains an em or en dash`);
    const x = text.match(EXTREME);
    if (x) problems.push(`${name}: extreme word "${x[0]}"`);
  }
  return problems;
}

if (realpathSync(fileURLToPath(import.meta.url)) === (process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node review-lint.mjs review.json'); process.exit(2); }
  let review;
  try { review = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { console.error(`cannot read ${file}: ${e.message}`); process.exit(2); }
  const problems = lint(review);
  for (const p of problems) console.log(`FAIL ${p}`);
  if (problems.length === 0) console.log('ok');
  process.exit(problems.length ? 1 : 0);
}
