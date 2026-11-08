# Checklist

Every check `scripts/repo-check.mjs` runs, the skill that owns it, and how to fix it.
Status `fail` exits 1. `warn` is a recommendation. `pending` waits for a skill that is
not in the repo yet. `skip` means the input could not be read.

## Files

| Check | Owner | Passes when | Fix |
|---|---|---|---|
| `readme.present` | `readme` | A README is in `.github/`, the root or `docs/` | Write it with `readme`. CI runs `readme-check.mjs --online` when it changes |
| `license.present` | repo-standards | A LICENSE or COPYING file is at the root | Ask Jeff. GitHub has no inherited license file |
| `contributing.present` | `contributing` | CONTRIBUTING is in a health-file location | Write it with `contributing` |
| `security.present` | repo-standards | SECURITY.md exists, says "vulnerability" and links a reporting channel | `--fix`, then fill the response times with Jeff |
| `codeowners.present` | repo-standards | CODEOWNERS exists. Warns when no line covers `/.github/` | `--fix`. In an organization, name a user or team |
| `pr-template.present` | `pr-template` | A default PR template exists. Warns when only a `PULL_REQUEST_TEMPLATE/` folder exists | `--fix` |
| `pr-template.format` | `pr-template` | Headings equal the declared `pr-sections:`, or the pr-template sections when none is declared | Declare the repo's own shape, or ask Jeff before replacing it |
| `templates.filled` | repo-standards | No installed file has an unfilled `{{field}}`. `${{ }}` does not count | Fill the field, or ask Jeff |

## Issues

| Check | Owner | Passes when | Fix |
|---|---|---|---|
| `issues.bug-form` | `issues-and-releases` | A YAML bug form has `name`, `description`, `body`, a required field, a reproduction, the expected result and a version. Warns on a Markdown-only bug template | `--fix`, or add the four questions |
| `issues.feature-form` | `issues-and-releases` | A YAML feature form requires the problem | `--fix` |
| `issues.config` | `issues-and-releases` | `config.yml` exists. Warns when blank issues are on or no contact link sends security reports private | `--fix` |

## CI and workflows

| Check | Owner | Passes when | Fix |
|---|---|---|---|
| `ci.workflow` | `review-gate` | A workflow is named `ci`, or the name `.github/risk-paths` gives after `ci:` | `--fix` installs `ci.yml` |
| `ci.tests` | repo-standards | The ci workflow runs a test command | Replace `node --test` with the repo's command |
| `gates.integrity` | repo-standards | Some workflow runs `repo-check.mjs gate` | `--fix` installs `skills-check.yml` |
| `gates.pr-body` | `pr-template` | Some workflow runs `repo-check.mjs pr` or `pr-body.mjs check --pr` | `--fix` installs `skills-check.yml` |
| `gates.readme` | `readme` | Some workflow runs `readme-check.mjs --online` | `--fix` installs `skills-check.yml` |
| `gates.pinned` | repo-standards | Every workflow that checks out `Jeff-Kazzee/github-skills` pins a 40-character SHA | Pin it. Never copy the checkers into the repo |
| `gates.block-only` | repo-standards | The gate workflows have no write permission and close nothing | Remove the write scope |
| `gates.on-edit` | `pr-template` | Warns when a body edit does not rerun the body check | Add `edited` to the `pull_request` types |
| `gates.docs` | `repo-docs` | Pending | Wait for `repo-docs` |
| `workflows.injection` | repo-standards | No `run:` block expands PR, issue or comment text | Pass it through `env:` and read `"$VAR"` |
| `workflows.pr-target` | repo-standards | No `pull_request_target` workflow uses `actions/checkout` | Use `pull_request` |
| `workflows.permissions` | repo-standards | Warns on a workflow without top-level `permissions:` | Add `contents: read` and raise per job |
| `workflows.pinned` | repo-standards | Warns on an action not pinned to a full SHA | Pin it, with the tag in a comment |

## Agents, secrets, branches

| Check | Owner | Passes when | Fix |
|---|---|---|---|
| `agents.git-law` | repo-standards | AGENTS.md exists at the root and names the Git law | `--fix`, then fill the test command |
| `agents.claude-router` | repo-standards | Warns when CLAUDE.md is more than a five-line pointer to AGENTS.md | Move the policy to AGENTS.md |
| `secrets.env-files` | repo-standards | Git tracks no `.env` file except `.env.schema` or an example | Untrack it, rotate its values, declare names in `.env.schema` |
| `branches.dev-prod` | repo-standards | Warns when origin lacks `dev` or `prod` (`main` plays `prod`). Skipped in GitHub Actions, where the checkout holds one branch | Ask Jeff |
| `branches.rules.dev` | repo-standards | With `--github`, warns when `dev` lacks PR, status checks (`skills-check`, `gate-integrity`), force-push and deletion rules | Recommend to Jeff |
| `branches.rules.prod` | repo-standards | With `--github`, warns when `prod` lacks PR, force-push and deletion rules | Recommend to Jeff |
| `discussions.templates` | `discussions` | Pending | Wait for `discussions` |

`branches.rules` reads `GET /repos/{owner}/{repo}/rules/branches/{branch}`, which shows
active rulesets to anyone with read access. Classic branch protection does not appear
there, so a warning can be wrong for a repo that uses it. Say so when you report it.

## The declaration file

`.github/repo-standards` is optional. It is a gate file, and CI reads it from the base
commit.

```text
pr-sections: Intent, Size, Blast Radius, Verification, Docs Impact, Release/Package Impact, Out of Scope
gate: scripts/review-gate.mjs
```

- `pr-sections:` judges PR bodies against these `##` headings, in order and not empty,
  with no unfilled field and no em dash. Without it, `pr-template`'s checker runs.
- `gate:` adds a path that `gate-integrity` protects. A value ending in `/` covers a folder.

## Inputs set aside

These come from third-party scorers. None is a rule here, because no skill in this repo
needs it. Raise one with Jeff when a repo has a reason.

| Input | Source | Why it is not a check |
|---|---|---|
| CODE_OF_CONDUCT | Community profile, repolinter | No skill requires it. 59 percent of the sample carry one |
| CHANGELOG, NOTICE, a test folder | repolinter default ruleset | Release notes live in GitHub releases (`issues-and-releases`) |
| A dependency update tool | Scorecard Dependency-Update-Tool | Common (80 percent) but a dependency change needs `security-audit`, so it is a recommendation |
| Conventional Commit PR titles | action-semantic-pull-request, commitlint | `commit` says to copy the repo's own style. 13 percent of the sample lint titles |
| Signed commits, CII badge, SBOM, fuzzing | Scorecard | Outside these skills |
| Stale bots and auto-close | actions/stale | The check blocks and never closes |
| Health percentage | Community profile API | It reported no issue template for 12 of 12 sampled repos, including 11 with templates, and moved with a moderation setting |
