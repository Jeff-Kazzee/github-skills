---
name: git-flow
description: Select feature, promotion, release and hotfix routes for projects with separate development and production lines. Use for scheduled releases, parallel stabilisation, supported versions and urgent production fixes.
---

# Git flow

Read the repository's release policy, branch history, protection rules, open PRs and active worktrees. Identify the actual development branch, production branch and any affected supported lines. Fetch those branches and confirm their live tips before branching. For a production incident, identify the affected deployed revision on the relevant line. Keep the existing branch names. Branch prefixes below are defaults where local rules permit them. If the release process is already documented, follow it.

| Situation | Start from | Destination and completion evidence |
| --- | --- | --- |
| Ordinary feature or fix | Current development tip | A fresh `feature/*` or repository-required task branch returns to development through review. |
| Routine promotion | Tested development revision | Use the existing promotion PR to production. Follow the project's merge method and sync policy. |
| Release must stabilise while development continues | Approved development cut | Create `release/*` for final checks and small fixes only. Merge the reviewed release to production and carry its fixes back to development. |
| Urgent production regression | Affected production revision | Create `hotfix/*` from production. If policy permits a direct hotfix PR, review and merge into production and development. If only development can promote, review the fix into development first and use the required promotion PR. Check each affected supported line and active release candidate for the same regression. |

Record each destination separately in the [release handoff](references/handoff.md). Run the repository's tests against each proposed integration, especially after conflict resolution or a backport. When policy calls for a tag, verify the released production SHA and check the proposed tag name locally and on the remote. Obtain approval of the exact name, SHA and publication destination before pushing it. If the name already exists, verify its target and retain it. Stop on a mismatch. Where only development may promote to production, take both release fixes and urgent hotfixes through that promotion route. If development already includes work that cannot ship, stop at the conflict and use the documented emergency route or obtain a maintainer decision. Keep the production guard in force.

Use the `github-flow` skill for the PR cycle. Use the PR template for its text and retain the target required by the repository for that PR. Before posting or editing PR text or comments, show Jeff the exact text and destination and wait for his explicit approval. Obtain fresh approval if either changes. Required reviews, checks and merge authorisation apply to each target and head. Deployments have their own approval.

Use a fresh branch for new work. Before authorised cleanup, verify the reviewed tip reached every required destination and the branch has no later commits, active worktree, owner or dependent PR needing it. Read the live remote ref, compare it with the reviewed tip and use conditional deletion so a concurrent push keeps the branch. Retain the branch when conditional deletion is unavailable. Check squash and cherry-pick results against the merged PR and destination content. Keep temporary branches while evidence is incomplete and retain all protected, supported and long-lived branches.

Source: [Vincent Driessen's branching model and 2020 guidance on when to use it](https://nvie.com/posts/a-successful-git-branching-model/) and [Git's guidance on managing branches](https://git-scm.com/docs/gitworkflows).
