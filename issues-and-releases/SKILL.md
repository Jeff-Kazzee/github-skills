---
name: issues-and-releases
description: Files GitHub issues a maintainer can act on, writes issue comments, and cuts releases users can trust. Use when you open, triage, comment on or close an issue, tag a version, or write release notes. Not for PR review comments, use `review-comments`. Not for a PR body, use `pr-template`.
---

# Issues and releases

A public issue, an issue comment and a release are external acts. Draft the exact text
and wait for Jeff's approval before you post (house rule). Sources and measurements are
in [references/sources.md](references/sources.md).

## 1. File an issue

1. Search open and closed issues first. File one problem per issue.
2. Use the repo's issue form when it has one, and fill every field it asks for. 16 of 21
   bug forms from top projects make a reproduction field required, and 15 of 21 make a
   version field required.
3. Title it with the symptom a reader would search for:
   `Install fails on Node 24 with EBADENGINE`, not `Bug in install`.
4. When the repo has no form, answer the four questions that Go's and Kubernetes' forms
   both ask:
   1. **What did you do?** The smallest reproduction, as commands or a runnable file.
   2. **What did you see?** Exact output, as text in a fenced block, not a screenshot.
   3. **What did you expect, and why?**
   4. **Where?** Version or commit SHA, OS, runtime. Use the repo's own command for it,
      such as `go version`, `brew config` or `npx envinfo`. For a regression, add the
      last version that worked.
5. A feature request opens with the problem and who has it. The proposal comes second.
6. Separate what you verified from what you suspect. If you could not reproduce it, say
   so.
7. Keep the body to symptoms. Put your root-cause analysis in a
   `<details><summary>Investigation</summary>` block, as Electron's form asks agents to.
8. Fill the repo's AI disclosure field honestly. 6 of the 21 forms address AI use.
   Homebrew and Terraform ask you to name the tool, and ESLint asks how you used it.
9. When a repo requires a human-written report, as Next.js and curl do, or human answers
   to follow-ups, as Homebrew does, give Jeff the reproduction and the facts. He writes
   the body and the replies. Never draft a follow-up answer as if Jeff wrote it.
10. Strip tokens, customer data and private paths. Never file a security problem in a
    public issue. Tell Jeff.

Done when a stranger can reproduce the problem from the issue alone.

## 2. Comment on an issue

Comment when the comment changes what someone does next. These are the cases:

| Situation | Template in [references/issue-comments.md](references/issue-comments.md) |
|---|---|
| A new issue needs a category, an owner or a next step | 1. Triage reply |
| You cannot reproduce it | 2. Ask for a reproduction |
| You reproduced it | 3. Confirm and reproduce |
| You own it and the thread is quiet, or the fix merged but the issue stays open | 4. Status update |
| A change fixed it | 5. Close as fixed |
| Nothing will change | 6. Won't fix, duplicate or not planned |
| It waits on someone past the repo's timeout | 7. Stale ping |
| Maintainers decided on a proposal or a dispute | 8. Maintainer decision |

Lead with the verdict or the ask, as the closing comments in the examples do ("Fixed in",
"Duplicate of", "Closed via"). Keep it short: the median maintainer triage reply in the
sample was 26 words, and the median closing comment was 17.

Done when the comment matches one row of the table and every `{{field}}` is filled.

## 3. Close an issue

1. Pick the close reason that matches the outcome: `Completed` for a fix or an answered
   question, `Duplicate` for a duplicate, and `Not planned` for working as intended,
   won't fix, out of scope and stale.
2. Always say why. Node.js and Go both require a reason on every close.
3. For a fix, link the change and name the version. In the sample, 10 of 15 closing
   comments that announce a fix link it, and only 6 of 15 name the version.
4. Closing keywords such as `Fixes #123` work only when the PR targets the default
   branch. Under the Git law, task PRs target `dev` and `prod` is the default. So the
   keyword in the squash message closes the issue when promotion brings that commit to
   `prod`. Until then, post a status update with the PR link.
5. For a duplicate, write `Duplicate of #N` and link the original. Close as a duplicate
   only when you are sure. Otherwise write "Possibly related to #N" and leave it open.

Done when the issue has the right close reason and a comment that links the fix, the
original or the reason.

## 4. Cut a release

If the repo has its own release doc, read it first. It beats everything below,
including the version scheme. A release is High in the `review-gate` skill and waits
for Jeff. This covers the release itself. Deploying is a separate step that happens
only when Jeff asks, from the owner repo's docs.

1. Promote first, then tag the commit on `prod`.
2. Unless the repo says otherwise, pick the version by semver: major for a breaking
   change, minor for a feature, patch for a fix.
3. Tag with `git tag -a v1.2.3 -m "v1.2.3"`. Never move a published tag. Fix forward
   with a new patch version.
4. Check the notes against `git log <last tag>..<new tag>`, so nothing is missing or
   invented. Walk the public surface in the diff too: commands, flags, environment
   variables, and anything renamed or removed. Each needs a note and current docs. Run
   the commands and examples the docs show, and confirm every version stamp and
   generated file agrees.
5. Write notes for users: past tense, one line per change, each with its PR link. 8 of
   11 recent releases sampled link every line. Group them under `Action required`,
   `Features` and `Fixes`, and drop empty groups. Anything a user must do goes first.
6. Install or run the released artifact, not the source tree, before you call it done.
7. Promotion closes the issues whose keywords reach `prod`, with no version named. On
   each issue the release fixed, post "Fixed in #N, released in vX.Y.Z" with template 5.

Done when a stranger can upgrade from the notes without asking you anything.

## Example

A user reports that `tool sync` hangs on Windows. You reproduce it on v2.3.1, and the
fix merges into `dev` in PR #418. You already posted the reproduction as its own
comment. The draft status update for Jeff to approve:

```md
Status: Fix merged, not released.

- Done: #418 quotes the cache path before it is passed to the child process.
- Next: it ships in v2.3.2, which is the next patch release.
```

After v2.3.2 ships, close it as `Completed` with "Fixed in #418, released in v2.3.2."
