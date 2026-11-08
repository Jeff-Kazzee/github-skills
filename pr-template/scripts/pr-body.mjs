#!/usr/bin/env node
// Evidence and format checks for the pr-template skill.
//
//   node pr-body.mjs attach --task <id> --upload-approved [--public-ok] [--replace] <file>...
//   node pr-body.mjs check <body.md> [--head <sha>] [--render]
//   node pr-body.mjs check --pr <number>
//
// attach pushes files to refs/pr-evidence/<task> and prints Markdown for them. That is an upload, so
// it needs --upload-approved. check reads the body offline and sends nothing. --render posts the
// whole body to GitHub to check its images and its rendered sections, so use it only with approval to
// send that text. --pr reads a PR that is already on GitHub and checks it the same way. check exits 1
// with one line per problem.
//
// This file always runs. Installed copies reach it through links, so it holds no "am I the main
// module" guard. Tests import rules.mjs.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join, resolve } from 'node:path'
import { classifyMedia, fail, lintSource, render, renderedProblems, run, SECTIONS, VIDEOS } from './rules.mjs'

const IMAGES = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])
const MAX_BYTES = 50 * 1024 * 1024
const BOM = String.fromCharCode(0xfeff)

// A pin must be on a commit a refs/pr-evidence ref still holds. A contents lookup alone is not
// enough: GitHub answered one for a commit whose push was rejected.
function pinProblems(html, repo) {
  const { pins, problems } = classifyMedia(html, repo)
  if (pins.length === 0) return problems
  const refs = JSON.parse(run('gh', ['api', `repos/${repo}/git/matching-refs/pr-evidence/`]))
  const tips = refs.map(r => r.object.sha)
  for (const { url, sha, path } of pins) {
    const held = tips.some(tip => {
      try {
        const status = run('gh', ['api', `repos/${repo}/compare/${sha}...${tip}`, '--jq', '.status'])
        return status === 'identical' || status === 'ahead'
      } catch {
        return false
      }
    })
    if (!held) {
      problems.push(`not on an evidence ref: ${url}`)
      continue
    }
    try {
      run('gh', ['api', `repos/${repo}/contents/${path}?ref=${sha}`, '--jq', '.sha'])
    } catch {
      problems.push(`no such file on its commit: ${url}`)
    }
  }
  return problems
}

function originRepo() {
  try {
    return run('git', ['remote', 'get-url', 'origin']).match(/github\.com[:/](.+?\/.+?)(?:\.git)?\/?$/)?.[1]
  } catch {
    return undefined
  }
}

function signedIn() {
  try {
    run('gh', ['auth', 'status'])
    return true
  } catch {
    return false
  }
}

function storedName(path) {
  return basename(path).replace(/[^\w.-]+/g, '-')
}

function previewName(path) {
  const name = storedName(path)
  return `${basename(name, extname(name))}.preview.gif`
}

function gifOf(video, dir) {
  const gif = join(dir, previewName(video))
  const filter = 'fps=10,scale=720:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse'
  try {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-t', '30', '-i', video, '-vf', filter, gif], { stdio: 'pipe' })
  } catch (error) {
    if (error.code !== 'ENOENT') fail(`ffmpeg could not make a preview of ${video}: ${error.message.split('\n')[0]}`)
    console.error(`no ffmpeg here, so ${basename(video)} gets a plain link and no preview`)
    return undefined
  }
  return gif
}

function attach(args) {
  const files = []
  let task
  let publicOk = false
  let approved = false
  let replace = false
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--task') task = args[(i += 1)]
    else if (args[i] === '--public-ok') publicOk = true
    else if (args[i] === '--upload-approved') approved = true
    else if (args[i] === '--replace') replace = true
    else if (args[i].startsWith('--')) fail(`unknown option ${args[i]}. A file with that name is ./${args[i]}`)
    else files.push(args[i])
  }
  if (!task || !/^\w[\w-]*$/.test(task) || files.length === 0) {
    fail('usage: pr-body.mjs attach --task <id> --upload-approved [--public-ok] [--replace] <file>...')
  }
  if (!approved) fail('attach uploads these files to a persistent ref. Get the approval, then pass --upload-approved.')
  const names = new Map()
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (!IMAGES.has(ext) && !VIDEOS.has(ext)) fail(`${file}: paste logs and text into the body, attach only media`)
    if (!existsSync(file)) fail(`${file}: no such file`)
    if (statSync(file).size > MAX_BYTES) fail(`${file}: over 50 MiB, trim it first`)
    for (const name of VIDEOS.has(ext) ? [storedName(file), previewName(file)] : [storedName(file)]) {
      if (names.has(name)) fail(`${names.get(name)} and ${file} would both be stored as ${name}. Rename one.`)
      names.set(name, file)
    }
  }

  const repo = originRepo()
  if (!repo) fail('run attach inside a checkout whose origin is on GitHub')
  const visibility = run('gh', ['repo', 'view', repo, '--json', 'visibility', '--jq', '.visibility'])
  if (visibility === 'PUBLIC' && !publicOk) {
    fail(`${repo} is public. A ref there publishes these files for good. Get Jeff's yes, then pass --public-ok.`)
  }

  const scratch = mkdtempSync(join(tmpdir(), 'pr-evidence-'))
  try {
    const entries = new Map()
    const ref = `refs/pr-evidence/${task}`
    const parent = run('git', ['ls-remote', 'origin', ref]).split(/\s/)[0]
    if (parent) {
      run('git', ['fetch', '-q', 'origin', ref])
      for (const line of run('git', ['ls-tree', parent]).split('\n')) {
        if (line) entries.set(line.split('\t')[1], line)
      }
    }
    const add = path => {
      const name = storedName(path)
      const blob = run('git', ['hash-object', '-w', path])
      const held = entries.get(name)?.split(/\s/)[2]
      if (held && held !== blob && !replace) fail(`${ref} already holds a different ${name}. Rename it, or pass --replace.`)
      entries.set(name, `100644 blob ${blob}\t${name}`)
      return name
    }
    const items = files.map(file => {
      const video = VIDEOS.has(extname(file).toLowerCase())
      const gif = video ? gifOf(resolve(file), scratch) : undefined
      return { name: add(resolve(file)), video, preview: gif && add(gif) }
    })

    const tree = run('git', ['mktree'], `${[...entries.values()].join('\n')}\n`)
    const [id, login] = run('gh', ['api', 'user', '--jq', '"\\(.id) \\(.login)"']).split(' ')
    const email = `${id}+${login}@users.noreply.github.com`
    const parents = parent ? ['-p', parent] : []
    const commit = execFileSync('git', ['commit-tree', tree, ...parents, '-m', `PR evidence for task ${task}`], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'pr-evidence',
        GIT_AUTHOR_EMAIL: email,
        GIT_COMMITTER_NAME: 'pr-evidence',
        GIT_COMMITTER_EMAIL: email,
      },
    }).trim()
    run('git', ['push', '-q', 'origin', `${commit}:${ref}`])
    if (run('git', ['ls-remote', 'origin', ref]).split(/\s/)[0] !== commit) fail(`push did not land on ${ref}`)

    const url = name => `https://github.com/${repo}/blob/${commit}/${encodeURIComponent(name)}?raw=true`
    for (const { name, video, preview } of items) {
      if (preview) console.log(`[![${name}](${url(preview)})](${url(name)})`)
      else console.log(video ? `[${name}](${url(name)})` : `![${name}](${url(name)})`)
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

async function check(args) {
  const usage = 'usage: pr-body.mjs check <body.md> [--head <sha>] [--render] | --pr <number>'
  const value = flag => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined)
  if (args.includes('--pr')) {
    if (!/^\d+$/.test(value('--pr') ?? '')) fail(usage)
    const repo = signedIn() ? originRepo() : undefined
    if (!repo) fail('check --pr needs a signed-in gh, inside a checkout whose origin is on GitHub')
    const pr = JSON.parse(run('gh', ['pr', 'view', value('--pr'), '-R', repo, '--json', 'body,headRefOid']))
    const body = pr.body.replace(BOM, '')
    const html = await render(body, repo, true)
    const problems = [...lintSource(body, pr.headRefOid), ...renderedProblems(html), ...pinProblems(html, repo)]
    if (problems.length > 0) fail(problems.join('\n'))
    console.log(`ok: ${SECTIONS.length} sections, head ${pr.headRefOid}`)
    return
  }
  const path = args.find((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--head')
  const head = value('--head')
  if (!path) fail(usage)
  if (args.includes('--head') && !/^[0-9a-f]{40}$/.test(head ?? '')) fail('--head needs the full 40-character SHA')
  if (!existsSync(path)) fail(`${path}: no such file`)
  const body = readFileSync(path, 'utf8').replace(BOM, '')
  const problems = lintSource(body, head)
  if (args.includes('--render')) {
    const online = signedIn()
    const repo = online ? originRepo() : undefined
    if (!repo) console.error('no signed-in gh or GitHub origin here, so the image check was skipped')
    console.error('sent the whole body to api.github.com to render it')
    const html = await render(body, repo, online)
    problems.push(...renderedProblems(html))
    if (repo) problems.push(...pinProblems(html, repo))
  }
  if (problems.length > 0) fail(problems.join('\n'))
  console.log(`ok: ${SECTIONS.length} sections${head ? `, head ${head}` : ', head not bound'}${args.includes('--render') ? '' : ', images not checked'}`)
}

const [command, ...args] = process.argv.slice(2)
try {
  if (command === 'attach') attach(args)
  else if (command === 'check') await check(args)
  else fail('usage: pr-body.mjs attach|check')
} catch (error) {
  console.error(error.stderr?.toString().trim() || error.message)
  process.exitCode = 1
}
