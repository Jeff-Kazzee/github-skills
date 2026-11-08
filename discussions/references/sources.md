# Sources

Read on 2026-11-07. Every row below is a page or API result opened in that session.

## Rules

| Source | What this skill takes |
|---|---|
| [GitHub Docs, best practices for community conversations](https://github.com/github/docs/blob/main/content/discussions/guides/best-practices-for-community-conversations-on-github.md) | Discussions for ideas and early design, issues for scoped work. Check `CONTRIBUTING.md` before posting. |
| [GitHub Docs, managing categories](https://github.com/github/docs/blob/main/content/discussions/managing-discussions-for-your-community/managing-categories-for-discussions.md) | The six default categories and their formats: announcement, open-ended, Q&A, poll. Up to 25 categories. |
| [GitHub Docs, about discussions](https://github.com/github/docs/blob/main/content/discussions/collaborating-with-your-community-using-discussions/about-discussions.md) | Mark answers, pin, lock, convert issues, run polls |
| [GitHub Docs, participating in a discussion](https://github.com/github/docs/blob/main/content/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion.md) | Who can mark an answer: the author and triage or higher. A threaded reply can be the answer, a minimized comment cannot. |
| [GitHub Docs, collaborating with maintainers](https://github.com/github/docs/blob/main/content/discussions/collaborating-with-your-community-using-discussions/collaborating-with-maintainers-using-discussions.md) | Upvotes sort discussions and top-level comments. Convert an issue that is a question or an open conversation. |
| [GitHub Docs, moderating discussions](https://github.com/github/docs/blob/main/content/discussions/managing-discussions-for-your-community/moderating-discussions.md) | Lock a heated thread or an announcement. Convert an issue to a discussion. |
| [GitHub Docs, managing discussions](https://github.com/github/docs/blob/main/content/discussions/managing-discussions-for-your-community/managing-discussions.md) | Close when resolved, outdated or duplicate. Pin up to four. Create an issue from a discussion when it is ready to work on. |
| [GitHub Docs, creating an issue from a discussion](https://github.com/github/docs/blob/main/content/issues/tracking-your-work-with-issues/using-issues/creating-an-issue.md) | The issue copies the post and its labels. The discussion stays. |
| [GitHub Docs, creating discussion category forms](https://github.com/github/docs/blob/main/content/discussions/managing-discussions-for-your-community/creating-discussion-category-forms.md) | Forms live in `.github/DISCUSSION_TEMPLATE/` on the default branch. Polls take no form. |
| [GitHub Docs, syntax for discussion category forms](https://github.com/github/docs/blob/main/content/discussions/managing-discussions-for-your-community/syntax-for-discussion-category-forms.md) and [the slug rule](https://github.com/github/docs/blob/main/data/reusables/discussions/discussion-category-forms-name.md) | Top-level keys `body`, `labels`, `title`. At least one non-markdown field. File name equals the category slug. |
| [Rust RFCs README](https://github.com/rust-lang/rfcs/blob/master/README.md) and [template](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) | Summary, Motivation, Drawbacks, Rationale and alternatives, Prior art, Unresolved questions. Poor reception for RFCs "disingenuous about the drawbacks or alternatives". A summary comment before the final comment period. |
| [React RFCs README](https://github.com/reactjs/rfcs/blob/main/README.md) and [template](https://github.com/reactjs/rfcs/blob/main/0000-template.md) | Summary, Basic example, Motivation, Detailed design, Drawbacks, Alternatives, Adoption strategy, How we teach this, Unresolved questions |
| [Vue RFCs README](https://github.com/vuejs/rfcs/blob/master/README.md) | RFCs open in the "RFC Discussions" category. Same line on drawbacks and alternatives. Final comments stage. |
| [Astro roadmap README](https://github.com/withastro/roadmap/blob/main/README.md) | Stage 1 proposals in Discussions, accepted ones become issues that a maintainer writes, a champion carries each one |
| [PEP 1](https://github.com/python/peps/blob/main/peps/pep-0001.rst) | One key proposal per PEP. Vet the idea in public first. Rejected Ideas and Open Issues sections. |
| [GitHub Docs, form schema](https://github.com/github/docs/blob/main/content/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema.md) | A `markdown` element takes only `value`. Validations belong to input fields. |
| Jeff's house rule, from `issues-and-releases` | A public post or reply is an external act. Jeff approves the exact text first. |

## Measured

### Answered rate by category

Method: `discussions(categoryId, answered: true) { totalCount }` against the unfiltered
`totalCount`, through `gh api graphql`, for every category with `isAnswerable: true`.
Categories that do not take answers are left out, since they are 0% by design.

| Repo | Category | Discussions | Answered | Rate |
|---|---|---:|---:|---:|
| denoland/deno | Q&A | 467 | 181 | 39% |
| microsoft/vscode-discussions | Extension Development QnA | 1609 | 1103 | 69% |
| oven-sh/bun | Q&A | 424 | 111 | 26% |
| pnpm/pnpm | Q&A | 969 | 274 | 28% |
| supabase/supabase | Feature Requests | 1646 | 85 | 5% |
| supabase/supabase | Questions | 10147 | 3593 | 35% |
| sveltejs/svelte | Q&A | 379 | 195 | 51% |
| tailwindlabs/tailwindcss | Help | 6621 | 2454 | 37% |
| vercel/next.js | App Router | 2487 | 446 | 18% |
| vercel/next.js | Help | 19102 | 4736 | 25% |
| vercel/next.js | Show and tell | 380 | 19 | 5% |
| vitejs/vite | Q&A | 3388 | 775 | 23% |
| community/community | 20 answerable categories, combined | 115282 | 26008 | 23% |
| All 10 repos with one | Every answerable category | 162901 | 39980 | 25% |

Across 162,901 discussions in answerable categories, 25% carry a marked answer. Vite and
Next.js Help sit near a quarter. Svelte and the VS Code extension Q&A reach half or
more. Categories set to take answers for ideas or showcases (Supabase Feature
Requests, Next.js Show and tell) show 5%, so they read as unanswered.

### Top-voted posts by kind

Method: GraphQL `search(type: DISCUSSION, query: "repo:<r> sort:top")`, first 15 per
repo for 12 repos, plus `is:answered sort:top` for 4 repos and `category:Polls` for 2.
Words exclude fenced code. Code means a fenced block in the post. community/community
answerable categories other than Programming Help and New to GitHub are counted as
product feedback, since they hold feature requests.

| Kind | Posts | Median words | Median upvotes | Median comments | With code |
|---|---:|---:|---:|---:|---:|
| Q&A question | 84 | 84 | 31 | 9 | 42% |
| Idea or RFC, pooled | 89 | 141 | 55 | 9 | 39% |
| Announcement | 11 | 780 | 38 | 7 | 64% |
| General | 20 | 134 | 32 | 8 | 25% |
| Show and tell | 9 | 148 | 2 | 0 | 11% |
| Poll | 17 | 47 | 3 | 1 | 24% |
| Product feedback (community/community) | 15 | 117 | 982 | 132 | 13% |

Polls: 17 polls, median 2 options, range 2 to 6.

Announcements in the wider sample (19, recent and top): median 503 words, 95% carry a
link, 84% use headings.

### Proposals: sections in top-voted posts

Method: a heading (Markdown `#` or a bold line) that contains the section word, in the
top-voted sample, split by category type.

| Section | RFC or Proposal categories (30 posts, median 335 words) | Ideas or Feature Requests (64 posts, median 110 words) |
|---|---:|---:|
| Summary or tldr | 80% | 3% |
| Motivation, background or problem | 83% | 11% |
| Goals | 43% | 5% |
| Example or usage | 67% | 3% |
| Alternatives or prior art | 33% | 6% |
| Drawbacks or tradeoffs | 30% | 2% |
| Unresolved or open questions | 23% | 2% |
| Code block anywhere | 70% | 23% |

Astro's Stage 1 form has no Alternatives field, which pulls the RFC column down. The Vue
posts that follow the full template carry it.

### Questions with code get answered more often

Method: the 50 newest discussions per repo through GraphQL, restricted to answerable
question categories, split by whether the post has a fenced code block. community/community
is left out.

| Repo | With code: answered | Without code: answered | Median age in days |
|---|---:|---:|---:|
| denoland/deno | 5 of 10 | 3 of 10 | 197 |
| microsoft/vscode-discussions | 3 of 3 | 7 of 21 | 54 |
| oven-sh/bun | 3 of 3 | 1 of 6 | 169 |
| pnpm/pnpm | 3 of 3 | 2 of 5 | 14 |
| supabase/supabase | 0 of 2 | 1 of 19 | 2 |
| sveltejs/svelte | 7 of 9 | 4 of 11 | 146 |
| tailwindlabs/tailwindcss | 3 of 4 | 1 of 4 | 25 |
| vercel/next.js | 0 of 2 | 2 of 6 | 13 |
| vitejs/vite | 5 of 6 | 4 of 14 | 90 |
| Total | 29 of 42 (69%) | 25 of 96 (26%) | |

The gap holds in 7 of 9 repos. Per-repo counts are small, and Supabase and Next.js
posts were days old, so treat this as an association. Length does not separate them:
in 143 recent questions from the same 9 repos, answered ones have a median of 95 words and open ones 99.

### Accepted answers

Method: every `answer` returned with the samples above, 123 in all.

| Measure | Value |
|---|---:|
| Code block or link | 76% |
| Link | 60% |
| Code block | 38% |
| Median words | 58 |
| Median hours from question to answer | 41 |
| Written by OWNER, MEMBER or COLLABORATOR | 26% |
| Open with a greeting | 13% (16 of 123) |

The 26% is a floor. Staff with private org membership show as CONTRIBUTOR, as the
Next.js 46722 answer does.

### Maintainer replies

Method: the first 40 comments of the 80 most upvoted proposal, general and question
threads. A maintainer is OWNER, MEMBER or COLLABORATOR.

| Measure | Value |
|---|---:|
| Threads with a maintainer comment in the first 40 | 24% |
| Median position of the first maintainer comment | 10 |
| Median maintainer comment length | 73 words |
| Maintainer comment links an issue or PR | 5% |
| Thread closed | 25% |

Many of these threads run to hundreds of comments, and private membership hides staff,
so these numbers undercount maintainer replies. They show that a status reply is rare,
not that it is unwanted.

### Moving threads and forms

| Measure | Value | Method |
|---|---|---|
| Non-PR issues in the latest 100 withastro/roadmap items that link a discussion (accepted proposals and a few others) | 34 of 52 | `GET /repos/withastro/roadmap/issues?state=all&per_page=100`, pull requests removed |
| Repos whose issue chooser sends questions to Discussions | 3 of 4 (Next.js, Vite, Tailwind CSS. Next.js and Tailwind CSS send ideas there too. Svelte sends questions to Discord.) | `.github/ISSUE_TEMPLATE/config.yml` |
| Repos with `.github/DISCUSSION_TEMPLATE/` | 7 of 24 checked | `GET /repos/<r>/contents/.github/DISCUSSION_TEMPLATE` |
| Fetched forms that put `validations` on a markdown element | 2 of 11 (Astro `proposal.yml`, community `programming-help.yml`) | `discussion-check.mjs --kind form` |

## Examples

107 rows: 90 discussions, 11 category forms, 3 issue choosers and 3 issues. The
numbers in each row come from the API on 2026-11-07. Upvotes are
on the opening post.

| URL | Project | Kind | What it teaches |
|---|---|---|---|
| https://github.com/vercel/next.js/discussions/37136 | vercel/next.js | RFC / proposal | RFC post that links a long design doc and asks for feedback in the thread. 532 upvotes, 165 comments, 99 words |
| https://github.com/vercel/next.js/discussions/77740 | vercel/next.js | RFC / proposal | RFC with Background and named pain points before any API. 238 upvotes, 28 comments, 859 words, code block |
| https://github.com/vercel/next.js/discussions/20030 | vercel/next.js | RFC / proposal | RFC split into Goals, Background, Implementation. 190 upvotes, 17 comments, 344 words |
| https://github.com/vuejs/rfcs/discussions/436 | vuejs/rfcs | RFC / proposal | Full RFC template: Summary, Basic example, Motivation, Detailed design, Alternatives. 159 upvotes, 32 comments, 704 words, code block, names alternatives |
| https://github.com/vuejs/rfcs/discussions/369 | vuejs/rfcs | RFC / proposal | Dropped RFC that keeps its body and puts the status first. 149 upvotes, 160 comments, 1583 words, code block, names alternatives |
| https://github.com/vuejs/rfcs/discussions/296 | vuejs/rfcs | RFC / proposal | Maintainer reply moves the RFC to final comments and states what that means. 79 upvotes, 45 comments, 38 words |
| https://github.com/vuejs/rfcs/discussions/430 | vuejs/rfcs | RFC / proposal | RFC with Drawbacks, Alternatives and Adoption strategy. 65 upvotes, 21 comments, 270 words, code block, names alternatives |
| https://github.com/withastro/roadmap/discussions/1321 | withastro/roadmap | RFC / proposal | 63 upvotes, 2 comments, 351 words |
| https://github.com/vuejs/rfcs/discussions/503 | vuejs/rfcs | RFC / proposal | RFC with Drawbacks, Alternatives and Adoption strategy. 57 upvotes, 45 comments, 276 words, code block, names alternatives |
| https://github.com/vuejs/rfcs/discussions/460 | vuejs/rfcs | RFC / proposal | 55 upvotes, 16 comments, 32 words, code block |
| https://github.com/vuejs/rfcs/discussions/453 | vuejs/rfcs | RFC / proposal | RFC with Unresolved questions. 46 upvotes, 8 comments, 795 words, code block, names alternatives |
| https://github.com/withastro/roadmap/discussions/558 | withastro/roadmap | RFC / proposal | 43 upvotes, 2 comments, 205 words |
| https://github.com/vuejs/rfcs/discussions/495 | vuejs/rfcs | RFC / proposal | 43 upvotes, 5 comments, 229 words, code block, names alternatives |
| https://github.com/withastro/roadmap/discussions/664 | withastro/roadmap | RFC / proposal | 41 upvotes, 7 comments, 335 words, code block |
| https://github.com/vuejs/rfcs/discussions/502 | vuejs/rfcs | RFC / proposal | 41 upvotes, 45 comments, 752 words, code block, names alternatives |
| https://github.com/vuejs/rfcs/discussions/400 | vuejs/rfcs | RFC / proposal | 40 upvotes, 8 comments, 749 words, code block, names alternatives |
| https://github.com/withastro/roadmap/discussions/995 | withastro/roadmap | RFC / proposal | Proposal that became accepted issue 1447. 38 upvotes, 7 comments, 368 words, code block |
| https://github.com/vuejs/rfcs/discussions/270 | vuejs/rfcs | RFC / proposal | 35 upvotes, 46 comments, 64 words |
| https://github.com/vuejs/rfcs/discussions/714 | vuejs/rfcs | RFC / proposal | 35 upvotes, 11 comments, 558 words, code block, names alternatives |
| https://github.com/vuejs/rfcs/discussions/513 | vuejs/rfcs | RFC / proposal | 34 upvotes, 8 comments, 214 words, code block, names alternatives |
| https://github.com/oven-sh/bun/discussions/46493 | oven-sh/bun | Announcement | 5 upvotes, 0 comments, 113 words, code block |
| https://github.com/withastro/roadmap/discussions/1405 | withastro/roadmap | RFC / proposal | Stage 1 proposal with Goals and Non-Goals, later accepted as issue 1454. 15 upvotes, 4 comments, 948 words, code block |
| https://github.com/withastro/roadmap/discussions/1054 | withastro/roadmap | RFC / proposal | Proposal that names a preferred approach and an alternative. 31 upvotes, 9 comments, 581 words, code block, names alternatives |
| https://github.com/withastro/roadmap/discussions/1246 | withastro/roadmap | RFC / proposal | Proposal with Non goals and Impact. 5 upvotes, 4 comments, 466 words, code block |
| https://github.com/vercel/next.js/discussions/59989 | vercel/next.js | Maintainer status reply | Maintainer status update that links the implementing PR. 129 upvotes, 30 comments, 94 words, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/59347 | vercel/next.js | Idea | Idea that states the user problem and current workarounds. 537 upvotes, 49 comments, 519 words |
| https://github.com/vercel/next.js/discussions/46300 | vercel/next.js | Idea | Idea with a code sample and a considered alternative. 439 upvotes, 38 comments, 70 words, code block, names alternatives |
| https://github.com/orgs/supabase/discussions/357 | supabase/supabase | Idea | 366 upvotes, 78 comments, 37 words |
| https://github.com/orgs/supabase/discussions/526 | supabase/supabase | Idea | 356 upvotes, 59 comments, 44 words, code block, answered (MEMBER) |
| https://github.com/orgs/supabase/discussions/8677 | supabase/supabase | Idea | 285 upvotes, 46 comments, 45 words, answered (MEMBER) |
| https://github.com/vercel/next.js/discussions/55393 | vercel/next.js | Idea | 230 upvotes, 48 comments, 464 words, names alternatives |
| https://github.com/tailwindlabs/tailwindcss/discussions/11669 | tailwindlabs/tailwindcss | Idea | 217 upvotes, 10 comments, 55 words, code block |
| https://github.com/vercel/next.js/discussions/56446 | vercel/next.js | Idea | 178 upvotes, 4 comments, 566 words, code block |
| https://github.com/orgs/supabase/discussions/11263 | supabase/supabase | Idea | 171 upvotes, 45 comments, 141 words |
| https://github.com/tailwindlabs/tailwindcss/discussions/7763 | tailwindlabs/tailwindcss | Idea | 170 upvotes, 40 comments, 66 words |
| https://github.com/tailwindlabs/tailwindcss/discussions/8337 | tailwindlabs/tailwindcss | Idea | 151 upvotes, 30 comments, 98 words |
| https://github.com/tailwindlabs/tailwindcss/discussions/14677 | tailwindlabs/tailwindcss | Idea | 121 upvotes, 54 comments, 80 words |
| https://github.com/orgs/supabase/discussions/22944 | supabase/supabase | Idea | 120 upvotes, 25 comments, 61 words |
| https://github.com/orgs/supabase/discussions/6979 | supabase/supabase | Idea | 117 upvotes, 58 comments, 7 words, answered (MEMBER) |
| https://github.com/tailwindlabs/tailwindcss/discussions/5258 | tailwindlabs/tailwindcss | Q&A, answered | Community answer with numbered steps and config blocks. 58 upvotes, 50 comments, 56 words, code block, answered (NONE) |
| https://github.com/tailwindlabs/tailwindcss/discussions/15820 | tailwindlabs/tailwindcss | Q&A, answered | Accepted answer names the cause (command removed in v4) and both fixes. 63 upvotes, 17 comments, 84 words, code block, answered (COLLABORATOR) |
| https://github.com/tailwindlabs/tailwindcss/discussions/13881 | tailwindlabs/tailwindcss | Q&A, answered | Accepted answer says it is a warning, then lists three fixes with links. 19 upvotes, 8 comments, 145 words, answered (COLLABORATOR) |
| https://github.com/vitejs/vite/discussions/5081 | vitejs/vite | Q&A, answered | Accepted answer: one config field, a code block, a docs link. 24 upvotes, 1 comments, 51 words, code block, answered (NONE) |
| https://github.com/vitejs/vite/discussions/3396 | vitejs/vite | Q&A, answered | Accepted answer explains why the default changed, then the flag. 38 upvotes, 18 comments, 43 words, answered (MEMBER) |
| https://github.com/vercel/next.js/discussions/46722 | vercel/next.js | Q&A, answered | Accepted answer is a status update that moves notifications to a new thread. 372 upvotes, 91 comments, 330 words, code block, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/10935 | vercel/next.js | Q&A, answered | 109 upvotes, 56 comments, 38 words, answered (NONE) |
| https://github.com/vitejs/vite/discussions/6799 | vitejs/vite | Q&A, answered | 18 upvotes, 8 comments, 80 words, answered (NONE) |
| https://github.com/tailwindlabs/tailwindcss/discussions/2854 | tailwindlabs/tailwindcss | Q&A, answered | 18 upvotes, 9 comments, 15 words, code block, answered (NONE) |
| https://github.com/vitejs/vite/discussions/3448 | vitejs/vite | Q&A, answered | 34 upvotes, 22 comments, 81 words, code block, answered (MEMBER) |
| https://github.com/vitejs/vite/discussions/4065 | vitejs/vite | Q&A, answered | 15 upvotes, 17 comments, 42 words, names alternatives, answered (NONE) |
| https://github.com/vercel/next.js/discussions/48110 | vercel/next.js | Q&A, answered | 430 upvotes, 45 comments, 83 words, code block, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/18419 | vercel/next.js | Q&A, answered | 243 upvotes, 51 comments, 286 words, names alternatives, answered (CONTRIBUTOR) |
| https://github.com/tailwindlabs/tailwindcss/discussions/6019 | tailwindlabs/tailwindcss | Q&A, answered | 14 upvotes, 11 comments, 32 words, answered (NONE) |
| https://github.com/vitejs/vite/discussions/7915 | vitejs/vite | Q&A, answered | 16 upvotes, 2 comments, 58 words, code block, answered (NONE) |
| https://github.com/orgs/supabase/discussions/8779 | supabase/supabase | Q&A, answered | 37 upvotes, 7 comments, 125 words, answered (NONE) |
| https://github.com/vercel/next.js/discussions/41934 | vercel/next.js | Q&A, answered | 143 upvotes, 76 comments, 22 words, answered (CONTRIBUTOR) |
| https://github.com/orgs/supabase/discussions/542 | supabase/supabase | Q&A, answered | 68 upvotes, 20 comments, 310 words, code block, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/11272 | vercel/next.js | Q&A, answered | 160 upvotes, 82 comments, 184 words, code block, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/41745 | vercel/next.js | Q&A, answered | 155 upvotes, 831 comments, 55 words, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/26389 | vercel/next.js | Q&A, answered | 153 upvotes, 27 comments, 263 words, code block, names alternatives, answered (CONTRIBUTOR) |
| https://github.com/vercel/next.js/discussions/12826 | vercel/next.js | Q&A, answered | 138 upvotes, 13 comments, 153 words, answered (CONTRIBUTOR) |
| https://github.com/sveltejs/svelte/discussions/10085 | sveltejs/svelte | Announcement | Principles post with one heading per tenet. 282 upvotes, 19 comments, 881 words |
| https://github.com/sveltejs/svelte/discussions/15845 | sveltejs/svelte | Announcement | Long design announcement that opens with a short summary and a try-it command. 243 upvotes, 50 comments, 2687 words, code block, names alternatives |
| https://github.com/withastro/roadmap/discussions/521 | withastro/roadmap | Announcement | Collection thread pinned in Announcements. 130 upvotes, 2786 comments, 43 words |
| https://github.com/oven-sh/bun/discussions/4580 | oven-sh/bun | Announcement | Release announcement: install command first, then changes and new contributors. 107 upvotes, 8 comments, 780 words, code block |
| https://github.com/microsoft/vscode-discussions/discussions/1 | microsoft/vscode-discussions | Announcement | Feature announcement for extension authors, pinned with many replies. 76 upvotes, 552 comments, 138 words, names alternatives |
| https://github.com/oven-sh/bun/discussions/837 | oven-sh/bun | Announcement | 38 upvotes, 0 comments, 503 words, code block |
| https://github.com/sveltejs/svelte/discussions/16784 | sveltejs/svelte | Announcement | Announcement that links the two earlier posts it builds on. 36 upvotes, 7 comments, 937 words, code block |
| https://github.com/oven-sh/bun/discussions/5117 | oven-sh/bun | Announcement | Patch release announcement with install command and What's Changed. 35 upvotes, 1 comments, 790 words, code block |
| https://github.com/oven-sh/bun/discussions/1349 | oven-sh/bun | Announcement | 31 upvotes, 0 comments, 345 words, code block |
| https://github.com/oven-sh/bun/discussions/398 | oven-sh/bun | Announcement | 29 upvotes, 0 comments, 523 words |
| https://github.com/orgs/supabase/discussions/53093 | supabase/supabase | Announcement, breaking change | 0 upvotes, 0 comments, 851 words |
| https://github.com/orgs/supabase/discussions/52779 | supabase/supabase | Announcement, breaking change | 0 upvotes, 0 comments, 944 words |
| https://github.com/vercel/next.js/discussions/59373 | vercel/next.js | Poll | Poll with two options and a body that defines both. 75 upvotes, 32 comments, 270 words |
| https://github.com/vercel/next.js/discussions/65385 | vercel/next.js | Poll | 16 upvotes, 5 comments, 26 words |
| https://github.com/vercel/next.js/discussions/68281 | vercel/next.js | Poll | 12 upvotes, 0 comments, 45 words, code block |
| https://github.com/vercel/next.js/discussions/73905 | vercel/next.js | Poll | Maintainer poll on a default, with the tradeoff in the body. 11 upvotes, 8 comments, 95 words |
| https://github.com/vercel/next.js/discussions/84732 | vercel/next.js | Poll | 5 upvotes, 3 comments, 614 words, code block, names alternatives |
| https://github.com/vercel/next.js/discussions/56696 | vercel/next.js | Poll | 5 upvotes, 5 comments, 75 words |
| https://github.com/vercel/next.js/discussions/10640 | vercel/next.js | Show and tell | Pinned show-and-tell collection thread. 233 upvotes, 1643 comments, 97 words |
| https://github.com/vercel/next.js/discussions/30174 | vercel/next.js | Show and tell | 208 upvotes, 797 comments, 148 words |
| https://github.com/sveltejs/svelte/discussions/10328 | sveltejs/svelte | Show and tell | 13 upvotes, 1 comments, 14 words |
| https://github.com/orgs/community/discussions/7923 | community/community | Product feedback | 2101 upvotes, 376 comments, 125 words |
| https://github.com/orgs/community/discussions/16925 | community/community | Product feedback | 1743 upvotes, 347 comments, 546 words, code block |
| https://github.com/orgs/community/discussions/9099 | community/community | Product feedback | 1325 upvotes, 142 comments, 117 words |
| https://github.com/orgs/community/discussions/10539 | community/community | Product feedback | 1322 upvotes, 237 comments, 118 words |
| https://github.com/orgs/community/discussions/4618 | community/community | Product feedback | 1127 upvotes, 132 comments, 122 words, code block |
| https://github.com/orgs/supabase/discussions/4889 | supabase/supabase | General | 134 upvotes, 4 comments, 20 words |
| https://github.com/orgs/supabase/discussions/4907 | supabase/supabase | General | 129 upvotes, 39 comments, 66 words |
| https://github.com/vitejs/vite/discussions/17738 | vitejs/vite | General | 113 upvotes, 49 comments, 115 words, code block |
| https://github.com/vercel/next.js/blob/HEAD/.github/DISCUSSION_TEMPLATE/help.yml | vercel/next.js | Category form | Q&A form: Summary required, code with `render`, optional repro link |
| https://github.com/vercel/next.js/blob/HEAD/.github/DISCUSSION_TEMPLATE/ideas.yml | vercel/next.js | Category form | Idea form: Goals, Non-Goals, Background with prior art, Proposal |
| https://github.com/withastro/roadmap/blob/HEAD/.github/DISCUSSION_TEMPLATE/proposal.yml | withastro/roadmap | Category form | Proposal form prefilled with Summary, Background and Motivation, Goals, Example |
| https://github.com/pnpm/pnpm/blob/HEAD/.github/DISCUSSION_TEMPLATE/ideas.yml | pnpm/pnpm | Category form | Idea form: user story, solution, drawbacks, alternatives |
| https://github.com/renovatebot/renovate/blob/HEAD/.github/DISCUSSION_TEMPLATE/request-help.yml | renovatebot/renovate | Category form | Help form: exact version, minimal reproduction, logs in a details block |
| https://github.com/renovatebot/renovate/blob/HEAD/.github/DISCUSSION_TEMPLATE/suggest-an-idea.yml | renovatebot/renovate | Category form | Minimal idea form |
| https://github.com/vercel/turborepo/blob/HEAD/.github/DISCUSSION_TEMPLATE/help.yml | vercel/turborepo | Category form | Same help form shape as Next.js |
| https://github.com/community/community/blob/HEAD/.github/DISCUSSION_TEMPLATE/actions.yml | community/community | Category form | Form with dropdowns for discussion type and product area |
| https://github.com/community/community/blob/HEAD/.github/DISCUSSION_TEMPLATE/announcements.yml | community/community | Category form | Announcement form with one required body field |
| https://github.com/community/community/blob/HEAD/.github/DISCUSSION_TEMPLATE/programming-help.yml | community/community | Category form | Help form for a general programming category |
| https://github.com/shadcn-ui/ui/blob/HEAD/.github/DISCUSSION_TEMPLATE/blocks-request.yml | shadcn-ui/ui | Category form | Request form for one content type |
| https://github.com/vercel/next.js/blob/HEAD/.github/ISSUE_TEMPLATE/config.yml | vercel/next.js | Issue chooser | `contact_links` send questions and ideas to Discussions, blank issues off |
| https://github.com/vitejs/vite/blob/HEAD/.github/ISSUE_TEMPLATE/config.yml | vitejs/vite | Issue chooser | `contact_links` send questions and ideas to Discussions, blank issues off |
| https://github.com/tailwindlabs/tailwindcss/blob/HEAD/.github/ISSUE_TEMPLATE/config.yml | tailwindlabs/tailwindcss | Issue chooser | `contact_links` send questions and ideas to Discussions, blank issues off |
| https://github.com/withastro/roadmap/issues/1454 | withastro/roadmap | Discussion to issue | Accepted proposal issue that links its source discussion and names a champion |
| https://github.com/withastro/roadmap/issues/1447 | withastro/roadmap | Discussion to issue | Accepted proposal issue that links its source discussion and names a champion |
| https://github.com/withastro/roadmap/issues/1388 | withastro/roadmap | Discussion to issue | Accepted proposal issue that links its source discussion and names a champion |
