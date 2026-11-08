---
name: repo-standards
description: Audits one repository against these GitHub skills and installs what enforces them, such as templates, issue forms, SECURITY.md, CODEOWNERS and a blocking CI check. Use when setting up a repo, before it goes public, or when asked whether it meets the standards. Not for writing a README, use `readme`.
---

# Repo standards

A standard that lives only in a skill is a suggestion. This skill makes each repo
enforce the other skills: files GitHub shows to contributors, and a required check
that blocks a merge when a PR body or README breaks the format.

Jeff's skills are the standard. GitHub's community profile, OpenSSF Scorecard,
repolinter and listing sites are input. Take a rule from them only when it serves
a skill here, and record the ones you set aside in `references/checklist.md`.

## 1. Audit

Run from the repo's checkout, on `linveo-16gb` when the repo has one there:

```sh
node <this skill's folder>/scripts/repo-check.mjs . --github <owner/repo>
```

It changes nothing. Each line names a check, its status and the skill that owns it.
`fail` blocks, `warn` is a recommendation, `pending` belongs to a skill that is not
in the repo yet, and `skip` could not be read. `--github` reads branch rules with GET
calls only. `references/checklist.md` explains every check and its fix.

Done when you have the full output and know which skill owns each failure.

## 2. Install what is missing

```sh
node <this skill's folder>/scripts/repo-check.mjs . --fix
```

`--fix` copies a template from `references/templates/` only where the repo has none,
and never overwrites a file. It fills the owner, the repo name and the pinned
github-skills commit when it can read them. Then do the rest by hand:

- Fill every `{{field}}` left in `SECURITY.md` and `AGENTS.md`. Ask Jeff for response
  times and supported versions. Never invent them.
- Write `CONTRIBUTING.md` with the `contributing` skill and the README with `readme`.
- Leave `LICENSE` to Jeff.
- A repo that already has its own PR template keeps it. Declare it in
  `.github/repo-standards` with one line, `pr-sections: <its headings, in order>`.
  The check then judges PR bodies against that shape, and the PR says so.
- Do not add checks for tools the owner has paused.

Done when the audit shows no `fail` except checks only Jeff can settle, each listed.

## 3. Wire the gates

`--fix` installs two workflows. `ci.yml` runs the tests under the name `ci`, which
`review-gate` reads. It is skipped when the repo already has a `ci` workflow.
`skills-check.yml` holds the gates, and it is added whenever no workflow runs them:

| Job | What it does |
|---|---|
| `skills-check` | Checks the PR body with `pr-template`'s checker, or the declared shape. Runs `readme-check.mjs --online` only when `README.md` changed |
| `gate-integrity` | Fails any PR that touches a gate file: `.github/workflows/`, the checker pin, `.github/repo-standards`, `.github/risk-paths` or CODEOWNERS |
| `audit` | Runs this skill's audit into the job summary. The step cannot fail, because `review-gate` counts any failed check and open work must keep moving |

Keep these properties when you edit it:

- Fetch the checkers from `Jeff-Kazzee/github-skills` at a full commit SHA. Never copy
  them into the repo. One pinned standard cannot drift.
- Read the rules from the PR's base commit, never from the PR.
- Use `pull_request`. Never `pull_request_target` with a checkout, and never run PR
  code under a write token.
- The check blocks. It never closes, labels or edits a PR. It skips no author, so
  Jeff's own PRs are blocked too.
- Keep the workflow name `ci`, because `review-gate` reads that run.

`gate-integrity` cannot protect itself. The workflow runs from the PR, so a PR can
rewrite the job. The CODEOWNERS line for `/.github/` and a required code owner review
are the backstop. A gate failure means Jeff decides how the PR lands.

Done when the audit's `ci.*`, `gates.*` and `workflows.*` lines pass.

## 4. Land the setup PR

Open it into `dev` with `pr-template`, and put its checker's pass in Proof. It touches
`.github/`, so `review-gate` sets it High and `gate-integrity` fails it by design.
That makes it `ask`: Jeff approves the exact head and decides how it lands.

Done when Jeff has the PR, its head and the expected gate failure, or it has merged.

## 5. Recommend branch settings

Agents never change branch protection or rulesets. After the workflow has run once
on `dev`, so its check names appear in the picker, hand Jeff one batched ask, about
10 minutes, with the clicks:

1. `dev` and `prod` exist, and `prod` is the default branch.
2. A ruleset on `dev`: require a PR, require the `skills-check` and `gate-integrity`
   checks, require conversation resolution, block force pushes and deletion.
3. A ruleset on `prod`: require a PR, require conversation resolution, block force
   pushes and deletion. Conversation resolution makes GitHub enforce the rule in
   `babysit-pr/references/findings.md`: no merge with an open finding.
4. Require code owner review, and turn on private vulnerability reporting.

Done when `--github` shows the rules, or Jeff has the ask.

## 6. Prove it blocks

Once the checks are required, open a test PR into `dev` with a body missing a section.
Capture the failed required check and the blocked merge. Fix the body and capture the
green run. Close the test PR. Put both captures in your report to Jeff and on the task
row. Never rewrite other open PRs to pass the new check unless Jeff asks.

Done when Jeff has the blocked capture and the green capture from the same test PR.

## Example

```text
$ node repo-check.mjs . --fix
added .github/ISSUE_TEMPLATE/feature.yml
added .github/workflows/skills-check.yml
added SECURITY.md
PASS    pr-template.format     [pr-template] .github/pull_request_template.md matches the shape declared in .github/repo-standards (7 sections)
PASS    issues.bug-form        [issues-and-releases] bug_report.yml asks the bug questions
FAIL    templates.filled       [repo-standards] unfilled {{field}} in SECURITY.md
                               fix: Fill each field. Ask Jeff for anything you cannot confirm.
FAIL    contributing.present   [contributing] no CONTRIBUTING.md
WARN    branches.rules.dev     [repo-standards] dev rulesets lack required check gate-integrity
```

The repo kept its own 7-section PR template and declared it. The agent asks Jeff for
the SECURITY.md response times, writes CONTRIBUTING.md with `contributing`, and adds
the dev ruleset to the batched ask.

Sources and measured numbers: `references/sources.md`.
