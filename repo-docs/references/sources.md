# Sources

Last verified: 2026-11-07. Every row below was opened or pulled in this session on that date.

## Rules

| Source | What this skill takes |
|---|---|
| [Diataxis, start here](https://diataxis.fr/start-here/) | Four page types, kept apart. Blurring them causes most docs problems |
| [Diataxis, tutorials](https://diataxis.fr/tutorials/) | Show the destination, visible results each step, say what the learner sees, minimal explanation, no alternatives |
| [Diataxis, how-to guides](https://diataxis.fr/how-to-guides/) | Title states the goal, assumes competence, action only, link out for background and full options |
| [Diataxis, reference](https://diataxis.fr/reference/) | Describe only, mirror the product's structure, standard patterns, short examples |
| [Diataxis, explanation](https://diataxis.fr/explanation/) | Context and why, opinion allowed, bounded by a why question, the "About" title test |
| [Diataxis, how to use it](https://diataxis.fr/how-to-use-diataxis/) | Do not create empty structures. Structure grows from the content |
| [GitHub Docs, content model](https://docs.github.com/en/contributing/style-guide-and-content-model/about-the-content-model) | Order inside a section: conceptual, referential, procedural, troubleshooting. Split categories past ten articles. One-sentence intros |
| [GitHub Docs, about wikis](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis) | Write access edits by default. Search engines index only wikis with 500+ stars and locked editing. Soft limit of 5,000 files |
| [GitHub Docs, wiki footer and sidebar](https://docs.github.com/en/communities/documenting-your-project-with-wikis/creating-a-footer-or-sidebar-for-your-wiki) | `_Sidebar` and `_Footer` files fill the sidebar and footer |
| [GitHub Docs, editing wiki content](https://docs.github.com/en/communities/documenting-your-project-with-wikis/editing-wiki-content) | Wiki link syntax. Verified against real wikis below: `[[Text\|Page]]` puts the text first, and `Page Name` maps to `Page-Name.md` (a raw fetch of `Iteration-Plans.md` returned 200, `Iteration%20Plans.md` 404) |
| [Write the Docs, principles](https://www.writethedocs.org/guide/writing/docs-principles/) | Nearby (docs beside the code), Unique (no overlap between sources), Discoverable, Addressable, Cumulative (prerequisites first), Current |
| [Write the Docs, beginner's guide](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/) | FAQs "quickly outgrow their use", so answers move into pages |
| [Write the Docs, docs as code](https://www.writethedocs.org/guide/docs-as-code/) | Docs in version control, code review and automated tests |
| [Google style, headings](https://developers.google.com/style/headings) | Sentence case, task headings as bare verbs, concept headings as noun phrases, one h1, no skipped levels |
| [Google style, cross-references](https://developers.google.com/style/cross-references) | Descriptive link text, never "click here" or a URL, link to the most relevant heading |
| [Good Docs Project templates](https://gitlab.com/tgdp/templates) | Template set (tutorial, how-to, concept, reference, troubleshooting, changelog and more). Shapes: how-to is Overview, Before you start, Task, See also. Troubleshooting is Symptom, Cause, Solution |
| [Nygard, Documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | Title, Context, Decision ("We will"), Status, Consequences. Sequential numbers never reused. Superseded records stay |
| [MADR template](https://raw.githubusercontent.com/adr/madr/develop/template/adr-template.md) | Optional sections: Decision drivers, Considered options, Pros and cons. `status` and `date` metadata |
| [adr.github.io](https://adr.github.io/) | An ADR records one decision and its rationale. The set is the decision log |
| [matklad, ARCHITECTURE.md](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html) | Root file beside README. Bird's eye view, code map, invariants, boundaries, cross-cutting concerns. Short, revisited a few times a year |
| [arc42](https://docs.arc42.org/home/) | The 12-section architecture outline, used here only as a heavier alternative |
| [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) | `CHANGELOG.md`, newest first, `Unreleased` on top, ISO dates, linked version headings |
| Jeff's Writing law (`~/AGENTS.md`) | House rule: a claim in documentation carries a source or a verified date. The sample shows only 5% of pages do this, so the verified line is a house rule, not observed practice |
| Jeff's Approval law (`~/AGENTS.md`) | House rule: publishing waits for Jeff, so a direct push to a public wiki waits for his approval |
| Jeff's Wiki law (`~/AGENTS.md`) | House rule: a project keeps plans, decisions and research in its own `wiki/` folder |
| `readme` skill | House rule: architecture goes in a root `ARCHITECTURE.md` with one link from the README |
| `domain-modeling` skill | House rule: when a decision earns a record, and where records live |
| `issues-and-releases` skill | House rule: release note groups (Action required, Features, Fixes) used by the changelog template |

## Measured

Method: `gh api repos/<o>/<r>/git/trees/HEAD:<docs path>?recursive=1` for 56 targets (54
answered, trpc/trpc and prometheus/docs returned 404). Pages are `.md`, `.mdx`, `.rst`
and `.adoc` files (plus `.txt` for Django). Then up to two pages per path-classified type
per repo, fetched from `raw.githubusercontent.com`: 495 pages from 50 docs folders.
Wikis: `Home.md`, `_Sidebar.md` and `_Footer.md` fetched for 40 repos. ADRs: all 48
numbered records in backstage, madr and adr-tools. Nav files were looked for inside the
docs path only, so config such as `astro.config.mjs` or `sidebars.js` at the repo root
was not counted.

| Measure | Result |
|---|---|
| Docs folders with an index page at the root | 34 of 50 (68%): `index.md` 13, `README.md` 10, `index.mdx` 5, `_index.md` 4, `SUMMARY.md` 3, other 5 |
| The 16 without one | All built by a site generator with nav in config (Astro, ESLint, Supabase, Playwright, Cypress and others) |
| Reading order set by numbered file names | 6 of 50 (12%): Svelte, Next.js, Rust book (`chNN-NN`), Astro tutorial, Go `doc/initial`, Backstage architecture. All zero-padded to two digits except Go and the Astro tutorial |
| Reading order set by a frontmatter key (`weight`, `order`, `sidebar_position`) | 7 of 50 (14%) |
| Nav file inside the docs path (`SUMMARY.md`, `nav.yaml`, `_category_.json`, `docs.json`) | 10 of 50 (20%) |
| File names in lowercase kebab case | Median 89% of pages per repo |
| Median pages per docs folder | 181. Median path depth 2 |
| Repos with at least one page of each type (path-classified) | Reference 40, tutorial 37, troubleshooting 30, explanation 28, architecture 28, how-to 27, changelog 20, FAQ 19 |
| Median words per type (path-classified, 495 pages) | Tutorial 574, how-to 555, explanation 543, architecture 606, reference 387, troubleshooting 415, FAQ 1,203, changelog 935 |
| Median words per decision record | 160 (48 records). Backstage 188, madr 138, adr-tools 160 |
| Decision record sections | Context, Decision, Consequences in 21 to 22 of 48 (Nygard form). MADR sections (Context and problem statement, Considered options, Decision outcome) in 19 |
| Decision record names | 32 of 48 use `NNNN-title.md` (madr, adr-tools). Backstage uses `adrNNN-title.md` |
| Sampled pages with a title (h1 or frontmatter `title`) | 93%. Frontmatter `title` used in 32 of 50 repos, `description` in 23 |
| Sampled pages with a freshness line | 26 of 495 (5%), in 4 of 50 repos: Deno `last_modified`, Grafana `review_date`, HashiCorp `last_modified`, Homebrew `last_review_date` (96 of 97 pages in its tree) |
| Top tutorial h2 headings | Prerequisites 8, Next steps 6, What's next 3 |
| Wikis with a Home page | 26 of 40 probed. Median Home 92 words |
| Wikis with `_Sidebar` / `_Footer` | 10 of 26 (8 with links) / 7 of 26 |
| Wiki Homes that send readers elsewhere | 5 of 26 (Neovim, Git for Windows, Windows Terminal, Hyprland, Syncthing). 3 more are empty welcome pages |
| GitHub link resolution | `github.com/rust-lang/book/blob/HEAD/src/ch01-01-installation` returns 404, the same path with `.md` returns 200. So a bare name breaks on GitHub, and only `--site` accepts it |
| `docs-check.mjs` on real trees | Rust book (112 pages) and Homebrew docs (97 pages) downloaded raw, `.md` files only. Default mode: 223 and 114 broken links, mostly `.html` and root-relative site links. With `--site`: 29 and 5, all images the download skipped plus one Liquid `{{ }}` tag. Semicolons and dashes are the bulk of the rest, as expected for projects without this law |

## Examples

Docs trees and wikis: one row per target, facts computed from the pull above. Pages and
templates: read individually. The VS Code and yt-dlp wikis appear twice, so the table
holds 110 distinct examples. The Rules table holds the 22 guidance pages.

| URL | Project | Kind | What it teaches |
|---|---|---|---|
| [kubernetes/website/content/en/docs](https://github.com/kubernetes/website/tree/HEAD/content/en/docs) | website | docs folder | 1722 pages. Index: _index.md. Order: frontmatter order key. |
| [rust-lang/book/src](https://github.com/rust-lang/book/tree/HEAD/src) | book | docs folder | 112 pages. Index: SUMMARY.md. Order: numbered names, nav file SUMMARY.md. |
| [golang/wiki](https://github.com/golang/wiki/tree/HEAD/) | wiki | docs folder | 167 pages. Index: Home.md, index.md. Order: nav file nav.yaml. |
| [nodejs/node/doc](https://github.com/nodejs/node/tree/HEAD/doc) | node | docs folder | 158 pages. Index: README.md. Order: config outside the docs path. |
| [python/devguide](https://github.com/python/devguide/tree/HEAD/) | devguide | docs folder | 67 pages. Index: README.rst, index.rst. Order: config outside the docs path. |
| [django/django/docs](https://github.com/django/django/tree/HEAD/docs) | django | docs folder | 681 pages. Index: README.rst, contents.txt, index.txt. Order: config outside the docs path. |
| [withastro/docs/src/content/docs/en](https://github.com/withastro/docs/tree/HEAD/src/content/docs/en) | docs | docs folder | 426 pages. Index: none at the root. Order: numbered names. |
| [vitejs/vite/docs](https://github.com/vitejs/vite/tree/HEAD/docs) | vite | docs folder | 57 pages. Index: index.md. Order: config outside the docs path. |
| [prettier/prettier/docs](https://github.com/prettier/prettier/tree/HEAD/docs) | prettier | docs folder | 24 pages. Index: index.md. Order: config outside the docs path. |
| [eslint/eslint/docs/src](https://github.com/eslint/eslint/tree/HEAD/docs/src) | eslint | docs folder | 408 pages. Index: none at the root. Order: nav file navigation.json. |
| [tailwindlabs/tailwindcss.com/src/docs](https://github.com/tailwindlabs/tailwindcss.com/tree/HEAD/src/docs) | tailwindcss.com | docs folder | 197 pages. Index: none at the root. Order: config outside the docs path. |
| [denoland/docs](https://github.com/denoland/docs/tree/HEAD/) | docs | docs folder | 460 pages. Index: README.md. Order: nav file _category_.json. |
| [oven-sh/bun/docs](https://github.com/oven-sh/bun/tree/HEAD/docs) | bun | docs folder | 1407 pages. Index: README.md, index.mdx. Order: nav file docs.json. |
| [supabase/supabase/apps/docs/content](https://github.com/supabase/supabase/tree/HEAD/apps/docs/content) | supabase | docs folder | 654 pages. Index: none at the root. Order: config outside the docs path. |
| [grafana/grafana/docs/sources](https://github.com/grafana/grafana/tree/HEAD/docs/sources) | grafana | docs folder | 773 pages. Index: _index.md. Order: frontmatter order key. |
| [hashicorp/web-unified-docs/content/terraform](https://github.com/hashicorp/web-unified-docs/tree/HEAD/content/terraform) | web-unified-docs | docs folder | 5670 pages. Index: none at the root. Order: config outside the docs path. |
| [github/docs/content](https://github.com/github/docs/tree/HEAD/content) | docs | docs folder | 3802 pages. Index: README.md, index.md. Order: config outside the docs path. |
| [Homebrew/brew/docs](https://github.com/Homebrew/brew/tree/HEAD/docs) | brew | docs folder | 97 pages. Index: README.md, index.md. Order: config outside the docs path. |
| [vercel/next.js/docs](https://github.com/vercel/next.js/tree/HEAD/docs) | next.js | docs folder | 479 pages. Index: index.mdx. Order: numbered names. |
| [sveltejs/svelte/documentation/docs](https://github.com/sveltejs/svelte/tree/HEAD/documentation/docs) | svelte | docs folder | 106 pages. Index: index.md. Order: numbered names. |
| [vuejs/docs/src](https://github.com/vuejs/docs/tree/HEAD/src) | docs | docs folder | 119 pages. Index: index.md. Order: config outside the docs path. |
| [electron/electron/docs](https://github.com/electron/electron/tree/HEAD/docs) | electron | docs folder | 303 pages. Index: README.md. Order: config outside the docs path. |
| [curl/curl/docs](https://github.com/curl/curl/tree/HEAD/docs) | curl | docs folder | 910 pages. Index: README.md. Order: config outside the docs path. |
| [rust-lang/rustc-dev-guide/src](https://github.com/rust-lang/rustc-dev-guide/tree/HEAD/src) | rustc-dev-guide | docs folder | 251 pages. Index: SUMMARY.md, overview.md. Order: nav file SUMMARY.md. |
| [rails/rails/guides/source](https://github.com/rails/rails/tree/HEAD/guides/source) | rails | docs folder | 76 pages. Index: none at the root. Order: config outside the docs path. |
| [microsoft/TypeScript-Website/packages/documentation/copy/en](https://github.com/microsoft/TypeScript-Website/tree/HEAD/packages/documentation/copy/en) | TypeScript-Website | docs folder | 133 pages. Index: none at the root. Order: config outside the docs path. |
| [astral-sh/uv/docs](https://github.com/astral-sh/uv/tree/HEAD/docs) | uv | docs folder | 81 pages. Index: index.md. Order: config outside the docs path. |
| [astral-sh/ruff/docs](https://github.com/astral-sh/ruff/tree/HEAD/docs) | ruff | docs folder | 16 pages. Index: none at the root. Order: config outside the docs path. |
| [fastapi/fastapi/docs/en/docs](https://github.com/fastapi/fastapi/tree/HEAD/docs/en/docs) | fastapi | docs folder | 158 pages. Index: index.md. Order: config outside the docs path. |
| [backstage/backstage/docs](https://github.com/backstage/backstage/tree/HEAD/docs) | backstage | docs folder | 757 pages. Index: none at the root. Order: numbered names. |
| [kubernetes/community/contributors/guide](https://github.com/kubernetes/community/tree/HEAD/contributors/guide) | community | docs folder | 29 pages. Index: README.md. Order: frontmatter order key. |
| [reactjs/react.dev/src/content](https://github.com/reactjs/react.dev/tree/HEAD/src/content) | react.dev | docs folder | 226 pages. Index: index.md. Order: config outside the docs path. |
| [pnpm/pnpm.io/docs](https://github.com/pnpm/pnpm.io/tree/HEAD/docs) | pnpm.io | docs folder | 161 pages. Index: none at the root. Order: config outside the docs path. |
| [cli/cli/docs](https://github.com/cli/cli/tree/HEAD/docs) | cli | docs folder | 27 pages. Index: README.md. Order: config outside the docs path. |
| [golang/go/doc](https://github.com/golang/go/tree/HEAD/doc) | go | docs folder | 46 pages. Index: README.md. Order: numbered names. |
| [docker/docs/content](https://github.com/docker/docs/tree/HEAD/content) | docs | docs folder | 1112 pages. Index: _index.md. Order: frontmatter order key. |
| [microsoft/vscode-docs/docs](https://github.com/microsoft/vscode-docs/tree/HEAD/docs) | vscode-docs | docs folder | 370 pages. Index: none at the root. Order: config outside the docs path. |
| [open-telemetry/opentelemetry.io/content/en/docs](https://github.com/open-telemetry/opentelemetry.io/tree/HEAD/content/en/docs) | opentelemetry.io | docs folder | 447 pages. Index: _index.md. Order: frontmatter order key. |
| [helm/helm-www/docs](https://github.com/helm/helm-www/tree/HEAD/docs) | helm-www | docs folder | 127 pages. Index: index.mdx, overview.md. Order: frontmatter order key, nav file _category_.json. |
| [tauri-apps/tauri-docs/src/content/docs](https://github.com/tauri-apps/tauri-docs/tree/HEAD/src/content/docs) | tauri-docs | docs folder | 431 pages. Index: index.mdx. Order: config outside the docs path. |
| [storybookjs/storybook/docs](https://github.com/storybookjs/storybook/tree/HEAD/docs) | storybook | docs folder | 871 pages. Index: index.mdx. Order: config outside the docs path. |
| [jestjs/jest/docs](https://github.com/jestjs/jest/tree/HEAD/docs) | jest | docs folder | 38 pages. Index: none at the root. Order: config outside the docs path. |
| [pydantic/pydantic/docs](https://github.com/pydantic/pydantic/tree/HEAD/docs) | pydantic | docs folder | 91 pages. Index: index.md. Order: config outside the docs path. |
| [kubernetes-sigs/kind/site/content/docs](https://github.com/kubernetes-sigs/kind/tree/HEAD/site/content/docs) | kind | docs folder | 20 pages. Index: none at the root. Order: config outside the docs path. |
| [argoproj/argo-cd/docs](https://github.com/argoproj/argo-cd/tree/HEAD/docs) | argo-cd | docs folder | 462 pages. Index: index.md. Order: config outside the docs path. |
| [microsoft/playwright/docs/src](https://github.com/microsoft/playwright/tree/HEAD/docs/src) | playwright | docs folder | 181 pages. Index: none at the root. Order: config outside the docs path. |
| [mermaid-js/mermaid/packages/mermaid/src/docs](https://github.com/mermaid-js/mermaid/tree/HEAD/packages/mermaid/src/docs) | mermaid | docs folder | 67 pages. Index: index.md. Order: config outside the docs path. |
| [cypress-io/cypress-documentation/docs](https://github.com/cypress-io/cypress-documentation/tree/HEAD/docs) | cypress-documentation | docs folder | 396 pages. Index: none at the root. Order: frontmatter order key, nav file _category_.json. |
| [joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record/tree/HEAD/) | architecture-decision-record | decision records | 23490 pages. Index: README.md. Order: config outside the docs path. |
| [adr/madr/docs](https://github.com/adr/madr/tree/HEAD/docs) | madr | decision records | 25 pages. Index: README.md, index.md. Order: frontmatter order key. |
| [npryce/adr-tools/doc](https://github.com/npryce/adr-tools/tree/HEAD/doc) | adr-tools | decision records | 9 pages. Index: none at the root. Order: config outside the docs path. |
| [arc42/arc42-template/EN](https://github.com/arc42/arc42-template/tree/HEAD/EN) | arc42-template | decision records | 15 pages. Index: none at the root. Order: config outside the docs path. |
| [zed-industries/zed/docs/src](https://github.com/zed-industries/zed/tree/HEAD/docs/src) | zed | docs folder | 199 pages. Index: SUMMARY.md. Order: nav file SUMMARY.md. |
| [biomejs/website/src/content/docs](https://github.com/biomejs/website/tree/HEAD/src/content/docs) | website | docs folder | 1146 pages. Index: none at the root. Order: config outside the docs path. |
| [wiki](https://github.com/microsoft/vscode/wiki) | vscode | wiki | Home 87 words. _Sidebar yes. _Footer yes. |
| [wiki](https://github.com/microsoft/TypeScript/wiki) | TypeScript | wiki | Home 91 words. _Sidebar yes. _Footer yes. |
| [wiki](https://github.com/neovim/neovim/wiki) | neovim | wiki | Home 25 words. No _Sidebar. _Footer yes. |
| [wiki](https://github.com/junegunn/fzf/wiki) | fzf | wiki | Home 120 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/ohmyzsh/ohmyzsh/wiki) | ohmyzsh | wiki | Home 459 words. _Sidebar yes. _Footer yes. |
| [wiki](https://github.com/pyenv/pyenv/wiki) | pyenv | wiki | Home 1514 words. _Sidebar yes. No _Footer. |
| [wiki](https://github.com/tmux/tmux/wiki) | tmux | wiki | Home 115 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/git-for-windows/git/wiki) | git | wiki | Home 11 words. No _Sidebar. _Footer yes. |
| [wiki](https://github.com/obsproject/obs-studio/wiki) | obs-studio | wiki | Home 111 words. _Sidebar yes. No _Footer. |
| [wiki](https://github.com/nim-lang/Nim/wiki) | Nim | wiki | Home 448 words. _Sidebar yes. _Footer yes. |
| [wiki](https://github.com/swaywm/sway/wiki) | sway | wiki | Home 5874 words. _Sidebar yes. No _Footer. |
| [wiki](https://github.com/termux/termux-app/wiki) | termux-app | wiki | Home 5 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/koekeishiya/yabai/wiki) | yabai | wiki | Home 822 words. _Sidebar yes. _Footer yes. |
| [wiki](https://github.com/microsoft/terminal/wiki) | terminal | wiki | Home 23 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/yt-dlp/yt-dlp/wiki) | yt-dlp | wiki | Home 32 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/neoclide/coc.nvim/wiki) | coc.nvim | wiki | Home 150 words. _Sidebar yes. No _Footer. |
| [wiki](https://github.com/jesseduffield/lazygit/wiki) | lazygit | wiki | Home 54 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/alacritty/alacritty/wiki) | alacritty | wiki | Home 0 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/hyprwm/Hyprland/wiki) | Hyprland | wiki | Home 9 words. _Sidebar yes. No _Footer. |
| [wiki](https://github.com/zsh-users/zsh-autosuggestions/wiki) | zsh-autosuggestions | wiki | Home 5 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/tldr-pages/tldr/wiki) | tldr | wiki | Home 433 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/syncthing/syncthing/wiki) | syncthing | wiki | Home 21 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/mpv-player/mpv/wiki) | mpv | wiki | Home 139 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/ranger/ranger/wiki) | ranger | wiki | Home 117 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/dense-analysis/ale/wiki) | ale | wiki | Home 170 words. No _Sidebar. No _Footer. |
| [wiki](https://github.com/vim/vim/wiki) | vim | wiki | Home 55 words. No _Sidebar. No _Footer. || [Kubernetes basics tutorial](https://github.com/kubernetes/website/blob/HEAD/content/en/docs/tutorials/kubernetes-basics/_index.md) | Kubernetes | tutorial | Objectives first, modules in order, "What's next" at the end |
| [Rust book, hash maps](https://github.com/rust-lang/book/blob/HEAD/src/ch08-03-hash-maps.md) | Rust | tutorial | A numbered chapter that ends in a Summary and leads to the next chapter |
| [Docker, what is Compose](https://github.com/docker/docs/blob/HEAD/content/get-started/docker-concepts/the-basics/what-is-docker-compose.md) | Docker | tutorial | Explanation, then "Try it out", then additional resources, kept as separate sections |
| [Vue, class and style bindings](https://github.com/vuejs/docs/blob/HEAD/src/guide/essentials/class-and-style.md) | Vue | how-to | Custom `{#id}` anchors on every heading, so links survive heading edits |
| [Supabase, full text search](https://github.com/supabase/supabase/blob/HEAD/apps/docs/content/guides/database/full-text-search.mdx) | Supabase | how-to | Preparation, then usage, basic queries before advanced ones |
| [GitHub Docs, manage code scanning alerts](https://github.com/github/docs/blob/HEAD/content/code-security/how-tos/manage-security-alerts/manage-code-scanning-alerts/index.md) | GitHub | index | A 59-word map-topic index that only lists its child articles |
| [Next.js, agentFeedback config](https://github.com/vercel/next.js/blob/HEAD/docs/01-app/03-api-reference/05-config/01-next-config-js/agentFeedback.mdx) | Next.js | reference | Numbered folders set order. Ends in a Version History table |
| [Kubernetes feature gate page](https://github.com/kubernetes/website/blob/HEAD/content/en/docs/reference/command-line-tools-reference/feature-gates/SchedulerAsyncAPICalls.md) | Kubernetes | reference | A 47-word reference entry, one page per feature gate |
| [Kubernetes, device taints](https://github.com/kubernetes/website/blob/HEAD/content/en/docs/concepts/resource-management/dynamic-resource-allocation/device-taints.md) | Kubernetes | explanation | Concepts live under `concepts/`, apart from tasks and reference |
| [uv, caching concept](https://github.com/astral-sh/uv/blob/HEAD/docs/concepts/cache.md) | uv | explanation | One bounded topic with sections for safety, clearing and CI |
| [Pydantic, JSON concept](https://github.com/pydantic/pydantic/blob/HEAD/docs/concepts/json.md) | Pydantic | explanation | One concept per page under `concepts/`, split into parsing and serialization |
| [Grafana, MSSQL troubleshooting](https://github.com/grafana/grafana/blob/HEAD/docs/sources/datasources/mssql/troubleshooting/index.md) | Grafana | troubleshooting | Symptoms grouped by area (configuration, connection, authentication, query). `review_date` frontmatter |
| [Electron, debugging with a symbol server](https://github.com/electron/electron/blob/HEAD/docs/development/debugging-with-symbol-server.md) | Electron | troubleshooting | Ends with a symptom heading: "Symbols will not load" |
| [rustc dev guide, debugging bootstrap](https://github.com/rust-lang/rustc-dev-guide/blob/HEAD/src/building/bootstrapping/debugging-bootstrap.md) | Rust | troubleshooting | Debugging techniques as headings, one per tool |
| [Homebrew FAQ](https://github.com/Homebrew/brew/blob/HEAD/docs/FAQ.md) | Homebrew | FAQ | Each heading is a question as a user asks it. `last_review_date` frontmatter |
| [Vue FAQ](https://github.com/vuejs/docs/blob/HEAD/src/about/faq.md) | Vue | FAQ | Questions as headings, each with a custom `{#id}` anchor |
| [Deno Deploy changelog](https://github.com/denoland/docs/blob/HEAD/deploy/changelog.md) | Deno | changelog | Newest first, one dated heading per release, `last_modified` frontmatter |
| [Docker Engine 17.06 release notes](https://github.com/docker/docs/blob/HEAD/content/manuals/engine/release-notes/17.06.md) | Docker | changelog | One page per minor line, patch releases as headings |
| [Backstage ADR template](https://github.com/backstage/backstage/blob/HEAD/docs/architecture-decisions/adr000-template.md) | Backstage | decision record | Record number 000 is the template itself |
| [madr ADR 0000](https://github.com/adr/madr/blob/HEAD/docs/decisions/0000-use-markdown-architectural-decision-records.md) | MADR | decision record | Four-digit names, the first record adopts the format |
| [adr-tools ADR 0001](https://github.com/npryce/adr-tools/blob/HEAD/doc/adr/0001-record-architecture-decisions.md) | adr-tools | decision record | Nygard form: Status, Context, Decision, Consequences, at about 160 words |
| [rust-analyzer architecture](https://github.com/rust-lang/rust-analyzer/blob/HEAD/docs/book/src/contributing/architecture.md) | rust-analyzer | architecture | Bird's eye view, entry points, then a code map with one heading per crate |
| [jj architecture](https://github.com/jj-vcs/jj/blob/HEAD/docs/technical/architecture.md) | Jujutsu | architecture | Data model first, then the library and UI boundary |
| [Tauri ARCHITECTURE.md](https://github.com/tauri-apps/tauri/blob/HEAD/ARCHITECTURE.md) | Tauri | architecture | A root file with a "What Tauri is NOT" section, an invariant stated as an absence |
| [Helix architecture](https://github.com/helix-editor/helix/blob/HEAD/docs/architecture.md) | Helix | architecture | One section per crate, short |
| [VS Code wiki sidebar](https://github.com/microsoft/vscode/wiki) | VS Code | wiki | Bold group labels with nested `[[Page]]` links. The footer sends edits to a mirror repo by PR |
| [yt-dlp wiki](https://github.com/yt-dlp/yt-dlp/wiki) | yt-dlp | wiki | Home says changes go through PRs to a separate wiki repo |
| [Good Docs troubleshooting template](https://gitlab.com/tgdp/templates/-/blob/main/troubleshooting/template_troubleshooting.md) | Good Docs | template | Symptom, cause, solution, and "for more information" |
| [Good Docs how-to template](https://gitlab.com/tgdp/templates/-/blob/main/how-to/template_how-to.md) | Good Docs | template | Overview, Before you start, numbered task steps, See also |
| [Good Docs tutorial template](https://gitlab.com/tgdp/templates/-/blob/main/tutorial/template_tutorial.md) | Good Docs | template | Overview, Before you start, task, Summary, Next steps |
| [Good Docs concept template](https://gitlab.com/tgdp/templates/-/blob/main/concept/template_concept.md) | Good Docs | template | Background, use cases, comparison, related resources |
| [Good Docs reference template](https://gitlab.com/tgdp/templates/-/blob/main/reference/template_reference.md) | Good Docs | template | A description, then structured tables, then commands |

