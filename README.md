# GitHub skills

Four agent skills for GitHub work. Each is a folder with a `SKILL.md` that Claude Code, Codex, OpenCode and other agents that read Agent Skills can load.

| Skill | What it does |
|---|---|
| [`commit`](commit/SKILL.md) | Writes commits with one logical change, a subject that stands alone, a body that says why, and trailers |
| [`pr-template`](pr-template/SKILL.md) | Writes every pull request in one format: ELI5, before and after, proof, testing, risk and a checklist, with evidence attached |
| [`review-gate`](review-gate/SKILL.md) | Sets a pull request's risk level from its diff and says how much review it needs |
| [`issues-and-releases`](issues-and-releases/SKILL.md) | Files issues a maintainer can act on and cuts releases people can trust |

## Install

Copy or link a skill folder into your agent's skills folder. For Claude Code:

```sh
git clone https://github.com/Jeff-Kazzee/github-skills
cp -r github-skills/pr-template ~/.claude/skills/
```

## Tests

`pr-template` and `review-gate` ship Node scripts with tests:

```sh
node --test pr-template/scripts/pr-body.test.mjs review-gate/scripts/risk-floor.test.mjs
```

## Notes

These skills were written for one person's workflow. Some rules name that owner, for example the GitHub account that `review-gate` trusts. Change those lines for your own setup.

## License

MIT. See [LICENSE](LICENSE).
