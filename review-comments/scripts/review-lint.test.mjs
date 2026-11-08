import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lint, isBlocking, hasEvidence } from './review-lint.mjs';

const good = {
  commit_id: '3f2a9c1e7b04aa11',
  event: 'REQUEST_CHANGES',
  body: 'The fix makes sense. Checked at 3f2a9c1e.\n\nTo merge:\n1. Read `bufferSize` once.',
  comments: [
    { path: 'lib/dir.js', line: 41, body: 'blocking: `bufferSize` is read twice, so a getter returning 1 then 0 crashes the process.\n\n```js\nfs.opendirSync(".", { get bufferSize() { return n++ ? 0 : 1; } });\n```' },
    { path: 'lib/dir.js', line: 50, body: 'nit: the parent is a generator.\n\n```suggestion\n        yield from ()\n```' },
  ],
};

const one = (over) => lint({ ...good, ...over });

test('a well-formed review passes', () => {
  assert.deepEqual(lint(good), []);
});

test('an unlabelled comment fails', () => {
  const p = one({ comments: [{ path: 'a.js', line: 1, body: 'This looks off.' }], event: 'COMMENT' });
  assert.ok(p.some((x) => x.includes('does not start with a label')));
});

test('a blocking comment without evidence fails', () => {
  const p = one({ comments: [{ path: 'a.js', line: 1, body: 'blocking: this is wrong.' }] });
  assert.ok(p.some((x) => x.includes('carries no evidence')));
});

test('question (blocking) counts as blocking', () => {
  assert.equal(isBlocking('question (blocking): does this run on Windows?'), true);
  assert.equal(isBlocking('question: does this run on Windows?'), false);
});

test('evidence detection accepts code, links, SHAs, lines and commands', () => {
  assert.ok(hasEvidence('see line 41 of dir.js'));
  assert.ok(hasEvidence('repro:\n$ node t.js'));
  assert.ok(hasEvidence('see lib/dir.js:41'));
  assert.ok(!hasEvidence('this fails with an error'));
  assert.ok(hasEvidence('see https://example.com/x'));
  assert.ok(hasEvidence('on head 3f2a9c1e7b04'));
  assert.ok(!hasEvidence('this is wrong'));
});

test('approve with an open blocking comment fails', () => {
  const p = one({ event: 'APPROVE', body: 'Looks good.\n\nTo merge: nothing required.' });
  assert.ok(p.some((x) => x.startsWith('APPROVE with 1 blocking')));
});

test('request changes with no blocking comment fails', () => {
  const p = one({ comments: [good.comments[1]] });
  assert.ok(p.includes('REQUEST_CHANGES with no blocking comment'));
});

test('request changes that says nothing is required fails', () => {
  const p = one({ body: 'Hmm.\n\nTo merge: nothing required.' });
  assert.ok(p.some((x) => x.includes('says nothing is required')));
});

test('a summary without a To merge line fails', () => {
  const p = one({ body: 'Some nits.' });
  assert.ok(p.includes('summary has no "To merge:" line'));
});

test('an unclosed suggestion block fails', () => {
  const p = one({ comments: [good.comments[0], { path: 'a.js', line: 2, body: 'nit: x\n\n```suggestion\nfoo' }] });
  assert.ok(p.some((x) => x.includes('unclosed suggestion block')));
});

test('a four-backtick fence holding a three-backtick block is closed', () => {
  const body = 'suggestion: doc fix\n\n````suggestion\n```js\nx()\n```\n````';
  const p = one({ comments: [good.comments[0], { path: 'a.md', line: 3, body }] });
  assert.deepEqual(p, []);
});

test('lazy is a technical term, not an extreme word', () => {
  const p = one({ comments: [good.comments[0], { path: 'a.py', line: 1, body: 'question: is the lazy import still deferred here?' }] });
  assert.deepEqual(p, []);
});

test('dashes and extreme words fail', () => {
  const p = one({ body: 'Obviously broken ' + String.fromCharCode(0x2014) + ' sorry.\n\nTo merge:\n1. fix' });
  assert.ok(p.some((x) => x.includes('em or en dash')));
  assert.ok(p.some((x) => x.includes('extreme word')));
});

test('bad event and missing commit_id fail', () => {
  const p = one({ event: 'LGTM', commit_id: undefined });
  assert.ok(p.some((x) => x.startsWith('event must be')));
  assert.ok(p.some((x) => x.startsWith('commit_id is missing')));
});

test('CLI exits 0 on a clean file and 1 on a failing one', () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-lint-'));
  const script = join(dirname(fileURLToPath(import.meta.url)), 'review-lint.mjs');
  const ok = join(dir, 'ok.json');
  writeFileSync(ok, JSON.stringify(good));
  assert.match(execFileSync(process.execPath, [script, ok], { encoding: 'utf8' }), /ok/);
  const bad = join(dir, 'bad.json');
  writeFileSync(bad, JSON.stringify({ ...good, body: 'x' }));
  assert.throws(() => execFileSync(process.execPath, [script, bad], { encoding: 'utf8' }), (e) => e.status === 1);
});
