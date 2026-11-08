---
name: discussions
description: Writes GitHub Discussions posts and replies, from RFCs and questions to answers and maintainer replies, and moves threads between discussions and issues. Use when you post, answer or moderate in Discussions or add a category form. Not for bug reports or release notes, use `issues-and-releases`.
---

# Discussions

A discussion is for talk that is not yet a work item: a question, an idea, an early
design, news. An issue is for work someone will do. Every post and reply here is an
external act. Draft the exact text and wait for Jeff's approval before you post.

Sources and numbers for every rule are in [references/sources.md](references/sources.md).
Fill-in templates for every kind are in [references/post-templates.md](references/post-templates.md).

## 1. Pick the place

Search open and closed discussions and issues first. Then route the post:

| You have | Post it as |
|---|---|
| A bug with a reproduction | An issue, with the `issues-and-releases` skill |
| A question about using the project | A discussion in the Q&A or Help category |
| An idea or feature request | A discussion in Ideas, or the repo's proposal category |
| A design that changes an API | An RFC discussion, when the repo runs its RFCs there |
| News from the maintainers | A discussion in Announcements |

Read the repo's `CONTRIBUTING.md` and `.github/ISSUE_TEMPLATE/config.yml`. Next.js,
Vite and Tailwind CSS turn blank issues off and send questions to Discussions through
`contact_links`. Next.js and Tailwind CSS send ideas there too. Follow what the repo says over this table.

Done when you have the category, and a search turned up no thread that already covers
it. If one exists, reply or upvote there instead.

## 2. Write the post

Copy the matching template. Its kind name is the `--kind` value for the check.

| Kind | What the strong examples do |
|---|---|
| `question` | Title is the question plus the exact error. Body has the code, config or error in a fenced block, the exact version, and what you tried. |
| `idea` | Opens with the problem and who has it. The proposal comes second. Names one alternative. |
| `rfc` | Summary, Basic example, Motivation, Detailed design, Drawbacks, Alternatives, Unresolved questions. One proposal per post. |
| `announcement` | Release posts put the install command first, then the notes link. |
| `breaking` | What changed, Why, Who is affected, What happens if you take no action, Migration steps, Timeline. |
| Poll | The title is the question. Two to six options. The body says what the vote decides. |

What the numbers say:

- Questions with a fenced code block got answers more often: 69% against 26% without
  one, across 138 recent questions in 9 repos. The gap held in 7 of the 9.
- In RFC categories, 80% of top-voted posts have a Summary section and 83% have a
  Motivation or Background section. Only 33% name alternatives, and only 6% of top-voted ideas do. The Rust,
  React and Vue RFC guides all say proposals that skip drawbacks or alternatives are
  poorly received. Write the section anyway.

Done when every `{{field}}` is filled and the post answers the questions its template
asks.

## 3. Answer and mark

An accepted answer leads with the cause or the fix. Code and a docs link follow. Of
123 accepted answers, 76% carry a code block or a link, and the median runs 58
words.

- Mark the comment that solved it. Only the author and people with triage access or
  higher can mark one. A threaded reply can be the answer. A minimized comment cannot.
- If you asked and then solved it yourself, post the fix as a comment and mark it.
  A fix edited into the question leaves the thread unanswered.
- Use the Q&A format only for categories that take questions. Supabase Feature
  Requests and Next.js Show and tell take answers and show 5% answered.

Done when the answer stands alone for a reader who skips the rest of the thread, and
the comment that solved it is marked.

## 4. Reply as a maintainer

Post a status reply when the team decides, starts work, or ships. Give the status, one
reason, the link to the issue or PR, and what comes next. Next.js 59989 links the
implementing PR. Vue RFC 296 names the stage and says what it means. Next.js 46722
moves progress notices to a new thread so hundreds of people stop getting mail.

Move a thread when its job changes:

- Discussion to issue: when the scope is agreed and someone will do the work, use
  **Create issue from discussion**. It copies the post and labels and keeps the
  discussion open. Reply in the discussion with the issue link. Astro's roadmap opens
  an issue for each accepted proposal, and 34 of the 52 issues in its latest 100 items
  link a discussion.
- Issue to discussion: when an issue is a question or an open conversation, not a
  work item, comment why, then use **Convert to discussion**.
- Close a discussion when it is resolved, outdated or a duplicate. Lock it when it
  turns heated, or to keep an announcement free of replies.

Done when the thread shows its status, and every moved thread links to where the work
now lives.

## 5. Add a category form

Save a form as `.github/DISCUSSION_TEMPLATE/<category-slug>.yml` on the default
branch. The file name must match the category slug. The body needs at least one field
that is not markdown. Polls take no form. Copy the YAML from the templates file.

Done when the check passes on the file and the form shows up in that category's new
discussion page.

## 6. Check and hand off

```sh
node <this skill's folder>/scripts/discussion-check.mjs draft.md --kind rfc
```

The check fails on a missing section for the kind, a question with no code block or
version, an answer that opens with a greeting or has no code or link, a status or
conversion reply with no link, a form that breaks GitHub's rules, a leftover
`{{field}}`, an em dash, a semicolon in prose or a marketing word.

Done when the check exits 0 and Jeff has approved the exact text.

## Worked example

Someone opens an issue in a repo you maintain: "How do I serve the app from a
subfolder?" It is a question, not a bug. You draft two texts: the issue-to-discussion
reply and this answer.

````markdown
Vite builds absolute asset paths by default, so a subfolder deploy cannot find them.

Set `base` to the subfolder path.

```js
export default defineConfig({ base: '/app/' })
```

Docs: https://vite.dev/config/shared-options.html#base
````

`discussion-check.mjs answer.md --kind answer` passes. Jeff approves both texts. Then
you post the reply on the issue, use **Convert to discussion**, and post the answer in
the new discussion. The asker marks it as the answer.
