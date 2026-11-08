# Sources

Read on 2026-11-07, except the three Go and Kubernetes links in the last rows of the
Rules table, which the skill's earlier version read on 2026-11-06.

## Rules

| Source | What this skill takes |
|---|---|
| [GitHub, syntax for issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms) | Forms have required fields set by `validations.required`. Fill the repo's form field by field. |
| [GitHub, linking a PR to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) | The closing keywords, and that they work only when the PR targets the default branch. A keyword in a commit message closes the issue when the commit reaches the default branch. |
| [GitHub, closing an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/closing-an-issue) | Close when a bug is fixed, feedback is acted on, or to show work is not planned. Pick a reason. |
| [GitHub REST, update an issue](https://docs.github.com/en/rest/issues/issues#update-an-issue) | The close reasons are `completed`, `not_planned` and `duplicate`. |
| [GitHub, marking a duplicate](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/marking-issues-or-pull-requests-as-a-duplicate) | `Duplicate of #N` in a comment marks the duplicate in the timeline. |
| [GitHub, about saved replies](https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies/about-saved-replies) | Saved replies are per account, up to 100. The templates here can become saved replies. |
| [Kubernetes, issue triage](https://github.com/kubernetes/community/blob/master/contributors/guide/issue-triage.md) | Bot commands on their own lines at the front of a comment. Ask with `/triage needs-information`. Close after 20 days with no reply, with a comment. For a duplicate, reference the original. |
| [VS Code, issue grooming](https://github.com/microsoft/vscode/wiki/Issue-Grooming) | Close reasons as labels (`*duplicate`, `*as-designed`, `*out-of-scope`, `needs more info` after 7 days). Explain a won't-fix. |
| [Rust, issue triage](https://forge.rust-lang.org/release/issue-triaging.html) | Ask for a reproduction when in doubt. Close as duplicate only when certain, otherwise say "possibly related". Close an old needs-repro issue after about a month. |
| [Node.js, issues](https://github.com/nodejs/node/blob/main/doc/contributing/issues.md) | Ask for details and add `needs more info` when you cannot reproduce. Always explain why you close. |
| [Homebrew, maintainer guidelines](https://docs.brew.sh/Maintainer-Guidelines) | Keep decisions public and linkable. "Because I say so" is never the reason. Link a fix with `Fixes #N`. |
| [Go, handling issues](https://go.dev/wiki/HandlingIssues) | `WaitingForInfo` while waiting on the reporter. Close with a reason: fixed by, duplicate of, working as intended. |
| [Go, proposal process](https://github.com/golang/proposal/blob/master/README.md) | The decision comment: likely accept or decline, then accepted or declined after one week with no change in consensus. |
| [Go bug form](https://github.com/golang/go/blob/master/.github/ISSUE_TEMPLATE/00-bug.yml) | What did you do, see and expect, and the version. |
| [Kubernetes bug form](https://github.com/kubernetes/kubernetes/blob/master/.github/ISSUE_TEMPLATE/bug-report.yaml) | A minimal, precise reproduction and versions. |
| [Kubernetes, release notes](https://github.com/kubernetes/community/blob/master/contributors/guide/release-notes.md) | Notes written for users, with action required first. |

House rules from the existing skills, not from these sources: Jeff approves every
public issue, comment and release before it goes out. The `prod` and `dev` branch model
comes from the Git law. A release is High in `review-gate`.

## Measured

Method, issue forms: list `.github/ISSUE_TEMPLATE` in 30 repos through `gh api`, take
the bug form, split it into fields, and match labels and ids against reproduction,
version and AI-disclosure patterns. 22 repos had YAML forms, 21 of them bug forms.

| Measure | Result |
|---|---|
| Bug forms with a required reproduction field | 16 of 21. 18 of 21 if you count the required summary field that must hold an example (CPython, uv) |
| Bug forms with a reproduction field at all | 19 of 21 |
| Bug forms with a required version field | 15 of 21. All 21 ask for a version or environment output somewhere |
| Bug forms that name a command to collect the version | 17 of 21 |
| Median fields per bug form | 7 |
| Bug forms that address AI use | 6 of 21: Homebrew, ESLint and Terraform ask for disclosure, Electron gives agents rules, curl and Next.js want a human-written report |

Method, comments: for 18 repos, list the 60 most recently updated closed issues, keep
non-PR issues with comments and a human author, take the first 7, and pull all comments
(105 issues, 75 completed, 20 not planned, 10 duplicate). A closing comment is the last
maintainer (`MEMBER`, `OWNER`, `COLLABORATOR`) comment within 48 hours of `closed_at`.
A triage reply is the first maintainer comment that is not the closing one. Both were
hand-coded after a regex pass, because the regex counted any `#N`, hex string or `?`.
Close events came from `/issues/<n>/events`. Sorting by `updated` mixes new issues with
old ones that stale bots closed, so these numbers describe recent activity, not new
issues only.

| Measure | Result |
|---|---|
| Completed issues that carry a link to the change | 22 of 75 (29%): 12 closed by a commit or PR keyword, 10 by a comment that links the PR or commit. The 75 include answered questions and reporter self-closes, and bors merge closes count as unlinked, so this understates linking for real fixes |
| Closing comments that announce a fix and link it | 10 of 15 (67%). 3 more name the version only, 2 name neither |
| Closing comments that announce a fix and name a version | 6 of 15 (40%) |
| Not-planned and duplicate closing comments with a reason or a link | 10 of 12 |
| Closes by a bot as the last actor near close | 15 of 105 (14%) |
| Median closing comment | 17 words |
| Triage replies, hand-coded (39) | 11 ask the reporter one thing, 7 state a decision with its reason, 6 are labels or routing only (Kubernetes slash commands, `cc` lines), 2 claim the work, 13 are discussion or status |
| Triage replies that set a next step (ask, claim or decision) | 20 of 39 (51%) |
| Median triage reply | 26 words |
| Curl closes not-a-bug reports as `completed` | At least 4 of 7 curl closing comments (23773, 23780, 23797, 23799). 3 more are unclear. The close reason is often wrong in practice |

Method, release notes: the latest release in 12 repos through
`/repos/<o>/<r>/releases?per_page=1`, counting bullet lines that carry a PR, issue or
commit link. TypeScript's latest was a tooling tag with no notes, so 11 count.

| Measure | Result |
|---|---|
| Releases that link every bullet | 8 of 11 |
| Bullets linked, all releases | 237 of 294 (81%). Bun's notes point to a blog post and link none |

## Examples

122 rows, every one pulled through `gh api` on 2026-11-07. A `bot` kind is automation
text. Two Bun replies are machine-generated and are listed so they are not copied as a
length model.

| # | URL | Project | Kind | What it teaches |
|---:|---|---|---|---|
| 1 | https://github.com/golang/go/blob/master/.github/ISSUE_TEMPLATE/00-bug.yml | golang/go | Issue form (bug) | Five required fields that ask what you did, saw and expected |
| 2 | https://github.com/kubernetes/kubernetes/blob/master/.github/ISSUE_TEMPLATE/bug-report.yaml | kubernetes/kubernetes | Issue form (bug) | Requires a minimal, precise reproduction and versions |
| 3 | https://github.com/rust-lang/rust/blob/main/.github/ISSUE_TEMPLATE/diagnostics.yaml | rust-lang/rust | Issue form (bug) | Requires code, current output and `rustc --version --verbose` |
| 4 | https://github.com/react/react/blob/main/.github/ISSUE_TEMPLATE/compiler_bug_report.yml | facebook/react | Issue form (bug) | Bug form field set |
| 5 | https://github.com/nodejs/node/blob/main/.github/ISSUE_TEMPLATE/1-bug-report.yml | nodejs/node | Issue form (bug) | Bug form field set |
| 6 | https://github.com/oven-sh/bun/blob/main/.github/ISSUE_TEMPLATE/2-bug-report.yml | oven-sh/bun | Issue form (bug) | Bug form field set |
| 7 | https://github.com/withastro/astro/blob/main/.github/ISSUE_TEMPLATE/---01-bug-report.yml | withastro/astro | Issue form (bug) | Bug form field set |
| 8 | https://github.com/vercel/next.js/blob/canary/.github/ISSUE_TEMPLATE/1.bug_report.yml | vercel/next.js | Issue form (bug) | Requires a reproduction link and environment output |
| 9 | https://github.com/sveltejs/svelte/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml | sveltejs/svelte | Issue form (bug) | Bug form field set |
| 10 | https://github.com/vuejs/core/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml | vuejs/core | Issue form (bug) | Bug form field set |
| 11 | https://github.com/electron/electron/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml | electron/electron | Issue form (bug) | Tells AI agents to describe symptoms and fold analysis into details |
| 12 | https://github.com/Homebrew/brew/blob/main/.github/ISSUE_TEMPLATE/bug.yml | Homebrew/brew | Issue form (bug) | Requires `brew config` and `brew doctor` output and an AI disclosure |
| 13 | https://github.com/curl/curl/blob/master/.github/ISSUE_TEMPLATE/bug_report.yml | curl/curl | Issue form (bug) | Asks for the report in your own human voice |
| 14 | https://github.com/eslint/eslint/blob/main/.github/ISSUE_TEMPLATE/bug-report.yml | eslint/eslint | Issue form (bug) | AI acknowledgment checkboxes beside a required repro link |
| 15 | https://github.com/vitejs/vite/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml | vitejs/vite | Issue form (bug) | Bug form field set |
| 16 | https://github.com/trpc/trpc/blob/main/.github/ISSUE_TEMPLATE/1.bug_report.yml | trpc/trpc | Issue form (bug) | Bug form field set |
| 17 | https://github.com/grafana/grafana/blob/main/.github/ISSUE_TEMPLATE/0-bug-report.yaml | grafana/grafana | Issue form (bug) | Asks "Did this work before?" for regressions |
| 18 | https://github.com/hashicorp/terraform/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml | hashicorp/terraform | Issue form (bug) | Asks which generative AI tool helped, if any |
| 19 | https://github.com/microsoft/TypeScript/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml | microsoft/TypeScript | Issue form (bug) | Search terms and regression information before the code |
| 20 | https://github.com/python/cpython/blob/main/.github/ISSUE_TEMPLATE/bug.yml | python/cpython | Issue form (bug) | Three fields: bug report with code, versions, OS |
| 21 | https://github.com/astral-sh/uv/blob/main/.github/ISSUE_TEMPLATE/1_bug_report.yaml | astral-sh/uv | Issue form (bug) | One required summary field that must hold a minimal example |
| 22 | https://github.com/github/docs/blob/main/.github/ISSUE_TEMPLATE/improve-existing-docs.yaml | github/docs | Issue form (docs) | Bug form field set |
| 23 | https://github.com/golang/go/issues/76221#issuecomment-3504728407 | golang/go | Closing comment, duplicate | Duplicate close that links the original and the cause |
| 24 | https://github.com/golang/go/issues/76210#issuecomment-3503107958 | golang/go | Closing comment, completed | Closing comment, 16 words |
| 25 | https://github.com/golang/go/issues/76219#issuecomment-3502431918 | golang/go | Closing comment, duplicate | Closing comment, 14 words |
| 26 | https://github.com/kubernetes/kubernetes/issues/141952#issuecomment-6701149992 | kubernetes/kubernetes | Closing comment, completed | Closing comment, 29 words |
| 27 | https://github.com/kubernetes/kubernetes/issues/142383#issuecomment-6691890084 | kubernetes/kubernetes | Closing comment, completed | Closing comment, 8 words |
| 28 | https://github.com/kubernetes/kubernetes/issues/143852#issuecomment-6665640927 | kubernetes/kubernetes | Closing comment, completed | Closing comment, 1 words |
| 29 | https://github.com/kubernetes/kubernetes/issues/142440#issuecomment-6688485482 | kubernetes/kubernetes | Closing comment, completed | Closing comment, 88 words |
| 30 | https://github.com/kubernetes/kubernetes/issues/140468#issuecomment-6688034197 | kubernetes/kubernetes | Closing comment, completed | Closing comment that names the merged PRs and what each covers |
| 31 | https://github.com/rust-lang/rust/issues/165515#issuecomment-6713199805 | rust-lang/rust | Closing comment, completed | Fix close with commit, PR and the release that carries it |
| 32 | https://github.com/rust-lang/rust/issues/69939#issuecomment-6711204791 | rust-lang/rust | Closing comment, completed | Closing comment, 9 words |
| 33 | https://github.com/rust-lang/rust/issues/54882#issuecomment-6706161901 | rust-lang/rust | Closing comment, completed | Closing comment, 11 words |
| 34 | https://github.com/microsoft/vscode/issues/345390#issuecomment-6636436870 | microsoft/vscode | Closing comment, completed | Closing comment, 9 words |
| 35 | https://github.com/microsoft/vscode/issues/315769#issuecomment-6714632934 | microsoft/vscode | Closing comment, completed | AI-authored verification with build, steps and a reopen path |
| 36 | https://github.com/microsoft/vscode/issues/333990#issuecomment-5791182962 | microsoft/vscode | Closing comment, completed | Three-word fix close with the PR link |
| 37 | https://github.com/microsoft/vscode/issues/334183#issuecomment-5791143325 | microsoft/vscode | Closing comment, duplicate | Closing comment, 1 words |
| 38 | https://github.com/oven-sh/bun/issues/48079#issuecomment-6704067060 | oven-sh/bun | Closing comment, not_planned | Machine-generated not-planned reply, 561 words, not a length model |
| 39 | https://github.com/oven-sh/bun/issues/48080#issuecomment-6703826019 | oven-sh/bun | Closing comment, not_planned | Machine-generated cannot-reproduce reply, 657 words, not a length model |
| 40 | https://github.com/electron/electron/issues/48668#issuecomment-3461013746 | electron/electron | Closing comment, not_planned | Not-planned close that gives the reason |
| 41 | https://github.com/electron/electron/issues/55137#issuecomment-6690571171 | electron/electron | Closing comment, completed | Fix close that lists the backport PRs and versions |
| 42 | https://github.com/electron/electron/issues/54653#issuecomment-6690550441 | electron/electron | Closing comment, completed | Fixed by one PR link |
| 43 | https://github.com/Homebrew/brew/issues/24509#issuecomment-6704803118 | Homebrew/brew | Closing comment, not_planned | Closing comment, 40 words |
| 44 | https://github.com/Homebrew/brew/issues/24493#issuecomment-6662218671 | Homebrew/brew | Closing comment, not_planned | Closing comment, 3 words |
| 45 | https://github.com/Homebrew/brew/issues/24339#issuecomment-6369926287 | Homebrew/brew | Closing comment, completed | Closing comment, 36 words |
| 46 | https://github.com/Homebrew/brew/issues/22659#issuecomment-4680873774 | Homebrew/brew | Closing comment, not_planned | Not-planned close with a reason and a link |
| 47 | https://github.com/curl/curl/issues/23755#issuecomment-6681345980 | curl/curl | Closing comment, completed | Closing comment, 24 words |
| 48 | https://github.com/curl/curl/issues/23780#issuecomment-6705717135 | curl/curl | Closing comment, completed | Closing comment, 74 words |
| 49 | https://github.com/curl/curl/issues/23809#issuecomment-6713313941 | curl/curl | Closing comment, completed | Closing comment, 15 words |
| 50 | https://github.com/curl/curl/issues/23796#issuecomment-6706613961 | curl/curl | Closing comment, completed | Closing comment, 8 words |
| 51 | https://github.com/curl/curl/issues/23773#issuecomment-6680111094 | curl/curl | Closing comment, completed | Closing comment, 52 words |
| 52 | https://github.com/curl/curl/issues/23799#issuecomment-6705368906 | curl/curl | Closing comment, completed | Closing comment, 17 words |
| 53 | https://github.com/curl/curl/issues/23797#issuecomment-6705420622 | curl/curl | Closing comment, completed | Not-a-bug decision closed as completed: wrong close reason |
| 54 | https://github.com/eslint/eslint/issues/21504#issuecomment-6704347985 | eslint/eslint | Closing comment, duplicate | Thanks, link to the original, closing as duplicate |
| 55 | https://github.com/eslint/eslint/issues/21456#issuecomment-6519950765 | eslint/eslint | Closing comment, duplicate | Closing comment, 18 words |
| 56 | https://github.com/eslint/eslint/issues/21242#issuecomment-6451398431 | eslint/eslint | Closing comment, completed | Closing comment, 35 words |
| 57 | https://github.com/vitejs/vite/issues/23945#issuecomment-6625632532 | vitejs/vite | Closing comment, completed | Closing comment, 17 words |
| 58 | https://github.com/vitejs/vite/issues/23968#issuecomment-6570055964 | vitejs/vite | Closing comment, duplicate | Moves tracking upstream with a reason |
| 59 | https://github.com/python/cpython/issues/161430#issuecomment-6711355270 | python/cpython | Closing comment, completed | Status after the commits, with logs |
| 60 | https://github.com/hashicorp/terraform/issues/25587#issuecomment-6042819366 | hashicorp/terraform | Closing comment, completed | Belated close via the PR link |
| 61 | https://github.com/hashicorp/terraform/issues/36154#issuecomment-6697900044 | hashicorp/terraform | Closing comment, completed | Closed via #N |
| 62 | https://github.com/hashicorp/terraform/issues/38314#issuecomment-6001619632 | hashicorp/terraform | Closing comment, completed | Fix close that names the version but no link |
| 63 | https://github.com/hashicorp/terraform/issues/38084#issuecomment-6001847704 | hashicorp/terraform | Closing comment, completed | Fix close that names the version and PR |
| 64 | https://github.com/microsoft/TypeScript/issues/65356#issuecomment-6689667576 | microsoft/TypeScript | Closing comment, completed | Closing comment, 44 words |
| 65 | https://github.com/microsoft/TypeScript/issues/65309#issuecomment-6635945208 | microsoft/TypeScript | Closing comment, completed | Closing comment, 16 words |
| 66 | https://github.com/astral-sh/uv/issues/23103#issuecomment-6667588606 | astral-sh/uv | Closing comment, completed | Closed by a PR link |
| 67 | https://github.com/astral-sh/uv/issues/4917#issuecomment-2218132681 | astral-sh/uv | Closing comment, completed | Closing comment, 4 words |
| 68 | https://github.com/astral-sh/uv/issues/23102#issuecomment-6635554960 | astral-sh/uv | Closing comment, completed | Closing comment, 43 words |
| 69 | https://github.com/astral-sh/uv/issues/17642#issuecomment-4233180680 | astral-sh/uv | Closing comment, completed | Closing comment, 51 words |
| 70 | https://github.com/kubernetes/kubernetes/issues/141952#issuecomment-5595639035 | kubernetes/kubernetes | First maintainer reply | Kubernetes triage as slash commands only |
| 71 | https://github.com/kubernetes/kubernetes/issues/143852#issuecomment-6664724516 | kubernetes/kubernetes | First maintainer reply | Six label commands, one per line |
| 72 | https://github.com/rust-lang/rust/issues/125813#issuecomment-2141899238 | rust-lang/rust | First maintainer reply | Claims the work in four words |
| 73 | https://github.com/electron/electron/issues/54653#issuecomment-6087363615 | electron/electron | First maintainer reply | Partial reproduction with a precise follow-up question |
| 74 | https://github.com/electron/electron/issues/28684#issuecomment-860996543 | electron/electron | First maintainer reply | Confirms the repro on an old version and asks one question |
| 75 | https://github.com/electron/electron/issues/8725#issuecomment-281292774 | electron/electron | First maintainer reply | One question: does it happen on the latest stable? |
| 76 | https://github.com/Homebrew/brew/issues/24339#issuecomment-6364369616 | Homebrew/brew | First maintainer reply | Intentional behaviour, pointed at the FAQ and tests |
| 77 | https://github.com/curl/curl/issues/23796#issuecomment-6705529314 | curl/curl | First maintainer reply | Out of date and no reproducer, in two lines |
| 78 | https://github.com/eslint/eslint/issues/21169#issuecomment-5698783830 | eslint/eslint | First maintainer reply | Version support policy link, then the analysis |
| 79 | https://github.com/python/cpython/issues/148891#issuecomment-4299646961 | python/cpython | First maintainer reply | Repro request that says why a self-contained repro matters |
| 80 | https://github.com/microsoft/TypeScript/issues/65092#issuecomment-6586485859 | microsoft/TypeScript | First maintainer reply | Intentional exclusion, stated with the reason |
| 81 | https://github.com/astral-sh/uv/issues/17642#issuecomment-3782341153 | astral-sh/uv | First maintainer reply | Offers the existing option as the alternative |
| 82 | https://github.com/golang/go/issues/81698#issuecomment-6180828040 | golang/go | decision | Go proposal review: likely accept, restating the proposal |
| 83 | https://github.com/golang/go/issues/81698#issuecomment-6507741693 | golang/go | decision | Go proposal review: accepted, and the issue now tracks the work |
| 84 | https://github.com/golang/go/issues/69230#issuecomment-6507758595 | golang/go | decision | decision, 25 words |
| 85 | https://github.com/golang/go/issues/69230#issuecomment-6642604875 | golang/go | decision | decision, 30 words |
| 86 | https://github.com/rust-lang/rust/issues/152760#issuecomment-3916135620 | rust-lang/rust | decision | decision, 47 words |
| 87 | https://github.com/rust-lang/rust/issues/136652#issuecomment-6659282440 | rust-lang/rust | decision | Starts the final comment period with @rfcbot fcp merge |
| 88 | https://github.com/vitejs/vite/issues/23145#issuecomment-5187868744 | vitejs/vite | repro-request, bot | Bot repro-request text, 29 words |
| 89 | https://github.com/vitejs/vite/issues/22971#issuecomment-5030588920 | vitejs/vite | repro-request, bot | Bot repro-request text, 29 words |
| 90 | https://github.com/vercel/next.js/issues/52996#issuecomment-1645494052 | vercel/next.js | repro-request, bot | Bot repro-request text, 600 words |
| 91 | https://github.com/vercel/next.js/issues/52996#issuecomment-1793255819 | vercel/next.js | repro-request, bot | Bot repro-request text, 36 words |
| 92 | https://github.com/vercel/next.js/issues/92888#issuecomment-4260917389 | vercel/next.js | repro-request, bot | Bot repro-request text, 602 words |
| 93 | https://github.com/vercel/next.js/issues/92888#issuecomment-4260920249 | vercel/next.js | repro-request | repro-request, 20 words |
| 94 | https://github.com/microsoft/vscode/issues/316196#issuecomment-4460557340 | microsoft/vscode | repro-request | repro-request, 15 words |
| 95 | https://github.com/microsoft/vscode/issues/336275#issuecomment-5681871823 | microsoft/vscode | repro-request, bot | Bot repro-request text, 39 words |
| 96 | https://github.com/microsoft/vscode/issues/336275#issuecomment-5682109864 | microsoft/vscode | repro-request, bot | Bot repro-request text, 53 words |
| 97 | https://github.com/nodejs/node/issues/66788#issuecomment-6240585131 | nodejs/node | triage | triage, 20 words |
| 98 | https://github.com/nodejs/node/issues/66788#issuecomment-6397922207 | nodejs/node | triage | triage, 231 words |
| 99 | https://github.com/sveltejs/svelte/issues/15887#issuecomment-4508221075 | sveltejs/svelte | repro-request | repro-request, 44 words |
| 100 | https://github.com/sveltejs/svelte/issues/15607#issuecomment-2750087077 | sveltejs/svelte | repro-request | repro-request, 30 words |
| 101 | https://github.com/nodejs/node/issues/49453#issuecomment-4820296033 | nodejs/node | Bot notice | This issue has been marked as stale due to 210 days of inactivity. It |
| 102 | https://github.com/vercel/next.js/issues/101359#issuecomment-6714106662 | vercel/next.js | Bot notice | We could not detect a valid reproduction link. Make sure to follow t |
| 103 | https://github.com/sveltejs/svelte/issues/19104#issuecomment-6440675466 | sveltejs/svelte | Bot notice | I reproduced the issue, but could not produce a safe, verified fix. |
| 104 | https://github.com/electron/electron/issues/52284#issuecomment-6029293311 | electron/electron | Bot notice | This issue has been automatically marked as stale. If this issue is |
| 105 | https://github.com/eslint/eslint/issues/21491#issuecomment-6672647043 | eslint/eslint | Bot notice | 👋 Hi! This issue is being addressed in pull request https://github.co |
| 106 | https://github.com/vitejs/vite/issues/23809#issuecomment-6246530952 | vitejs/vite | Bot notice | Hello @lucasvidela94. Please provide a [minimal reproduction](https:// |
| 107 | https://github.com/golang/go/issues/74472#issuecomment-4284572415 | golang/go | Open issue comment | Status heads-up: who is meeting and why it matters |
| 108 | https://github.com/python/cpython/issues/106338#issuecomment-6652198609 | python/cpython | Open issue comment | Tells a volunteer to send the PR |
| 109 | https://github.com/nodejs/node/issues/64841#issuecomment-5193977710 | nodejs/node | Open issue comment | Independent reproduction on a native host with numbers |
| 110 | https://github.com/nodejs/node/issues/64841#issuecomment-5204995836 | nodejs/node | Open issue comment | Corrects an earlier conclusion in the open |
| 111 | https://github.com/nodejs/node/issues/56241#issuecomment-2545887531 | nodejs/node | Open issue comment | Status: links the work-in-progress branch |
| 112 | https://github.com/denoland/deno/releases/tag/v2.9.8 | denoland/deno | Release notes | 13 lines, 9 linked, headings: 2.9.8 / 2026.10.21 |
| 113 | https://github.com/oven-sh/bun/releases/tag/bun-v1.4.4 | oven-sh/bun | Release notes | 39 lines, 0 linked, headings: or you can use npm, npm install -g bun, [Read Bun v1.4.4's release notes on Bun's blog](https://bun.com/blog/bun-v1.4.4), Thanks to 39 contributors! |
| 114 | https://github.com/vitejs/vite/releases/tag/v8.3.6 | vitejs/vite | Release notes | 27 lines, 27 linked, headings: Bug Fixes, Performance Improvements, Miscellaneous Chores, Build System |
| 115 | https://github.com/astral-sh/uv/releases/tag/0.13.7 | astral-sh/uv | Release notes | 9 lines, 9 linked, headings: Release Notes, Preview features, Bug fixes, Documentation |
| 116 | https://github.com/electron/electron/releases/tag/v46.0.0-alpha.7 | electron/electron | Release notes | 4 lines, 4 linked, headings: Fixes, Other Changes, Documentation |
| 117 | https://github.com/hashicorp/terraform/releases/tag/v1.17.1 | hashicorp/terraform | Release notes | 3 lines, 3 linked, headings: 1.17.1 (October 28, 2026) |
| 118 | https://github.com/eslint/eslint/releases/tag/v10.14.0 | eslint/eslint | Release notes | 22 lines, 22 linked, headings: Features, Bug Fixes, Documentation, Chores |
| 119 | https://github.com/grafana/grafana/releases/tag/v13.3.0 | grafana/grafana | Release notes | 163 lines, 149 linked, headings: Security, Features and enhancements, Bug fixes, Breaking changes |
| 120 | https://github.com/prettier/prettier/releases/tag/3.9.10 | prettier/prettier | Release notes | 1 lines, 1 linked, headings: none |
| 121 | https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.5 | tailwindlabs/tailwindcss | Release notes | 7 lines, 7 linked, headings: Fixed |
| 122 | https://github.com/sveltejs/svelte/releases/tag/svelte%405.57.3 | sveltejs/svelte | Release notes | 6 lines, 6 linked, headings: Patch Changes |
