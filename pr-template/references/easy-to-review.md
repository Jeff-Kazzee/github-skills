# Making a PR easy to review

Read this when asked to make a PR easy to review, tidy it, clean up its commits or annotate its diff. The goal is that a reviewer quickly sees the intent, the important files and the risk, with no change in behavior.

1. Resolve the PR from the URL or the current branch.
2. Read its commits, diff size, changed paths, generated files and body.
3. Name the problems: noisy commits, a stale body, unrelated changes, mechanical and logic changes mixed together, missing tests, no clear place to start reading.
4. Fix what you can in the body first. Separate core files from generated or mechanical ones in `What Changed`. Call out risky behavior changes, migration order and rollout in `Risk`.
5. If notes cannot make the PR reviewable, recommend splitting it.

Never hide a behavior change inside cleanup.

## Rewriting history

Rewrite commits only when the user asks or agrees to your plan, and force-push only a branch you created, with `--force-with-lease`.

Group commits in dependency order: schema or generated API, core logic, wiring, UI, tests.

Record the tree first, and confirm it is the same afterward:

```sh
gh pr view <n> --json headRefName,baseRefName,commits
git fetch origin <headRefName> <baseRefName>
ORIGINAL_TREE=$(git rev-parse origin/<headRefName>^{tree})
# rewrite, then
git rev-parse HEAD^{tree}
git diff origin/<headRefName> --stat
```

Do not push if the tree changed by accident. Do not bypass hooks unless the user asks.
