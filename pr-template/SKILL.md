---
name: pr-template
description: Writes every pull request title and description in Jeff's format (ELI5, before and after, proof, testing, risk, checklist) and attaches screenshots, video, logs or other evidence of the work. Use when you open or update a PR in any repo, for any kind of change, or when asked to make a PR easy to review. Not for watching a PR through CI and review, use `babysit-pr`.
---

# PR template

Every PR gets this body: code, docs, config, skills, any repo. It replaces every
other PR body format, for every agent on every host. A reader who stops after the
ELI5 knows what changed, and a reader who goes to the end can check every claim.

Hold to these on every PR:

- Evidence comes from the exact head, in this session. Unrun checks stay visibly
  unrun, and a checked box is a claim you can back.
- Posting a PR, a body or a comment is an external message. Show Jeff the exact text
  and destination first, and post only after his yes.
- `check` is offline. `--render` sends the whole body to GitHub, and `attach` uploads
  to a persistent ref. Each needs its own approval.
- A risk level sets review depth. It never grants merge approval, so a PR is done
  when it is ready for Jeff, not when it merges.
- Attribution reports what actually happened. Never guess a model.

## Steps

1. **Find what exists.** Check whether this branch has a PR. If one exists, update
   it and read `references/older-prs.md` first. Review the diff against the base and
   confirm it matches the goal.
2. **Capture proof.** `references/evidence.md` covers captures, uploads and hosts
   with no GitHub login.
3. **Write the body.** `references/body.md` holds the template and its rules.
   `references/example.md` is the PR Jeff chose as the model, so read it once per
   session before your first draft. If asked to make a PR easy to review, read
   `references/easy-to-review.md`.
4. **Write the title.** It usually becomes the commit subject, so follow the repo's
   recent merged PRs, and say why the change matters.
   `perf(server): cut websocket frame size by 70%+ with gzipping` beats
   `perf(server): negotiate permessage-deflate on the websocket`.
5. **Check it offline.** Run the command below. Read the title, body, quotes and
   attachments for secrets and private details.
6. **Open it, after approval.** Use the repo's base branch. Where the repo uses
   `agent-git`, the head is the `task/<id>-<slug>` branch from `agent-git claim`, and
   the base is `dev`. Open a real PR, not a draft, so review bots run.
7. **Keep it true.** After every push, recapture what changed, update the head in
   Testing, and rerun the check. When a verifier records a receipt, put its id in AI
   Disclosure. `babysit-pr` watches it from here.

```sh
node <this skill's folder>/scripts/pr-body.mjs check body.md --head <full sha>
gh pr create --base <base> --title "<title>" --body-file body.md
node <this skill's folder>/scripts/pr-body.mjs check --pr <number>
```

If `gh pr create` fails because the GraphQL rate limit is used up, open it through
REST: `gh api repos/<owner>/<repo>/pulls -f title=... -f head=... -f base=<base> -F
body=@body.md`.

## What the check proves

`check body.md` sends nothing. It fails on a missing, empty or out-of-order section,
a label missing from its own section, an empty label, a bare `N/A`, an unfilled
`{{field}}`, a Level that is not Low, Medium or High, a Rollback that names no door,
a checked manual box with no manual run, an em dash, and a missing `Task:` last line.
With `--head`, it fails unless Testing or Verification names that full SHA.

`check --pr` reads a PR already on GitHub, requires the current full head, and
confirms each image is on an evidence ref or a GitHub upload host. After a push it
fails until the proof is redone.

The offline check follows common Markdown and is not GitHub's renderer. A fence closed
at column zero inside a list is one body it passes and GitHub breaks, so only `check
--pr` is authoritative for how a body renders.

It checks the format, not that the claims are true, and it is not a security gate.
Open the PR as a signed-in viewer and confirm each image draws. If no signed-in
browser is reachable, say that in your reply.

Done when the check passes on the head and you have seen the images draw.
