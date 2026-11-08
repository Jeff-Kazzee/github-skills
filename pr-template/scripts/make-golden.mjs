#!/usr/bin/env node
// Renders the media test cases through GitHub and saves the HTML, so the tests run offline against
// real renderer output. It sends every fixture body to GitHub, so it needs --send and approval.

import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { fragmentOf, mediaCases, repo } from './cases.mjs'
import { render } from './rules.mjs'

if (!process.argv.includes('--send')) throw new Error('this sends the fixtures to GitHub. Get approval, then pass --send.')
const golden = {}
for (const [name, { body }] of Object.entries(mediaCases)) {
  golden[name] = {
    sha256: createHash('sha256').update(fragmentOf(body)).digest('hex'),
    html: await render(body, repo, true),
  }
}
writeFileSync(new URL('./golden.json', import.meta.url), `${JSON.stringify(golden, null, 1)}\n`)
console.log(`rendered ${Object.keys(golden).length} cases`)
