# Page templates

Last verified: 2026-11-07 against the examples in [sources.md](sources.md).

One fill-in template per page type. Copy the block inside the fence, fill every
`{{field}}`, and delete an optional section rather than leave it empty. Each template
names its file path on its heading line. The shapes come from the examples in
[sources.md](sources.md). The test `docs-check.test.mjs` fills every template and runs
the page check on it, so a template that breaks the check fails the tests.

Every page carries a verified line: `Last verified: YYYY-MM-DD against <version or commit>.`
Change the date only after you check the page against that version.

## Index page: `docs/README.md`

List only the groups that have pages. Order them so prerequisites come first: start,
guides, concepts, reference, help, then project records.

````md
# {{Project}} documentation

{{One sentence: who these docs are for and what they cover.}}

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## Start here

- [{{Tutorial title}}](tutorials/{{tutorial-file}}.md): {{what the reader builds}}.

## How-to guides

- [{{Task title}}](how-to/{{task-file}}.md): {{the goal it reaches}}.

## Concepts

- [{{Topic title}}](concepts/{{topic-file}}.md): {{the question it answers}}.

## Reference

- [{{Thing}} reference](reference/{{thing-file}}.md): {{what it lists}}.

## Help

- [Troubleshoot {{feature}}](troubleshooting.md): {{the symptoms it covers}}.
- [FAQ](faq.md): {{the kinds of questions it answers}}.

## Project records

- [Architecture](../ARCHITECTURE.md): the code map and its invariants.
- [Decision records](adr/README.md): why the project is shaped this way.
- [Changelog](../CHANGELOG.md): what changed in each release.
````

## Tutorial: `docs/tutorials/{{tutorial-file}}.md`

A lesson. Every step ends in something the learner can see. Leave out alternatives and
explanation, and link to them.

````md
# {{Build a specific thing}}

In this tutorial, we build {{the thing}}. At the end, you have {{the visible result}}.

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## Before you begin

- {{Tool and version}}
- {{Account, key or other prerequisite}}

## {{First step as a verb phrase}}

{{One sentence on what this step does.}}

```sh
{{command}}
```

You see:

```text
{{exact output}}
```

## {{Next step as a verb phrase}}

{{One sentence.}}

```{{language}}
{{code}}
```

{{What changed, and where the learner sees it.}}

## Next steps

- [{{How-to title}}](../how-to/{{task-file}}.md) {{to do the real version of this task}}.
- [{{Concept title}}](../concepts/{{topic-file}}.md) {{to learn why it works}}.
````

## How-to guide: `docs/how-to/{{task-file}}.md`

A recipe for a reader who already knows the basics. Title it with the goal.

````md
# {{Verb}} {{object}}

This guide shows how to {{reach the goal}}. It assumes you know {{prerequisite knowledge}}.

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## Before you begin

- {{Prerequisite}}

## {{Verb}} {{object}}

1. {{Step that starts with a verb.}}

   ```sh
   {{command}}
   ```

2. {{Step that starts with a verb.}}
3. If {{condition}}, {{do this instead}}.

To confirm it worked, {{the check and what it shows}}.

## See also

- [{{Reference title}}](../reference/{{thing-file}}.md) for every option.
````

## Reference: `docs/reference/{{thing-file}}.md`

Facts for lookup. Mirror the structure of the thing described, one section per command,
option group or endpoint. Describe only.

````md
# {{Thing}} reference

{{One sentence: what the thing is and which version this page covers.}}

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## Usage

```sh
{{command}} [options] {{arguments}}
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `{{--flag}}` | {{type}} | `{{default}}` | {{What it does.}} |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | {{Success.}} |
| `{{1}}` | {{The failure it reports.}} |

## Examples

```sh
{{command with the most common options}}
```
````

## Explanation: `docs/concepts/{{topic-file}}.md`

Understanding for a reader away from the keyboard. The title must read well after an
implied "About". Opinion and trade-offs belong here and nowhere else.

````md
# {{Topic as a noun phrase}}

{{Two sentences: the question this page answers, and the short answer.}}

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## Why {{the design is this way}}

{{The constraint, the history or the goal that shaped it.}}

## How {{it fits with the rest}}

{{The parts it touches and what each one expects from it.}}

## Trade-offs

{{What this design costs, and when a different one would win.}}

## Related

- [{{Decision record title}}](../adr/{{NNNN-decision-file}}.md)
- [{{Reference title}}](../reference/{{thing-file}}.md)
````

## Decision record: `docs/adr/{{NNNN-decision-file}}.md`

Use the `domain-modeling` skill to decide whether a decision earns a record and where
records live. This is the file shape when the repo keeps `docs/adr/`. Number with four
digits, never reuse a number, and never edit an accepted record. A new record
supersedes it.

````md
# {{NNNN}}. {{The decision as a short noun phrase}}

Date: {{YYYY-MM-DD}}

Status: {{Proposed, Accepted, Deprecated, or Superseded by [NNNN](NNNN-file.md)}}

## Context

{{The forces at play, in neutral words: the problem, the constraints, what we know.}}

## Decision

We will {{the decision, in active voice}}.

## Consequences

{{What becomes easier, what becomes harder, and what we must now do.}}

## Considered options

- {{Option}}: {{why we did not pick it}}.
````

## Architecture: `ARCHITECTURE.md` at the repo root

The map a new contributor reads first. Name modules and types so readers can search for
them. Keep only what changes rarely, and revisit it a few times a year.

````md
# Architecture

{{Two sentences: the problem the code solves, from a bird's eye view.}}

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## Code map

### `{{path/to/module}}`

{{What it owns, and what it must never depend on.}}

### `{{path/to/other-module}}`

{{What it owns.}}

## Invariants

- {{A rule the whole codebase keeps, such as "nothing in core does I/O".}}

## Boundaries

{{The layers, and the API each one exposes to the next.}}

## Cross-cutting concerns

{{Errors, logging, testing, configuration: one paragraph each.}}
````

## Troubleshooting: `docs/troubleshooting.md`

One section per symptom, titled with what the reader sees. Group symptoms by area when
there are more than a few.

````md
# Troubleshoot {{feature}}

{{One sentence: which product, feature or task this page covers.}}

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## {{Exact error message or symptom}}

### Cause

{{Why it happens.}}

### Fix

1. {{Step that starts with a verb.}}
2. {{Step.}}

The fix worked when {{what the reader now sees}}.

## Get more help

If none of these match, {{where to ask, and what to include}}.
````

## FAQ: `docs/faq.md`

Each answer is short and links to the page that owns the topic. When an answer grows
past a paragraph, move it into a page and keep the link here.

````md
# Frequently asked questions

{{One sentence: who asks these questions.}}

Last verified: {{YYYY-MM-DD}} against {{version or commit}}.

## {{General}}

### {{The question, as a reader asks it?}}

{{The answer in one to three sentences.}} See [{{page title}}]({{page-file}}.md).

### {{Another question?}}

{{The answer.}}
````

## Changelog: `CHANGELOG.md` at the repo root

The newest release goes first, with an Unreleased section on top. The entries are the
release notes the `issues-and-releases` skill writes, under its groups.

````md
# Changelog

Every release of {{project}}, newest first. Dates are YYYY-MM-DD.

## [Unreleased]

### Fixes

- {{One line per change, in the past tense}} ([#{{PR}}]({{PR URL}})).

## [{{1.2.0}}] - {{YYYY-MM-DD}}

### Action required

- {{What a user must do to upgrade}} ([#{{PR}}]({{PR URL}})).

### Features

- {{Change}} ([#{{PR}}]({{PR URL}})).

[Unreleased]: {{repo URL}}/compare/v{{1.2.0}}...HEAD
[{{1.2.0}}]: {{repo URL}}/compare/v{{1.1.0}}...v{{1.2.0}}
````

## Wiki home: `Home.md` in the wiki

GitHub shows the file name as the page title, so a wiki page needs no `#` heading.

````md
{{One sentence: what this wiki holds, and that the docs folder is the reference.}}

Last verified: {{YYYY-MM-DD}}.

## {{Group}}

- [[{{Page Name}}]]: {{what it answers}}.
- [[{{Link text}}|{{Page Name}}]]: {{what it answers}}.

The project docs live in [the docs folder]({{repo URL}}/tree/{{default branch}}/docs).
````

## Wiki sidebar: `_Sidebar.md` in the wiki

Lists every page, in the same groups as Home.

````md
**{{Group}}**

* [[Home]]
* [[{{Page Name}}]]
  * [[{{Child Page Name}}]]
````

## Wiki footer: `_Footer.md` in the wiki

Tells readers how to change the wiki.

````md
To change this wiki, {{how: edit here with write access, or open a PR against the repo that mirrors it}}.
````
