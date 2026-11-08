# Reply templates

Fill every `{{field}}` and delete the lines marked optional that you do not use. Put the
agent header from step 7 of the skill above each one. Each template names the real
replies it was shaped from. The links are in [sources.md](sources.md).

Measured lengths, from 579 author replies in 27 projects: an accept runs a median of
about 20 words, a decline about 47, a defer about 32, and a question about 12. Stay near
those. A longer reply usually means the explanation belongs in the code.

## Accept, fixed in a commit

```md
Fixed in {{short sha}}. {{What the code does now, in one or two sentences.}}
{{Optional: the test or check that covers it, by name.}}
```

Shaped from Django 21922 ("Done in 473dec9857: the exact ... check comes first again"),
Node 66782 ("Applied in 96a03775. The regression test ..."), curl 23604 ("Done. I
folded the overflow case into existing test 1520") and Kubernetes 143816 ("Removed the
limits summary in f0f26b53001 to avoid duplicating information").

Rules:

- Name the commit. GitHub links a bare SHA on its own.
- Say what changed, not that something changed. "Done" alone makes the reviewer open
  the diff to check.
- If you took the idea but not the exact suggestion, say how yours differs and why.

## Decline, with a reason

```md
I kept {{the current approach}} because {{the reason, one sentence}}.
{{The evidence: a link to the code, a measurement, a test result, or the spec.}}
{{Optional: what the suggested change would cost.}}
Do you weigh {{the tradeoff}} differently, or is there a case I am missing?
```

Shaped from Google's "I went with X because of these pros and cons" example, Kubernetes
141807 ("Dropping `!IsZero()` here was intentional:" then the reasons), Tailwind 20666
("We keep it as is, for these reasons:"), VS Code 337232 (links the pre-PR code to show
the behavior is not new) and Ruff 28329 (kept callbacks where the suggested API did not
make the code clearer).

Rules:

- Lead with the decision, then the reason. In the hand-labeled sample, 19 of 21 declines
  gave one.
- Back it with something the reviewer can check. A benchmark number beats "I think it
  is fine".
- Resolve the thread only after Jeff reads the evidence and says yes. If the reviewer
  answers with new evidence, treat it as a new finding.
- Never reply in anger or say you have said it before. Answer the point.

## Ask a clarifying question

```md
Do you mean {{your reading of the comment}}? If so, {{what you would change}}.
{{Optional: If you mean {{the other reading}}, then {{what that would take}}.}}
```

Shaped from Django 22169 ("If I understand correctly, you are suggesting ..."), LLVM
("I think you mean defined outside the loop?"), Rails ("would re-arranging methods ... be
a breaking change?") and Django 22233 ("I've tried to restructure it a bit. Does this
parse better?").

Rules:

- Restate the comment so a yes or no settles it.
- Ask one question per thread. Keep it short.
- When you can try the change cheaply, push it and ask whether it reads better.

## Defer to a follow-up issue

```md
Agreed that {{the problem}} is real. It is outside this PR because {{reason}}.
Filed {{issue link}} to track it.
{{Optional: I left a TODO at {{file}} that names the issue.}}
```

Shaped from Ruff 26680 ("Going to leave this as a follow up and restore the original
guard here for now ... Filed https://github.com/astral-sh/ty/issues/4951"), Grafana
136087 ("Tracked as an optional follow-up in #137253") and Prettier 20351 ("Sure, opened
#20454").

Rules:

- File the issue before you reply. Only 7 of 22 measured defers linked one, and Google
  reports that cleanup promised for later usually never happens.
- Defer only what this PR did not cause. New complexity from this PR gets fixed here.
- A TODO in code names the issue number.

## Summary after a round of fixes

```md
Addressed the review in {{first sha}}..{{last sha}}.

- {{thread link}}: {{what changed}} ({{sha}})
- {{thread link}}: {{what changed}} ({{sha}})
- {{thread link}}: kept as is, {{one-line reason}}. The thread is open for you.
- {{thread link}}: deferred to {{issue link}}.

CI: {{all required checks pass on {{head sha}} / {{check}} fails, see below}}.
Open question: {{question, or "none"}}.

{{The repo's ready signal: PTAL, @rustbot ready, or a re-request.}}
```

Shaped from Django 19984 ("I've addressed all the feedback:" then a bullet per change),
Kubernetes 143536 ("Updated as follow:" then bullets), Kubernetes 143387 ("I addressed
your comments! PTAL.") and Kubernetes community 9139 ("ready for review again with all
the SIG metadata in place").

Rules:

- Post one summary per round, not one per push.
- List the declines and defers too, so nothing looks silently dropped.

## CI-fix report

Use the first form when the PR caused the failure, the second when it did not.

```md
{{check name}} failed on {{sha}}: {{the first actionable error, quoted in one line}}.
The cause was {{root cause in this PR}}. Fixed in {{fix sha}}, and the check passes on {{new head}}.
```

```md
{{check name}} fails on {{test or step}}, and it is not caused by this PR.
The same failure appears on {{the default branch / another PR}}: {{link to that run}}.
{{Optional: the issue that tracks the flake: {{link}}.}}
Could {{a maintainer}} rerun it{{, or share the log if you cannot see it}}?
```

Shaped from Vite 23889 ("The `node-26` failure is the flaky ... test. It fails on `main`
too" with a run link), Node 62599 ("It doesn't look related. Similar failures happened
here and here"), Electron 55637 (names the job, the test and the 30s timeout on all
four attempts), Astro 18541 ("CI failure was a test fixture bug, not the `matchAllRoutes`
change") and Node 66782 (asks for the Windows log the author cannot see).

Rules:

- Name the job and the test, and quote the error. "CI is red" is not a report.
- Prove "unrelated" with a link to the same failure without this PR.
- Ask for a rerun only after you have that evidence.
