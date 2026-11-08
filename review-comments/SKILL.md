---
name: review-comments
description: Writes the reviewer's inline comments, suggested changes, review summary and thread replies on someone else's PR. Use when you review a PR and post feedback. Not for replying on your own PR, use `babysit-pr`. Not for review depth or merge risk, use `review-gate`.
---

# Review comments

A review comment is an instruction to a stranger who cannot ask you what you meant. Write
each one so the author knows what is wrong, why, how much it matters, and what would fix
it. Finding the defects is a separate job for `code-review`. This skill is how you write
them down.

Every agent posts as Jeff, so a review is a draft until Jeff approves its text (Approval
law). The review state you pick describes your findings. It is not the merge decision,
which `review-gate` makes.

## 1. Read before you write

- Read the PR description, the linked issue and every open thread. Do not repeat a point
  another reviewer made. Link their comment and add only what is new.
- Note the head SHA you are reviewing. Every claim you make is about that commit.
- Decide your scope. If you review only part of the change, you will say so in step 5.

Done when you know the head SHA, your scope, and which points are already raised.

## 2. Label every comment

Start each inline comment with one label and a colon:

| Label | Means | Author must act |
|---|---|---|
| `blocking:` | A defect, or a missing test or doc that merge needs | Yes |
| `question:` | You need an answer to judge the code | Only `question (blocking):` |
| `suggestion:` | A better way, with the reason | No |
| `nit:` | Polish: naming, style, wording | No |
| `praise:` | Something done well, and why | No |

Google's guide says unlabelled comments read as mandatory. Real reviewers rarely label (4
percent of 377 comments sampled), but an agent's comment carries no tone of voice, so the
label does that job. When torn between `blocking` and `suggestion`, ask whether you would
refuse the merge over it. If not, it is a suggestion.

Done when every comment starts with a label, and every `blocking:` comment is one you
would refuse the merge over.

## 3. Write each comment

Copy the matching template from
[references/comment-templates.md](references/comment-templates.md).

- One point per comment, on the line it concerns. For the same issue in many places, comment
  once and write "Same for the others."
- Keep it short. The median real comment is 139 characters, about two sentences.
- Talk about the code, never the person. "This reads the getter twice", not "you read it
  twice".
- Say why. A rule, a failing case or a measured cost beats a preference. Technical facts
  overrule opinions.
- A `blocking:` comment carries evidence: a command that fails on the head with its output,
  a minimal repro, or the cited lines that establish it plus what blocked a run (Git law).
  No evidence means it is a `question:`.
- Give the fix, or the fix you would accept. 58 percent of real comments propose one.
- When unsure, ask. "Do I understand correctly that..." beats a wrong claim.
- Skip extreme words such as "obviously", "terrible" or "no sane person". Do not argue taste
  the repo's formatter or style guide already settles.

Done when each comment names the problem, the reason and the fix or the question.

## 4. Use suggestion blocks for small fixes

A suggestion block lets the author apply your change in one click:

````markdown
suggestion: these steps do not need npm.

```suggestion
node --run build
```
````

- Select exactly the lines to replace. The block replaces all of them, so keep their
  indentation. An empty block deletes the lines.
- Use it only when the whole fix fits inside the selected lines of one file. Otherwise
  write numbered steps.
- Add one sentence of reason. Only 56 percent of sampled blocks had one, and a bare block
  leaves the author guessing whether it is required.

Done when every block replaces exactly its selected lines and carries a reason.

## 5. Write the summary and pick the state

Use the summary templates in
[references/comment-templates.md](references/comment-templates.md). Each one says what you
checked, at which SHA, and ends with a `To merge:` line. Only 28 percent of real summaries
said what merge needs, and the ones that did were the clearest.

| State | Pick when |
|---|---|
| Approve | No `blocking:` comment is open. Remaining comments are optional, or minor enough that you trust the author to address them (Google's "LGTM with comments") |
| Request changes | At least one `blocking:` comment. List each one under `To merge:` |
| Comment | A partial review, or questions only. Say what you did not review |

When the PR author is the account you post as, which is common because every agent posts
as Jeff, use Comment. GitHub does not let an author approve their own PR, so the
`To merge:` line carries the verdict.

Approve a change that improves the code even if it is not perfect. Move a bigger refactor
to a follow-up issue, and file the issue now, because "clean it up later" rarely happens.

Done when the state matches the labels and the `To merge:` line names every blocking item.

## 6. Reply when the author answers

- Re-review on the new head. Start the reply with `Resolved at <sha>`, `Partly resolved at
  <sha>` or `Still open at <sha>`, then what you checked.
- If the author pushes back, check whether they are right first. If they are, say so and
  drop the point. If not, explain again with new information, not the same words louder.
- Once a thread you opened is fixed, resolve it if you have write access. Otherwise reply
  `Resolved at <sha>` and leave the click to the author. If a thread was marked resolved
  and the question is still open, say so in the thread.
- Find an end. When only nits remain, approve.

Done when each of your threads is resolved or has a reply on the current head.

## 7. Check and post

Draft the review as a JSON file with `event`, `body`, `commit_id` and `comments`. Then run:

```sh
node <this skill's folder>/scripts/review-lint.mjs review.json
```

It fails on an unlabelled comment, a `blocking:` comment with no code block, link, SHA,
line reference or `$ ` command, a state that
contradicts the labels, a summary with no `To merge:` line, an unclosed suggestion block,
an em or en dash, or an extreme word. After Jeff approves the text, post it as one batched
review, so the author gets one notification:

```sh
gh api repos/<owner>/<repo>/pulls/<n>/reviews --method POST --input review.json
```

Done when the lint exits 0, Jeff has approved the text, and the review is posted on the
SHA in `commit_id`.

## Example

Inline, on `lib/internal/fs/dir.js`:

````markdown
blocking: `bufferSize` is read twice, so a getter that returns `1` and then `0` reaches
the native call with `0` and crashes the process. On main it throws `ERR_OUT_OF_RANGE`.

```js
let n = 0;
fs.opendirSync('.', { get bufferSize() { return n++ ? 0 : 1; } });
```

Read it once into a local and validate the local.
````

Summary, state Request changes:

```markdown
The fix makes sense, and the new test fails on main as it should. Checked at 3f2a9c1e.

To merge:
1. Read `bufferSize` once (comment on dir.js line 41), with a test for a changing getter.
```

`references/sources.md` holds the guidance, the measurements and 123 real examples.
