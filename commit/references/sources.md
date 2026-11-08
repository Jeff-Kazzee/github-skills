# Sources

## Rules

Read on 2026-11-06.

| Source | What this skill takes |
|---|---|
| [Linux, submitting patches](https://github.com/torvalds/linux/blob/master/Documentation/process/submitting-patches.rst) | Problem first, one logical change, imperative mood, bisectable series, 12-character SHA with quoted subject, `Fixes:` |
| [Linux, coding assistants](https://github.com/torvalds/linux/blob/master/Documentation/process/coding-assistants.rst) | AI agents must not add `Signed-off-by` |
| [Git, SubmittingPatches](https://github.com/git/git/blob/master/Documentation/SubmittingPatches) | Problem, justification and discarded alternatives. The 50-character soft limit. |
| [Google, CL descriptions](https://github.com/google/eng-practices/blob/master/review/developer/cl-descriptions.md) | A first line that stands alone, an informative body |
| [Google, small CLs](https://github.com/google/eng-practices/blob/master/review/developer/small-cls.md) | Refactors apart, tests with their code |
| [gstack `ship`](https://github.com/garrytan/gstack), [pstack](https://github.com/michael-denyer/pstack-claude) `make-pr-easy-to-review` | Dependency order, and proving the tree is unchanged after a rewrite |
| [Kubernetes, pull requests](https://github.com/kubernetes/community/blob/master/contributors/guide/pull-requests.md) | Squash fixes to earlier commits, keep independent layers |

## Measured habits

Latest non-merge commits per target, up to 100 each, read through the GitHub API on
2026-11-06. Body means more than 40 characters of prose beside the trailers.

| Project or author | Commits | Median subject | Over 72 | With a body | Median body words | Conventional |
|---|---:|---:|---:|---:|---:|---:|
| Linux | 76 | 59 | 5% | 100% | 124 | 0% |
| Git | 51 | 46 | 0% | 78% | 82 | 6% |
| Go | 100 | 62 | 11% | 98% | 73 | 1% |
| PostgreSQL | 100 | 56 | 2% | 98% | 99 | 4% |
| Kubernetes | 52 | 56 | 25% | 27% | 44 | 4% |
| Rust | 100 | 63 | 29% | 73% | 48 | 1% |
| LLVM | 100 | 70 | 40% | 94% | 42 | 0% |
| React | 100 | 68 | 34% | 84% | 111 | 1% |
| Jeff King, Git | 100 | 50 | 1% | 100% | 164 | 4% |
| Russ Cox, Go | 100 | 49 | 3% | 90% | 74 | 0% |
| Tom Lane, PostgreSQL | 100 | 60 | 1% | 98% | 101 | 0% |

What the numbers show:

- A body is the norm. Kubernetes is the outlier because its merge bots keep the
  explanation in the PR.
- Three of the strongest individual contributors stay near 50 to 60 characters, while
  the median across a whole project drifts longer.
- Trailers follow each project's process, so copy the repo, not a universal set.
- `Assisted-by:` for AI tools now appears in Git and LLVM history. Jeff's Git law uses
  `Agent:` and `Agent-Session:`, which name the tool more precisely.

## Merge messages

Read on 2026-11-07. These rows back section 6, the trailer line in section 5, the
revert line in section 7, and [merge-messages.md](merge-messages.md).

### Rules

| Source | What this skill takes |
|---|---|
| [Linux, rebasing and merging](https://github.com/torvalds/linux/blob/master/Documentation/maintainer/rebasing-and-merging.rst) | A merge message says why the merge is done. For a lower-level tree, the why is a summary of the changes it brings. A back merge documents why it was needed. |
| [git-merge](https://github.com/git/git/blob/master/Documentation/git-merge.adoc) and [merge options](https://github.com/git/git/blob/master/Documentation/merge-options.adoc) | `-m` and `-F` set the merge message. `--log` appends the shortlog. |
| [git-revert](https://github.com/git/git/blob/master/Documentation/git-revert.adoc) | `-m <parent>` names the mainline. A reverted merge stays merged in history, so later merges bring only newer commits. |
| [Revert a faulty merge](https://github.com/git/git/blob/master/Documentation/howto/revert-a-faulty-merge.adoc) | To bring a reverted merge back, revert the revert. |
| [git-interpret-trailers](https://github.com/git/git/blob/master/Documentation/git-interpret-trailers.adoc) | The trailer block is the last group of lines in the message. |
| [GitHub, pull request merges](https://github.com/github/docs/blob/main/content/pull-requests/reference/pull-request-merges.md) | Squash fits one logical change. The default squash message comes from the title, the description or the commits, set per repository. |
| [GitHub, configure squashing](https://github.com/github/docs/blob/main/content/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests.md) and [merging](https://github.com/github/docs/blob/main/content/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-merging-for-pull-requests.md) | The squash default is the one commit's message, or the PR title plus the commit list for 2 or more commits. The merge default is `Merge pull request #123 from patch-1` plus the title. |
| `gh pr merge --help` (gh CLI) | `--subject`, `--body`, `--body-file` and `--match-head-commit` |
| `agent-git land --help` and `agent-git promote --help` (Jeff's house tool) | `land` sets the subject to `<PR title> (#N)` and appends `Task`, `Agent`, `Agent-Session`, `Landed-by`, `Verified-by` and `Approved-by`. `--message` is the body above them. `promote` sets `Promote dev to <target> (#N)`, and its sync sets `Sync <target> into dev after promotion (#N)` with trailers only. |

### Measured

Method: `gh api repos/<o>/<r>/commits?per_page=N[&sha=<branch>]`, 1,500 commits from 34
branch pulls across 29 repositories, read on 2026-11-07, then 1,454 after removing
duplicates by SHA and by repository plus subject. A merge has 2 parents. A squash
has 1 parent and a subject ending in `(#N)`. Written words exclude the PR title GitHub
or bors copies, the shortlog, rollup PR lists, HTML comments and trailers.

| Measure | Result |
|---|---|
| Non-merge commits with `(#N)` in the subject, in the 12 squash-model repos (React, Next.js, Vite, TypeScript, Deno, Bun, Astro, Svelte, Grafana, Supabase, Electron, VS Code) | 480 of 492 (98%) |
| Squash commits, all 19 repos that have them | 635 |
| Squash bodies with no prose | 282 (44%). TypeScript, Vite and Home Assistant `dev`: 40 of 40 each |
| Squash bodies that are the branch commit list | 81 (13%) |
| Squash bodies that are a PR description | 272 (43%), median 80 words |
| Squash bodies with a leaked PR template comment | 27 (Next.js 20 of 37) |
| Squash median subject, and over 72 characters | 66 characters, 225 (35%) |
| Squash commits with `Co-authored-by:` / `Signed-off-by:` | 251 (39%) / 12 (2%) |
| Maintainer-written merges (Linux, Git): 15 or more written words | 84 of 94 (89%), median 35 words, median subject 48 |
| Bitcoin merge-script merges: summary present | 29 of 29, median 111 words, copied from the PR description, `Tree-SHA512:` on all 29 |
| bors merges (Rust): summary present | 32 of 46 (70%), median 31 words, copied PR body |
| GitHub merge-button default `Merge pull request #N from ...` (Kubernetes and its release branch, Rails, Homebrew, Terraform, Pi-hole FTL, Rust subtree syncs): summary present | 0 of 89 |
| GitHub release merges into a release branch (pi-hole, Pi-hole FTL, Home Assistant) | 3 of 3 carry only the version in the commit |
| Reverts of merges found by commit search (6 repositories, 6 results each) | 36. 30 keep the default `Revert "Merge ..."` subject. 11 give a reason of 10 or more words. |

What the numbers show:

- Where a maintainer writes the merge message, nearly every merge says what it brings.
  Where a button writes it, none does.
- The squash subject carries the PR number almost everywhere, so the number is the link
  back to the review. The body is the part teams drop.
- Trailers on merges are rare outside Bitcoin's `Tree-SHA512`. The `Landed-by` and
  `Verified-by` block is Jeff's Git law, not a common practice.
- Most reverts of merges state no reason. The best ones state the regression and when
  the change comes back.

### Examples

106 rows, each fetched on 2026-11-07 through `gh api` (commits and pulls) or commit
search (reverts). Merge rows link the commit on the branch named.

| Commit or PR | Project | Kind | What it teaches |
|---|---|---|---|
| [d71b537241d2](https://github.com/react/react/commit/d71b537241d26861df496413db2142c7ba192c25) | facebook/react | squash | PR description as body, 267 words, `Co-authored-by`, subject 72 chars |
| [76baa3b5434f](https://github.com/react/react/commit/76baa3b5434fad315ece9cfd4d20d7a8d6c34a25) | facebook/react | squash | Title only, no body, subject 71 chars |
| [ec8ddcd7a52f](https://github.com/vercel/next.js/commit/ec8ddcd7a52fb7b3508fa1cf467abc85dea3a0b8) | vercel/next.js | squash | PR description as body, 180 words, PR template comment leaked in, subject 56 chars |
| [4a0609e15a3f](https://github.com/vercel/next.js/commit/4a0609e15a3f9a3bca0dd95daacb0b9358297122) | vercel/next.js | squash | Title only, no body, subject 72 chars |
| [dc73b346c1f3](https://github.com/supabase/supabase/commit/dc73b346c1f37eaae9e529fae81a4307b78fefe6) | supabase/supabase | squash | PR description as body, 114 words, `Co-authored-by`, subject 61 chars |
| [e91fa7a3d634](https://github.com/supabase/supabase/commit/e91fa7a3d634f06975ea08278b76a7bb629fcfc6) | supabase/supabase | squash | Title only, no body, subject 79 chars |
| [2596ac5d391d](https://github.com/oven-sh/bun/commit/2596ac5d391d47804c93a42bdbe615804aa62387) | oven-sh/bun | squash | PR description as body, 6597 words, a full design write-up in the commit, subject 66 chars |
| [a579e352a66f](https://github.com/vitejs/vite/commit/a579e352a66fbdce6a51d4e1f67006ccf4f91343) | vitejs/vite | squash | Title only, no body, subject 50 chars |
| [f7973164a5f0](https://github.com/microsoft/TypeScript/commit/f7973164a5f079a2d8b88d0fdb39347222549124) | microsoft/TypeScript | squash | Title only, no body, subject 69 chars |
| [e023abac912d](https://github.com/withastro/astro/commit/e023abac912d7cb6af2b9fb5107ef5dabc667096) | withastro/astro | squash | PR description as body, 31 words, subject 63 chars |
| [e71c038f3119](https://github.com/withastro/astro/commit/e71c038f31194280b44515bf53cf449a5313baf9) | withastro/astro | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 93 chars |
| [39ede5f06129](https://github.com/withastro/astro/commit/39ede5f061297fdda7af945aa8e576f625ab5152) | withastro/astro | squash | Title only, no body, `Co-authored-by` kept, subject 94 chars |
| [e7b39ebd55c8](https://github.com/denoland/deno/commit/e7b39ebd55c85aaf6a29290c1f5a99e2e21e09dd) | denoland/deno | squash | PR description as body, 43 words, subject 54 chars |
| [b4f08f127652](https://github.com/denoland/deno/commit/b4f08f127652d8442b4d3dbabc277aca3840bc1d) | denoland/deno | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 91 chars |
| [6e9f66f5dca5](https://github.com/denoland/deno/commit/6e9f66f5dca58c594a7c23c5f1107103045be8d2) | denoland/deno | squash | Title only, no body, subject 77 chars |
| [7775f73b7cbe](https://github.com/sveltejs/svelte/commit/7775f73b7cbe32de3bb566f3515113208887e961) | sveltejs/svelte | squash | PR description as body, 218 words, subject 121 chars |
| [628098d2c662](https://github.com/sveltejs/svelte/commit/628098d2c662fabf4c1f3cf6564c6b20964ad9a8) | sveltejs/svelte | squash | Title only, no body, subject 75 chars |
| [c81fbc73a625](https://github.com/grafana/grafana/commit/c81fbc73a625cfb86b889279adf1df54fcd1c66a) | grafana/grafana | squash | PR description as body, 6 words, `Co-authored-by`, subject 50 chars |
| [03106fa29ab5](https://github.com/grafana/grafana/commit/03106fa29ab5c49996b6e9742c41c94486af0db5) | grafana/grafana | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 72 chars |
| [84cd7c5c0521](https://github.com/grafana/grafana/commit/84cd7c5c0521d205d95a4987d6e545996d729975) | grafana/grafana | squash | Title only, no body, subject 48 chars |
| [78d4af57bc6f](https://github.com/electron/electron/commit/78d4af57bc6f9f20701a82efed2e4f25a81dd931) | electron/electron | squash | PR description as body, 23 words, subject 80 chars |
| [894839367d7e](https://github.com/electron/electron/commit/894839367d7ecb1f14e50eb687c24ccaf4f60cbd) | electron/electron | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 64 chars |
| [ef2710fa6c10](https://github.com/electron/electron/commit/ef2710fa6c10fe56365a9949fa783d26ca1499e5) | electron/electron | squash | Title only, no body, `Co-authored-by` kept, subject 46 chars |
| [366f292cd741](https://github.com/microsoft/vscode/commit/366f292cd74138a3b5308e8cf2b43d6ff5b9458d) | microsoft/vscode | squash | PR description as body, 95 words, `Co-authored-by`, subject 54 chars |
| [b4bd9bd3c017](https://github.com/microsoft/vscode/commit/b4bd9bd3c0171f72f54d742b8152db735fd9ce0a) | microsoft/vscode | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 79 chars |
| [f38b6d8928a1](https://github.com/microsoft/vscode/commit/f38b6d8928a171c65a42174e8394270760203fac) | microsoft/vscode | squash | Title only, no body, subject 53 chars |
| [1955eb3ec065](https://github.com/python/cpython/commit/1955eb3ec065bda56ed74c7473f293b8f21a22b2) | python/cpython | squash | PR description as body, 108 words, `Co-authored-by`, subject 88 chars |
| [5f46ac97490d](https://github.com/python/cpython/commit/5f46ac97490ddfd8f7a4d01b9f765cccd00d0e72) | python/cpython | squash | Title only, no body, `Co-authored-by` kept, subject 71 chars |
| [319bd32d5276](https://github.com/llvm/llvm-project/commit/319bd32d5276bb9936db4d8f80b66b507a2aa681) | llvm/llvm-project | squash | PR description as body, 25 words, subject 74 chars |
| [fff83e84f4df](https://github.com/llvm/llvm-project/commit/fff83e84f4df24ea6a5ec11bd9a59d76fcebfe66) | llvm/llvm-project | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 62 chars |
| [635f30899dd0](https://github.com/llvm/llvm-project/commit/635f30899dd0914fa89f0b3dc9a9e548e6d0ceec) | llvm/llvm-project | squash | Title only, no body, subject 78 chars |
| [a47b3c062d55](https://github.com/hashicorp/terraform/commit/a47b3c062d557c8e941e2c5840375ba08814b9cb) | hashicorp/terraform | squash | PR description as body, 23 words, subject 77 chars |
| [63213fa7e50b](https://github.com/hashicorp/terraform/commit/63213fa7e50b3f1a7ef1bf1e6eb16cd5cb78e9e8) | hashicorp/terraform | squash | Body is the branch commit list (GitHub default for 2+ commits), subject 63 chars |
| [b324038d9502](https://github.com/hashicorp/terraform/commit/b324038d95028f61269ca6ef0e013b1712ff42aa) | hashicorp/terraform | squash | Title only, no body, subject 50 chars |
| [fa4ad798f6f6](https://github.com/torvalds/linux/commit/fa4ad798f6f681031775266044ba1b0cf3c670bd) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 73 words, then the shortlog |
| [7f75cd8ccd95](https://github.com/torvalds/linux/commit/7f75cd8ccd9588e969158c5dc92a8cc217663f5b) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 152 words, then the shortlog |
| [12419f306c3c](https://github.com/torvalds/linux/commit/12419f306c3ca34a38064d2b502966fa01650b49) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 148 words, then the shortlog |
| [a41e364995bb](https://github.com/torvalds/linux/commit/a41e364995bbcfa627418a70fe913c35b7510728) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 65 words, then the shortlog |
| [c1c70a8431be](https://github.com/torvalds/linux/commit/c1c70a8431be6df4ada55ed4930ea9bac9baab48) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 66 words, then the shortlog |
| [91fd3a15265f](https://github.com/torvalds/linux/commit/91fd3a15265f095a9632d8f9d9732b37363ed121) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 50 words, then the shortlog |
| [d164c7d754f0](https://github.com/torvalds/linux/commit/d164c7d754f0e1f020298366ea92430e62476089) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 47 words, then the shortlog |
| [fd7e9dc9997a](https://github.com/torvalds/linux/commit/fd7e9dc9997a3e792e93f8b6795cba1de0f52726) | torvalds/linux | maintainer merge | "Pull X from Y:" then a written summary of 303 words, then the shortlog |
| [e56bc05d213b](https://github.com/git/git/commit/e56bc05d213b9632bf4b33971a0d814c4503cad7) | git/git | maintainer merge | Topic merge with a 34-word release-note paragraph above the shortlog |
| [d17a7db82262](https://github.com/git/git/commit/d17a7db82262f77c0d4e9b8d5a56cf8d71d6eb93) | git/git | maintainer merge | Topic merge with a 49-word release-note paragraph above the shortlog |
| [06ec7076633f](https://github.com/git/git/commit/06ec7076633f2d7c0429437f093aa2ae2f71405e) | git/git | maintainer merge | Topic merge with a 28-word release-note paragraph above the shortlog |
| [51ab9f435c0e](https://github.com/git/git/commit/51ab9f435c0e3264b3ce2dd9fc8e48bde4584716) | git/git | maintainer merge | Topic merge with a 18-word release-note paragraph above the shortlog |
| [95a149082fd7](https://github.com/git/git/commit/95a149082fd76daa86d8f63fac4fdb3e420c38dd) | git/git | maintainer merge | Topic merge with a 26-word release-note paragraph above the shortlog |
| [a9d6fefd3650](https://github.com/git/git/commit/a9d6fefd3650ec568a420264a233178d21fda95d) | git/git | maintainer merge | Topic merge with a 19-word release-note paragraph above the shortlog |
| [268fe3e00726](https://github.com/git/git/commit/268fe3e00726dd681d8339de4b0e23bc5e5e17f8) | git/git | maintainer merge | Short note (10 words) still precedes the shortlog |
| [742810498ef0](https://github.com/git/git/commit/742810498ef0fd26ea9b7ffcf7d45370be98bc19) | git/git | maintainer merge | Short note (14 words) still precedes the shortlog |
| [34f06850c16c](https://github.com/git/git/commit/34f06850c16c7f7ac822b1adc71354f11b0f2ca3) | git/git `maint` | release-branch merge | Merge on `maint`, a one-word note above the shortlog |
| [3bbf43483e39](https://github.com/git/git/commit/3bbf43483e3954291b9fb4caa228eedb9dd528c2) | git/git `maint` | release-branch merge | Merge on `maint`, 25 written words |
| [2a41443dc8b8](https://github.com/git/git/commit/2a41443dc8b82e307228a04d3d2c1af86921ff9b) | git/git `maint` | release-branch merge | Merge on `maint`, a two-word note above the shortlog |
| [49c3c7fe09ac](https://github.com/bitcoin/bitcoin/commit/49c3c7fe09ac311ea9ce37599a0df3e4065657f9) | bitcoin/bitcoin | maintainer-script merge | Commit list, copied PR description (230 words), ACKs, `Tree-SHA512` trailer |
| [c6dcda33b0f0](https://github.com/bitcoin/bitcoin/commit/c6dcda33b0f0254bd2f07e1d5584ffcc3da717fa) | bitcoin/bitcoin | maintainer-script merge | Commit list, copied PR description (89 words), ACKs, `Tree-SHA512` trailer |
| [5bf3bc5e2634](https://github.com/bitcoin/bitcoin/commit/5bf3bc5e263407a252c14a17afe04fc3bf24a889) | bitcoin/bitcoin | maintainer-script merge | Commit list, copied PR description (125 words), ACKs, `Tree-SHA512` trailer |
| [411c971e75ba](https://github.com/bitcoin/bitcoin/commit/411c971e75ba8ef16855a41dfe2d31d574ebf507) | bitcoin/bitcoin | maintainer-script merge | Commit list, copied PR description (177 words), ACKs, `Tree-SHA512` trailer |
| [f5cedb83a788](https://github.com/rust-lang/rust/commit/f5cedb83a788ea9581097abc36a2a8503a7f541c) | rust-lang/rust | bors merge | `Auto merge of #N - branch, r=reviewer`, PR body copied (13 words) |
| [cd6695728a91](https://github.com/rust-lang/rust/commit/cd6695728a916cfd91828a4116b296c0f0ca66cc) | rust-lang/rust | bors merge | `Auto merge of #N - branch, r=reviewer`, no PR body, so only the title lands |
| [93583629f742](https://github.com/rust-lang/rust/commit/93583629f7429a9ab9fb807408e66eed81f3e5b1) | rust-lang/rust | bors merge | `Auto merge of #N - branch, r=reviewer`, PR body copied (11 words) |
| [e30d778f3029](https://github.com/rust-lang/rust/commit/e30d778f3029b78bb9c2e0dbe11a3b7389b652c4) | rust-lang/rust | bors merge | `Auto merge of #N - branch, r=reviewer`, no PR body, so only the title lands |
| [ab23614146c1](https://github.com/rust-lang/rust/commit/ab23614146c143013b5a38dffadf68d07ead0c1a) | rust-lang/rust | bors rollup merge | Per-PR rollup merge, PR title then 18 words of PR body |
| [a93a298f126e](https://github.com/rust-lang/rust/commit/a93a298f126ed453ce1a45ce1722330cb63bd77e) | rust-lang/rust | bors rollup merge | Per-PR rollup merge, PR title then 69 words of PR body |
| [e971d78bcfc2](https://github.com/rust-lang/rust/commit/e971d78bcfc2e12858d4acb0a7620ed2b409648f) | rust-lang/rust | bors rollup merge | Per-PR rollup merge, PR title then 60 words of PR body |
| [2014c63bb093](https://github.com/rust-lang/rust/commit/2014c63bb0931bd2c48e9405d9f13d367bd1de31) | rust-lang/rust | bors rollup merge | Per-PR rollup merge, PR title then 13 words of PR body |
| [58cf8f9c35b3](https://github.com/rust-lang/rust/commit/58cf8f9c35b355199727627d07ae34a4e2846d67) | rust-lang/rust `stable` | release merge | `[stable]` release PR, bullets naming each backport and the issue it fixes |
| [b940084d7eb6](https://github.com/rust-lang/rust/commit/b940084d7eb6a299eb4bfeb8e34901bc051e7ac4) | rust-lang/rust `stable` | release merge | `[stable]` release PR, bullets naming each backport and the issue it fixes |
| [dfb0accb7f50](https://github.com/rust-lang/rust/commit/dfb0accb7f508ae8be965d8629557221c889dd98) | rust-lang/rust `stable` | release merge | `[stable]` release PR, bullets naming each backport and the issue it fixes |
| [6b5d04cd0bf7](https://github.com/kubernetes/kubernetes/commit/6b5d04cd0bf7e9aa953dc4a13028878a8a48bd6a) | kubernetes/kubernetes | merge button | Default `Merge pull request #N from fork/branch` plus PR title, no why |
| [59332646f342](https://github.com/kubernetes/kubernetes/commit/59332646f342a3e2c485e4f9e4b776eb2f79042f) | kubernetes/kubernetes | merge button | Default `Merge pull request #N from fork/branch` plus PR title, no why |
| [ac8d3ed1cdf6](https://github.com/kubernetes/kubernetes/commit/ac8d3ed1cdf6c8bb11e9d3eda8acf2a9f03915b8) | kubernetes/kubernetes | merge button | Default `Merge pull request #N from fork/branch` plus PR title, no why |
| [613eee349499](https://github.com/kubernetes/kubernetes/commit/613eee349499fa86a53ab9c399f43ebaf6681e37) | kubernetes/kubernetes | merge button | Default `Merge pull request #N from fork/branch` plus PR title, no why |
| [91c32c2bbd92](https://github.com/kubernetes/kubernetes/commit/91c32c2bbd92976fe0d36f3a3e7b36db8a39c640) | kubernetes/kubernetes `release-1.37` | release-branch backport merge | `Automated cherry pick of #N` names the source PR |
| [62235c6fe254](https://github.com/kubernetes/kubernetes/commit/62235c6fe2548e09ee5d2f3ca83388653eba1bb6) | kubernetes/kubernetes `release-1.37` | release-branch backport merge | `Automated cherry pick of #N` names the source PR |
| [8384b38f1506](https://github.com/rails/rails/commit/8384b38f150663b2fd510926f38a2958bd5ac1db) | rails/rails | merge button | Default merge message, PR title only |
| [315c0b42af2e](https://github.com/rails/rails/commit/315c0b42af2ebf4c220b17b10ed67360ebfc11e9) | rails/rails | merge button | Default merge message, PR title only |
| [22898dbd8277](https://github.com/rails/rails/commit/22898dbd8277aa5e762f8f7fcb9842a0683cec81) | rails/rails | merge button | Default merge message, PR title only |
| [3ccfa1d07143](https://github.com/Homebrew/brew/commit/3ccfa1d071435faf83990f0788d18920ab90d817) | Homebrew/brew | merge button | Default merge message, PR title only |
| [6dce86e2d2d1](https://github.com/Homebrew/brew/commit/6dce86e2d2d12b94f7ebebb85d8e4aa516ebfd36) | Homebrew/brew | merge button | Default merge message, PR title only |
| [11820a2e4e16](https://github.com/microsoft/vscode/commit/11820a2e4e1615137d363f44604548c282f0841d) | microsoft/vscode | merge commit, title and description setting | PR title as subject, PR body as message, here only the PR template comment |
| [a9afb7c8531a](https://github.com/microsoft/vscode/commit/a9afb7c8531af5da786ef291bec02926c9189ee6) | microsoft/vscode | merge commit, title and description setting | PR title as subject, PR body as message (415 words) |
| [f503a65d3a07](https://github.com/pi-hole/pi-hole/commit/f503a65d3a07cb71fd931389f1d3babf718249aa) | pi-hole/pi-hole `master` | promotion merge | `development` into `master`, subject is the version only. Release notes stayed in the PR body. |
| [91ffaddc1f5a](https://github.com/pi-hole/pi-hole/commit/91ffaddc1f5a1aff113014cb4452705a49c38ebc) | pi-hole/pi-hole `development` | sync merge | `master` back into `development` after a release, opened by an action, no body |
| [78075d20262a](https://github.com/pi-hole/pi-hole/commit/78075d20262a0d2168f23135064c0e338113acc2) | pi-hole/pi-hole `development` | merge commit, PR title setting | Two parents, subject `Title (#N)`, empty body |
| [4b33f6e45091](https://github.com/pi-hole/pi-hole/commit/4b33f6e45091174ec8d1b5a7f8e36ef092204ac8) | pi-hole/pi-hole `development` | merge commit, PR title setting | Two parents, subject `Title (#N)`, empty body |
| [ba255ec32e24](https://github.com/pi-hole/pi-hole/commit/ba255ec32e24838642e0aafcc26fc05ed21d6fd7) | pi-hole/pi-hole `master` | security advisory merge | `Merge commit from fork`, one line of advisory title |
| [29c8b13f4bba](https://github.com/pi-hole/FTL/commit/29c8b13f4bba0c4f4f47598e45a65cbf1cedac88) | pi-hole/FTL `master` | promotion merge | Release branch into `master`. PR #3252 body holds the real release summary. |
| [74cf5a49c63e](https://github.com/home-assistant/core/commit/74cf5a49c63ed8d4d87717844bf14f79c28c9cea) | home-assistant/core `master` | promotion merge | `rc` into `master`, subject is the version and PR number, empty PR body |
| [05b9a9d2c7c0](https://github.com/Homebrew/brew/commit/05b9a9d2c7c07ac244abe297cab712baff2800d3) | Homebrew/brew | back merge | `Merge branch 'main' into topic` with no reason |
| [fedfa225fd6f](https://github.com/torvalds/linux/commit/fedfa225fd6f3802885060591faf5fc05777ec85) | torvalds/linux | revert of merge | Says why: the change moves to another tree |
| [96f03c8cb29f](https://github.com/torvalds/linux/commit/96f03c8cb29f2ec5ffe8e24fbec2c64f3c3bf4e5) | torvalds/linux | revert of merge | Gives a reason in the body |
| [112e43e9fd3b](https://github.com/torvalds/linux/commit/112e43e9fd3b999513b1914e2bf523ae509f4c7d) | torvalds/linux | revert of merge | Explains the breakage before the revert |
| [8766d61a1d33](https://github.com/torvalds/linux/commit/8766d61a1d33cb5f15bfdd6ce9832bbe1fc649c2) | torvalds/linux | revert of merge | Lists every reverted commit by 12-char SHA and subject |
| [49a594ab7dce](https://github.com/kubernetes/kubernetes/commit/49a594ab7dceb0e63b5f02913a37a8e7e5d487df) | kubernetes/kubernetes | revert of merge | Generated message only, no reason |
| [17523c000eef](https://github.com/microsoft/vscode/commit/17523c000eef5c2197a369b1dda37574b9c63217) | microsoft/vscode | revert of merge | Squash-style revert of several merges with a reason |
| [c0dfb08af912](https://github.com/microsoft/vscode/commit/c0dfb08af9123a45170680a652b276b7f9063f45) | microsoft/vscode | revert of merge | Generated message only, no reason |
| [0f8e75abebff](https://github.com/git/git/commit/0f8e75abebff0877cae681a3d5ff31ac47f54220) | git/git | revert of merge | Gives the reason for backing out a topic |
| [a3d1f391d357](https://github.com/git/git/commit/a3d1f391d35762162356201028fb73774a6c4a8b) | git/git | revert of merge | States the regressions and when the topic restarts |
| [c6da34a610e5](https://github.com/git/git/commit/c6da34a610e58f7e58042b5ed24a19bd2c18e928) | git/git | revert of merge | Generated message only, no reason |
| [ceeb0e0cc8fa](https://github.com/rust-lang/rust/commit/ceeb0e0cc8fa104893241f63ad021f6e3423e981) | rust-lang/rust | revert of merge | Revert of a bors rollup merge, no reason |
| [261cec846e57](https://github.com/rails/rails/commit/261cec846e57eb181cf23db4a815007badcd3182) | rails/rails | revert of merge | Generated message only, no reason |
| [4a753c2f79a9](https://github.com/rails/rails/commit/4a753c2f79a9c41ec3ab5551724599193da180e5) | rails/rails | revert of merge | Short reason after the generated line |
| [eea3d5adcffc](https://github.com/rails/rails/commit/eea3d5adcffca1c9f403b852414907b75ada26e8) | rails/rails | revert of merge | Custom subject names the regression, reverts two merges in one commit |
| [#6719](https://github.com/pi-hole/pi-hole/pull/6719) | pi-hole/pi-hole | promotion PR | Generated "What's Changed" list of PRs with authors, kept only in the PR |
| [#6724](https://github.com/pi-hole/pi-hole/pull/6724) | pi-hole/pi-hole | sync PR | `master` into `development`, body "Created by Github action" |
| [#3252](https://github.com/pi-hole/FTL/pull/3252) | pi-hole/FTL | promotion PR | Release summary: scope, what was left out, improvements, fixes of note |
