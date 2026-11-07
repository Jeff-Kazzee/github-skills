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
