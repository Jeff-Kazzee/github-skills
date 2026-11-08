# Sources

Read on 2026-11-06. Jeff's policy comes from his instructions of the same day: High
needs human and AI review, Medium seeks human eyes, Low may use AI review, and he
approves every merge at every level.

| Source | What this skill takes |
|---|---|
| [DORA, streamlining change approval](https://dora.dev/capabilities/streamlining-change-approval/) | External approval showed no link to lower change failure, and it slows delivery. Peer review plus automation works better, with extra scrutiny for changes flagged high risk. |
| [Swift release PRs](https://github.com/swiftlang/swift/pull/81613) | Risk as a level and a reason, beside Testing. |
| [Firefox uplift rules](https://wiki.mozilla.org/Release_Management/Uplift_rules) | Low, Medium or High, followed by why, and CSS and build changes as the Low examples. |
| [Rust rollups](https://github.com/rust-lang/rust-forge/blob/master/src/release/rollups.md) | Four tiers set by the reviewer, not the author. CI config counts as risky, docs as safe. Raise a tier on any doubt. |
| [Google, small CLs](https://github.com/google/eng-practices/blob/master/review/developer/small-cls.md) | 100 lines is usually reasonable and 1000 is usually too large. |
| [SLSA source requirements](https://slsa.dev/spec/v1.2/source-requirements) | Approval attaches to the final revision, so any new commit needs review. |
| [GitHub, required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews) | Authors cannot approve their own PRs. Every agent posts as Jeff, so GitHub approval is unavailable. |
| [gstack](https://github.com/garrytan/gstack) `review`, `land-and-deploy`, `ship` | Review the merged result, cite proof for every claim, revert by the shape of the landed commit, and a rollback ends only when it is verified. Its gate-integrity catalog: a deleted test or loosened check reads green. |
| [Pocock `pr`](https://github.com/mattpocock/skills) | One-way and two-way doors |
| [Linux coding assistants](https://github.com/torvalds/linux/blob/master/Documentation/process/coding-assistants.rst) | State what could not be built or tested. |

## Limits of this gate

- **It is imperfect by design.** In [Meta's Diff Risk Score study](https://arxiv.org/abs/2410.06351),
  the baseline model caught 27.9 percent of severe incidents while gating the riskiest
  10 percent of diffs, and 84.6 percent while gating half. Expect some bad changes to
  pass, and keep rollback cheap.
- **Agent review is not two-person review.** SLSA Source Level 4 needs two trusted
  persons. An agent cannot supply the human review.
- **The reviewer shares a model's blind spots.** A verifier session differs from the
  builder session, but may be the same model. Medium needs a second model family for
  this reason.
- **Back-test.** On 181 merged PRs from five of Jeff's repos on 2026-11-06, an earlier
  version of the path rules rated 57 percent High. None of those PRs was a revert, so
  this shows review load, not how many bad changes the gate catches. The current rules
  also read diff content, so expect that share to rise.
- **Paths and patterns are proxies.** The script reads names and a short list of risky
  patterns in changed lines, so it misses risk it has no pattern for. Step 2 and
  `.github/risk-paths` cover some of that.
- **A named workflow can be weak.** The gate proves it passed, not that it tests much.

## Why CI must be positive proof

PRs 6 and 7 in this repo landed with `ci: green` receipts on 2026-11-05 while no CI
had run. GitHub Actions failed to start on billing, the only visible check was a
skipped CodeRabbit run, and `agent-git land` counted a skip as a pass.
