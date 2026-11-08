# Capturing and attaching evidence

Read this when a change has behavior to prove or media to attach.

## Capture

Evidence comes from the PR's head commit, in this session. Pick the strongest
row that fits. A PR can use several.

| Change | Evidence |
|---|---|
| Anything visible | Before and after screenshots with identical state |
| A flow, animation or timing | A short video of the real app |
| CLI, script, service | Command and output, before and after |
| Bug fix | The regression check red on the base, green on the head |
| Performance | Baseline and final medians, with the command |
| Docs, config, a skill | The rendered result, or a run of the thing it instructs |

For a before capture, run the base commit with the same data. The only
difference between the two captures is the change, and the caption says so.

Open each capture and look at it. Crop or redo anything that shows a token, an
email address, customer data or an unrelated window.

Done when every changed behavior has a capture you observed on the head, or
Proof says `N/A:` with the reason.

For new work, include screenshots or other visual evidence when the change is
visible. This clarification applies from 2026-11-06 onward. Do not reopen
earlier PRs or backfill captures solely because of this update.

## Attach

GitHub has no upload API for PR media, so `attach` stores files in the repo
under a `refs/pr-evidence/<task>` ref. That ref stays out of the branch list and
the PR diff, and it outlives the merge.

```sh
node <this skill's folder>/scripts/pr-body.mjs attach --task <id> --upload-approved before.png after.png demo.mp4
```

`attach` pushes a persistent ref, so it is an upload. Show Jeff each capture and the
exact repo first, and pass `--upload-approved` only after his yes. That goes for
private repos too. It refuses without the flag, before it touches the network.

Run it inside a checkout of the repo, on a host with `gh` signed in. It prints
one Markdown line per file. Paste those lines into the body. It refuses a name the
ref already holds with different bytes, unless you pass `--replace`, and it verifies
the ref landed. A push that loses a race fails and leaves nothing changed.

**No GitHub login on this host** (a Daytona sandbox, for one). Capture and write
`body.md` here, with each file's name where its image will go, and run
`check body.md`, which needs no login. Copy the media and `body.md` out to a host with `gh`, then run
`attach`, swap the names for the printed lines, and open the PR there. Keep GitHub
tokens out of sandboxes.

- **Video.** An `.mp4` on a ref shows as a plain link, with no player, and a
  `<video>` tag does not help. `attach` makes a GIF of the first 30 seconds and prints it linked to the
  full file. Say so in the caption when the video runs longer. Without `ffmpeg`
  (Linveo has none) it prints the plain link and warns, so make the GIF on a host
  that has `ffmpeg`, or attach a GIF you made.
- **Public repos.** `attach` refuses a public repo until you pass `--public-ok`.
  A ref on a public repo publishes the file for good, so get Jeff's yes first.
- **Private repos.** Images load only for signed-in members. An anonymous fetch
  gets 404, which is the private boundary working and says nothing about whether
  the image is broken. Only a signed-in viewer can confirm it draws.

Paste logs inline: a short one in a fenced block, a long one inside `<details>`.
