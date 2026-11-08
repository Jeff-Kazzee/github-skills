# When a PR has review findings

A finding is any review comment that claims something is wrong: an inline thread, a
bot finding, a review summary item, or a failed check. This page says what to do with
one finding, with many findings, and with findings that arrive after a merge.

The rule (Jeff, 2026-11-07): never merge with an open finding, at any severity. A P2,
a nit and a bot finding block a merge the same way a P1 does. Severity sets the order
of work, not whether the work happens.

## 1. Stop

When the first finding arrives, nothing merges and nothing promotes until section 6 is
done. If the PR already merged, go to section 7 instead.

Done when no merge or promotion of this work is pending.

## 2. Collect every finding

Pull every thread and comment on the head, not only the newest:

```sh
gh api repos/<owner>/<repo>/pulls/<n>/comments --paginate
gh api repos/<owner>/<repo>/pulls/<n>/reviews --paginate
gh api repos/<owner>/<repo>/issues/<n>/comments --paginate
```

Number them F1 to Fn in one list: id, severity, file and line, the claim in one line,
and the thread URL. Merge duplicates (the same claim on the same code) into one entry
that keeps every thread URL. Bots often repost the same finding on each new head.

Done when every open thread maps to exactly one numbered finding.

## 3. Reproduce each finding

A finding is a lead, not a fact. For each one:

- Write a test that fails on the current head for the reason the finding gives. Run it
  and keep the failing output.
- If it does not fail, check that it covers the conditions the finding names: the
  platform, the service, the input shape. Only then does the finding not hold. Keep the
  command and its output. That evidence is the reply.
- A passing test that skips those conditions, such as a mock that leaves out the
  service, is inconclusive. The finding stays open until evidence that covers them rules
  it out, or a fix addresses it.
- Look for the same bug in sibling code. A wrong pattern in one checker is usually
  copied into the others. Add those as new findings with their own tests.

Done when every finding is marked reproduced, with a failing test, or not reproduced,
with the command that shows it.

## 4. Fix them on one branch

- Work on one fix branch, named `task/<id>-review-findings` or
  `fix/review-findings-<date>`. Start it where the code under review lives:
  - Open PR: branch from the PR head (`origin/<head branch>`), because code the PR
    adds exists only there. The fixes must reach that head before sections 5 and 6.
    When the head is a task branch you created, push the fixes to it with
    `git push origin HEAD:<head branch>`. That push is a fast-forward. If it is
    rejected because the head moved, rebase onto the new head and run the tests again.
    When the head is `dev`, `prod`, `main` or a branch you did not create, never push to
    it. Open the fix PR into the head branch. The open PR gets the fixes when that fix
    PR merges.
  - Open PR from a fork: `origin/<head branch>` is not the head. Fetch it with
    `git fetch origin pull/<n>/head`, and push to the fork's remote, not to `origin`.
  - Merged PR: branch from the branch the repo uses for work, which is `dev` in a repo
    with `dev` and `prod`, and open the fix PR into it as section 7 says. A merged
    promotion into `prod` gets its fix PR into `dev`, never into `prod`.
- Fix each reproduced finding with the smallest change that makes its test pass. Keep
  each test in the same commit as its fix.
- Many findings across several files can go to parallel workers, one worker per group
  of files and never two writers on one file. Workers edit and test. One person
  commits.
- Run every suite on every platform CI tests (for example Linux and Windows), not only
  on the machine you built on. Report real pass and fail counts per platform.

Done when every reproduced finding has a fix, its test passes, and the full suite
passes on every platform CI tests.

## 5. Answer every thread

Reply in each thread with [reply-templates.md](reply-templates.md):

- Fixed: the commit SHA and the test name that proves it.
- Not reproduced: the command and output, and a question asking the reviewer whether
  you misread the claim.
- Deferred: only with Jeff's yes, and only with an issue link in the reply. A deferred
  finding counts as open until Jeff approves the deferral.

Resolve a thread when its fix is on the PR head and its test passes there, or when Jeff
has approved its deferral and the issue is filed. Resolve a not-reproduced thread once
its evidence is posted, you have told Jeff what the finding claimed and why it does not
hold, and he says yes (Jeff, 2026-11-08). A reviewer can be wrong, and a merge must not
wait forever on one, so this resolved thread does not block section 6. If the reviewer
answers with new evidence, start again at section 2. Post replies only after Jeff approves the text, as step 7 of the skill says.

A finding with no thread, such as one in a review summary, gets one PR comment that
lists each such finding with its outcome and fix commit. GitHub cannot resolve it, so
that comment is its record.

Done when every finding has a reply or a line in that comment, and every thread is
resolved.

## 6. Get a fresh review, then merge

Push, then ask for a new review of the exact head. A new finding on the new head starts
again at section 2. Merge only when all of these hold on the same head:

- zero unresolved threads, read with a paginated query right before the merge,
- every finding without a thread recorded in the comment from section 5,
- a review of that head with no new findings,
- CI green on that head,
- Jeff's approval of that head.

Done when the merge commit SHA is reported with the head it merged.

## 7. Findings after a merge

The default is to fix forward. Open the fix PR into the branch the repo's workflow
uses for work, which is `dev` in a repo with `dev` and `prod`, get it reviewed and
merged, then promote it to the release branch where the repo has one. In a repo with
only `main`, the fix PR goes into `main`. Nothing is deleted from the release branch.
A finding in a checker's edge case is never a reason to revert.

When a credential is published, revoke or rotate it first, before any revert or fix. A
revert leaves the commit in history, so anyone who copied the credential can still use
it. Cleaning history is a separate decision for Jeff.

Revert only when the release branch is causing harm now and a fix will take longer
than a day:

- a secret, token or personal data is published, after the credential is revoked,
- installing or running the code damages a user's files or data,
- the main path is broken for a material share of users, such as everyone on one
  platform, and a revert restores it.

A revert is one commit and one PR. For a merge commit:

```sh
git switch -c revert/<merge-sha> origin/<branch the merge landed on>
git revert -m 1 <merge sha>
```

For a squash merge, `git revert <squash sha>`. For a PR that landed by rebase, revert
every commit it landed, newest to oldest, in one commit. The range command below uses
that order. Reverting the oldest first can conflict when later commits change the same
lines:

```sh
git revert --no-commit <first landed sha>^..<last landed sha>
git commit
```

Write the message from the revert template in the `commit` skill, push, and open a PR
that waits for Jeff like any other. List in its body every file the revert deletes.
Jeff's approval of that PR covers those deletions.

Never revert any other way:

- never delete files one at a time, as a series of commits, or through the contents
  API,
- never rebuild an old state by hand,
- never delete a file Jeff has not named, outside a revert PR that lists it.

A PR that deletes more than five files needs Jeff to approve the list of files by name.

Done when the fix or the single revert commit is merged with Jeff's approval and the
promotion is reported with its SHA.

## Several PRs with findings

When findings span several PRs, collect them into one list (section 2) and fix them in
one fix PR per repository and target branch. Each fix PR body has a table with one row per finding: id, source PR and thread,
reproduced or not, fix commit, test name. Reply in every source thread with the fix PR
link and commit, even when the source PR is closed.

Done when every source thread links to its fix.
