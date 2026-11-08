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
- If it does not fail, the finding does not hold. Keep the command and its output. That
  evidence is the reply.
- Look for the same bug in sibling code. A wrong pattern in one checker is usually
  copied into the others. Add those as new findings with their own tests.

Done when every finding is marked reproduced, with a failing test, or not reproduced,
with the command that shows it.

## 4. Fix them on one branch

- Work on one fix branch from the base the PR targeted, named
  `task/<id>-review-findings` or `fix/review-findings-<date>`.
- Fix each reproduced finding with the smallest change that makes its test pass. Keep
  each test in the same commit as its fix.
- Many findings across several files can go to parallel workers, one worker per group
  of files and never two writers on one file. Workers edit and test. One person
  commits.
- Run every suite on the platform CI uses (Linux for GitHub Actions), not only on the
  machine you built on. Report real pass and fail counts.

Done when every reproduced finding has a fix, its test passes, and the full suite
passes on Linux.

## 5. Answer every thread

Reply in each thread with [reply-templates.md](reply-templates.md):

- Fixed: the commit SHA and the test name that proves it.
- Not reproduced: the command and output, and a question asking the reviewer whether
  you misread the claim.
- Deferred: only with Jeff's yes, and only with an issue link in the reply. A deferred
  finding still counts as open until Jeff says it does not.

Resolve a thread only after its fix is on the PR head and its test passes there. Post
replies only after Jeff approves the text, as step 7 of the skill says.

Done when every thread has a reply and every fixed thread is resolved.

## 6. Get a fresh review, then merge

Push, then ask for a new review of the exact head. A new finding on the new head starts
again at section 2. Merge only when all of these hold on the same head:

- zero unresolved threads,
- a review of that head with no new findings,
- CI green on that head,
- Jeff's approval of that head.

Done when the merge commit SHA is reported with the head it merged.

## 7. Findings after a merge

The default is to fix forward. Open the fix PR into `dev` from section 4, get it
reviewed and merged, then promote `dev` to `prod` again. Nothing is deleted from `prod`.
A finding in a checker's edge case is never a reason to revert.

Revert only when `prod` is causing harm now and a fix will take longer than a day:

- a secret, token or personal data is published,
- installing or running the code damages a user's files or data,
- the main path is broken for every user.

A revert is one commit and one PR:

```sh
git switch -c revert/<merge-sha> origin/<branch the merge landed on>
git revert -m 1 <merge sha>
```

Write the message from the revert template in the `commit` skill, push, and open a PR
that waits for Jeff like any other.

Never revert any other way:

- never delete files one at a time, as a series of commits, or through the contents
  API,
- never rebuild an old state by hand,
- never delete a file Jeff has not named.

A PR that deletes more than five files needs Jeff to approve the list of files by name.

Done when the fix or the single revert commit is merged with Jeff's approval and the
promotion is reported with its SHA.

## Several PRs with findings

When findings span several PRs, collect them into one list (section 2) and fix them in
one fix PR. Its body has a table with one row per finding: id, source PR and thread,
reproduced or not, fix commit, test name. Reply in every source thread with the fix PR
link and commit, even when the source PR is closed.

Done when every source thread links to its fix.
