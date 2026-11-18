# Change briefs and gists

**Change brief.** Use this as input to the repository's PR template. Lead with the outcome a reviewer can check, then give the reason the old behaviour mattered.

```text
Change: <what a user can now do>
Reason: <what happened before and when>
Review first: <path and decision that needs judgement>
Evidence: <head SHA, command or fixture, observed result>
Still open: <untested case or decision, if any>
```

**Minimal reproduction gist.** Useful when a self-contained example helps another maintainer reproduce a result outside the project. For example, a Markdown renderer issue can use three files: README.md, input.md and expected.html. Draft locally. A secret gist is readable by anyone who obtains its URL. Keep private inputs in the approved private workspace. Show Jeff the destination, visibility and exact files for approval before publishing or revising a gist.

```markdown
# <Specific symptom>
Environment: <versions that affect the result>
Input: <small synthetic input or named fixture>
Run: <one command from a clean directory>
Expected: <observable output>
Observed: <actual output and exit status>
Verified on: <revision and date, or say untested>
```

For an ordinary change, one concrete before/after example will often suffice. For a reproduction, remove each input in turn and keep only those needed to show the behaviour. Use the existing review-comments skill for inline findings.

Sources: [Google's change-description guide](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) and [GitHub's gist visibility rules](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists).
