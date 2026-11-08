---
name: commit
description: Writes git commits to the standard of the best-kept project histories - one logical change, a subject that stands alone, a body that says why, and the trailers the Git law needs. Use whenever you stage, commit, amend, split, squash, rebase or revert, or write the text that lands on a base branch.
---

# Commit

Write for the person debugging this line in three years with no access to this
session. The diff shows what changed. The message says why it had to.

## 1. Cut one logical change

- One change per commit. If the subject needs "and", split it.
- Keep a refactor apart from the behavior change it enables.
- Keep a test in the same commit as the code it tests.
- Every commit builds and passes on its own, so `git bisect` works.
- Stage by path or by hunk, never `git add -A` or `git add .`.
- Read `git diff --staged` first. Remove secrets, debug output, build output and
  unrelated reformatting.
- Let hooks run. When one fails, fix the cause. Never pass `--no-verify`.

## 2. Copy the repo's style

```sh
git log --no-merges -15 --format=%s -- <changed paths>
```

Match what you see: `area: change`, `type(scope): change`, or a plain sentence.
Bring in no format of your own. Conventional Commits appears in 0 to 6 percent of
recent commits across the eight top projects in `references/sources.md`.

## 3. Write the subject

- Use the imperative. It finishes "If applied, this commit will ...". `Fix`, not
  `Fixed` or `Fixes`.
- Name the effect, not the file: `Stop retrying after a 401`, not `Update client.ts`.
- Aim for 50 characters. 72 is the limit.
- End without a period, unless the repo's history uses one.
- Never `fix`, `update`, `changes`, `misc`, `wip` or `address review` alone.

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

## 5. End with trailers

One block at the very end, with no blank lines inside it. Git reads only the last
block.

- `Task:`, `Agent:` and `Agent-Session:` on every commit (Git law), then the
  attribution line your harness gives you.
- `Fixes: <12-char SHA> ("subject")` when this repairs a specific commit.
- `Fixes #123` to close an issue, only when this really fixes it.
- `Reported-by:` and `Co-authored-by:` to credit a person.
- Never `Signed-off-by:`. It certifies the DCO, and only a human can do that.

## 6. Get the why onto dev

PRs squash through `agent-git land`, so the branch commits disappear. The PR title
becomes the subject, and `--message` becomes the body. Write the title as section 3
says, and pass the problem, fix and limits as `--message`. Skip that and the why
never reaches history.

## 7. Change history safely

- On your own unreviewed branch, tidy freely: `git commit --fixup <sha>`, then
  `git rebase --autosquash <base>`.
- Squash fixes to earlier commits. Keep independent layers apart.
- On a branch someone else created, add commits and never rewrite.
- On your own pushed branch, use `--force-with-lease` against the head you last saw.
- Never rewrite `prod`, `main` or `dev`. Undo with `git revert <sha>`, and say why
  in the body.

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
