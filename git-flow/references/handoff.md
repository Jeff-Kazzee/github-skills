# Release and hotfix handoff

Use this working note when more than one branch must receive a change. Record actual refs. A pending backport stays visible even after the production fix lands.

```markdown
## <Version or symptom>
Owner and release window:
Reason for isolation or urgency:
Starting revision and affected versions:
Acceptance check:
Recovery action and owner:

| Destination | PR and reviewed SHA | Check and observed result | Merged revision or pending owner |
| --- | --- | --- | --- |
| <production> | | | |
| <development> | | | |
| <other affected line, if any> | | | |

Tag and production revision, if required:
Cleanup decision and outstanding dependencies:
```

**Worked example, fictional.** Version 2.3 drops a saved preference after restart. Production and the 2.4 candidate both contain the affected reader. The owner tests save, close and reopen on each line. In this example the project permits direct hotfix PRs, so the production PR merges first. The candidate still fails that test, so its row stays pending and the hotfix branch stays available. Development receives the corrected reader through its own reviewed PR. Record the candidate's passing result and merged revision before closing the handoff.

For a routine promotion, record the reviewed development SHA, destination and check result. Use the full table when there are multiple fixes or destinations to track. Kubernetes maintainers make test plans, readiness and rollback explicit in larger proposals. Scale those fields to the release decision at hand. [Kubernetes enhancement proposal template](https://github.com/kubernetes/enhancements/tree/HEAD/keps/NNNN-kep-template)
