# GitHub skills

Seven agent skills for GitHub work. Each is a folder with a `SKILL.md` that Claude Code, Codex, OpenCode and other agents that read Agent Skills can load.

| Skill | What it does |
|---|---|
| [`commit`](commit/SKILL.md) | Writes commits and merge messages with one logical change, a subject that stands alone, a body that says why, and trailers |
| [`pr-template`](pr-template/SKILL.md) | Writes every pull request in one format: ELI5, before and after, proof, testing, risk and a checklist, with evidence attached |
| [`review-gate`](review-gate/SKILL.md) | Sets a pull request's risk level from its diff and says how much review it needs |
| [`issues-and-releases`](issues-and-releases/SKILL.md) | Files issues a maintainer can act on, writes issue comments, and cuts releases people can trust |
| [`readme`](readme/SKILL.md) | Writes or rewrites a repository README that shows the project on its first screen and proves every claim |
| [`contributing`](contributing/SKILL.md) | Writes a CONTRIBUTING.md that takes a first-time contributor from a fresh clone to a merged PR |
| [`babysit-pr`](babysit-pr/SKILL.md) | Watches your PR through CI and review, fixes failing checks, and answers each review thread |

## Install

Copy or link a skill folder into your agent's skills folder. For Claude Code:

```sh
git clone https://github.com/Jeff-Kazzee/github-skills
cp -r github-skills/pr-template ~/.claude/skills/
```

## Tests

`contributing`, `pr-template`, `readme` and `review-gate` ship Node scripts with tests. Run them all from the repo root:

```sh
node --test contributing/scripts/contributing-check.test.mjs \
  pr-template/scripts/pr-body.test.mjs \
  readme/scripts/image-check.test.mjs \
  readme/scripts/readme-check.test.mjs \
  review-gate/scripts/risk-floor.test.mjs
```

`babysit-pr` ships `pr-wait`, a Python watcher with no test suite. Check it compiles with `python -m py_compile babysit-pr/scripts/pr-wait babysit-pr/scripts/pr-wait-win.py`.

## Notes

These skills were written for one person's workflow. Some rules name that owner, for example the GitHub account that `review-gate` trusts. Change those lines for your own setup.

## License

MIT. See [LICENSE](LICENSE).
