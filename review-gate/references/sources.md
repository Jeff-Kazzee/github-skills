# Sources

Read on 2026-11-06. Jeff's policy for the three levels comes from his instruction of
the same day: High needs human and AI review, Medium gets human eyes without a new
blocking gate, and Low may use AI review alone.

| Source | What this skill takes |
|---|---|
| [Ship / Show / Ask](https://martinfowler.com/articles/ship-show-ask.html) | The three lanes. Show merges first and invites a look after. |
| [DORA, streamlining change approval](https://dora.dev/capabilities/streamlining-change-approval/) | External approval showed no link to lower change failure, and it slows delivery. Peer review plus automation works better, with extra scrutiny for changes flagged high risk. |
| [Swift release PRs](https://github.com/swiftlang/swift/pull/81613) | Risk as a level and a reason, beside Testing. |
| [Firefox uplift rules](https://wiki.mozilla.org/Release_Management/Uplift_rules) | Low, Medium or High, followed by why, and CSS and build changes as the Low examples. |
| [Rust rollups](https://github.com/rust-lang/rust-forge/blob/master/src/release/rollups.md) | Four tiers set by the reviewer, not the author. CI config counts as risky, docs as safe. Raise a tier on any doubt. |
| [Google, small CLs](https://github.com/google/eng-practices/blob/master/review/developer/small-cls.md) | 100 lines is usually reasonable and 1000 is usually too large. |
| [Renovate automerge](https://github.com/renovatebot/renovate/blob/main/docs/usage/key-concepts/automerge.md) | Agents can merge low-risk changes when required tests gate them. |
| [SLSA source requirements](https://slsa.dev/spec/v1.2/source-requirements) | Approval attaches to the final revision, so any new commit needs review. |
| [GitHub, required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews) | Authors cannot approve their own PRs. Every agent posts as Jeff, so GitHub approval is unavailable. |
| [Linux coding assistants](https://github.com/torvalds/linux/blob/master/Documentation/process/coding-assistants.rst) | State what could not be built or tested. |

## Limits of this gate

- **It is imperfect by design.** In [Meta's Diff Risk Score study](https://arxiv.org/abs/2410.06351),
  the baseline model caught 27.9 percent of severe incidents while gating the riskiest
  10 percent of diffs, and 84.6 percent while gating half. Expect some bad changes to
  pass, and keep rollback cheap.
- **Agent review is not two-person review.** SLSA Source Level 4 needs two trusted
  persons. Agent lanes do not meet it, so repos that need that level stay on `ask`.
- **The reviewer shares a model's blind spots.** A verifier session differs from the
  builder session, but may be the same model. Medium needs a second model family for
  this reason.
- **Back-test.** On 181 merged PRs from five of Jeff's repos on 2026-11-06, the diff
  rules alone sent 57 percent to `ask`, 41 percent to `show` and 2 percent to `ship`.
  That run predates the wider agent-rules trigger, and the repos must each name a CI
  workflow before they can use an agent lane. None of
  those PRs was a revert, so this shows the load on Jeff, not how many bad changes the
  gate catches.
- **A path is a proxy.** The script reads names, not contents, so it misses risky code
  in plainly named files, such as a `postinstall` script added to `package.json`. Step 2
  and `.github/risk-paths` cover some of that.
- **A named workflow can be weak.** The gate proves it passed, not that it tests much.

## Why CI must be positive proof

PRs 6 and 7 in this repo landed with `ci: green` receipts on 2026-11-05 while no CI
had run. GitHub Actions failed to start on billing, the only visible check was a
skipped CodeRabbit run, and `agent-git land` counted a skip as a pass.
