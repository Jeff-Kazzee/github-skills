---
name: git-flow
description: Select feature, promotion, release and hotfix routes for projects with separate development and production lines. Use for scheduled releases, parallel stabilisation, supported versions and urgent production fixes.
---

# Git flow

Read the repository's release policy, branch history, protection rules, open PRs and active worktrees. Identify the actual development branch, production branch and any affected supported lines. Keep their existing names. Branch prefixes below are defaults where local rules permit them. If the release process is already documented, follow it.

| Situation | Start from | Destination and completion evidence |
| --- | --- | --- |
| Ordinary feature or fix | Current development tip | A fresh `feature/*` or repository-required task branch returns to development through review. |
| Routine promotion | Tested development revision | Use the existing promotion PR to production. Follow the project's merge method and sync policy. |
| Release must stabilise while development continues | Approved development cut | Create `release/*` for final checks and small fixes only. Merge the reviewed release to production and carry its fixes back to development. |
| Urgent production regression | Affected production revision | Create `hotfix/*` from production. Review and merge into production and development. Check each affected supported line and active release candidate for the same regression. |

Record each destination separately in the [release handoff](references/handoff.md). Run the repository's tests against each proposed integration, especially after conflict resolution or a backport. Apply a version tag to the released production commit only when the project calls for one and the action is authorised. Where only development may promote to production, integrate the approved release fixes via that route. If development already includes work that cannot ship, stop at the conflict and use the documented emergency route or obtain a maintainer decision. Keep the production guard in force.

Use the `github-flow` skill for the PR cycle. Before posting or editing PR text or comments, show Jeff the exact text and destination and wait for his explicit approval. Obtain fresh approval if either changes. Required reviews, checks and merge authorisation apply to each target and head. Deployments have their own approval.

Use a fresh branch for new work. Before authorised cleanup, verify the reviewed tip reached every required destination and the branch has no later commits, active worktree, owner or dependent PR needing it. Check squash and cherry-pick results against the merged PR and destination content. Keep temporary branches while evidence is incomplete and retain all protected, supported and long-lived branches.

Source: [Vincent Driessen's branching model and 2020 guidance on when to use it](https://nvie.com/posts/a-successful-git-branching-model/) and [Git's guidance on managing branches](https://git-scm.com/docs/gitworkflows).
