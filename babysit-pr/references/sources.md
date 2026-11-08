# Sources

Read on 2026-11-07. Guidance docs came through `gh api repos/<o>/<r>/contents/...` or
the published page. PR data came through the GitHub GraphQL API.

## Rules

| Source | What this skill takes |
|---|---|
| [Google, How to handle reviewer comments](https://github.com/google/eng-practices/blob/master/review/developer/handling-comments.md) | Fix the code before you explain it in the tool. Ask when you do not understand. Decline collaboratively with the "I went with X because of these tradeoffs" form. Never respond in anger. |
| [Google, Handling pushback](https://github.com/google/eng-practices/blob/master/review/reviewer/pushback.md) | Cleanup promised for later usually never happens. New complexity gets fixed in this CL. Surrounding problems get a filed bug and a TODO that names it. |
| [Google, The CL author's guide](https://github.com/google/eng-practices/blob/master/review/developer/index.md) | The author's side of review is its own set of practices. |
| [Kubernetes, Pull request process](https://github.com/kubernetes/community/blob/master/contributors/guide/pull-requests.md) | Put review fixups in new commits and do not squash until asked. Ping with `PTAL` after you fix the issues. It is OK to push back with a good reason. Answer reasonable comments with an explanation. `/retest` reruns failed e2e tests. |
| [Node.js, Pull requests](https://github.com/nodejs/node/blob/main/doc/contributing/pull-requests.md) | Add a new commit for each change during review. Force-push hides what changed from reviewers. Inspect every red test to decide whether the PR caused it. Ask in the PR for CI output you cannot see. |
| [Rust, PR lifecycle](https://github.com/rust-lang/rust/blob/main/src/doc/rustc-dev-guide/src/pr-lifecycle.md) | Make incremental commits during review. Squash only at the end or on request. After a force-push, leave a comment saying what changed. Mark the PR `@rustbot ready` when you have addressed the review. |
| [Go, Contribution guide](https://go.dev/doc/contribute) | Treat each comment like a ticket to close. Reply to every comment, "Done" when implemented, otherwise say why not. For a trybot failure that looks unrelated, check the build dashboard for the same failure and say so in a comment. |
| [GitHub Docs, Commenting on a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request) | The PR author or anyone with write access can resolve a conversation. A resolved conversation collapses. |
| [GitHub Docs, Requesting a pull request review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review) | After you make the requested changes, re-request review from the same reviewer. |
| [GitHub Docs, Incorporating feedback](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request) | Suggested changes can be committed one at a time or in a batch, and each suggester becomes a co-author. |
| [GitHub REST, Pull request review comments](https://docs.github.com/en/rest/pulls/comments) | The reply endpoint takes the ID of a top-level review comment. Replies to replies are not supported. |
| [GitHub REST, Review requests](https://docs.github.com/en/rest/pulls/review-requests) | `POST .../requested_reviewers` requests the listed users and teams, and it notifies them. |
| GitHub GraphQL schema, introspected with `gh api graphql` | `resolveReviewThread` takes a `threadId`. `requestReviews` has a `union` field: "Add users to the set rather than replace." |
| [GitHub Docs, Autolinked references](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls) | A bare commit SHA in a comment becomes a link to the commit. `#26` links an issue or PR. |
| Jeff's house rules, from the private `babysit-pr`, `pr-template` and `review-gate` skills | Every comment waits for Jeff's approval and carries the agent header. Reproduce a bot finding before you change code. Keep the PR at the size the goal needs. Wait with `pr-wait`, one watcher per PR. Merge only through `agent-git land` after Jeff approves the head. Resolve a thread only after its reply posted, and leave a decline or question open for the reviewer. Fix one CI failure at a time and name the failing thing in the commit subject (see the `commit` skill and the CI commit rows below). |

## Measured

Method: the 40 most recently updated merged PRs in each of 27 projects (1,080 PRs, 30
authored by bots and dropped), with their review threads, PR commits and timeline events,
read through GraphQL on 2026-11-07. An author reply is a later comment in a review thread,
by the PR author, in a thread a reviewer started. A SHA is 7 to 40 hex characters with
both a digit and a letter, or a commit URL. Words exclude code blocks and quotes. Classes
come from a keyword pass, then hand labels on the 92 replies it filed as decline, defer or
question, plus a 60-reply random check. Timing uses `committedDate`, which a rebase
rewrites, so the push-before-reply share is a lower bound.

| Measure | Value |
|---|---:|
| PRs with at least one review thread | 309 of 1,050 |
| Reviewer threads | 1,125 (851 from people, 274 from bots) |
| Threads that got any author reply | 44% |
| Author replies | 579 |
| Median reply length, replies to people | 20 words |
| Replies that cite a commit SHA, all | 17% (99 of 579) |
| Same, replies to human reviewers | 11% (52 of 468) |
| Same, replies to review bots | 42% |
| Same, without VS Code, Deno, Tailwind and Grafana | 8% (38 of 477) |
| Median reply length in those four projects | 46 words |
| Accepts that cite a SHA, random check | 10 of 34 |
| Accepts that are a bare "Done" or a bare SHA, random check | 4 of 34 |
| Declines that give a reason, hand labeled | 19 of 21 |
| Declines that link evidence (code, spec, other run) | 3 of 21 |
| Median decline length | 47 words |
| Defers that link an issue or PR | 7 of 22 |
| Defers that leave only a TODO or FIXME in code | 5 of 22 |
| Median defer length | 32 words |
| Questions, hand labeled, median length | 15, 12 words |
| Median time from a human reviewer's comment to the author reply | 10.7 hours |
| Replies to human reviewers within 1 hour, within 24 hours | 19%, 66% |
| Accept replies with a PR commit between comment and reply | at least 47% |
| Median minutes from that commit to the reply | 3 |
| Resolved threads resolved by the author | 73% |
| Resolved threads the author closed with no reply | 45% |
| PRs with human threads, timeline sample (n=192), where the author re-requested review | 33% |
| Same 192 PRs, author force-pushed after the first review | 55% |
| Same 192 PRs, a `PTAL` or "ready for review" comment | 7% |
| Top-level author comments about a CI failure | 18 |

What the numbers show:

- Authors push the fix and reply a few minutes later. The skill makes that order the
  rule: push, then reply with the commit.
- People citing a SHA is rare (8 to 11%). Most of the SHA-heavy replies come from four
  projects whose replies run twice as long and often read as agent-written ("At head
  4f1c0fbea51d ..."). The templates follow the shorter human-maintainer style and still
  name the commit, because an agent's claim needs a pointer the reviewer can check.
- Declines almost always carry a reason. Defers usually do not link an issue, which is
  the gap Google warns about. The skill requires the link.
- Many authors resolve threads silently and force-push during review. Go, Node.js,
  Kubernetes and Rust all ask for the opposite. The skill follows the guides, not the
  habit.

## Examples

117 artifacts, all opened through the API on 2026-11-07. Kinds: accept, decline, ask,
defer, explain, CI report, round summary, CI commit, and minimal (a common short form the
skill asks you to expand).

| URL | Project | Kind | What it teaches |
|---|---|---|---|
| https://github.com/django/django/pull/21922#discussion_r4483371807 | Django | accept | Name the commit, then the one condition that changed |
| https://github.com/electron/electron/pull/55629#discussion_r4489854059 | Electron | accept | Commit plus the data-structure change in one line |
| https://github.com/eslint/eslint/pull/21437#discussion_r4422092637 | ESLint | accept | A revert is an accept too, with its commit link |
| https://github.com/eslint/eslint/pull/21419#discussion_r4357920851 | ESLint | accept | Show the pattern already exists elsewhere, then link the commit |
| https://github.com/react/react/pull/37965#discussion_r4402467418 | React | accept | A short thanks and a commit link fit a small fix |
| https://github.com/grafana/grafana/pull/136907#discussion_r4496310005 | Grafana | accept | Link the commit and the test case added with it |
| https://github.com/grafana/grafana/pull/136087#discussion_r4390028604 | Grafana | accept | Fixed in a SHA, then the new behavior |
| https://github.com/hashicorp/terraform/pull/39191#discussion_r4157804484 | Terraform | accept | Own the mistake and point to the fixing commit |
| https://github.com/hashicorp/terraform/pull/39191#discussion_r4157797368 | Terraform | accept | Say what tradeoff remains after the fix |
| https://github.com/kubernetes/kubernetes/pull/143816#discussion_r4500485842 | Kubernetes | accept | Answer a scope cut with one line and a SHA |
| https://github.com/kubernetes/kubernetes/pull/143816#discussion_r4500486492 | Kubernetes | accept | Give the reason for a removal beside the SHA |
| https://github.com/microsoft/vscode/pull/335016#discussion_r4087394916 | VS Code | accept | Name the head where the bug was seen and the fixing commit |
| https://github.com/microsoft/vscode/pull/335016#discussion_r4087394907 | VS Code | accept | The same form for a performance finding |
| https://github.com/microsoft/vscode/pull/337354#discussion_r4076827666 | VS Code | accept | Follow the existing convention and say so |
| https://github.com/nodejs/node/pull/66782#discussion_r4425699617 | Node.js | accept | Applied in a SHA, plus the related tests |
| https://github.com/nodejs/node/pull/66782#discussion_r4451326881 | Node.js | accept | Flag in the reply that CI needs a fresh run |
| https://github.com/prettier/prettier/pull/20351#discussion_r4489235260 | Prettier | accept | Done in a SHA with the exact rule now applied |
| https://github.com/astral-sh/ruff/pull/29482#discussion_r4481434003 | Ruff | accept | Take a wording fix and credit the reviewer |
| https://github.com/curl/curl/pull/23604#discussion_r4377334550 | curl | accept | Say which existing test now covers the case |
| https://github.com/denoland/deno/pull/37046#discussion_r4329868909 | Deno | accept | Act on a low-stakes point anyway |
| https://github.com/django/django/pull/21260#discussion_r3233774205 | Django | accept | Take the idea, not the literal suggestion, and say why |
| https://github.com/django/django/pull/21260#discussion_r3241539275 | Django | accept | Name the option you picked |
| https://github.com/electron/electron/pull/51243#discussion_r4406630656 | Electron | accept | Adopt the suggested fix and describe the edge case it covers |
| https://github.com/eslint/eslint/pull/21496#discussion_r4492166396 | ESLint | accept | Admit the helper existed and remove the duplicate |
| https://github.com/eslint/eslint/pull/21469#discussion_r4436559306 | ESLint | accept | A plain accept that names the changed logic |
| https://github.com/eslint/eslint/pull/21271#discussion_r3908190859 | ESLint | accept | Check the spec before answering, then accept |
| https://github.com/eslint/eslint/pull/21271#discussion_r3956410635 | ESLint | accept | Move code and add tests in one answer |
| https://github.com/react/react/pull/36865#discussion_r3484458868 | React | accept | Propose the restructure before doing it |
| https://github.com/react/react/pull/36865#discussion_r3484461900 | React | accept | Drop an approach when the reviewer finds a real flaw |
| https://github.com/llvm/llvm-project/pull/237574#discussion_r4503107212 | LLVM | accept | Agree a test is too weak and say why |
| https://github.com/curl/curl/pull/16358#discussion_r1958011036 | curl | minimal | A one-word reply gives the reviewer nothing to check |
| https://github.com/django/django/pull/21982#discussion_r4217612371 | Django | minimal | "Updated" alone sends the reviewer to the diff |
| https://github.com/eslint/eslint/pull/21400#discussion_r4221817473 | ESLint | minimal | A bare "Done." is the Gerrit habit without its link |
| https://github.com/Homebrew/brew/pull/24490#discussion_r4491432864 | Homebrew | minimal | Agreement with no action stated |
| https://github.com/kubernetes/community/pull/9139#discussion_r4244316177 | Kubernetes | minimal | Another bare "Done." |
| https://github.com/astral-sh/ruff/pull/26680#discussion_r4462877412 | Ruff | decline | Accept part, explain the rest, link the tracking issue |
| https://github.com/astral-sh/ruff/pull/28329#discussion_r4200914531 | Ruff | decline | Keep the old API where the new one is not clearer |
| https://github.com/electron/electron/pull/51243#discussion_r4462257217 | Electron | decline | Explain the compatibility cost of the stricter option |
| https://github.com/grafana/grafana/pull/136907#discussion_r4471884174 | Grafana | decline | Concede the gap, argue net improvement, scope it out |
| https://github.com/grafana/grafana/pull/137164#discussion_r4491714513 | Grafana | decline | State the milestone scope that makes it intended |
| https://github.com/kubernetes/community/pull/9139#discussion_r3977890947 | Kubernetes | decline | Cite the governance rule that requires the split |
| https://github.com/kubernetes/kubernetes/pull/143644#discussion_r4497269322 | Kubernetes | decline | Link the existing convention as evidence |
| https://github.com/kubernetes/kubernetes/pull/141807#discussion_r4379769678 | Kubernetes | decline | "Intentional", then one bullet per reason |
| https://github.com/kubernetes/kubernetes/pull/143751#discussion_r4479713761 | Kubernetes | decline | Keep a comment because it prevents a known confusion |
| https://github.com/llvm/llvm-project/pull/226197#discussion_r4143310110 | LLVM | decline | Explain why the pass cannot hit it, still take the cheap part |
| https://github.com/microsoft/vscode/pull/337232#discussion_r4078764332 | VS Code | decline | Link the pre-PR code to show the behavior is not new |
| https://github.com/microsoft/vscode/pull/337189#discussion_r4078131211 | VS Code | decline | Name the supported contract that makes the change unneeded |
| https://github.com/tailwindlabs/tailwindcss/pull/20666#discussion_r4473347504 | Tailwind | decline | "We keep it as is, for these reasons" with a list |
| https://github.com/tailwindlabs/tailwindcss/pull/20666#discussion_r4473348093 | Tailwind | decline | Show the ambiguous input that rules the suggestion out |
| https://github.com/vuejs/core/pull/16158#discussion_r4490270837 | Vue | decline | Cite parity with the existing renderer |
| https://github.com/astral-sh/ruff/pull/26680#discussion_r4489187051 | Ruff | defer | Leave regressions for a follow-up, add a fast path now |
| https://github.com/astral-sh/ruff/pull/26680#discussion_r4489314129 | Ruff | defer | Restore the guard, file the issue, link it |
| https://github.com/astral-sh/ruff/pull/29482#discussion_r4481326262 | Ruff | defer | File an issue and add a TODO test that marks it |
| https://github.com/astral-sh/ruff/pull/28329#discussion_r4460526598 | Ruff | minimal | Defers a redesign without an issue link |
| https://github.com/grafana/grafana/pull/136087#discussion_r4495085210 | Grafana | defer | Verify in the browser, track the rest as a follow-up |
| https://github.com/grafana/grafana/pull/136087#discussion_r4497177133 | Grafana | defer | Link the follow-up issue in the reply |
| https://github.com/hashicorp/terraform/pull/39326#discussion_r4185629425 | Terraform | minimal | Agrees to a separate PR with no link |
| https://github.com/hashicorp/terraform/pull/39318#discussion_r4185835504 | Terraform | defer | Move a TODO into the stacked PR |
| https://github.com/Homebrew/brew/pull/24471#discussion_r4474678088 | Homebrew | minimal | Calls it pre-existing and defers with no link |
| https://github.com/kubernetes/community/pull/9139#discussion_r4144723079 | Kubernetes | defer | Defer until the prerequisite exists and name the owner |
| https://github.com/prettier/prettier/pull/20351#discussion_r4489754053 | Prettier | defer | Open the follow-up and say what it does |
| https://github.com/llvm/llvm-project/pull/239747#discussion_r4498482738 | LLVM | minimal | A FIXME and a promise, with no issue |
| https://github.com/astral-sh/ruff/pull/26680#discussion_r4476502225 | Ruff | explain | Link the known issue behind a retry |
| https://github.com/astral-sh/ruff/pull/26680#discussion_r4489703224 | Ruff | explain | Explain the motivation with code when the reviewer guessed wrong |
| https://github.com/curl/curl/pull/22970#discussion_r4027049343 | curl | explain | Answer a leak worry by pointing at the ownership transfer |
| https://github.com/django/django/pull/21260#discussion_r3233787274 | Django | explain | Explain a naming choice by the prior style |
| https://github.com/django/django/pull/21260#discussion_r3234963034 | Django | explain | Say why you squash instead of adding a follow-up commit |
| https://github.com/curl/curl/pull/15289#discussion_r1798934468 | curl | ask | A short question that proposes the simpler alternative |
| https://github.com/django/django/pull/22233#discussion_r4444688096 | Django | ask | Push a rewrite and ask whether it reads better |
| https://github.com/django/django/pull/22169#discussion_r4315606701 | Django | ask | Restate the suggestion before answering it |
| https://github.com/kubernetes/kubernetes/pull/142913#discussion_r4389923734 | Kubernetes | ask | Cite the design doc rule while asking |
| https://github.com/kubernetes/kubernetes/pull/143644#discussion_r4455714252 | Kubernetes | ask | Check your own understanding with a question |
| https://github.com/llvm/llvm-project/pull/226197#discussion_r4466799316 | LLVM | ask | "I think you mean ...?" settles a term in one reply |
| https://github.com/llvm/llvm-project/pull/226197#discussion_r4133661863 | LLVM | ask | Ask what "this" refers to, then answer both readings |
| https://github.com/rails/rails/pull/50312#discussion_r1440890761 | Rails | ask | Ask the maintainer whether a reorder is breaking |
| https://github.com/rails/rails/pull/50312#discussion_r1423141686 | Rails | ask | Raise a circular-dependency risk as a question |
| https://github.com/rust-lang/rust/pull/159374#discussion_r4228850924 | Rust | ask | Point at the last commit and ask if it clarifies |
| https://github.com/rust-lang/rust/pull/159374#discussion_r4230353480 | Rust | ask | Offer a commit link as the proposed answer |
| https://github.com/electron/electron/pull/55098#discussion_r4450179958 | Electron | explain | Test the claim and report it is pre-existing |
| https://github.com/microsoft/TypeScript/pull/64823#discussion_r4286693839 | TypeScript | explain | Promise a benchmark before arguing |
| https://github.com/microsoft/TypeScript/pull/64823#discussion_r4287115768 | TypeScript | decline | Report the benchmark result as the reason |
| https://github.com/nodejs/node/pull/66409#discussion_r4502943463 | Node.js | explain | Rerun the benchmark on the reviewer's platform |
| https://github.com/nodejs/node/pull/66756#discussion_r4413102444 | Node.js | accept | Explain what a benchmark case measures and rename it |
| https://github.com/rust-lang/rust/pull/149245#discussion_r4112492867 | Rust | explain | Answer a reviewer's guess with what every tested case showed |
| https://github.com/curl/curl/pull/13522#issuecomment-2353369171 | curl | CI report | Name the job and the missing symbol that holds the PR |
| https://github.com/electron/electron/pull/55637#issuecomment-6674230818 | Electron | CI report | Job, test, timeout and attempt count in one line |
| https://github.com/electron/electron/pull/55637#issuecomment-6675521845 | Electron | CI report | Answer a CI-script question with the tool's documented default |
| https://github.com/eslint/eslint/pull/21460#issuecomment-6522191924 | ESLint | CI report | Trace an unrelated failure to a transitive dependency |
| https://github.com/grafana/grafana/pull/135295#issuecomment-6685686871 | Grafana | CI report | Explain a re-created signed commit after a rebase |
| https://github.com/nodejs/node/pull/66782#issuecomment-6647952816 | Node.js | CI report | Ask for the log of a run you cannot see |
| https://github.com/nodejs/node/pull/63733#issuecomment-6379094690 | Node.js | CI report | Link the failed Jenkins run when you ask |
| https://github.com/nodejs/node/pull/62599#issuecomment-4190866124 | Node.js | CI report | Link two other runs with the same failure |
| https://github.com/python/cpython/pull/148928#issuecomment-4342331411 | CPython | minimal | "Unrelated" with no evidence |
| https://github.com/rust-lang/rust/pull/165517#issuecomment-6666475656 | Rust | CI report | Say plainly you cannot read the failure and what passes locally |
| https://github.com/vitejs/vite/pull/23634#issuecomment-6261580191 | Vite | CI report | Note the dismissed approval and the unrelated timeout |
| https://github.com/vitejs/vite/pull/23922#issuecomment-6458678574 | Vite | CI report | Compare the failing cases across two runs |
| https://github.com/vitejs/vite/pull/23889#issuecomment-6395672690 | Vite | CI report | Name the flaky test and link it failing on main |
| https://github.com/withastro/astro/pull/18541#issuecomment-6486905504 | Astro | CI report | Show the failure was a fixture bug, with the exact input |
| https://github.com/withastro/astro/pull/18574#issuecomment-6573538303 | Astro | CI report | Calls a Windows failure a timing flake and makes no change |
| https://github.com/electron/electron/pull/55098#issuecomment-6594202598 | Electron | round summary | Addressed findings, with a regression test that fails before the fix |
| https://github.com/astral-sh/ruff/pull/28772#issuecomment-6672433524 | Ruff | minimal | A thanks-and-updated summary that lists nothing |
| https://github.com/django/django/pull/21857#issuecomment-5751945200 | Django | round summary | Cover feedback from the PR and the tracker in one list |
| https://github.com/django/django/pull/21260#issuecomment-6693756598 | Django | round summary | Say why the PR was not marked ready sooner |
| https://github.com/django/django/pull/19984#issuecomment-3460168221 | Django | round summary | One bullet per change |
| https://github.com/grafana/grafana/pull/136087#issuecomment-6434760707 | Grafana | round summary | Explain a visual-diff bot result with links |
| https://github.com/kubernetes/community/pull/9139#issuecomment-5866846717 | Kubernetes | round summary | Ready again, plus what changed since |
| https://github.com/kubernetes/kubernetes/pull/143387#issuecomment-6648478501 | Kubernetes | round summary | The minimal "addressed, PTAL" |
| https://github.com/kubernetes/kubernetes/pull/143536#issuecomment-6619412126 | Kubernetes | round summary | "Updated as follows" with bullets |
| https://github.com/kubernetes/kubernetes/pull/143816#issuecomment-6650018212 | Kubernetes | round summary | Assign reviewers with the repo's bot command |
| https://github.com/llvm/llvm-project/pull/235828#issuecomment-6626752340 | LLVM | round summary | A status ping after a week that restates the scope |
| https://github.com/python/cpython/pull/161432#issuecomment-6695896694 | CPython | round summary | A milestone update that re-marks the PR ready |
| https://github.com/curl/curl/pull/17891/commits/ee1d920e0e763e379aba4ec563bd898f4ac3447b | curl | CI commit | The subject names the job and the package |
| https://github.com/denoland/deno/pull/37084/commits/6236fd42b2beca93f0249e7054f7cc53fee5d0a4 | Deno | CI commit | The subject names the lint and the function |
| https://github.com/electron/electron/pull/55651/commits/e5fffb03e62f9ce07bff9cf0f39d22bf75cc2442 | Electron | CI commit | The subject names the flaky step and the retry |
| https://github.com/eslint/eslint/pull/21462/commits/66c561cff048bf900f827bbc6f9c1e49c53712b7 | ESLint | CI commit | Disable a broken ecosystem test by name |
| https://github.com/react/react/pull/33578/commits/beb5844820aac477594cbf2d23cb2f8248a6f263 | React | minimal | "Fix CI" says nothing about the failure |
| https://github.com/microsoft/vscode/pull/337305/commits/3b3b7b011f141142d7c8b48736667c92884546ec | VS Code | minimal | "fix test" names no test |
