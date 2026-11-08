---
name: contributing
description: Writes or rewrites a repo's CONTRIBUTING.md so a first-time contributor gets from a fresh clone to a merged PR, and links SECURITY, CODE_OF_CONDUCT and SUPPORT. Use when a repo needs one, or its guide is stale. Not for the README, use `readme`. Not for a PR body, use `pr-template`.
---

# Contributing

A contributing guide takes a stranger from "can I help?" to a merged pull request.
Every command in it runs on a fresh clone, and every link opens. The numbers below
come from 125 CONTRIBUTING files measured in
[references/sources.md](references/sources.md).

## 1. Gather the facts

Read the repo and run it. Write down each of these, from a file or a command output you
saw in this session:

- The tool versions it needs, from `package.json` engines, `.nvmrc`, `rust-toolchain`,
  `go.mod`, `pyproject.toml` or the CI workflow.
- The install, build, test and lint commands. CI is the source of truth.
- The default branch, the merge method, and the commit format in `git log`.
- Where questions go: Discussions, a chat server or a forum.
- Which health files exist: `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, issue
  and PR templates. Look in the root, `.github/` and `docs/`, and in the org's `.github`
  repo, which supplies defaults.
- Any DCO, CLA or AI policy the project already has.

Done when each fact has a source. A fact you could not confirm stays as `[JEFF]` for the
owner to fill.

## 2. Pick the shape

| Project | Shape |
|---|---|
| Has a guide hosted elsewhere | A pointer file under 250 words that links to it. 27 of 125 files do this. |
| Everything else | A full guide from the template, between 700 and 2,100 words, the middle half of the sample |

A full guide past 2,500 words moves its detail into `docs/` and links it. Put the file
at the repo root, where 100 of 125 files live.

Done when you have picked one shape.

## 3. Write from the template

Copy [references/template.md](references/template.md) and fill every field. Its section
order is the median order in the sample: getting help, reporting issues, setting up,
making a change, running tests, commit messages, pull requests, AI policy, code of
conduct, signing your work.

- Setting up holds one `sh` block that starts with `git clone` and ends with a built
  project. Only 26% of full guides show the clone, and that is the step a first-timer
  most needs.
- Running tests holds the same commands CI runs.
- Link the other health files. Do not copy them in.
  - Reporting issues links `SECURITY.md`, or the repo's private advisory form. 65 of 83
    repos with a SECURITY.md never mention it in CONTRIBUTING.
  - Code of conduct links `CODE_OF_CONDUCT.md`.
  - Getting help links `SUPPORT.md` when it exists.
- Keep an AI section. 28% of the sample has one, including Rust, Node.js, TypeScript,
  Electron and Vite. State what the project allows and that the contributor owns every
  line.
- Say "open an issue first" for large changes (opensource.guide).
- Thank the reader in the first lines (Mozilla), and keep the rest plain.
- Use relative links for files in the repo. GitHub resolves them from the file's folder.

Follow the Writing law. Run `unslop` on the prose. Done when no `{{field}}` is left.

## 4. Check it

Run from the repo root, in the repo's checkout on `linveo-16gb` when it has one:

```sh
node <this skill's folder>/scripts/contributing-check.mjs CONTRIBUTING.md --online --clone <repo url or path>
```

A pointer file (no `##` headings, under 250 words) skips the section and setup rules.
It must link the hosted guide over http, and still links the security policy. If it
holds `sh` commands, `--clone` runs them on a fresh clone like setup commands.

The check fails on any of these:

- A missing, empty or out-of-order required section: getting help, reporting issues,
  setting up, running tests, pull requests, code of conduct.
- A setup section with no `sh` block, no clone command, or more than 8 commands. A tests
  section with no `sh` block.
- No link to a security policy. A code of conduct section with no link. A SUPPORT.md the
  file does not link.
- A relative link to a file that does not exist, or to a heading that does not exist.
- An em or en dash, a semicolon in prose, a marketing adjective, or more than 2,500
  words.
- With `--online`, a dead `http` link.
- With `--clone`, a setup or test command, or a pointer file's command, that fails on a
  fresh clone. The check skips the clone and the first `cd` into the cloned folder.

`--clone` runs the commands on the machine you run it on. For a repo Jeff owns, run it
on `linveo-16gb`. For anything else, run it in a sandbox, or leave `--clone` off and say
so. Pass `--root <dir>` when the file is not inside a git checkout.

Done when the command exits 0 on the commit you will publish. A failure means the guide
or the project is wrong. Fix whichever one lied.

## 5. Publish

Link the guide from the README's Contributing section. Open the change as a normal PR
with the `pr-template` skill, and put the check's output in Proof. For a public repo,
Jeff approves the text before it goes out.

## Example

A Node library has `SECURITY.md` and `CODE_OF_CONDUCT.md` in `.github/`, CI runs
`pnpm test` and `pnpm lint`, and questions go to Discussions. The setup section reads:

```sh
git clone https://github.com/example/lantern.git
cd lantern
pnpm install
pnpm build
```

Reporting issues ends with "Do not report a security vulnerability in a public issue.
Follow [SECURITY.md](.github/SECURITY.md) instead." Running tests lists `pnpm test` and
`pnpm lint`. The check then prints a line that starts with `ok: CONTRIBUTING.md` and
exits 0.
