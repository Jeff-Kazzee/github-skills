# Sources

Read on 2026-11-07. Every example URL below was pulled through `gh api` or opened in that
session. Bodies are paraphrased, not quoted, so the Writing law holds for this file.

## Rules

| Source | What this skill takes |
|---|---|
| [Google, how to write review comments](https://github.com/google/eng-practices/blob/master/review/reviewer/comments.md) | Comment on the code, never the developer. Explain why. Balance pointing out a problem with giving the fix. Label severity (`Nit:`, `Optional:`, `FYI:`) because without labels authors may read every comment as mandatory. Praise good work and say why. An explanation the author gives in the tool should usually become clearer code or a code comment. |
| [Google, the standard of code review](https://github.com/google/eng-practices/blob/master/review/reviewer/standard.md) | Approve once the change improves code health, even if it is not perfect. Prefix polish and teaching comments with `Nit:`. Technical facts and data overrule opinions. |
| [Google, speed of code reviews](https://github.com/google/eng-practices/blob/master/review/reviewer/speed.md) | Respond within one business day. LGTM with comments when the remaining comments are minor or optional, or you trust the author to address them. |
| [Google, handling pushback](https://github.com/google/eng-practices/blob/master/review/reviewer/pushback.md) | When the author disagrees, first check whether they are right, and drop the point if so. Otherwise explain again with new information. "Clean it up later" usually never happens, so new complexity is fixed now or gets a tracked follow-up. |
| [Chromium, respectful code reviews](https://github.com/chromium/chromium/blob/main/docs/cr_respect.md) | Assume competence. Say what the right way looks like, not only that something is wrong. "Maybe I'm missing something" when unsure. Ask why. Find an end and move bigger refactors to a new change. Mention the positives. No extreme language. Do not bikeshed. Say when you will review if you cannot within about 24 hours. |
| [Conventional Comments](https://conventionalcomments.org/) | The `<label> [decorations]: <subject>` shape. The labels `praise`, `nitpick`, `suggestion`, `issue`, `todo`, `question`, `thought`, `chore`, `note`, and the `blocking`, `non-blocking` and `if-minor` decorations. |
| [GitHub, reviewing proposed changes](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request) | The three states: Comment gives feedback without approving or requesting changes, Approve approves merging, Request changes must be addressed before merge. Request changes is informational unless a rule requires reviews. Line comments stay pending and private until you submit. Multi-line comments select a range. |
| [GitHub, commenting on a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request) | Suggested changes are applied by the author from the comment. Batching comments in one review avoids a notification per comment. The PR opener or anyone with write access can resolve a conversation. |
| [GitHub, incorporating feedback](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request) | Several suggestions can be applied in one commit, and each suggester becomes a co-author. |
| [GitHub, approving with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews) | Pull request authors cannot approve their own pull requests. Every agent posts as Jeff, so on Jeff's own PRs the review state is Comment. |
| [GitHub REST, create a review](https://docs.github.com/en/rest/pulls/reviews#create-a-review-for-a-pull-request) | `event` is `APPROVE`, `REQUEST_CHANGES` or `COMMENT`. `body` is required for the last two. Omitting `event` leaves the review `PENDING`. `commit_id` pins the head. `comments[]` takes `path`, `line`, `side`, `start_line` and `body`. |
| [Mozilla, Code Review FAQ](https://firefox-source-docs.mozilla.org/contributing/Code_Review_FAQ.html) | A reviewer who sets a review flag usually adds a comment explaining it. Outcomes are Accepted or Needs Revision. |
| [Mozilla, getting reviews](https://firefox-source-docs.mozilla.org/contributing/reviews.html) | Reviews are expected within a business day or two. |
| Jeff's Git law (`~/AGENTS.md`) | House rule. A finding counts only with a command that fails on the current head, or cited lines plus what blocked a run. Every agent posts as Jeff. |
| Jeff's Approval law (`~/AGENTS.md`) | House rule. External messages wait for Jeff, so a review is a draft until he approves its text. |
| `review-gate` skill | House rule. The merge decision and review depth live there, not in the review state you pick. |

## Measured

Method: for each of 10 repos, the latest 100 inline review comments
(`/repos/<o>/<r>/pulls/comments?sort=created&direction=desc`), then for the 7 PRs with the
most comments in that set, `/pulls/<n>` for the author and `/pulls/<n>/reviews`. Five more
repos (grafana, terraform, deno, svelte, ruff) added their 6 latest merged PRs with
`/pulls/<n>/reviews` and `/pulls/<n>/comments`. Bots and the PR author's own comments are
excluded. About 227 REST calls in total: 215 for comments and reviews, the rest for guidance
docs, two of which returned 404.

The sample leans toward long discussions, because it took the most-commented PRs. One Rails
docs PR (59387) dominates the Rails row and its long median. The five second-pass repos had
0 to 5 inline comments each, so they count in the total only.

Inline comments, 377 from reviewers:

| Repo | Comments | Label word first | Any severity word | Median chars | Suggestion block | Concrete fix | Has a question |
|---|---:|---:|---:|---:|---:|---:|---:|
| django/django | 52 | 2% | 8% | 187 | 15% | 63% | 40% |
| facebook/react | 27 | 0% | 0% | 160 | 19% | 81% | 52% |
| golang/vscode-go | 25 | 0% | 4% | 147 | 0% | 24% | 40% |
| kubernetes/kubernetes | 43 | 9% | 12% | 51 | 14% | 35% | 33% |
| microsoft/TypeScript | 18 | 0% | 0% | 75 | 28% | 56% | 33% |
| nodejs/node | 44 | 2% | 5% | 110 | 18% | 59% | 27% |
| python/cpython | 46 | 2% | 7% | 128 | 35% | 65% | 24% |
| rails/rails | 32 | 6% | 6% | 390 | 44% | 69% | 56% |
| rust-lang/rust | 67 | 7% | 9% | 160 | 4% | 60% | 21% |
| vitejs/vite | 19 | 0% | 0% | 140 | 0% | 63% | 37% |
| All 15 repos | 377 | 4% | 6% | 139 | 18% | 58% | 34% |

- Label word first: a label (`nit`, `nitpick`, `question`, `suggestion`, `optional`, `minor`,
  `fyi`, `blocking`, `praise`, `typo` and the other Conventional Comments labels) in the
  first two words.
- Any severity word: a label, or `blocking`, `not a blocker`, `optional`, `up to you`,
  `feel free`, `no strong opinion` anywhere.
- Concrete fix: a code block, or `instead`, `should be`, `could be`, `how about`,
  `what about`, `rename`, `replace`, `change this to`, `move this`, `can be removed`.
- Of the 66 suggestion blocks, 37 (56%) also carry a sentence saying why.
- 13% of the reviewer comments are replies inside a thread. 22% cite evidence (a link, an
  issue number, a test, a failure, a spec). 4% contain a praise word.

Review summaries, 443 reviews from reviewers:

| Measure | Value |
|---|---:|
| Reviews with any body text | 82 of 443 (19%) |
| Approvals with no body | 29 of 50 (58%) |
| COMMENTED reviews with no body (containers for inline comments) | 321 of 371 (87%) |
| Median body length, when present | 165 chars |
| Bodies that state the merge condition, hand-labelled | 23 of 81 (28%) |
| ... in APPROVED reviews | 8 of 21 (38%) |
| ... in CHANGES_REQUESTED reviews | 7 of 11 (64%) |
| ... in COMMENTED reviews | 8 of 49 (16%) |

Merge condition means the body names what has to change before merge, or says it can
merge now. One review (react 36921, opening "DECISION: COMMENT") was dropped as
machine-written. The 23 reviews counted as stating it, as `<repo>/pull/<n>#pullrequestreview-<id>`:
denoland/deno/pull/33381#pullrequestreview-4172698527, django/django/pull/19984#pullrequestreview-5792162313, django/django/pull/21312#pullrequestreview-5807319945, golang/vscode-go/pull/101#pullrequestreview-440003223, hashicorp/terraform/pull/39497#pullrequestreview-5788826177, kubernetes/kubernetes/pull/140473#pullrequestreview-5756748131, kubernetes/kubernetes/pull/140629#pullrequestreview-4712200704, kubernetes/kubernetes/pull/140629#pullrequestreview-4714610623, kubernetes/kubernetes/pull/140629#pullrequestreview-4723280474, microsoft/TypeScript/pull/64988#pullrequestreview-5772779142, nodejs/node/pull/66470#pullrequestreview-5535353332, nodejs/node/pull/66569#pullrequestreview-5793480978, nodejs/node/pull/67239#pullrequestreview-5814185775, nodejs/node/pull/67277#pullrequestreview-5790141424, nodejs/node/pull/67277#pullrequestreview-5792803235, python/cpython/pull/161321#pullrequestreview-5815823317, python/cpython/pull/161453#pullrequestreview-5809481127, rails/rails/pull/59464#pullrequestreview-5720079136, rails/rails/pull/59631#pullrequestreview-5781366131, rust-lang/rust/pull/147696#pullrequestreview-4134695617, rust-lang/rust/pull/147696#pullrequestreview-5811499935, rust-lang/rust/pull/155216#pullrequestreview-5662891023, rust-lang/rust/pull/165301#pullrequestreview-5788537867.

What the numbers show:

- Guidance and practice disagree on labels. Google and Conventional Comments recommend them,
  yet only 4% of real comments open with one, and `nit` is nearly the only label used. This
  skill requires labels anyway, because an agent's comment arrives with no tone of voice and
  Google names the failure: unlabelled comments read as mandatory.
- Short wins. The median comment is 139 characters, about two sentences.
- A concrete fix is the norm (58%). A suggestion block appears in 18%, and about half of
  those also say why.
- One in three comments asks a question, which is how reviewers state doubt without
  claiming a defect.
- Most summaries say nothing, and only 28% of those with text say what merge needs. A
  request for changes that names the required change (64%) is the strongest habit seen.
- Praise is rare (4%), though both Google and Chromium ask for it.

## Examples

Kinds: `blocking` (a defect that must change), `nit`, `question`, `suggestion`,
`praise`, `reply` (a reviewer's reply in a thread), `summary` (a review body). `anti` marks a
cautionary example.

| URL | Project | Kind | What it teaches |
|---|---|---|---|
| https://github.com/nodejs/node/pull/67183#discussion_r4471871654 | Node.js | blocking | Names the input that breaks it (a getter returning 1 then 0), the effect (process crash), and that main is fine |
| https://github.com/rails/rails/pull/59631#discussion_r4473075093 | Rails | blocking | Shows with a short example how caching changes what `super` returns |
| https://github.com/python/cpython/pull/160812#discussion_r4503805568 | CPython | blocking | The new test passes without the fix on a release build, and a longer input makes it fail |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4502988236 | Rust | blocking | A minimal repro that crashes the compiler, no prose needed |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4502911535 | Rust | blocking | Names the function the author forgot to update and that it breaks today |
| https://github.com/python/cpython/pull/161536#discussion_r4503021751 | CPython | blocking | Walks the NULL path to the crash, then asks why the chaining is needed |
| https://github.com/nodejs/node/pull/66470#discussion_r4492159399 | Node.js | blocking | Steps through a 32-bit hash collision between two property lists |
| https://github.com/django/django/pull/22192#discussion_r4493076187 | Django | blocking | Says which queryset is wrong, which is right, and gives the block |
| https://github.com/kubernetes/kubernetes/pull/142287#discussion_r4501047197 | Kubernetes | blocking | Gives the exact feature-gate combination where validation still fails |
| https://github.com/kubernetes/kubernetes/pull/142287#discussion_r4497893531 | Kubernetes | blocking | Missing dependency stated in one line with the corrected line as a block |
| https://github.com/django/django/pull/21893#discussion_r4473465464 | Django | blocking | The type is too broad because it admits `Subquery`, and proposes the narrower pair |
| https://github.com/rust-lang/rust/pull/164217#discussion_r4504161800 | Rust | blocking | Explains why the produced notes mislead users, with the output |
| https://github.com/react/react/pull/37289#discussion_r3913148189 | React | blocking | The test cannot prove the claim because the app code leaks too, and asks for a real repro |
| https://github.com/django/django/pull/20578#discussion_r4481399175 | Django | blocking | Measures the limit against a real fixture file to show the values are too low |
| https://github.com/django/django/pull/20578#discussion_r4481481581 | Django | blocking | Links the upstream line (pinned SHA) that makes the guarded case unrealistic |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4502814843 | Rust | blocking | A dangling comment still names the deleted item, with a permalink |
| https://github.com/python/cpython/pull/161321#discussion_r4504386971 | CPython | blocking | Adds a note stating the intended substitution because GitHub renders the block oddly |
| https://github.com/denoland/deno/pull/33381#discussion_r3139132716 | Deno | blocking | Corrects a factual claim in docs and states the real behavior |
| https://github.com/kubernetes/kubernetes/pull/143760#discussion_r4500377936 | Kubernetes | nit | `nit:` first, the reasoning for the simplification, then the block |
| https://github.com/kubernetes/kubernetes/pull/143579#discussion_r4498997937 | Kubernetes | nit | A bare `nit` plus a block wrapping the error with `%w` |
| https://github.com/kubernetes/kubernetes/pull/143760#discussion_r4500407051 | Kubernetes | nit | Short and direct: an unusual pattern, inline it |
| https://github.com/kubernetes/kubernetes/pull/143579#discussion_r4499010476 | Kubernetes | nit | One line naming where the initialization belongs |
| https://github.com/rails/rails/pull/59387#discussion_r4436706081 | Rails | nit | "Nitpick." then why (expand the acronym) and the block |
| https://github.com/rails/rails/pull/59530#discussion_r4447328114 | Rails | nit | "Nit," phrased as a question, with the hoisted lines as a block |
| https://github.com/django/django/pull/22192#discussion_r4493031062 | Django | nit | Inconsistent return type versus the parent generator, with a one-line block |
| https://github.com/django/django/pull/22208#discussion_r4494616622 | Django | nit | "Style nitpick:" citing the house writing style |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503588053 | Rust | nit | `nit:` with the restructured code in a fenced block |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503469168 | Rust | nit | `nit:` offering an alternative as a question |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503461652 | Rust | nit | `nit:` asking for `_`, the shortest useful comment in the set |
| https://github.com/python/cpython/pull/161536#discussion_r4503101689 | CPython | nit | Opens with "not really important" so the author knows it is optional |
| https://github.com/kubernetes/kubernetes/pull/143760#discussion_r4500369391 | Kubernetes | question | Asks whether a specific alternative condition is the right check |
| https://github.com/kubernetes/kubernetes/pull/143760#discussion_r4499914792 | Kubernetes | question | Why these fields exist beside two others, and are the values different |
| https://github.com/python/cpython/pull/161536#discussion_r4503051470 | CPython | question | "I don't understand the purpose" and offers the simpler path it expected |
| https://github.com/python/cpython/pull/122902#discussion_r4499718351 | CPython | question | States what the reviewer expected to see, then suggests comments |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503670749 | Rust | question | "Do I understand correctly" restates the author's intent to check it |
| https://github.com/rust-lang/rust/pull/164217#discussion_r4504173435 | Rust | question | Block plus "can this use X, and if not, add a comment saying why" |
| https://github.com/react/react/pull/37542#discussion_r3956566396 | React | question | Asks whether a check matters, given another mechanism already covers it |
| https://github.com/rails/rails/pull/59530#discussion_r4447125672 | Rails | question | Asks for a failure-path test and names the scenario that needs it |
| https://github.com/rails/rails/pull/59530#discussion_r4447738303 | Rails | question | Points out a coverage gap and says no existing test covers it |
| https://github.com/rails/rails/pull/59530#discussion_r4447453177 | Rails | question | Asks for a specific assertion mirroring the test above |
| https://github.com/django/django/pull/21312#discussion_r4497910502 | Django | question | Offers a simpler command and asks if it would work |
| https://github.com/django/django/pull/21312#discussion_r4498036051 | Django | question | Asks how the version guards stay correct over time |
| https://github.com/rails/rails/pull/59675#discussion_r4495179094 | Rails | question | Quotes the open question from the motivating PR |
| https://github.com/nodejs/node/pull/66902#discussion_r4445951789 | Node.js | suggestion | One reason line and a block replacing npm calls with `node --run` |
| https://github.com/python/cpython/pull/161543#discussion_r4502218529 | CPython | suggestion | Block first, then why all platforms must check the lazy import |
| https://github.com/python/cpython/pull/161321#discussion_r4504411843 | CPython | suggestion | Rewrites a NEWS entry and says why the old scope was too narrow |
| https://github.com/python/cpython/pull/161543#discussion_r4503433989 | CPython | suggestion | Trims a NEWS entry to the user-visible fact |
| https://github.com/python/cpython/pull/161453#discussion_r4499263852 | CPython | suggestion | Opens with the goal (avoid repetition) before the block |
| https://github.com/python/cpython/pull/161543#discussion_r4502462543 | CPython | suggestion | A block that restructures a try block, applied in one click |
| https://github.com/python/cpython/pull/161453#discussion_r4499600326 | CPython | suggestion | Proposes a rename plus a wrapper, and says how tests benefit |
| https://github.com/python/cpython/pull/160812#discussion_r4499513735 | CPython | suggestion | Says the entry is too detailed and drafts a shorter one |
| https://github.com/python/cpython/pull/161453#discussion_r4499268209 | CPython | suggestion | Names the redundant test, which to keep, and why |
| https://github.com/python/cpython/pull/161536#discussion_r4503048757 | CPython | suggestion | Tests are hard to follow, so it proposes a helper shape |
| https://github.com/rails/rails/pull/59387#discussion_r4424341512 | Rails | suggestion | Move the sentence to where the term is defined, make it a tip, with the block |
| https://github.com/rails/rails/pull/59387#discussion_r4424520236 | Rails | suggestion | Names the ambiguous pronoun and rewrites the sentence |
| https://github.com/rails/rails/pull/59387#discussion_r4425482545 | Rails | suggestion | Makes an implied tradeoff explicit in the docs |
| https://github.com/rails/rails/pull/59387#discussion_r4436675168 | Rails | suggestion | The section does not do what its title says, and points to a model section |
| https://github.com/rails/rails/pull/59530#discussion_r4447813721 | Rails | suggestion | Asks for one more assertion and writes it as a block |
| https://github.com/django/django/pull/22192#discussion_r4493277532 | Django | suggestion | Cites the convention (arbitrary-length sequences are lists) and the block |
| https://github.com/django/django/pull/22192#discussion_r4493264425 | Django | suggestion | Hedges wording advice ("not a native speaker, but maybe") |
| https://github.com/django/django/pull/22192#discussion_r4493256982 | Django | suggestion | Corrects the cause (rendering, not loading) in the doc text |
| https://github.com/django/django/pull/21893#discussion_r4473367370 | Django | suggestion | Removing a refresh tests the path that matters, says why |
| https://github.com/django/django/pull/22208#discussion_r4432541366 | Django | suggestion | Cites `__iter__` to justify a simpler check that avoids building an object |
| https://github.com/django/django/pull/21312#discussion_r4497848228 | Django | suggestion | Offers an alternative to per-extra groups with the command |
| https://github.com/django/django/pull/22208#discussion_r4494593034 | Django | suggestion | Prefers an empty cell type and links the accessibility rule |
| https://github.com/django/django/pull/21893#discussion_r4473505681 | Django | suggestion | Asks for a test in a named file covering two named expression kinds |
| https://github.com/kubernetes/kubernetes/pull/143579#discussion_r4499009300 | Kubernetes | suggestion | "use ctx aware functions" with the exact call |
| https://github.com/kubernetes/kubernetes/pull/143579#discussion_r4499000004 | Kubernetes | suggestion | Names the usual pattern and where the generated code belongs |
| https://github.com/kubernetes/kubernetes/pull/142287#discussion_r4501082478 | Kubernetes | suggestion | A block that adds the missing graduation comment |
| https://github.com/microsoft/TypeScript/pull/65056#discussion_r4496418985 | TypeScript | suggestion | Hedged performance idea ("I don't know if this would be inlined") |
| https://github.com/microsoft/TypeScript/pull/64451#discussion_r4480961478 | TypeScript | suggestion | Bare block for a signature, paired with a summary that explains it |
| https://github.com/rust-lang/rust/pull/165586#discussion_r4501563280 | Rust | suggestion | A rename block with the reason (contrast with the sibling function) |
| https://github.com/rust-lang/rust/pull/164217#discussion_r4504169380 | Rust | suggestion | One block plus "same for all the others" instead of repeating it |
| https://github.com/rust-lang/rust/pull/164544#discussion_r4501180719 | Rust | suggestion | Rename request with the future work that motivates the name |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503520698 | Rust | suggestion | Numbered steps when one block cannot cover the range |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503622222 | Rust | suggestion | Proves a lookup is redundant from the enclosing loop |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503663155 | Rust | suggestion | Marks the point as pre-existing so it is clearly optional |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503574126 | Rust | suggestion | Admits it has no good name to offer, still flags the rename |
| https://github.com/react/react/pull/37543#discussion_r4005473966 | React | suggestion | Says where the type belongs and links the spec |
| https://github.com/react/react/pull/37542#discussion_r3956552773 | React | suggestion | Match existing test patterns and inline a one-use helper |
| https://github.com/react/react/pull/37289#discussion_r3989117436 | React | suggestion | "This can be removed" plus the real reason behind the default |
| https://github.com/react/react/pull/38009#discussion_r4386118087 | React | suggestion | Explains the semantic difference between two APIs before asking for a change |
| https://github.com/react/react/pull/37457#discussion_r3895116168 | React | suggestion | One of a series of one-line blocks applying a stated preference |
| https://github.com/nodejs/node/pull/67183#discussion_r4471872528 | Node.js | suggestion | "No longer needed." and an empty block, which deletes the lines |
| https://github.com/nodejs/node/pull/67183#discussion_r4471873262 | Node.js | suggestion | Asks for the regression test that pins the defect found above |
| https://github.com/nodejs/node/pull/67271#discussion_r4492297863 | Node.js | suggestion | Recalls the approach agreed in an earlier PR, with the link |
| https://github.com/golang/vscode-go/pull/101#discussion_r447673938 | vscode-go | suggestion | Asks for a comment that documents a contract and says what it must cover |
| https://github.com/golang/vscode-go/pull/185#discussion_r437212611 | vscode-go | suggestion | Links existing helpers at a pinned SHA so the author reuses them |
| https://github.com/golang/vscode-go/pull/2#discussion_r392794552 | vscode-go | suggestion | "How about" a user-facing improvement, framed as an offer |
| https://github.com/hashicorp/terraform/pull/39507#discussion_r4493204142 | Terraform | suggestion | A bare block is enough for a changelog wording fix |
| https://github.com/microsoft/TypeScript/pull/64500#discussion_r4482060615 | TypeScript | reply | "+1" that adds new analysis instead of only agreeing |
| https://github.com/django/django/pull/22074#discussion_r4470642942 | Django | reply | Re-review: confirms the first case now raises, then names the remaining hole |
| https://github.com/nodejs/node/pull/67277#discussion_r4487274135 | Node.js | reply | Reopens a thread marked resolved because the question is still open |
| https://github.com/python/cpython/pull/122902#discussion_r4499631752 | CPython | reply | Concedes after the author explains, and keeps only the small naming point |
| https://github.com/python/cpython/pull/122902#discussion_r4499624370 | CPython | reply | Thanks the author for testing the reviewer's idea and drops it |
| https://github.com/django/django/pull/21312#discussion_r4498185797 | Django | reply | Calls a good question out of scope and says why |
| https://github.com/django/django/pull/22074#discussion_r4483803878 | Django | reply | Asks to spin a side topic into its own issue to contain scope |
| https://github.com/django/django/pull/22074#discussion_r4484010605 | Django | reply | Splits a thread: one part to an issue, one part fixed here because it loses data |
| https://github.com/django/django/pull/19984#discussion_r4468388305 | Django | reply | Asks the author to come back with a recommendation, not a question |
| https://github.com/rust-lang/rust/pull/163758#discussion_r4503002644 | Rust | reply | Adds a second case the fix must also reject |
| https://github.com/vitejs/vite/pull/23742#discussion_r4256932092 | Vite | reply | Shows with a docs link that the bug is upstream, then files it (r4279458561) |
| https://github.com/vitejs/vite/pull/23839#discussion_r4322676400 | Vite | reply | Explains the dependency and the merge order |
| https://github.com/rails/rails/pull/59464#discussion_r4432795229 | Rails | reply | Closes a thread in one line once the fix is in |
| https://github.com/kubernetes/kubernetes/pull/142287#discussion_r4501086069 | Kubernetes | reply | Links the other thread instead of repeating the argument |
| https://github.com/rust-lang/rust/pull/147696#pullrequestreview-5811499935 | Rust | summary | Approve: nothing left is required, polish goes to follow-ups, then `@bors r+` |
| https://github.com/rust-lang/rust/pull/165301#pullrequestreview-5788537867 | Rust | summary | Approve that names which nits must be addressed before merge |
| https://github.com/nodejs/node/pull/66470#pullrequestreview-5535353332 | Node.js | summary | LGTM with the reasoning that behavior is preserved |
| https://github.com/nodejs/node/pull/66569#pullrequestreview-5793480978 | Node.js | summary | Request changes with one condition: clarify the license before merge |
| https://github.com/nodejs/node/pull/67183#pullrequestreview-5773960111 | Node.js | summary | Says the reviewer confirmed the new test fails on main, and points to the open comment |
| https://github.com/rails/rails/pull/59631#pullrequestreview-5781366131 | Rails | summary | Re-review naming the commit checked, each case verified, and the CI failure with its fix |
| https://github.com/kubernetes/kubernetes/pull/140473#pullrequestreview-5756748131 | Kubernetes | summary | "Initial review", no major problems, and the minimum test bar for merge |
| https://github.com/kubernetes/kubernetes/pull/143579#pullrequestreview-5808708821 | Kubernetes | summary | States the review scope: the controller, minus the tests |
| https://github.com/kubernetes/kubernetes/pull/140629#pullrequestreview-4714610623 | Kubernetes | summary | Says which files got a full review and lists the test gaps |
| https://github.com/python/cpython/pull/161321#pullrequestreview-5815823317 | CPython | summary | Request changes: agrees it is worth fixing and names the other calls to fix |
| https://github.com/microsoft/TypeScript/pull/64988#pullrequestreview-5772779142 | TypeScript | summary | Request changes listing each API to remove, each with a reason |
| https://github.com/django/django/pull/19984#pullrequestreview-5792162313 | Django | summary | Approve: only optional polish left, and when it will merge |
| https://github.com/django/django/pull/19984#pullrequestreview-3367490746 | Django | summary | First pass: comments left, closer look after they are folded in |
| https://github.com/denoland/deno/pull/33381#pullrequestreview-4172698527 | Deno | summary | Approve with the one remaining condition (sign the CLA) |
| https://github.com/rust-lang/rust/pull/155216#pullrequestreview-5662891023 | Rust | summary | Explains a concern, the workaround it would accept, and the one missing test |
| https://github.com/rust-lang/rust/pull/164544#pullrequestreview-5792353324 | Rust | summary | Hands the review to someone else honestly when the PR grew too large |
| https://github.com/python/cpython/pull/122902#pullrequestreview-5724462743 | CPython | anti | Approves while saying the reviewer is not yet convinced, so the author cannot tell what merge needs |
| https://github.com/rails/rails/pull/59631#pullrequestreview-5815098935 | Rails | anti | Request changes whose only body is a question, so the required change is unstated |
| https://github.com/kubernetes/kubernetes/pull/143886#pullrequestreview-5800271321 | Kubernetes | anti | "Few minor comments" without saying whether any must change |

The table holds 123 rows from 12 projects: 18 blocking, 12 nit, 13 question, 47 suggestion,
14 reply, 16 summary and 3 anti. The sample held no strong inline praise comment, so the
praise template follows Google and Chromium guidance instead of an example. GitHub returned
`facebook/react` URLs under `react/react`, and they are listed as returned.
