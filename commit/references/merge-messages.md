# Merge messages

Fill-in templates for the text that lands on a base branch. Each one is shaped from the
examples in [sources.md](sources.md#merge-messages). Replace every `{{field}}`, and delete
a line whose field does not apply.

Before you use a template, count the parents of the commit you are writing or undoing:

```sh
git rev-list --parents -n 1 <sha>
```

One SHA after the commit means one parent (a squash). Two mean a merge commit.

## Rules for every merge message

- Replace GitHub's prefilled text. Depending on repository settings, it is the PR title
  alone, the list of branch commits, or the PR body with its template comments. In the
  sample, 282 of 635 squash commits landed with no prose, 81 landed with a commit list,
  and 27 kept PR template comments such as `<!-- Thank you for ... -->`.
- Write the why into the commit, not only into the PR. The three GitHub release merges
  in the sample (pi-hole, Pi-hole FTL, Home Assistant) landed with a version number as
  the whole message. Two of them kept their release notes in the PR body only. Rust's
  four stable merges, made by bors, carry the release bullets in the commit.
- End with one trailer block. Git reads only the last block, so put no trailer lines in
  the body text.
- Drop `Signed-off-by:` unless a human adds it.

## 1. Squash a task PR into dev

The subject is the PR title plus its number. Write the PR title by the subject rules in
`SKILL.md` section 3, because it becomes the subject.

### Through `agent-git land`

The tool sets the subject to `{{PR title}} (#{{PR}})` and appends the whole trailer
block. Pass only the body as `--message`, with no trailer lines in it. A trailer line in
`--message` leaves a dead block above the real one. That includes `Co-authored-by:`,
so `land` cannot credit a co-author today. Name the co-author in the PR body instead.

```text
{{What is wrong now, who hits it, and the visible effect.}}

{{Why this approach fixes it. Name the alternative you rejected, if there was one.}}

{{The limits: what you left alone, what is untested, the cost you accepted.
Or: No behavior change.}}
```

### By hand, with `gh pr merge`

Use this only where `agent-git land` cannot run. Pass the subject with `--subject` and
the rest with `--body`, and pin the head with `--match-head-commit`. Here you write the
whole block, so keep a `Co-authored-by:` line for each person who wrote code on the
branch.

```text
{{Imperative effect, 50 to 72 characters}} (#{{PR}})

{{The problem, as above.}}

{{The fix, as above.}}

{{The limits, as above.}}

Task: {{task id}}
Agent: {{builder role}}
Agent-Session: {{builder runtime}}:{{builder session id}}
Landed-by: {{lander role}} ({{runtime}}:{{session id}})
Verified-by: {{verifier role}} ({{runtime}}:{{session id}}) receipt {{receipt id}}
Approved-by: Jeff ({{where and how he approved}}, recorded {{UTC time}})
Co-authored-by: {{name}} <{{noreply address}}>
```

`agent-git land` writes `Approved-by:` after `Verified-by:`, so the hand-written block
does the same.

## 2. Promote dev to prod

`agent-git promote` sets the subject to `Promote dev to {{prod or main}} (#{{PR}})`,
merges with a merge commit, and appends the trailers. Pass the release summary as
`--message`. List what ships with:

```sh
git log --first-parent --no-merges --format='%h %s' origin/prod..origin/dev
```

dev holds squashed task PRs plus one sync merge per release. `--no-merges` drops the
sync merge, so each line left is one task PR.

```text
Ships {{N}} task PRs merged into dev since {{prod SHA, 12 characters}}
("{{subject of the current prod head}}"). {{One or two sentences: what a
user sees change, and why it ships now.}}

Changes:

- {{effect a user sees}} (#{{PR}})
- {{effect a user sees}} (#{{PR}})

Fixes of note:

- {{bug, who hit it, and the effect}} (#{{PR}})

Held back: {{work on dev that is not in this release, and why. Or: Nothing.}}

Risk: {{what could break on deploy, and how to roll back. Or: None known.}}
```

Group the bullets by what a user sees, not by PR order. Leave out internal refactors and
dependency bumps unless they change behavior. When you promote by hand, add the trailer
block from section 1 after the summary, with `Task: none` and `Verified-by: CI, {{CI
result on the dev head}}`.

## 3. Sync prod back into dev

`agent-git promote` does this itself. It sets the subject to
`Sync {{prod or main}} into dev after promotion (#{{PR}})` and passes only the trailers.
Use this template only when you finish a failed sync by hand.

```text
Sync {{prod or main}} into dev after promotion (#{{PR}})

Brings promotion merge {{merge SHA, 12 characters}} ("Promote dev to
{{prod or main}} (#{{promotion PR}})") back into dev, so both branches
hold the same tree. {{Why it is done by hand: what failed in the
automatic sync.}} No other change.

{{trailer block from section 2}}
```

## 4. Revert

Undo a change with a new commit through a task PR. Never rewrite `prod`, `main` or `dev`.

### A squash commit (one parent)

On a task branch cut from `origin/dev`:

```sh
git revert <sha>
```

```text
Revert "{{original subject}}"

This reverts commit {{full 40-character SHA}}.

{{What broke: the failure, who sees it, and the evidence, such as a
failing command, a log line or an issue.}}

{{How the change comes back: what must be fixed first. Re-land it by
reverting this revert.}}
```

### A merge commit (two parents)

`-m 1` keeps parent 1, the branch you merged into, and drops what the merge brought in:

```sh
git revert -m 1 <merge sha>
```

```text
Revert "{{original merge subject}}"

This reverts commit {{merge SHA}}, reversing
changes made to {{parent 1 SHA}}.

{{What broke and the evidence, as above.}}

{{Optional: the reverted commits, one per line, as
12-character SHA ("subject").}}

{{How the change comes back, as above.}}
```

Git still treats the reverted branch as merged. A later merge of the same branch brings
in only commits added after the revert. To bring the whole change back, revert this
revert.

In the dev and prod model, prod changes only through a promotion. To pull a bad change
out of prod, revert its squash commit on dev, then promote. Use `-m 1` for a merge commit
in a repo that merges with merge commits.

### Landing a revert through `agent-git land`

`land` replaces the revert commit's message with the PR title and `--message`. Title the
PR `Revert "{{original subject}}"`, and copy the `This reverts commit ...` line and the
reason into `--message`. Otherwise the record of which commit was undone is lost.
