# Issue comment templates

Read this when you are about to comment on an issue. Each template is a draft. Fill
every `{{field}}`, delete the lines that do not apply, and wait for Jeff's approval
before you post (house rule).

Every template follows the same rules, taken from the examples in
[sources.md](sources.md):

- One comment does one job. Lead with the verdict or the ask in the first sentence.
- Keep it short. The median maintainer triage reply was 26 words, and the median
  closing comment was 17 words.
- Address the reporter by handle when you ask them for something.
- Link the thing you name: the PR, the commit, the duplicate, the doc.
- Put long logs and investigation inside `<details>`, so the thread stays readable.
- When the repo uses bot commands (`/kind bug`, `@rustbot label`), put each command on
  its own line at the start of the comment. Otherwise set labels in the sidebar and
  leave them out of the prose.

## 1. Triage reply

Use it on a new issue once you have read it and know where it goes.

```md
Thanks for the report, @{{reporter}}. {{one sentence: what you think this is, such as "This looks like a regression in X since v1.2.0."}}

{{label or routing line, such as "Labeled `bug` and `area/cli`." or "cc @{{owner}}, who owns {{area}}."}}

Next step: {{who does what, such as "I'll try to reproduce it on main this week." or "Can you confirm it still happens on {{latest version}}?"}}
```

Done when the reader knows the issue's category, its owner, and the next action and
who owns it.

## 2. Ask for a reproduction

Use it when you cannot reproduce the issue from what the report gives you.

```md
@{{reporter}}, I couldn't reproduce this with {{what you tried, with version}}.

Can you share a minimal reproduction? {{the shape the repo prefers, such as "a public repo, a StackBlitz, or a single file we can run with `{{command}}`"}}. Please include:

- The exact command or code you ran.
- The full output, as text and not a screenshot.
- The output of `{{version or environment command}}`.

{{only if the repo has a timeout: "Issues labeled `{{label}}` close after {{days}} days without a reply."}}
```

Take `{{days}}` from the repo's own guide. Windows in the sample run from 3 days
(Vite's bot) through 7 (VS Code), 20 (Kubernetes) and about a month (Rust). Never
invent one.

Done when the reporter can answer with one reply, and you have set the repo's waiting
label, such as `needs reproduction`, `info-needed` or `WaitingForInfo`.

## 3. Confirm and reproduce a bug

Use it when you reproduced the bug yourself.

```md
I can reproduce this on {{version or commit}}, {{OS and runtime}}.

{{steps, as a numbered list or one fenced block}}

Expected: {{expected}}
Actual: {{actual}}

{{scope: "It also fails on {{older version}}, so it is not a recent regression." or "It works on {{version}}, so it regressed between {{a}} and {{b}}."}}

<details><summary>Investigation</summary>

{{stack trace, bisect output or code pointers}}

</details>
```

Done when another maintainer can rerun your steps and see the same failure, and the
comment says whether this is a regression.

## 4. Status update on work in progress

Use it when you own the issue and the thread has gone quiet, or when a fix merged
into a branch that does not close the issue.

```md
Status: {{one word, such as "In progress", "Blocked" or "Fix merged, not released"}}.

- Done: {{what is finished, with links}}
- Next: {{the next step and when}}
- Blocked on: {{what, with a link}}  <!-- delete if not blocked -->
```

Some repos merge task PRs into `dev`, not the default branch, as the Git law does.
Closing keywords do not run on those merges. Post this update with
"Fix merged into `dev` in {{PR link}}, ships in the next release." and close when the
release lands.

Done when a reader learns the state, the next step and any blocker without reading
the rest of the thread.

## 5. Close as fixed

Use it when a change fixed the issue and GitHub did not close it for you, or when a
keyword closed it with no version named.

```md
Fixed in {{PR or commit link}}, released in {{version}}.

{{one optional line: how to get it, or what to do if it still happens, such as "If you still see this on {{version}}, reopen with your setup."}}
```

Pick the close reason `Completed`. When the fix is merged but not yet released, say
"will ship in {{version}}" instead.

Done when the comment links the change and names the version that carries it.

## 6. Close as won't fix, duplicate or not planned

Use it when nothing will change. Pick the matching close reason: `Duplicate` or
`Not planned`. Do not close these as `Completed`.

Duplicate:

```md
Duplicate of #{{original}}. {{one line on why they match}} Please follow that issue, and add your details there if they differ.
```

`Duplicate of #N` on its own line marks the duplicate in the timeline. When you are
not sure it is the same root cause, write "Possibly related to #{{n}}" and leave the
issue open.

Won't fix or not planned:

```md
{{the decision in one sentence, such as "This is working as intended." or "We're not going to add this."}}

{{the reason, with a link to the doc, design note or earlier decision}}

{{what the reporter can do instead: a workaround, a config option, another project, or a plugin}}
```

Done when the comment states the decision, the reason and an alternative, and the close
reason matches the decision.

## 7. Stale ping

Use it when an issue waits on someone and has had no activity for the repo's timeout.

```md
@{{person}}, this has been waiting on {{what}} since {{date}}. Is it still happening on {{latest version}}?

If we don't hear back in {{days}} days, I'll close it. You can reopen it any time with {{the missing piece}}.
```

Done when the comment names the person, the missing piece and the deadline from the
repo's guide.

## 8. Maintainer decision

Use it when maintainers have decided on a proposal, a design question or a disputed
bug.

```md
Decision: {{accepted | declined | likely accept | likely decline}}, {{who decided, such as "for the {{team}} team"}}.

{{the decision restated in one or two sentences, so this comment stands alone}}

Reason: {{the reason, with a link to the discussion or meeting notes}}

Next: {{what happens now, such as "This issue now tracks the implementation." or "Final comments are open until {{date}}."}}
```

Done when someone who reads only this comment knows what was decided, why, who decided,
and what happens next.
