---
name: github-flow
description: Choose a short-lived branch and review path for a change that can ship independently. Use for ordinary GitHub work and for the PR cycle inside an existing development and production workflow.
---

# GitHub flow

Start with the repository's instructions and current work. Inspect the remote default (`git ls-remote --symref origin HEAD`), production and development policy, open PRs, branch protections, worktrees and local changes. The default branch can differ from the integration target. If evidence conflicts, identify the unresolved target before branching. Fetch the relevant remote branch and confirm its tip before branching. Preserve other writers' work.

1. For an ordinary task, start a fresh descriptive branch from the current remote default or production branch named by policy. If the project integrates tasks on development, branch from development and target it with the task PR. For releases and hotfixes, keep the starting revision and destinations selected by the release policy and `git-flow`. Keep the repository's naming and worktree rules. Give each new task its own branch.
2. Implement one reviewable change. Run the repository's checks. Record the user-visible result, exact head and any untested case. Use the existing commit, PR and review skills. Use the [change brief or gist template](references/formats.md) when a reviewer needs evidence.
3. Prepare the PR text locally for the verified base. Before posting or editing a PR title, body, review, reply or comment, show Jeff the exact text and destination and wait for his explicit approval. If either changes, obtain fresh approval. Review the diff, resolve feedback, rerun affected checks and obtain required reviews on the final head.
4. Merge only with explicit authorisation for that head and passing required checks, using the repository's merge method. Respect branch protections, review rules and any separate promotion or deployment gate.
5. Before authorised cleanup, verify the merged PR's base, head SHA and resulting commit on the destination. For squash or rebase merges, use the forge's merged record rather than relying on ancestry of the original tip. Read the live remote ref and compare it and the local tip with the reviewed head. For remote deletion, use a conditional operation that fails if the tip moves. Keep the branch when the host cannot enforce that condition. Check other worktrees, open or stacked PRs, uncommitted changes and ownership. Keep the branch if any work, dependency or ownership is unresolved. Delete only the confirmed disposable branch with authorisation. Retain protected and long-lived branches.

Choose the release-oriented `git-flow` skill when a release needs isolation, an urgent fix must reach multiple lines, or several production versions need support. A routine change can follow this PR cycle inside any of those projects.

Source: [GitHub's workflow](https://docs.github.com/en/get-started/using-github/github-flow) and [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
