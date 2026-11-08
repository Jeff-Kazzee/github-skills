# Sources

Read on 2026-11-07. Repository files were pulled through the GitHub GraphQL API
(`object(expression: "HEAD:<path>")`), and docs through GraphQL or the REST API.

## Rules

| Source | What this skill takes |
|---|---|
| Jeff's Git law (`~/AGENTS.md`, the Git bullet) | `dev` and `prod`, PRs into `dev`, Jeff approves every merge, no agent bypasses a required check, each repo's AGENTS.md names the Git law. House rule |
| Jeff's Secrets law (`~/AGENTS.md`) | Secret names in a committed `.env.schema`, values never in git. House rule |
| Jeff, enforcement design of 2026-11-07 | Checkers fetched at a pinned SHA, never vendored. `readme-check --online` only when README changed. A gate-integrity job reading rules from the base. Block, never close. A repo may declare its own template. Graceful rollout. No checks for paused tools. House rule |
| [`pr-template`](../../pr-template/SKILL.md), [`readme`](../../readme/SKILL.md), [`issues-and-releases`](../../issues-and-releases/SKILL.md), [`review-gate`](../../review-gate/SKILL.md), [`commit`](../../commit/SKILL.md) | The PR body sections, the README check, the four bug questions and problem-first features, the `ci` workflow name and `.github/risk-paths`, copying the repo's commit style. House rules |
| [GitHub, default community health files](https://github.com/github/docs/blob/main/content/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file.md) | Lookup order `.github/`, root, `docs/`. An org's public `.github` repo supplies defaults. A license cannot be inherited. A repo's own `ISSUE_TEMPLATE` replaces the default folder |
| [GitHub, PR templates](https://github.com/github/docs/blob/main/content/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository.md) | The three locations, the `PULL_REQUEST_TEMPLATE/` folder for several templates, and templates taking effect from the default branch |
| [GitHub, issue form syntax](https://github.com/github/docs/blob/main/content/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms.md) | Every form needs `name`, `description` and `body` |
| [GitHub, configuring issue templates](https://github.com/github/docs/blob/main/content/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository.md) | `blank_issues_enabled: false` and `contact_links`. Writers still see a blank issue option |
| [GitHub, code owners](https://github.com/github/docs/blob/main/content/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners.md) | Lookup order `.github/`, root, `docs/`. Own `/.github/` so CODEOWNERS changes need the owner. Pair with "Require review from Code Owners" |
| [GitHub, about rulesets](https://github.com/github/docs/blob/main/content/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets.md) | Anyone with read access can view active rulesets, so `--github` needs no admin token |
| [GitHub, available rules](https://github.com/github/docs/blob/main/content/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets.md) | Require a pull request, require status checks, block force pushes, restrict deletions |
| [GitHub, secure use of Actions](https://github.com/github/docs/blob/main/content/actions/reference/security/secure-use.md) | Untrusted input through an intermediate environment variable. Read-only `GITHUB_TOKEN` by default. No `pull_request_target` with a checkout of untrusted code. Pin actions to a full SHA |
| [GitHub, community profile API](https://github.com/github/docs/blob/main/content/rest/metrics/community.md) and [community profiles](https://github.com/github/docs/blob/main/content/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories.md) | What the health score counts. Input only, see Measured |
| [OpenSSF Scorecard checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md) | Security-Policy scores a link plus vulnerability and disclosure text. Branch-Protection, Token-Permissions, Pinned-Dependencies and Dangerous-Workflow shape the workflow checks. Input only |
| [todogroup repolinter default ruleset](https://github.com/todogroup/repolinter/blob/main/rulesets/default.json) | File-existence rules and their globs. It errors on CHANGELOG, NOTICE and a test folder, which these skills do not require. Input only |
| [CHAOSS, Time to First Response](https://chaoss.community/kb/metric-time-to-first-response/) | Outcome metrics measure people, not files. Out of scope for a file audit |
| [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request/blob/main/README.md), [commitlint](https://github.com/conventional-changelog/commitlint/blob/master/README.md), [Danger JS](https://github.com/danger/danger-js/blob/main/README.md) | How projects lint PR text in CI. Title linting is set aside because `commit` copies each repo's own style |

## Measured

Method: 107 repositories known for strong process, read through GraphQL on
2026-11-07, root, `.github/`, `docs/`, `.github/ISSUE_TEMPLATE/` and
`.github/workflows/` with file text, plus each owner's `.github` repo (61 of 96 owners
have one). File names match without case. Percentages use the 101 repos that review
through GitHub PRs and are not archived. Linux, Git, PostgreSQL (mailing lists), Go
(Gerrit), SQLite (mirror) and google/eng-practices (archived) are left out of shares.

| Measure | Own files | With the org `.github` defaults |
|---|---:|---:|
| README | 100% | 100% |
| LICENSE | 100% | 100% |
| CONTRIBUTING | 95% | 98% |
| SECURITY.md | 67% | 94% (GitHub's `isSecurityPolicyEnabled` also says 94%) |
| CODE_OF_CONDUCT | 59% | 76% |
| SUPPORT | 12% | 17% |
| CODEOWNERS | 50% | not inheritable |
| PR template | 77% | 84% |
| `.github/ISSUE_TEMPLATE/` | 93% | 97% |
| At least one YAML issue form | 74% | |
| Markdown issue templates only | 19% | |
| `ISSUE_TEMPLATE/config.yml` | 83% | |
| `blank_issues_enabled: false` | 52% (63% of repos with a config) | |
| A contact link for security reports | 12% | |
| AGENTS.md at the root | 57% | |
| CLAUDE.md at the root | 26% | |
| Dependabot or Renovate | 80% | |
| Any workflow | 98% | |

Locations across all 107: SECURITY.md at the root 55, in `.github/` 16. CODEOWNERS in
`.github/` 34, at the root 16. PR template in `.github/` 77, at the root 1.

| PR templates (78 read) | Value |
|---|---:|
| Has a `- [ ]` checklist | 46% |
| Median boxes, when it has a checklist | 6 |
| Median length | 28 lines |
| Uses HTML comments for guidance | 88% |
| Asks for a summary or description | 94% |
| Asks for a linked issue | 83% |
| Mentions tests | 81% |
| Mentions docs | 63% |
| Mentions AI or generated code | 41% |
| Mentions a changelog or release note | 29% |
| Asks for screenshots | 21% |
| Mentions breaking changes | 14% |
| Mentions risk or rollback | 4% |

| Issue forms (243 forms in 76 repos) | Value |
|---|---:|
| Has a `required: true` field | 98% |
| Sets labels | 76% |
| Sets a title prefix | 39% |
| Median fields | 6 |
| Bug forms (83 in 72 repos): ask for steps or reproduction | 96% |
| Bug forms: ask what was expected | 86% |
| Bug forms: ask for a version | 81% |
| Bug forms: ask for a duplicate search | 47% |
| Feature forms (61 in 55 repos): ask for the problem or use case | 80% |
| Feature forms: median fields | 4 |

| Workflows | Value |
|---|---:|
| Workflows with top-level `permissions:` | 83% of 2,230 |
| Action references pinned to a full SHA | 82% of 11,699 |
| Repos that pin every action | 49% of 99 |
| Repos with any `pull_request_target` workflow | 61% |
| Repos with a workflow named `ci` (all 107) | 37 |
| Repos whose CI validates PR text | 17% (17 of 101) |
| Of those, lint the title | 13 (7 with action-semantic-pull-request) |
| Of those, check the body | 7 (electron, Homebrew, django, prometheus, moby, opentelemetry-collector, typescript-eslint) |
| Body checks that expand the body inside `run:` | 0. Each passes it through `env:` or a script context |
| Repos that screen PRs from automated accounts, by workflow name | 9 |
| commitlint / Danger | 4 / 2 |

Method for PR text checks: workflows on `pull_request` or `pull_request_target`
whose name or content names a title, body, template, semantic, commit-message,
changelog or issue-link check, read and classified by hand.

| Rulesets on the default branch (20 sampled through `rules/branches`) | Count |
|---|---:|
| Any ruleset rule | 14 |
| Require a pull request | 12 |
| Restrict deletion | 12 |
| Block force pushes | 11 |
| Require status checks | 8 |

Classic branch protection does not show in that endpoint, so these are lower bounds.

Community profile API, 12 sampled (kubernetes, react, node, vscode, vite, eslint,
grafana, rust, django, electron, cli, scorecard): health 100 for 6 and 87 for 6. The
split matched `content_reports_enabled`, a moderation setting. `issue_template` was
null for all 12, although 11 have templates in `.github/ISSUE_TEMPLATE/`. The score
is input, never the standard.

What the numbers show:

- Health files are near universal in strong repos. The gaps are SECURITY.md in the
  repo itself and CODEOWNERS, so the skill installs both.
- Issue forms with required fields have replaced Markdown templates.
- Few repos check PR text in CI, and the ones that check the body all pass it
  through the environment. The skill copies that pattern.
- Mature repos pin actions and scope tokens. The skill makes both a warning.
- Over half carry AGENTS.md, so naming the Git law there reaches agents where they look.

## Examples

Each row is a file or tree pulled through GraphQL on 2026-11-07. 107 repositories.

| URL | Project | Kind | What it teaches |
|---|---|---|---|
| https://github.com/torvalds/linux | torvalds/linux | Repo root | Reviews outside GitHub PRs (mailing list), no .github folder. has AGENTS.md |
| https://github.com/git/git/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | git/git | PR template | 11 lines, no checklist. has SECURITY |
| https://github.com/golang/go/blob/HEAD/.github/ISSUE_TEMPLATE/00-bug.yml | golang/go | Bug form | 6 fields, required fields. has SECURITY |
| https://github.com/postgres/postgres/tree/HEAD/.github | postgres/postgres | .github tree | Reviews outside GitHub PRs (mailing list), so health files differ. has SECURITY |
| https://github.com/sqlite/sqlite | sqlite/sqlite | Repo root | Reviews outside GitHub PRs (read-only mirror), no .github folder. has AGENTS.md |
| https://github.com/llvm/llvm-project/tree/HEAD/.github | llvm/llvm-project | .github tree | Health files only. has SECURITY, CODEOWNERS |
| https://github.com/rust-lang/rust/blob/HEAD/.github/pull_request_template.md | rust-lang/rust | PR template | 24 lines, no checklist, AI disclosure. has AGENTS.md |
| https://github.com/kubernetes/kubernetes/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | kubernetes/kubernetes | PR template | 71 lines, no checklist, asks about tests, AI disclosure. has SECURITY, AGENTS.md |
| https://github.com/facebook/react/blob/HEAD/.github/ISSUE_TEMPLATE/compiler_bug_report.yml | facebook/react | Bug form | 6 fields, required fields, asks for version. Blank issues off. has SECURITY |
| https://github.com/nodejs/node/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | nodejs/node | PR template | 46 lines, no checklist, asks about tests. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/python/cpython/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | python/cpython | PR template | 31 lines, no checklist. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/django/django/blob/HEAD/.github/workflows/check_pr_quality.yml | django/django | PR text check | Runs a script over PR title and body passed as env variables. has SECURITY |
| https://github.com/rails/rails/blob/HEAD/.github/pull_request_template.md | rails/rails | PR template | 46 lines, no checklist, asks about tests. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/microsoft/TypeScript/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | microsoft/TypeScript | Bug form | 8 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY |
| https://github.com/microsoft/vscode/blob/HEAD/.github/pull_request_template.md | microsoft/vscode | PR template | 8 lines, no checklist, asks about tests. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/denoland/deno/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | denoland/deno | PR template | 32 lines, no checklist, asks about tests, AI disclosure. has SECURITY |
| https://github.com/oven-sh/bun/blob/HEAD/.github/pull_request_template.md | oven-sh/bun | PR template | 4 lines, no checklist. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/withastro/astro/blob/HEAD/.github/ISSUE_TEMPLATE/---01-bug-report.yml | withastro/astro | Bug form | 7 fields, required fields, asks for version. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/vercel/next.js/blob/HEAD/.github/ISSUE_TEMPLATE/1.bug_report.yml | vercel/next.js | Bug form | 9 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has CODEOWNERS, AGENTS.md |
| https://github.com/sveltejs/svelte/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | sveltejs/svelte | Bug form | 6 fields, required fields. Blank issues off. has AGENTS.md |
| https://github.com/vuejs/core/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | vuejs/core | Bug form | 8 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY |
| https://github.com/electron/electron/blob/HEAD/.github/workflows/pr-template-check.yml | electron/electron | PR text check | Fails a fork PR whose body drops a heading from the PR template. has SECURITY, CODEOWNERS |
| https://github.com/Homebrew/brew/blob/HEAD/.github/workflows/check-prs.yml | Homebrew/brew | PR text check | Checks the PR body against the template, passing the body through env and never checking out head code. has CODEOWNERS, AGENTS.md |
| https://github.com/curl/curl/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | curl/curl | Bug form | 6 fields, required fields, asks for version. Blank issues off. has SECURITY, CODEOWNERS |
| https://github.com/tailwindlabs/tailwindcss/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | tailwindlabs/tailwindcss | PR template | 30 lines, no checklist, asks about tests. has CODEOWNERS |
| https://github.com/prettier/prettier/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | prettier/prettier | PR template | 20 lines, 6 boxes, asks about tests, AI disclosure. has SECURITY |
| https://github.com/eslint/eslint/blob/HEAD/.github/ISSUE_TEMPLATE/bug-report.yml | eslint/eslint | Bug form | 11 fields, required fields, asks for version. Blank issues off. has CODEOWNERS, AGENTS.md |
| https://github.com/vitejs/vite/blob/HEAD/.github/workflows/semantic-pull-request.yml | vitejs/vite | PR text check | Lints PR titles with action-semantic-pull-request. has SECURITY |
| https://github.com/trpc/trpc/blob/HEAD/.github/workflows/semantic-pr.yml | trpc/trpc | PR text check | Lints PR titles. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/colinhacks/zod/tree/HEAD/.github | colinhacks/zod | .github tree | Health files only. has SECURITY, AGENTS.md |
| https://github.com/supabase/supabase/blob/HEAD/.github/pull_request_template.md | supabase/supabase | PR template | 47 lines, 2 boxes. has CODEOWNERS, AGENTS.md |
| https://github.com/grafana/grafana/blob/HEAD/.github/ISSUE_TEMPLATE/0-bug-report.yaml | grafana/grafana | Bug form | 11 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has CODEOWNERS, AGENTS.md |
| https://github.com/hashicorp/terraform/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | hashicorp/terraform | Bug form | 11 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has CODEOWNERS |
| https://github.com/github/docs/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | github/docs | PR template | 23 lines, 3 boxes. has CODEOWNERS |
| https://github.com/google/eng-practices/tree/HEAD/.github | google/eng-practices | .github tree | Health files only |
| https://github.com/angular/angular/blob/HEAD/.github/ISSUE_TEMPLATE/1-bug-report.yaml | angular/angular | Bug form | 7 fields, required fields, asks for version. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/nestjs/nest/blob/HEAD/.github/workflows/pr-content-guard.yml | nestjs/nest | PR text check | Scans changed files with PR content read only as API data. has SECURITY |
| https://github.com/expressjs/express/tree/HEAD/.github | expressjs/express | .github tree | Health files only |
| https://github.com/fastify/fastify/blob/HEAD/.github/workflows/pull-request-title.yml | fastify/fastify | PR text check | Lints PR titles against a regex with read-only permissions. has SECURITY |
| https://github.com/webpack/webpack/blob/HEAD/.github/ISSUE_TEMPLATE/1-bug-report.yml | webpack/webpack | Bug form | 11 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has AGENTS.md |
| https://github.com/babel/babel/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | babel/babel | Bug form | 10 fields, required fields, asks for version. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/jestjs/jest/blob/HEAD/.github/ISSUE_TEMPLATE/bug.yml | jestjs/jest | Bug form | 12 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY |
| https://github.com/vitest-dev/vitest/blob/HEAD/.github/workflows/ai-policy.yml | vitest-dev/vitest | PR text check | Screens fork PRs from likely automated accounts. has SECURITY, AGENTS.md |
| https://github.com/microsoft/playwright/blob/HEAD/.github/ISSUE_TEMPLATE/bug.yml | microsoft/playwright | Bug form | 11 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/puppeteer/puppeteer/blob/HEAD/.github/workflows/conventional-commit.yml | puppeteer/puppeteer | PR text check | Lints PR titles as Conventional Commits. has SECURITY |
| https://github.com/storybookjs/storybook/blob/HEAD/.github/workflows/danger-js.yml | storybookjs/storybook | PR text check | Runs Danger JS over each PR. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/remix-run/react-router/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | remix-run/react-router | Bug form | 6 fields, required fields, asks for a duplicate search. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/nuxt/nuxt/blob/HEAD/.github/workflows/semantic-pull-requests.yml | nuxt/nuxt | PR text check | Lints PR titles with action-semantic-pull-request. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/solidjs/solid/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | solidjs/solid | PR template | 28 lines, no checklist, asks about tests |
| https://github.com/preactjs/preact/tree/HEAD/.github | preactjs/preact | .github tree | Health files only. has CODEOWNERS |
| https://github.com/sveltejs/kit/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | sveltejs/kit | Bug form | 7 fields, required fields, asks for version. Blank issues off. has AGENTS.md |
| https://github.com/pnpm/pnpm/blob/HEAD/.github/ISSUE_TEMPLATE/bug-report.yaml | pnpm/pnpm | Bug form | 15 fields, required fields, asks for version. Blank issues off. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/yarnpkg/berry/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | yarnpkg/berry | PR template | 48 lines, 3 boxes, asks about tests. has SECURITY, CODEOWNERS |
| https://github.com/npm/cli/blob/HEAD/.github/workflows/pull-request.yml | npm/cli | PR text check | Runs commitlint over PR commits and title. has SECURITY, CODEOWNERS |
| https://github.com/biomejs/biome/blob/HEAD/.github/workflows/pull_request_title_lint.yaml | biomejs/biome | PR text check | Lints PR titles with action-semantic-pull-request. has CODEOWNERS, AGENTS.md |
| https://github.com/evanw/esbuild/tree/HEAD/.github | evanw/esbuild | .github tree | Health files only |
| https://github.com/rollup/rollup/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | rollup/rollup | PR template | 57 lines, 9 boxes, asks about tests. has SECURITY, AGENTS.md |
| https://github.com/swc-project/swc/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | swc-project/swc | PR template | 18 lines, no checklist. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/typescript-eslint/typescript-eslint/blob/HEAD/.github/workflows/pr-title-validation.yml | typescript-eslint/typescript-eslint | PR text check | Validates PR titles, plus a breaking-change body check. has SECURITY, CODEOWNERS |
| https://github.com/prisma/prisma/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | prisma/prisma | Bug form | 7 fields, required fields, asks for version. Blank issues off. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/drizzle-team/drizzle-orm/blob/HEAD/.github/ISSUE_TEMPLATE/bug-template.yaml | drizzle-team/drizzle-orm | Bug form | 6 fields, required fields. has SECURITY |
| https://github.com/tokio-rs/tokio/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | tokio-rs/tokio | PR template | 15 lines, no checklist, asks about tests. has SECURITY |
| https://github.com/rust-lang/cargo/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | rust-lang/cargo | PR template | 14 lines, no checklist, asks about tests, AI disclosure |
| https://github.com/rust-lang/rust-analyzer/tree/HEAD/.github | rust-lang/rust-analyzer | .github tree | Health files only. has AGENTS.md |
| https://github.com/BurntSushi/ripgrep/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | BurntSushi/ripgrep | Bug form | 9 fields, required fields |
| https://github.com/astral-sh/ruff/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | astral-sh/ruff | PR template | 18 lines, no checklist, asks about tests, AI disclosure. has CODEOWNERS, AGENTS.md |
| https://github.com/astral-sh/uv/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | astral-sh/uv | PR template | 16 lines, no checklist, asks about tests. has SECURITY, AGENTS.md |
| https://github.com/pallets/flask/blob/HEAD/.github/pull_request_template.md | pallets/flask | PR template | 26 lines, no checklist, asks about tests |
| https://github.com/fastapi/fastapi/tree/HEAD/.github | fastapi/fastapi | .github tree | Health files only |
| https://github.com/psf/requests/tree/HEAD/.github | psf/requests | .github tree | Health files only. has SECURITY, CODEOWNERS |
| https://github.com/pytest-dev/pytest/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | pytest-dev/pytest | PR template | 32 lines, 6 boxes, asks about tests, AI disclosure. has SECURITY |
| https://github.com/numpy/numpy/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | numpy/numpy | PR template | 39 lines, no checklist, AI disclosure |
| https://github.com/pandas-dev/pandas/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | pandas-dev/pandas | PR template | 11 lines, 8 boxes, asks about tests, AI disclosure. has CODEOWNERS, AGENTS.md |
| https://github.com/scikit-learn/scikit-learn/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | scikit-learn/scikit-learn | Bug form | 9 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/pytorch/pytorch/blob/HEAD/.github/ISSUE_TEMPLATE/bug-report.yml | pytorch/pytorch | Bug form | 5 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/huggingface/transformers/blob/HEAD/.github/workflows/anti-slop.yml | huggingface/transformers | PR text check | Screens low-effort automated PRs. has SECURITY, AGENTS.md |
| https://github.com/helm/helm/blob/HEAD/.github/pull_request_template.md | helm/helm | PR template | 13 lines, 3 boxes, asks about tests. has SECURITY, AGENTS.md |
| https://github.com/prometheus/prometheus/blob/HEAD/.github/workflows/check_release_notes.yml | prometheus/prometheus | PR text check | Pipes the PR body from env into a release-note checker. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/etcd-io/etcd/blob/HEAD/.github/ISSUE_TEMPLATE/bug-report.yml | etcd-io/etcd | Bug form | 10 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY |
| https://github.com/containerd/containerd/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yaml | containerd/containerd | Bug form | 7 fields, required fields. has AGENTS.md |
| https://github.com/moby/moby/blob/HEAD/.github/workflows/validate-pr.yml | moby/moby | PR text check | Requires a changelog block in the PR body when an impact label is set. has SECURITY, AGENTS.md |
| https://github.com/docker/compose/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | docker/compose | PR template | 45 lines, 5 boxes, asks about tests, AI disclosure. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/istio/istio/blob/HEAD/.github/pull_request_template.md | istio/istio | PR template | 27 lines, 17 boxes, asks about tests. has SECURITY, CODEOWNERS |
| https://github.com/envoyproxy/envoy/tree/HEAD/.github | envoyproxy/envoy | .github tree | Health files only. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/cilium/cilium/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yaml | cilium/cilium | Bug form | 15 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/argoproj/argo-cd/blob/HEAD/.github/workflows/pr-title-check.yml | argoproj/argo-cd | PR text check | Lints PR titles with permissions set to none at the top. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/open-telemetry/opentelemetry-collector/blob/HEAD/.github/workflows/check-pr-issue-link.yml | open-telemetry/opentelemetry-collector | PR text check | Fails a non-member PR over 20 lines with no linked issue. has CODEOWNERS, AGENTS.md |
| https://github.com/opentofu/opentofu/blob/HEAD/.github/pull_request_template.md | opentofu/opentofu | PR template | 38 lines, 10 boxes, asks about tests, AI disclosure. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/hashicorp/vault/blob/HEAD/.github/pull_request_template.md | hashicorp/vault | PR template | 5 lines, no checklist. has CODEOWNERS |
| https://github.com/gohugoio/hugo/tree/HEAD/.github | gohugoio/hugo | .github tree | Health files only. has SECURITY, AGENTS.md |
| https://github.com/caddyserver/caddy/blob/HEAD/.github/pull_request_template.md | caddyserver/caddy | PR template | 30 lines, no checklist, asks about tests, AI disclosure. has SECURITY, AGENTS.md |
| https://github.com/cli/cli/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | cli/cli | PR template | 83 lines, 6 boxes, asks about tests, AI disclosure. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/actions/runner/tree/HEAD/.github | actions/runner | .github tree | Health files only. has CODEOWNERS |
| https://github.com/ossf/scorecard/blob/HEAD/.github/ISSUE_TEMPLATE/1-bug.yml | ossf/scorecard | Bug form | 10 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, CODEOWNERS, AGENTS.md |
| https://github.com/sigstore/cosign/tree/HEAD/.github | sigstore/cosign | .github tree | Health files only. has CODEOWNERS, AGENTS.md |
| https://github.com/nodejs/undici/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | nodejs/undici | PR template | 54 lines, 7 boxes, asks about tests. has SECURITY |
| https://github.com/facebook/docusaurus/blob/HEAD/.github/ISSUE_TEMPLATE/bug.yml | facebook/docusaurus | Bug form | 10 fields, required fields, asks for version. Blank issues off. has CODEOWNERS, AGENTS.md |
| https://github.com/mdn/content/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | mdn/content | PR template | 28 lines, no checklist. has SECURITY, CODEOWNERS |
| https://github.com/mastodon/mastodon/blob/HEAD/.github/ISSUE_TEMPLATE/1.web_bug_report.yml | mastodon/mastodon | Bug form | 10 fields, required fields, asks for version. Blank issues off. has SECURITY |
| https://github.com/neovim/neovim/blob/HEAD/.github/ISSUE_TEMPLATE/bug_report.yml | neovim/neovim | Bug form | 10 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/microsoft/terminal/blob/HEAD/.github/ISSUE_TEMPLATE/Bug_Report.yml | microsoft/terminal | Bug form | 7 fields, required fields, asks for version, asks for a duplicate search. Blank issues off. has SECURITY, AGENTS.md |
| https://github.com/flutter/flutter/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | flutter/flutter | PR template | 46 lines, 11 boxes, asks about tests, AI disclosure. has CODEOWNERS |
| https://github.com/dotnet/runtime/blob/HEAD/.github/PULL_REQUEST_TEMPLATE/ | dotnet/runtime | PR template | 1 lines, no checklist. has SECURITY, CODEOWNERS |
| https://github.com/tauri-apps/tauri/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md | tauri-apps/tauri | PR template | 22 lines, no checklist, asks about tests. has SECURITY, CODEOWNERS |
| https://github.com/zed-industries/zed/blob/HEAD/.github/workflows/danger.yml | zed-industries/zed | PR text check | Runs Danger over each PR. has AGENTS.md |
| https://github.com/vercel/turborepo/blob/HEAD/.github/workflows/lint-pr-title.yml | vercel/turborepo | PR text check | Lints PR titles with action-semantic-pull-request. has SECURITY, AGENTS.md |
| https://github.com/nrwl/nx/blob/HEAD/.github/workflows/pr-title-validation.yml | nrwl/nx | PR text check | Validates PR title format. has SECURITY, CODEOWNERS, AGENTS.md |
