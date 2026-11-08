# Post templates

Copy the block for the kind you are writing. Fill every `{{field}}` and delete a line
that does not apply rather than leave it empty. Each template names the posts it was
shaped from. Their URLs are in [sources.md](sources.md). After you fill one, run
`scripts/discussion-check.mjs` with the `--kind` shown.

## Announcement: release

`--kind announcement`. Shaped from the Bun release posts (4580, 5117, 46493): the
install command comes first, then the notes link, then thanks.

````markdown
To install {{project}} {{version}}:

```sh
{{install or upgrade command}}
```

{{One or two sentences: the change most users will notice, in past tense.}}

## What changed

- {{Change, one line, with its PR link}}
- {{Change}}

Full release notes: {{link to the release or changelog}}

Thanks to the {{count}} people who contributed to this release.
````

## Announcement: breaking change

`--kind breaking`. Shaped from the Supabase CLI v3 (52779) and supabase-flutter v3
(53093) posts. The reader learns whether they must act before they read why.

```markdown
{{One sentence: what changes and when.}} {{One sentence: what the reader must do, or "Nothing changes until you upgrade."}}

## What changed

- {{Change, with its PR or docs link}}

## Why we made this change

{{The problem the old behavior caused, in two to four sentences.}}

## Who is affected

{{Who must act: which versions, platforms, or configurations.}}

## What happens if you take no action

{{What breaks, and when. Or "Nothing, until you upgrade to" and the version.}}

## Migration steps

1. {{Step, as a command or a config change}}
2. {{Step}}

Migration guide: {{link}}

## Rollout timeline

- {{date}}: {{what happens}}
- {{date}}: {{what happens}}

Questions go in this thread. Bugs go in a new issue: {{link to the issue form}}
```

## RFC or proposal

`--kind rfc`. The sections follow the React and Vue RFC templates, which match the
Rust template on Summary, Motivation, Drawbacks, Alternatives and Unresolved
questions. Astro's Stage 1 form adds Goals and Non-Goals, and Next.js's ideas form
does the same.

````markdown
# Summary

{{One or two sentences: what you propose.}}

# Basic example

```{{language}}
{{The smallest code that shows the proposal in use}}
```

# Motivation

{{The problem, told as what a user tries to do today and where it fails. Link the
issues or discussions that show it.}}

# Goals

- {{Goal}}

# Non-goals

- {{What this proposal does not try to solve}}

# Detailed design

{{The API or behavior, precise enough that someone else could build it. Cover the
edge cases you know about.}}

# Drawbacks

{{Cost to implement, to teach, to maintain. Breaking changes.}}

# Alternatives

- {{Alternative}}: {{why it falls short}}
- Do nothing: {{what users keep doing instead}}

# Adoption strategy

{{Is this breaking? How do current users migrate?}}

# Unresolved questions

- {{Question you want the thread to answer}}
````

## Idea

`--kind idea`. A short form for an Ideas or Feature Requests category. Shaped from the
pnpm form (user story, solution, drawbacks, alternatives) and the Next.js ideas form.

```markdown
## Problem

As a {{kind of user}}, I want to {{task}}, but {{what stops me}}.

{{How you work around it today, and what that costs.}}

## Proposal

{{What should happen. Add a code sample when it is an API.}}

## Alternatives

- {{Alternative you considered}}: {{why it is not enough}}

## Would you implement it?

{{Yes, with help, or no.}}
```

## Q&A question

`--kind question`. Shaped from the Next.js help form (summary, code, reproduction link)
and the Renovate help form (exact version, logs in a details block). Title it with the
question and the exact error: `vite build fails with "Could not resolve entry module"`.

````markdown
{{One sentence: what you are trying to do.}}

{{One sentence: what happens instead.}}

```{{language}}
{{The smallest code, config or command that shows it}}
```

<details><summary>Error output</summary>

```
{{Exact error or log lines}}
```

</details>

- {{project}} version: {{exact version, such as 5.4.2}}
- Runtime and OS: {{Node 22.11, macOS 15}}
- Reproduction: {{link to a repo or StackBlitz, or "none"}}

What I tried:

- {{Attempt}}: {{result}}
````

## Accepted answer

`--kind answer`. Shaped from the most upvoted accepted answers in Tailwind CSS (15820,
13881) and Vite (5081, 3396). Lead with the cause or the fix. Code and a docs link
follow.

````markdown
{{The cause in one sentence, such as "The init command no longer exists in v4."}}

{{The fix in one sentence.}}

```{{language}}
{{The command or config that fixes it}}
```

{{When the fix depends on a version or option, say which: "On v3, pin the version
first."}}

Docs: {{link to the page that explains it}}
````

When you asked the question and solved it yourself, post this as a comment and mark
it. A fix that lives only in your question body leaves the discussion unanswered.

## Maintainer status reply

`--kind status`. Shaped from Next.js 59989 and 46722 and Vue RFC 296. Post it when the
team decides, when work starts, or when it ships.

```markdown
Status: {{status: Under consideration, Accepted, In progress, Shipped in a named version, or Declined}}.

{{One or two sentences: what the team decided and why.}}

{{Link to the PR, issue, or release that carries the work.}}

Next: {{what happens next, and when the thread will hear more}}.
```

For a declined idea, give the reason and close the discussion as outdated or resolved.
For a long thread, edit the status into the top of the original post too, the way Vue
RFC 369 marks itself dropped.

## Maintainer reply: discussion to issue

`--kind to-issue`. Post this after you use **Create issue from discussion**, which
copies the post and its labels and leaves the discussion open. Shaped from Astro's
accepted-proposal issues (1454, 1447), which link back to their source discussion.

```markdown
We agreed on the scope here, so this is now tracked as an issue: {{issue link}}.

The issue covers {{the scoped part}}. It does not cover {{what stays out}}.

Follow the issue for progress. Keep design questions in this thread.
```

## Maintainer reply: issue to discussion

Post this as the last comment before you use **Convert to discussion** on an issue
that is a question or an open idea, not a work item.

```markdown
This is a {{question or feature idea}} rather than a bug we can fix, so I am moving it
to Discussions, where {{the community can answer it or people can upvote it}}.

If you find a reproducible bug, open a new issue with the bug form: {{link}}.
```

## Poll

Polls have no form support. Shaped from Next.js 59373 and 73905 and Deno 15503: the
title is the question, two to six options, and the body says what the vote decides.

```markdown
Title: {{The question, ending in a question mark}}

{{What decision this poll informs, and who decides.}}

- {{Option 1}}: {{what it means}}
- {{Option 2}}: {{what it means}}

Vote, then comment with the reason behind your vote. Closes {{date}}.
```

## Discussion category form

`--kind form`. Save as `.github/DISCUSSION_TEMPLATE/{{category-slug}}.yml` on the
default branch. The file name must be the category's slug. The body needs at least one
field that is not markdown. Put `validations` only on input fields. Shaped from the
Next.js `help.yml` and `ideas.yml` forms and the Renovate `request-help.yml` form.

Q&A category:

```yaml
title: "{{Default title prefix, or delete this line}}"
labels: ["{{label}}"]
body:
  - type: markdown
    attributes:
      value: |
        Search existing discussions first. Bugs with a reproduction go in an issue: {{issue form link}}
  - type: textarea
    id: summary
    attributes:
      label: Summary
      description: What are you trying to do, and what happens instead?
    validations:
      required: true
  - type: textarea
    id: code
    attributes:
      label: Code, config or error output
      description: The smallest example that shows the problem.
      render: {{language}}
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
      description: The exact version, not "latest".
    validations:
      required: true
  - type: input
    id: reproduction
    attributes:
      label: Reproduction link
      description: A repository or StackBlitz link, if you have one.
    validations:
      required: false
```

Ideas category:

```yaml
labels: ["{{label}}"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: Who has the problem, and what do they do today?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposal
      description: What should happen? Add a code sample for an API change.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives
      description: What else did you consider, and why is it not enough?
    validations:
      required: false
  - type: checkboxes
    id: contribute
    attributes:
      label: Contribution
      options:
        - label: I would help implement this
```
