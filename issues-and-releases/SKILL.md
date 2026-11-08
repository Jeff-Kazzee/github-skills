---
name: issues-and-releases
description: Files GitHub issues a maintainer can act on, and cuts releases users can trust. Use whenever you open, triage or close an issue, tag a version, write release notes, or publish a GitHub release.
---

# Issues and releases

A public issue, an issue comment and a release are external acts. Draft the exact
text and wait for Jeff's approval before you post.

## Issues

Search open and closed issues first. File one problem per issue. Title it with the
symptom a reader would search for: `Install fails on Node 24 with EBADENGINE`, not
`Bug in install`.

A bug report answers what Go's and Kubernetes' forms both ask:

1. **What did you do?** The smallest reproduction, as commands.
2. **What did you see?** Exact output, in a fenced block.
3. **What did you expect, and why?**
4. **Where?** Version or commit SHA, OS, runtime.

A feature request opens with the problem and who has it. The proposal comes second.

- Separate what you verified from what you suspect. If you could not reproduce it,
  say so.
- Strip tokens, customer data and private paths.
- Never file a security problem in a public issue. Tell Jeff.
- Close with the reason, and link the fixing PR or say why it stays unfixed.

## Releases

A release is always `ask` in the `review-gate` skill.

1. Promote first, then tag the commit on `prod`.
2. Pick the version by semver: major for a breaking change, minor for a feature,
   patch for a fix.
3. Tag with `git tag -a v1.2.3 -m "v1.2.3"`. Never move a published tag. Fix forward
   with a new patch version.
4. Check the notes against `git log <last tag>..<new tag>`, so nothing is missing or
   invented.
5. Write notes for users: past tense, one line per change, each with its PR link.
   Group them under `Action required`, `Features` and `Fixes`, and drop empty groups.
   Anything a user must do goes first.
6. Install or run the released artifact, not the source tree, before you call it done.

Done when a stranger can act on the issue, or upgrade from the notes, without asking
you anything. Sources: Go's [bug form](https://github.com/golang/go/blob/master/.github/ISSUE_TEMPLATE/00-bug.yml),
Kubernetes' [bug form](https://github.com/kubernetes/kubernetes/blob/master/.github/ISSUE_TEMPLATE/bug-report.yaml)
and [release notes guide](https://github.com/kubernetes/community/blob/master/contributors/guide/release-notes.md),
read on 2026-11-06.
