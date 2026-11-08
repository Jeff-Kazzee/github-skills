---
name: repo-docs
description: Shapes a repo's docs folder and GitHub wiki, their pages, names, order and links, with a template per page type and a link check. Use when adding, reorganizing or auditing docs or a wiki. Not for the README or CONTRIBUTING, use `readme` or `contributing`. Not for sentences, use `technical-writing`.
---

# Repo docs

Docs are a set of pages a reader moves through, not a pile of files. This skill owns
the set: where it lives, which pages it has, what each page type looks like, and
whether every link still lands. The `technical-writing` skill owns the sentences on
each page. The `readme` and `contributing` skills own those two root files. Every rule here traces to [references/sources.md](references/sources.md).

## 1. Pick the home

Use one home per audience, and say in each one where the others are.

| Home | Holds | Why |
|---|---|---|
| `docs/` in the repo | User and contributor docs. The default. | Reviewed in PRs, versioned with the code, checked in CI |
| GitHub wiki (`<repo>.wiki.git`) | Community notes and a table of contents that points into `docs/` | Edited without review, searchable only past 500 stars with editing locked, soft limit of 5,000 files |
| `wiki/` folder in the repo | Jeff's plans, decisions and research, per the Wiki law | House rule. It is a docs folder, so this skill and its check apply to it too |

Pick the wiki for reference material only when the project already runs one that people
use. Of 26 wikis sampled, 5 Home pages send readers elsewhere and 3 are empty welcome
pages.

Done when every page you plan has one home, and each home links to the others.

## 2. Lay out the folder

- Give the folder an index page, `docs/README.md`, so GitHub shows it when someone opens
  the folder. Copy the index template. A folder built by a site generator can keep its
  nav in config, but the index page still lists every section.
- Add a type's subfolder (`tutorials/`, `how-to/`, `concepts/`, `reference/`) when you
  write its first page. Never create an empty one.
- Name files in lowercase kebab case after the page's subject: `install.md`,
  `cache.md`, `cli.md`.
- Let the index set the reading order. Number file names (`01-install.md`) only for
  content read front to back, such as a tutorial series. Pad to two digits.
- Keep decision records in `docs/adr/` as `NNNN-short-title.md`. The `domain-modeling`
  skill decides whether a decision earns a record and where records live.
- Put `ARCHITECTURE.md` and `CHANGELOG.md` at the repo root, beside the README, and
  link both from the index.
- Order a section's pages from broad to specific: concepts, reference, tasks,
  troubleshooting. Split a section past about ten pages.

Done when every page sits in a folder that has an index, and the index lists it.

## 3. Write each page from its template

One page, one type. Copy the matching block from
[references/page-templates.md](references/page-templates.md) and fill every `{{field}}`.

| Type | Answers | Title shape | Median words |
|---|---|---|---:|
| Tutorial | "Teach me by doing" | The thing built: `Build a chat bot` | 574 |
| How-to | "How do I reach this goal?" | Verb and object: `Rotate a key` | 555 |
| Reference | "What exactly is X?" | `<Thing> reference` | 387 |
| Explanation | "Why is it this way?" | A noun phrase that fits after "About" | 543 |
| Decision record | "Why did we choose this?" | `NNNN. <decision>` | 160 |
| Architecture | "Where is the code that does X?" | `Architecture` | 606 |
| Troubleshooting | "Why does this fail?" | `Troubleshoot <feature>`, with symptoms as headings | 415 |
| FAQ | Short questions with links out | `Frequently asked questions` | 1,203 |
| Changelog | "What changed in this release?" | `Changelog` | 935 |

The medians come from pages classified by path, so treat them as a sense of scale, not
limits. When a page grows a second type, split it and link the parts. When an FAQ answer
grows past a paragraph, move it into its own page and link to it.

Write every sentence to the `technical-writing` standard, then run `unslop`.

Done when no `{{field}}` is left and each page holds one type.

## 4. Link, title and date every page

- Every page opens with one `#` title, or a frontmatter `title`. A wiki page takes its
  title from its file name.
- Every page carries `Last verified: YYYY-MM-DD against <version or commit>.` Change the
  date only after you check the page against that version. A frontmatter `review_date`,
  `last_review_date` or `last_modified`, or a `<!-- source: url -->`, also counts. A
  changelog's dated release headings count.
- Link with relative paths that name the file, `.md` included. GitHub does not resolve
  a bare `cli` to `cli.md`.
  Link text names the target page. Never "click here" or a bare URL.
- Link to a heading by its GitHub anchor: lowercase, punctuation dropped, spaces as
  hyphens. Every page is reachable by links from the index.
- A wiki gets `Home.md`, a `_Sidebar.md` that lists every page, and a `_Footer.md`
  that says how to change the wiki. Link wiki pages as `[[Page Name]]` or
  `[[Link text|Page Name]]`.

Done when the check in step 5 passes.

## 5. Check it

Run from the repo root, in the repo's checkout on `linveo-16gb` when it has one:

```sh
node <this skill's folder>/scripts/docs-check.mjs docs
node <this skill's folder>/scripts/docs-check.mjs <repo>.wiki --wiki
```

The check fails on any of these:

- A relative link or image to a missing file, or a link whose case differs from the
  file. Windows accepts a wrong case. GitHub does not.
- A link into a folder the check cannot list, because then it cannot compare the case.
- An anchor that matches no heading, custom `{#id}` or `id` attribute.
- An orphan: a page that no link path from the index reaches. Pass `--index <page>`
  when the index has another name.
- A page with no title, or no verified line.
- A decision record not named `NNNN-short-title.md`.
- An em dash, an en dash, a semicolon in prose, or a marketing word.
- In a wiki, no `Home.md` or no `_Sidebar.md`.

Pass `--site` for docs built by a site generator. It skips root-relative and `.html`
links, which only the built site resolves. Run `node --test` in the `scripts` folder
after you change the check.

Done when the command exits 0 on the commit you will publish. A failure means a page or
the folder is wrong. Fix the page, not the check.

## 6. Publish

Open the change as a PR with the `pr-template` skill, and put the check's output in
Proof. A wiki has no PRs, so an edit there is a direct publish. Draft the change and
wait for Jeff's approval before you push it to a public wiki.

## Worked example

A CLI repo has a 900-line README and a wiki with three stale pages. Move setup into
`docs/tutorials/first-project.md`, each command flag into `docs/reference/cli.md`, the
"why SQLite" section into `docs/concepts/storage.md` plus `docs/adr/0001-use-sqlite.md`,
known errors into `docs/troubleshooting.md`, and short questions into `docs/faq.md`. Write `docs/README.md` from the index
template and link it from the README's Documentation section. Cut the wiki to a Home
page that points into `docs/`, with a `_Sidebar.md` and a `_Footer.md`. Then run the
check:

```text
$ node docs-check.mjs docs
reference/cli.md:9: broken anchor ../concepts/storage.md#write-ahead-log
faq.md:1: orphan: no link path from README.md
```

The heading is "The WAL journal". Change the link to `#the-wal-journal` and add `faq.md` to the index. The rerun
prints `ok: docs, 7 pages`.
