# Sources

Read on 2026-11-07.

## Rules

| Source | What this skill takes |
|---|---|
| [GitHub Docs, Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) | The file lives in `.github/`, the root or `docs/`, checked in that order. GitHub links it when someone opens an issue or a PR. Include steps for good issues and PRs, links to docs and channels, and a code of conduct. |
| [GitHub Docs, Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) | CONTRIBUTING, CODE_OF_CONDUCT, SECURITY and SUPPORT are separate health files. An org's public `.github` repo supplies defaults, and a repo's own file overrides them. |
| [GitHub Docs, Adding a security policy](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository) | SECURITY.md holds the supported versions and how to report a vulnerability. CONTRIBUTING links it and does not repeat it. |
| [GitHub Docs, Adding support resources](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-support-resources-to-your-project) | SUPPORT.md says where to get help, and GitHub links it on new issues. |
| [opensource.guide, Starting a project](https://opensource.guide/starting-a-project/) | Say how to file a bug, how to set up the environment and run tests, and which contributions you want. Use a warm tone and specific suggestions. Link CONTRIBUTING from the README. |
| [opensource.guide, How to contribute](https://opensource.guide/how-to-contribute/) | READMEs help people use a project, contributing docs help them contribute. For a large change, open an issue before doing the work. |
| [Mozilla Science, Building a contributing.md](https://mozillascience.github.io/working-open-workshop/contributing/) | The section list: welcome, links to resources, environment setup, testing, how to submit changes, how to report a bug, first bugs for newcomers, style, code of conduct, where to ask for help. Thank contributors up front. |
| Jeff's house rule, from the `readme` skill | The Writing law (no em or en dashes, no semicolons in prose, no marketing adjectives), a checker with an offline mode, a `--clone` mode, and a fresh-clone run of every command block. |

## Measured

Method: for 131 repos, `gh api repos/<o>/<r>/community/profile` gave the CONTRIBUTING
path and code of conduct, and the file came from `raw.githubusercontent.com/<o>/<r>/HEAD/<path>`
(fallback paths: root, `.github/`, `docs/`, `.md`, `.rst`). Headings were matched to
categories by regex. A file under 250 words counts as a pointer file. Section position
is the heading's index divided by the heading count, so 0 is the top and 1 the bottom.

125 of 131 repos have a CONTRIBUTING file (no file: sqlite, linux, esbuild, express,
pandas, fastapi). 27 are pointers and 98 are full guides.

| Measure | Value |
|---|---:|
| Full guide length, 25th, median, 75th percentile | 707, 1,333, 2,075 words |
| Full guide median lines, median headings | 173, 15 |
| Location: root, `.github/`, `docs/` | 100, 21, 4 |
| Format: Markdown, reStructuredText, AsciiDoc | 121, 3, 1 |
| Full guides with a shell code block | 60% |
| Full guides with a command in a code block | 51% |
| Full guides with `git clone` in a code block | 26% |
| Full guides with an install or build command in a code block | 41% |
| Full guides with a test command in a code block | 37% |
| Full guides that use relative links | 63% |
| All files that mention a code of conduct | 34% |
| Repos with a code of conduct on the community profile | 81% |
| Repos with SECURITY.md in root, `.github/` or `docs/` | 66% |
| All files that mention security reporting | 21% |
| Repos with SECURITY.md whose CONTRIBUTING never mentions it | 65 of 83 |
| All files with an AI or LLM policy heading | 35 of 125, 28% |
| Full guides with an em dash | 31% |
| Full guides with a quick guide or short version at the top | 7% |

Sections in the 98 full guides, by heading, and by heading or body mention:

| Section | Heading | Heading or mention | Median position |
|---|---:|---:|---:|
| Welcome or introduction | 27% | 27% | 0.07 |
| Security reporting | 13% | 23% | 0.18 |
| Reporting issues | 71% | 71% | 0.21 |
| Setup | 57% | 57% | 0.24 |
| Getting help | 40% | 72% | 0.25 |
| Style | 56% | 56% | 0.33 |
| First issues | 7% | 37% | 0.35 |
| Pull request process | 80% | 80% | 0.44 |
| Tests | 46% | 46% | 0.50 |
| Documentation | 38% | 38% | 0.50 |
| Commit messages | 37% | 37% | 0.60 |
| AI policy | 34% | 43% | 0.60 |
| Release process | 24% | 24% | 0.71 |
| Code of conduct | 18% | 39% | 0.75 |
| DCO or CLA | 22% | 40% | 0.90 |

What the numbers show:

- The order is stable. Issues, setup and help sit in the first quarter. The PR process
  sits in the middle. Conduct and legal terms close the file.
- Setup is where guides fall short. Only 57% have a setup heading and only 26% show the
  clone command, so a first-timer has to guess the first step.
- Security is the largest gap. Two thirds of the repos have SECURITY.md, but most of
  those CONTRIBUTING files never point to it.
- AI policy is new and common. 28% of the files have a heading for it, from Rust, Node,
  TypeScript, Electron, Vite, Prettier, ESLint, Homebrew, Terraform and others.
- Big projects keep a short pointer file and host the guide elsewhere (Kubernetes, Go,
  Django, React, curl, LLVM, Git, PostgreSQL). Full guides past about 2,000 words are
  the top quarter.

Limits: SECURITY.md was checked in the repo only, not in an org's `.github` defaults,
so 66% is a floor. Category regexes miss some headings, so the heading column is a
floor too. A pointer file can lead to a large external guide that was not measured.

## Examples

125 files, one per repo, pulled on 2026-11-07. Each row is a file fetched in this
session. Section names are the categories the headings matched.

| URL | Project | Kind | What it teaches |
|---|---|---|---|
| https://github.com/kubernetes/kubernetes/blob/HEAD/CONTRIBUTING.md | kubernetes/kubernetes | Pointer, 52 words | Short file. Its first link goes to git.k8s.io/community/contributors/guide/ |
| https://github.com/rust-lang/rust/blob/HEAD/CONTRIBUTING.md | rust-lang/rust | Full guide, 393 words | Sections: issues, help, AI policy |
| https://github.com/golang/go/blob/HEAD/CONTRIBUTING.md | golang/go | Pointer, 187 words | Short file. Its first link goes to groups.google.com/forum/#!forum/golang-nuts |
| https://github.com/nodejs/node/blob/HEAD/CONTRIBUTING.md | nodejs/node | Full guide, 556 words | Sections: style, PR process, issues, conduct, AI policy |
| https://github.com/python/cpython/blob/HEAD/.github/CONTRIBUTING.rst | python/cpython | Full guide, 308 words | Sections: setup, style, conduct |
| https://github.com/django/django/blob/HEAD/CONTRIBUTING.rst | django/django | Pointer, 141 words | Short file. Its first link goes to docs.djangoproject.com/en/dev/internals/contributing/ |
| https://github.com/rails/rails/blob/HEAD/CONTRIBUTING.md | rails/rails | Full guide, 467 words | Sections: style, PR process, issues, help, docs. Also links security reporting |
| https://github.com/facebook/react/blob/HEAD/CONTRIBUTING.md | facebook/react | Pointer, 28 words | Short file. Its first link goes to reactjs.org/docs/how-to-contribute.html |
| https://github.com/microsoft/vscode/blob/HEAD/CONTRIBUTING.md | microsoft/vscode | Full guide, 872 words | Sections: PR process, issues, help |
| https://github.com/microsoft/TypeScript/blob/HEAD/CONTRIBUTING.md | microsoft/TypeScript | Full guide, 1400 words | Sections: setup, tests, PR process, issues, help, AI policy. Also copy-paste shell blocks |
| https://github.com/electron/electron/blob/HEAD/CONTRIBUTING.md | electron/electron | Full guide, 570 words | Sections: style, PR process, issues, AI policy |
| https://github.com/vitejs/vite/blob/HEAD/CONTRIBUTING.md | vitejs/vite | Full guide, 3345 words | Sections: setup, tests, style, commits, PR process, issues, help, AI policy, release, docs. Also copy-paste shell blocks |
| https://github.com/withastro/astro/blob/HEAD/CONTRIBUTING.md | withastro/astro | Full guide, 4628 words | Sections: setup, tests, style, PR process, issues, release, docs. Also copy-paste shell blocks |
| https://github.com/sveltejs/svelte/blob/HEAD/CONTRIBUTING.md | sveltejs/svelte | Full guide, 1509 words | Sections: setup, tests, style, PR process, issues, help, DCO or CLA. Also copy-paste shell blocks |
| https://github.com/vuejs/core/blob/HEAD/.github/contributing.md | vuejs/core | Full guide, 2694 words | Sections: setup, tests, style, PR process, issues. Also copy-paste shell blocks |
| https://github.com/tailwindlabs/tailwindcss/blob/HEAD/.github/CONTRIBUTING.md | tailwindlabs/tailwindcss | Full guide, 757 words | Sections: setup, tests, style, commits, PR process, issues, help. Also copy-paste shell blocks |
| https://github.com/prettier/prettier/blob/HEAD/CONTRIBUTING.md | prettier/prettier | Full guide, 1208 words | Sections: tests, PR process, issues, AI policy. Also copy-paste shell blocks |
| https://github.com/eslint/eslint/blob/HEAD/CONTRIBUTING.md | eslint/eslint | Pointer, 195 words | Short file. Its first link goes to eslint.org/conduct |
| https://github.com/Homebrew/brew/blob/HEAD/CONTRIBUTING.md | Homebrew/brew | Full guide, 391 words | Sections: issues, help, AI policy |
| https://github.com/curl/curl/blob/HEAD/.github/CONTRIBUTING.md | curl/curl | Pointer, 68 words | Short file. Its first link goes to curl.se/mail/ |
| https://github.com/denoland/deno/blob/HEAD/.github/CONTRIBUTING.md | denoland/deno | Full guide, 1421 words | Sections: setup, tests, style, PR process. Also copy-paste shell blocks |
| https://github.com/oven-sh/bun/blob/HEAD/CONTRIBUTING.md | oven-sh/bun | Full guide, 2325 words | Sections: setup, PR process, issues, release. Also copy-paste shell blocks |
| https://github.com/supabase/supabase/blob/HEAD/CONTRIBUTING.md | supabase/supabase | Full guide, 387 words | Sections: setup, PR process, issues |
| https://github.com/grafana/grafana/blob/HEAD/CONTRIBUTING.md | grafana/grafana | Full guide, 1217 words | Sections: PR process, issues, DCO or CLA, security, docs. Also links security reporting |
| https://github.com/hashicorp/terraform/blob/HEAD/.github/CONTRIBUTING.md | hashicorp/terraform | Full guide, 5115 words | Sections: setup, tests, commits, PR process, AI policy, release |
| https://github.com/github/docs/blob/HEAD/.github/CONTRIBUTING.md | github/docs | Full guide, 988 words | Sections: setup, style, commits, PR process, issues, docs |
| https://github.com/atom/atom/blob/HEAD/CONTRIBUTING.md | atom/atom | Full guide, 4779 words | Sections: setup, style, commits, PR process, issues, help, conduct, docs |
| https://github.com/vercel/next.js/blob/HEAD/contributing.md | vercel/next.js | Full guide, 328 words | Sections: commits, docs |
| https://github.com/trpc/trpc/blob/HEAD/CONTRIBUTING.md | trpc/trpc | Full guide, 919 words | Sections: setup, tests, style, PR process, docs. Also copy-paste shell blocks |
| https://github.com/colinhacks/zod/blob/HEAD/CONTRIBUTING.md | colinhacks/zod | Full guide, 712 words | Sections: setup, tests, DCO or CLA, docs. Also copy-paste shell blocks |
| https://github.com/llvm/llvm-project/blob/HEAD/CONTRIBUTING.md | llvm/llvm-project | Pointer, 81 words | Short file. Its first link goes to llvm.org/docs/Contributing.html |
| https://github.com/git/git/blob/HEAD/.github/CONTRIBUTING.md | git/git | Pointer, 134 words | Short file. Its first link goes to gitgitgadget.github.io/ |
| https://github.com/postgres/postgres/blob/HEAD/.github/CONTRIBUTING.md | postgres/postgres | Pointer, 8 words | Short file. Its first link goes to www.postgresql.org/developer/ |
| https://github.com/angular/angular/blob/HEAD/CONTRIBUTING.md | angular/angular | Full guide, 1710 words | Sections: style, commits, PR process, issues, help, conduct, DCO or CLA. Also copy-paste shell blocks |
| https://github.com/facebook/jest/blob/HEAD/CONTRIBUTING.md | facebook/jest | Full guide, 1673 words | Sections: setup, tests, style, commits, PR process, issues, conduct, DCO or CLA, security, release, docs. Also copy-paste shell blocks, links security reporting |
| https://github.com/webpack/webpack/blob/HEAD/CONTRIBUTING.md | webpack/webpack | Full guide, 764 words | Sections: setup, PR process, issues, release, docs. Also links security reporting |
| https://github.com/babel/babel/blob/HEAD/CONTRIBUTING.md | babel/babel | Full guide, 2267 words | Sections: setup, tests, style, issues, help, first issues. Also copy-paste shell blocks |
| https://github.com/rollup/rollup/blob/HEAD/CONTRIBUTING.md | rollup/rollup | Full guide, 1765 words | Sections: setup, tests, PR process, help, first issues. Also copy-paste shell blocks |
| https://github.com/microsoft/playwright/blob/HEAD/CONTRIBUTING.md | microsoft/playwright | Full guide, 1127 words | Sections: tests, commits, PR process, issues, conduct, DCO or CLA, docs. Also copy-paste shell blocks |
| https://github.com/cypress-io/cypress/blob/HEAD/CONTRIBUTING.md | cypress-io/cypress | Full guide, 7691 words | Sections: setup, tests, style, commits, PR process, issues, conduct, AI policy, release, docs. Also copy-paste shell blocks |
| https://github.com/puppeteer/puppeteer/blob/HEAD/docs/contributing.md | puppeteer/puppeteer | Full guide, 1755 words | Sections: setup, tests, style, commits, PR process, issues, DCO or CLA, release, docs. Also copy-paste shell blocks |
| https://github.com/fastify/fastify/blob/HEAD/CONTRIBUTING.md | fastify/fastify | Full guide, 1124 words | Sections: release |
| https://github.com/nestjs/nest/blob/HEAD/CONTRIBUTING.md | nestjs/nest | Full guide, 2106 words | Sections: setup, style, commits, PR process, issues, help. Also copy-paste shell blocks |
| https://github.com/prisma/prisma/blob/HEAD/CONTRIBUTING.md | prisma/prisma | Full guide, 1396 words | Sections: setup, PR process, issues, help, conduct, DCO or CLA, security, AI policy. Also copy-paste shell blocks, links security reporting |
| https://github.com/typeorm/typeorm/blob/HEAD/CONTRIBUTING.md | typeorm/typeorm | Full guide, 1126 words | Sections: style, commits, PR process, issues, help, security. Also copy-paste shell blocks, links security reporting |
| https://github.com/mui/material-ui/blob/HEAD/CONTRIBUTING.md | mui/material-ui | Full guide, 2737 words | Sections: tests, style, PR process, issues, conduct, DCO or CLA, release, docs. Also copy-paste shell blocks |
| https://github.com/ant-design/ant-design/blob/HEAD/.github/CONTRIBUTING.md | ant-design/ant-design | Pointer, 68 words | Short file. Its first link goes to ant.design/docs/react/contributing |
| https://github.com/storybookjs/storybook/blob/HEAD/CONTRIBUTING.md | storybookjs/storybook | Full guide, 1748 words | Sections: setup, AI policy, release, docs. Also copy-paste shell blocks, links security reporting |
| https://github.com/facebook/react-native/blob/HEAD/CONTRIBUTING.md | facebook/react-native | Pointer, 50 words | Short file. Its first link goes to reactnative.dev/contributing/overview |
| https://github.com/flutter/flutter/blob/HEAD/CONTRIBUTING.md | flutter/flutter | Full guide, 1895 words | Sections: PR process, issues, help, release, docs |
| https://github.com/dart-lang/sdk/blob/HEAD/CONTRIBUTING.md | dart-lang/sdk | Full guide, 2136 words | Sections: setup, style, commits, PR process, AI policy, docs. Also copy-paste shell blocks |
| https://github.com/JetBrains/kotlin/blob/HEAD/docs/contributing.md | JetBrains/kotlin | Full guide, 831 words | Sections: style, commits, PR process. Also copy-paste shell blocks |
| https://github.com/apple/swift/blob/HEAD/CONTRIBUTING.md | apple/swift | Full guide, 2820 words | Sections: tests, commits, PR process, issues, first issues, release |
| https://github.com/dotnet/runtime/blob/HEAD/CONTRIBUTING.md | dotnet/runtime | Full guide, 2075 words | Sections: commits, PR process, issues, DCO or CLA, first issues |
| https://github.com/dotnet/aspnetcore/blob/HEAD/CONTRIBUTING.md | dotnet/aspnetcore | Full guide, 1621 words | Sections: tests, PR process, issues, help, conduct, security, first issues. Also links security reporting |
| https://github.com/microsoft/terminal/blob/HEAD/CONTRIBUTING.md | microsoft/terminal | Full guide, 2044 words | Sections: setup, tests, PR process, issues, security, first issues. Also copy-paste shell blocks, links security reporting |
| https://github.com/PowerShell/PowerShell/blob/HEAD/.github/CONTRIBUTING.md | PowerShell/PowerShell | Full guide, 3260 words | Sections: setup, tests, style, PR process, issues, conduct, DCO or CLA, docs. Also copy-paste shell blocks, links security reporting |
| https://github.com/microsoft/vscode-python/blob/HEAD/CONTRIBUTING.md | microsoft/vscode-python | Pointer, 11 words | Short file. Its first link goes to github.com/microsoft/vscode-python/wiki |
| https://github.com/numpy/numpy/blob/HEAD/.github/CONTRIBUTING.md | numpy/numpy | Pointer, 200 words | Short file. Its first link goes to github.com/numpy/numpy/blob/main/doc/source/dev/development_ |
| https://github.com/scikit-learn/scikit-learn/blob/HEAD/CONTRIBUTING.md | scikit-learn/scikit-learn | Pointer, 198 words | Short file. Its first link goes to scikit-learn.org/dev/developers/contributing.html |
| https://github.com/pytorch/pytorch/blob/HEAD/CONTRIBUTING.md | pytorch/pytorch | Full guide, 11478 words | Sections: setup, tests, style, PR process, issues, DCO or CLA, AI policy, docs. Also copy-paste shell blocks, links security reporting |
| https://github.com/tensorflow/tensorflow/blob/HEAD/CONTRIBUTING.md | tensorflow/tensorflow | Full guide, 1988 words | Sections: setup, tests, style, PR process, issues, DCO or CLA, docs. Also copy-paste shell blocks |
| https://github.com/huggingface/transformers/blob/HEAD/CONTRIBUTING.md | huggingface/transformers | Full guide, 2074 words | Sections: setup, issues, AI policy, docs. Also copy-paste shell blocks |
| https://github.com/psf/requests/blob/HEAD/.github/CONTRIBUTING.md | psf/requests | Full guide, 540 words | Sections: style, PR process, issues, help |
| https://github.com/pallets/flask/blob/HEAD/docs/contributing.rst | pallets/flask | Pointer, 29 words | Short file. Its first link goes to palletsprojects.com/contributing/ |
| https://github.com/pydantic/pydantic/blob/HEAD/CONTRIBUTING.md | pydantic/pydantic | Pointer, 1 words | Points to a guide kept in the docs folder |
| https://github.com/python-poetry/poetry/blob/HEAD/docs/contributing.md | python-poetry/poetry | Full guide, 1955 words | Sections: setup, PR process, issues, docs. Also copy-paste shell blocks |
| https://github.com/astral-sh/ruff/blob/HEAD/CONTRIBUTING.md | astral-sh/ruff | Full guide, 6909 words | Sections: setup, tests, style, PR process, issues, help, AI policy, release, docs. Also copy-paste shell blocks |
| https://github.com/astral-sh/uv/blob/HEAD/CONTRIBUTING.md | astral-sh/uv | Full guide, 1630 words | Sections: setup, tests, style, AI policy, release, docs. Also copy-paste shell blocks |
| https://github.com/pypa/pip/blob/HEAD/.github/CONTRIBUTING.md | pypa/pip | Pointer, 80 words | Short file. Its first link goes to www.pypa.io/en/latest/code-of-conduct/ |
| https://github.com/ansible/ansible/blob/HEAD/.github/CONTRIBUTING.md | ansible/ansible | Full guide, 477 words | Sections: issues, help, DCO or CLA |
| https://github.com/docker/compose/blob/HEAD/CONTRIBUTING.md | docker/compose | Full guide, 2646 words | Sections: style, PR process, issues, help, security, AI policy. Also links security reporting |
| https://github.com/moby/moby/blob/HEAD/CONTRIBUTING.md | moby/moby | Full guide, 1126 words | Sections: style, commits, PR process, issues, help, security, AI policy, release. Also links security reporting |
| https://github.com/containerd/containerd/blob/HEAD/CONTRIBUTING.md | containerd/containerd | Full guide, 707 words | Sections: setup, style, PR process, AI policy |
| https://github.com/helm/helm/blob/HEAD/CONTRIBUTING.md | helm/helm | Full guide, 3157 words | Sections: style, PR process, issues, help, security, release, docs. Also copy-paste shell blocks, links security reporting |
| https://github.com/prometheus/prometheus/blob/HEAD/CONTRIBUTING.md | prometheus/prometheus | Full guide, 1057 words | Sections: PR process, AI policy. Also copy-paste shell blocks |
| https://github.com/etcd-io/etcd/blob/HEAD/CONTRIBUTING.md | etcd-io/etcd | Full guide, 1344 words | Sections: setup, tests, commits, PR process. Also copy-paste shell blocks |
| https://github.com/istio/istio/blob/HEAD/CONTRIBUTING.md | istio/istio | Pointer, 25 words | Short file. Its first link goes to github.com/istio/community/blob/master/CONTRIBUTING.md |
| https://github.com/envoyproxy/envoy/blob/HEAD/CONTRIBUTING.md | envoyproxy/envoy | Full guide, 3781 words | Sections: style, PR process, help, DCO or CLA, AI policy. Also copy-paste shell blocks |
| https://github.com/cockroachdb/cockroach/blob/HEAD/CONTRIBUTING.md | cockroachdb/cockroach | Full guide, 318 words | Sections: setup, PR process, help, conduct |
| https://github.com/rust-lang/cargo/blob/HEAD/CONTRIBUTING.md | rust-lang/cargo | Pointer, 124 words | Short file. Its first link goes to rust-lang.github.io/cargo/contrib/ |
| https://github.com/rust-lang/rust-analyzer/blob/HEAD/CONTRIBUTING.md | rust-lang/rust-analyzer | Full guide, 364 words | Sections: issues, AI policy |
| https://github.com/tokio-rs/tokio/blob/HEAD/CONTRIBUTING.md | tokio-rs/tokio | Full guide, 255 words | Sections: help, conduct, release |
| https://github.com/serde-rs/serde/blob/HEAD/CONTRIBUTING.md | serde-rs/serde | Full guide, 289 words | Sections: tests, PR process, issues, conduct. Also copy-paste shell blocks |
| https://github.com/BurntSushi/ripgrep/blob/HEAD/CONTRIBUTING.md | BurntSushi/ripgrep | Pointer, 26 words | Short file. Its first link goes to github.com/BurntSushi/ripgrep/blob/master/AI_POLICY.md |
| https://github.com/sharkdp/bat/blob/HEAD/CONTRIBUTING.md | sharkdp/bat | Full guide, 587 words | Sections: tests, style, commits. Also copy-paste shell blocks |
| https://github.com/neovim/neovim/blob/HEAD/CONTRIBUTING.md | neovim/neovim | Full guide, 1937 words | Sections: setup, style, commits, PR process, issues, AI policy, docs. Also copy-paste shell blocks |
| https://github.com/vim/vim/blob/HEAD/CONTRIBUTING.md | vim/vim | Full guide, 1263 words | Sections: commits, issues, help, AI policy. Also copy-paste shell blocks, links security reporting |
| https://github.com/tmux/tmux/blob/HEAD/.github/CONTRIBUTING.md | tmux/tmux | Full guide, 345 words | Sections: tests, issues. Also copy-paste shell blocks |
| https://github.com/ohmyzsh/ohmyzsh/blob/HEAD/CONTRIBUTING.md | ohmyzsh/ohmyzsh | Full guide, 1714 words | Sections: setup, style, commits, PR process, issues, AI policy |
| https://github.com/nvm-sh/nvm/blob/HEAD/CONTRIBUTING.md | nvm-sh/nvm | Full guide, 920 words | Sections: setup, style, commits, PR process, issues, conduct, docs |
| https://github.com/pnpm/pnpm/blob/HEAD/CONTRIBUTING.md | pnpm/pnpm | Full guide, 3612 words | Sections: setup, tests, style, commits, PR process, AI policy. Also copy-paste shell blocks |
| https://github.com/yarnpkg/berry/blob/HEAD/CONTRIBUTING.md | yarnpkg/berry | Pointer, 18 words | Short file. Its first link goes to yarnpkg.com/advanced/contributing |
| https://github.com/npm/cli/blob/HEAD/CONTRIBUTING.md | npm/cli | Full guide, 615 words | Sections: tests, style, PR process, issues, conduct. Also copy-paste shell blocks |
| https://github.com/biomejs/biome/blob/HEAD/CONTRIBUTING.md | biomejs/biome | Full guide, 3757 words | Sections: setup, tests, style, commits, PR process, issues, help, AI policy, release, docs. Also copy-paste shell blocks |
| https://github.com/remix-run/react-router/blob/HEAD/CONTRIBUTING.md | remix-run/react-router | Pointer, 6 words | Points to a guide kept in the docs folder |
| https://github.com/TanStack/query/blob/HEAD/CONTRIBUTING.md | TanStack/query | Full guide, 1305 words | Sections: tests, style, commits, PR process, issues, help, AI policy, release, docs. Also copy-paste shell blocks |
| https://github.com/reduxjs/redux-toolkit/blob/HEAD/CONTRIBUTING.md | reduxjs/redux-toolkit | Full guide, 728 words | Sections: setup, tests, PR process, issues, help, docs. Also copy-paste shell blocks |
| https://github.com/vercel/swr/blob/HEAD/.github/CONTRIBUTING.md | vercel/swr | Full guide, 316 words | Sections: setup, style, PR process, issues, help, docs. Also copy-paste shell blocks |
| https://github.com/mermaid-js/mermaid/blob/HEAD/CONTRIBUTING.md | mermaid-js/mermaid | Pointer, 23 words | Points to a guide kept in the docs folder |
| https://github.com/excalidraw/excalidraw/blob/HEAD/CONTRIBUTING.md | excalidraw/excalidraw | Pointer, 7 words | Short file. Its first link goes to docs.excalidraw.com/docs/introduction/contributing |
| https://github.com/jquery/jquery/blob/HEAD/CONTRIBUTING.md | jquery/jquery | Full guide, 1598 words | Sections: setup, tests, PR process, issues, help, AI policy. Also copy-paste shell blocks |
| https://github.com/twbs/bootstrap/blob/HEAD/.github/CONTRIBUTING.md | twbs/bootstrap | Full guide, 1965 words | Sections: setup, style, PR process, issues, DCO or CLA. Also copy-paste shell blocks |
| https://github.com/godotengine/godot/blob/HEAD/CONTRIBUTING.md | godotengine/godot | Full guide, 1557 words | Sections: tests, style, commits, PR process, issues, help |
| https://github.com/bitcoin/bitcoin/blob/HEAD/CONTRIBUTING.md | bitcoin/bitcoin | Full guide, 3241 words | Sections: setup, commits, PR process, help, DCO or CLA |
| https://github.com/home-assistant/core/blob/HEAD/CONTRIBUTING.md | home-assistant/core | Pointer, 221 words | Short file. Its first link goes to home-assistant.io/ |
| https://github.com/nextcloud/server/blob/HEAD/.github/CONTRIBUTING.md | nextcloud/server | Full guide, 792 words | Sections: tests, style, commits, PR process, issues, DCO or CLA, AI policy, release. Also links security reporting |
| https://github.com/mastodon/mastodon/blob/HEAD/CONTRIBUTING.md | mastodon/mastodon | Full guide, 513 words | Sections: setup, PR process, issues, security, docs. Also links security reporting |
| https://github.com/discourse/discourse/blob/HEAD/CONTRIBUTING.md | discourse/discourse | Pointer, 132 words | Short file. Its first link goes to github.com/discourse/discourse |
| https://github.com/gitlabhq/gitlabhq/blob/HEAD/CONTRIBUTING.md | gitlabhq/gitlabhq | Full guide, 275 words | Sections: help, conduct, DCO or CLA, security. Also links security reporting |
| https://github.com/rubocop/rubocop/blob/HEAD/CONTRIBUTING.md | rubocop/rubocop | Full guide, 751 words | Sections: style, commits, PR process, issues. Also copy-paste shell blocks |
| https://github.com/jekyll/jekyll/blob/HEAD/.github/CONTRIBUTING.markdown | jekyll/jekyll | Full guide, 1333 words | Sections: tests, PR process, issues, help, docs. Also copy-paste shell blocks |
| https://github.com/gohugoio/hugo/blob/HEAD/CONTRIBUTING.md | gohugoio/hugo | Full guide, 1340 words | Sections: setup, style, commits, PR process, issues, help, AI policy. Also copy-paste shell blocks |
| https://github.com/hashicorp/vault/blob/HEAD/CONTRIBUTING.md | hashicorp/vault | Full guide, 1074 words | Sections: setup, commits, PR process, issues, DCO or CLA. Also links security reporting |
| https://github.com/minio/minio/blob/HEAD/CONTRIBUTING.md | minio/minio | Full guide, 419 words | Sections: setup, tests, style, commits, PR process, help. Also copy-paste shell blocks |
| https://github.com/redis/redis/blob/HEAD/CONTRIBUTING.md | redis/redis | Full guide, 1086 words | Sections: PR process, issues, DCO or CLA. Also links security reporting |
| https://github.com/elastic/elasticsearch/blob/HEAD/CONTRIBUTING.md | elastic/elasticsearch | Full guide, 7741 words | Sections: setup, tests, style, PR process, issues, help, DCO or CLA, release, docs. Also copy-paste shell blocks |
| https://github.com/apache/kafka/blob/HEAD/CONTRIBUTING.md | apache/kafka | Pointer, 189 words | Short file. Its first link goes to kafka.apache.org/contributing.html |
| https://github.com/spring-projects/spring-boot/blob/HEAD/CONTRIBUTING.adoc | spring-projects/spring-boot | Full guide, 559 words | Sections: style, issues, conduct, security. Also links security reporting |
| https://github.com/grpc/grpc-go/blob/HEAD/CONTRIBUTING.md | grpc/grpc-go | Full guide, 1284 words | Sections: setup, style, PR process, AI policy |
| https://github.com/cli/cli/blob/HEAD/.github/CONTRIBUTING.md | cli/cli | Full guide, 620 words | Sections: setup, style, PR process. Also links security reporting |
| https://github.com/github/linguist/blob/HEAD/CONTRIBUTING.md | github/linguist | Full guide, 2452 words | Sections: setup, tests. Also copy-paste shell blocks |
| https://github.com/withastro/starlight/blob/HEAD/CONTRIBUTING.md | withastro/starlight | Full guide, 2307 words | Sections: setup, tests, PR process, release, docs. Also copy-paste shell blocks |
| https://github.com/sveltejs/kit/blob/HEAD/CONTRIBUTING.md | sveltejs/kit | Full guide, 1145 words | Sections: tests, style, commits, PR process, issues, security, first issues, release, docs. Also copy-paste shell blocks, links security reporting |
| https://github.com/nuxt/nuxt/blob/HEAD/CONTRIBUTING.md | nuxt/nuxt | Full guide, 365 words | Sections: setup, tests, style, commits, AI policy. Also copy-paste shell blocks |
