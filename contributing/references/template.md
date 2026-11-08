# CONTRIBUTING.md template

Copy everything below the line into `CONTRIBUTING.md` at the repo root. Fill each
`{{field}}`. The section order follows the median position of each section in the 98
full guides measured in [sources.md](sources.md).

Two sections are optional. Delete `## AI-assisted contributions` only when the project
has no policy yet, and delete `## Signing your work` when the project needs no DCO or
CLA. Delete any other line in braces that does not apply, but keep every `##` heading
that the check requires.

---

# Contributing to {{Project}}

Thank you for helping with {{Project}}. This guide takes you from a fresh clone to a
merged pull request. {{One sentence on the kinds of help the project wants most, such as
bug reports, docs fixes or small features.}}

## Getting help

Ask questions in [{{channel, such as GitHub Discussions}}]({{channel URL}}). Use issues only for
bugs and feature requests. {{When a SUPPORT.md exists: See [SUPPORT.md](SUPPORT.md).}}

## Reporting issues

Search [open and closed issues]({{issues URL}}) first. If none matches, open one with
the {{bug report or feature request}} template and include:

- The version of {{Project}} and your operating system.
- The steps that reproduce the problem, in the smallest case you can make.
- What you expected, and what happened instead.

Do not report a security vulnerability in a public issue. Follow
[SECURITY.md](SECURITY.md) instead.

## Setting up

You need {{tools and versions, such as Node 22 and pnpm 10}}.

```sh
git clone {{repo URL}}
cd {{folder}}
{{install command}}
{{build command, when there is one}}
```

{{One line saying what the reader has now, such as "The build writes `dist/`."}}

## Making a change

1. Pick an issue. Issues labeled [good first issue]({{label URL}}) suit a first change.
   Comment on the issue before you start, so two people do not do the same work.
2. For a large change, open an issue and agree on the approach before you write code.
3. Create a branch from `{{default branch}}`.
4. Follow the style in {{style guide link, or the formatter and linter commands}}.
5. Add or update tests and docs in the same change.

## Running tests

```sh
{{test command}}
{{lint or format check command}}
```

{{One line on how CI runs the same checks, and where to see the results.}}

## Commit messages

{{The project's commit format, with one real example from its history.}}

## Pull requests

1. Push your branch and open a pull request against `{{default branch}}`.
2. Fill in the pull request template. Link the issue with `Fixes #{{number}}`.
3. Make sure every CI check passes.
4. {{Who reviews, and how long a first review usually takes.}}
5. {{How the change merges, such as squash merge by a maintainer.}}

## AI-assisted contributions

{{The project's policy. For example: You may use AI tools. You are responsible for
every line you submit, you must understand and be able to explain it, and you say in
the pull request which tool you used.}}

## Code of conduct

This project follows the [{{code of conduct name}}](CODE_OF_CONDUCT.md). By taking part,
you agree to follow it. Report unacceptable behavior as the code of conduct describes.

## Signing your work

{{DCO: Add a `Signed-off-by` line with `git commit -s`. CLA: Sign the CLA at {{link}}
before your first pull request merges.}}
