# The PR body

Read this when you write or update a body.


Write to a file, with every `{{field}}` filled. Keep every heading. A section
that does not apply says `N/A:` and why, except What Changed, Risk and Review, which every
PR has. Keep each `**Label:**` as written, in prose and not in a table. If the repo has
`.github/pull_request_template.md`, keep its sections and boxes as well, each
in the closest section here.

````markdown
## ELI5

{{Two or three plain sentences: what the user hit, and what happens now. No file names.}}

## What Changed

**Before:** {{the old behavior, concrete enough to reproduce}}

**After:** {{the new behavior, and what deliberately stayed the same}}

**Mechanism:** {{the function and file that changed, and which callers reach it}}

## Why

{{Why this needed doing, and why this approach over the option you rejected.}}

## Linked Issue

{{"Fixes #123", or "None:" and the reason}}

## Visual Proof

{{The setup that makes the captures comparable.}}

| Before | After |
| --- | --- |
| {{before image}} | {{after image}} |

{{What each capture shows, how it was made, and the only difference between them.}}

## Testing

- [ ] I manually tested these changes locally
- [ ] Automated tests added or updated, or explained why not below

{{One line per test file: what it now asserts.}}

{{Exact check command and result, on head `<full 40-character SHA>`.}}

{{Manual run: the OS and what you did.}}

## Risk

**Level:** {{Low, Medium or High}}

**Rationale:** {{What can fail, who is affected, and why this level fits the changed behavior.}}

**Verification:** {{Relevant commands, results, exact head SHA and evidence links. Mark checks not run and missing evidence.}}

**Rollback:** {{One-way or two-way door, then how to back it out, including any saved-data or compatibility limits.}}

**Unresolved concerns:** {{Remaining findings, evidence gaps and the person responsible, or None with the basis for that conclusion.}}

## AI Disclosure

Implemented with {{harness}} ({{model}}). {{Who reviewed it.}}

## Review

- [ ] Upstream boundary: this change copies no upstream source, or the copy is declared here

**Impact:** {{Security, cross-platform (Linux, Windows, Mac), remote SSH, mobile, backwards compatibility, performance. One short clause each: the impact, or why there is none.}}

## Checklist

- [ ] This PR is small and focused
- [ ] I explained what changed and why
- [ ] I stated the risk: what could break, for whom, and how to back it out
- [ ] Evidence is attached, or N/A with a reason
- [ ] Self-reviewed for correctness, security and performance
- [ ] Cross-platform, SSH and path impact considered, or N/A
- [ ] The repo's lint, typecheck, test and build pass, or CI will cover them

{{Attribution line}}

Task: {{task id or none}}
````

- **Proof without pictures.** Change the heading to `## Proof` and replace the
  table with before and after fenced output.
- **Boxes.** An `[x]` is a claim you can back with something from this session.
  Check `I manually tested` only when you ran the change yourself. Leave any
  other box empty and write why on the line below it.
- **AI Disclosure.** Name who actually reviewed it: a verifier session and its
  receipt, or "not yet reviewed by a person". Name each subagent that wrote part of
  the change, by the model the harness reports. When the model is unknown, name the
  harness and say so. Never guess.
- **Attribution line.** Use the line your harness gives you. Claude Code gives
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Others write
  `Created with <model> in <harness>.`
- **Last line.** `Task: <id>` closes the body, after the attribution.
- **Links.** Link the issue, dashboard or design document when it helps the reviewer
  and the reader is allowed to see it.
- **Hill climb.** When the work went through `hill-climb`, put its round table and
  completion record in Testing.
- **Risk.** Propose the level from the `review-gate` skill's table. Explain it in
  Rationale using the failure impact, who is affected and any evidence gaps. Missing
  evidence is not evidence of low risk.
