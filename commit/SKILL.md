---
name: commit
description: Writes git commits and merge messages like the best-kept histories - one logical change, a subject that stands alone, a body that says why, and the Git law's trailers. Use whenever you stage, commit, amend, squash, rebase, revert, merge, promote or land a PR. Not for a PR body, use `pr-template`.
---

# Commit

Write for the person debugging this line in three years with no access to this
session. The diff shows what changed. The message says why it had to.

## 1. Cut one logical change

- One change per commit. If the subject needs "and", split it.
- Keep a refactor apart from the behavior change it enables.
- Keep a test in the same commit as the code it tests.
- Every commit builds and passes on its own, so `git bisect` works.
- Order a series by dependency: schema, core logic, wiring, UI.
- Stage by path or by hunk, never `git add -A` or `git add .`.
- Read `git diff --staged` first. Remove secrets, debug output, build output and
  unrelated reformatting.
- Let hooks run. When one fails, fix the cause. Never pass `--no-verify`.

Done when `git diff --staged` shows only the one change, and the hooks pass.

## 2. Copy the repo's style

```sh
git log --no-merges -15 --format=%s -- <changed paths>
```

Match what you see: `area: change`, `type(scope): change`, or a plain sentence.
Bring in no format of your own. Conventional Commits appears in 0 to 6 percent of
recent commits across the eight top projects in `references/sources.md`.

Done when your subject matches the pattern of the last 15 subjects.

## 3. Write the subject

- Use the imperative. It finishes "If applied, this commit will ...". `Fix`, not
  `Fixed` or `Fixes`.
- Name the effect, not the file: `Stop retrying after a 401`, not `Update client.ts`.
- Aim for 50 characters. 72 is the limit.
- End without a period, unless the repo's history uses one.
- Never `fix`, `update`, `changes`, `misc`, `wip` or `address review` alone.

Done when the subject finishes "If applied, this commit will ...".

## 4. Write the body

Skip it only when the subject says everything. Otherwise wrap at 72 and cover:

1. **The problem.** What is wrong now, who hits it, and the visible effect.
2. **The fix.** Why this approach solves it.
3. **The alternative.** What you rejected and why, when there was a real choice.
4. **The limits.** What you left alone, what is untested, the cost you accepted.
   Say `No behavior change` when that is true.

Back a performance claim with numbers, and name its cost. Cite a commit by its
12-character SHA and quoted subject. Summarize an issue or thread before linking
it, so the message works with no network.

Done when a stranger can learn the problem, fix and limits from the body alone.

## 5. End with trailers

One block at the very end, with no blank lines inside it. Git reads only the last
block.

- `Task:`, `Agent:` and `Agent-Session:` on every commit (Git law), then the
  attribution line your harness gives you.
- A merge or squash message adds `Landed-by:` and `Verified-by:` to the same block
  (Git law). `agent-git land` and `promote` write the whole block.
- `Fixes: <12-char SHA> ("subject")` when this repairs a specific commit.
- `Fixes #123` to close an issue, only when this really fixes it.
- `Reported-by:` and `Co-authored-by:` to credit a person.
- Never `Signed-off-by:`. It certifies the DCO, and only a human can do that.

Done when `git interpret-trailers --parse` on the message prints every trailer.

## 6. Write the merge message

Readers of the base branch see the merge or squash message, not the branch commits.
Never accept GitHub's prefilled text. It is the PR title alone, the commit list, or the
PR body with its template comments. 282 of 635 sampled squash commits landed with no
prose at all.

- Task PR into dev: `agent-git land` makes the subject `<PR title> (#N)` and appends
  the trailers. Write the PR title as section 3 says. Pass the problem, fix and limits
  as `--message`, with no trailer lines in it.
- Promotion to prod, sync back into dev, or a revert: fill the matching template in
  [references/merge-messages.md](references/merge-messages.md).
- A merge commit in someone else's repo: say why the merge happens. For a pull of many
  changes, the why is a summary of what it brings.

Done when `git log --first-parent -1` on the base branch explains the change without
the PR.

## 7. Change history safely

- On your own branch, before you push it, tidy freely: `git commit --fixup <sha>`,
  then `git rebase --autosquash <base>`.
- Once it is pushed or in review, rewrite only when the user asks or agrees to the
  plan.
- Save `git rev-parse HEAD^{tree}` before a rewrite, and confirm it matches after,
  unless changing the code was the point.
- Squash fixes to earlier commits. Keep independent layers apart.
- On a branch someone else created, add commits and never rewrite.
- With that agreement, force-push only a branch you created, using
  `--force-with-lease` against the head you last saw.
- Never rewrite `prod`, `main` or `dev`. Undo with `git revert <sha>`, adding `-m 1`
  for a merge commit, and fill the revert template in
  [references/merge-messages.md](references/merge-messages.md).

Done when `git diff <saved tree>` is empty or shows only the change you meant.

## Example

```text
Stop counting skipped checks as passing CI

land treated a check in the skipping bucket as a pass. When Actions
could not start, the only check left was a skipped review bot, so
land recorded ci: green on PRs that no CI ever ran.

Count only a completed GitHub Actions success on the exact head.
A list of known bots was the smaller change, but it fails open on
the next new bot.

Old receipts are unchanged and still say green.

Task: 221
Agent: Engineer
Agent-Session: claude-code:<session id>
```

Done when `git log -1` tells the whole story to someone who never saw the diff.
