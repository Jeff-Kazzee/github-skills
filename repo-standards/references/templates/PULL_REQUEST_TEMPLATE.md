## ELI5

<!-- Two or three plain sentences: what the user hit, and what happens now. No file names. -->

## What Changed

**Before:** <!-- the old behavior, concrete enough to reproduce -->

**After:** <!-- the new behavior, and what deliberately stayed the same -->

**Mechanism:** <!-- the function and file that changed, and which callers reach it -->

## Why

<!-- Why this needed doing, and why this approach over the option you rejected. -->

## Linked Issue

<!-- "Fixes #123", or "None:" and the reason -->

## Visual Proof

<!-- The setup that makes the captures comparable. With no pictures, rename this heading to "Proof" and use before and after fenced output. -->

| Before | After |
| --- | --- |
| <!-- before image --> | <!-- after image --> |

<!-- What each capture shows, how it was made, and the only difference between them. -->

## Testing

- [ ] I manually tested these changes locally
- [ ] Automated tests added or updated, or explained why not below

<!-- One line per test file: what it now asserts. The exact check command and result, on head abc1234. -->

## Risk

**Level:** <!-- Low, Medium or High -->

**Rationale:** <!-- What can fail, who is affected, and why this level fits the changed behavior. -->

**Verification:** <!-- Commands, results, exact head SHA and evidence links. Mark checks not run. -->

**Rollback:** <!-- How to back it out, including any saved-data or compatibility limits. -->

**Unresolved concerns:** <!-- Remaining findings and who owns each, or None with the basis for that. -->

## AI Disclosure

<!-- Implemented with <harness> (<model>). Who reviewed it. -->

## Review

- [ ] Upstream boundary: this change copies no upstream source, or the copy is declared here

**Impact:** <!-- Security, cross-platform, remote SSH, mobile, backwards compatibility, performance. One clause each. -->

## Checklist

- [ ] This PR is small and focused
- [ ] I explained what changed and why
- [ ] I stated the risk: what could break, for whom, and how to back it out
- [ ] Evidence is attached, or N/A with a reason
- [ ] Self-reviewed for correctness, security and performance
- [ ] Cross-platform, SSH and path impact considered, or N/A
- [ ] The repo's lint, typecheck, test and build pass, or CI will cover them

<!-- Attribution line from your harness goes here. -->

Task: none
