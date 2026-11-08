"""Tests for pr-wait. Standard library only. Every gh call is stubbed.

Run from this folder with `python -m unittest`.
"""

from __future__ import annotations

import base64
import contextlib
import importlib.machinery
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

try:
    import fcntl  # noqa: F401
except ImportError:
    # Windows has no fcntl. pr-wait imports it only for lock(), which no test calls.
    sys.modules["fcntl"] = types.ModuleType("fcntl")

SCRIPT = Path(__file__).resolve().parent / "pr-wait"
_loader = importlib.machinery.SourceFileLoader("pr_wait", str(SCRIPT))
_spec = importlib.util.spec_from_loader("pr_wait", _loader)
pr_wait = importlib.util.module_from_spec(_spec)
_loader.exec_module(pr_wait)

REPO = "octo/demo"
PR = 7
HEAD = "abc1234def5678"
BASE_OID = "base000111222"


class PollLimit(Exception):
    """Raised by the fake gh to end a run that would otherwise poll forever."""


def thread(resolved: bool, ident: str) -> dict:
    return {
        "isResolved": resolved,
        "path": "src/app.py",
        "line": 3,
        "comments": {"nodes": [{
            "id": ident,
            "url": f"https://github.com/{REPO}/pull/{PR}#discussion_{ident}",
            "body": "please fix",
            "author": {"login": "reviewer", "__typename": "User"},
        }]},
    }


def greptile_review() -> dict:
    return {
        "id": "rev1",
        "url": f"https://github.com/{REPO}/pull/{PR}#review",
        "state": "COMMENTED",
        "body": "",
        "commit": {"oid": HEAD},
        "author": {"login": "greptile-apps", "__typename": "Bot"},
    }


def check(name: str, bucket: str) -> dict:
    return {"name": name, "bucket": bucket, "link": f"https://ci.example/{name}", "description": ""}


class FakeGitHub:
    """Answers the gh calls pr-wait makes, from plain Python data."""

    def __init__(self, checks=None, reviews=None, thread_pages=None, rules=None, max_polls=12,
                 checks_from_poll=1, workflows=None):
        self.checks = checks or []
        # Checks register late: gh pr checks reports none before this poll.
        self.checks_from_poll = checks_from_poll
        # Workflow files at the head, path to YAML text. None means no .github/workflows.
        self.workflows = workflows
        self.workflow_calls = 0
        self.reviews = reviews or []
        # Pages of review threads, newest page first, as GitHub returns them for last/before.
        self.thread_pages = thread_pages or [[]]
        # A list of results for the rules endpoint, one per call. The last one repeats.
        # A result is a list of required check names or a GhError to raise.
        self.rules = rules or [[]]
        self.rules_calls = 0
        self.polls = 0
        self.max_polls = max_polls

    def __call__(self, args, allow=(0,)):
        if args[:2] == ["api", "graphql"]:
            return self.graphql(args)
        if args[:2] == ["pr", "checks"]:
            if not self.checks or self.polls < self.checks_from_poll:
                return self.done("", "no checks reported on the 'feature' branch", 1)
            return self.done(json.dumps(self.checks))
        if args[0] == "api" and "/contents/.github/workflows" in args[1]:
            return self.contents(args[1])
        if args[0] == "api" and "/rules/branches/" in args[1]:
            result = self.rules[min(self.rules_calls, len(self.rules) - 1)]
            self.rules_calls += 1
            if isinstance(result, Exception):
                raise result
            return self.done("\n".join(result))
        if args[0] == "api" and "/protection/required_status_checks" in args[1]:
            raise pr_wait.GhError("HTTP 404: Branch not protected", False)
        if args[0] == "api" and "/compare/" in args[1]:
            return self.done("0")
        raise AssertionError(f"unexpected gh call: {args}")

    def contents(self, path):
        """The contents API: a directory listing (paths, as the --jq selects them)
        or one file (base64, as GitHub returns it). Both pin the head commit."""
        assert path.endswith(f"?ref={HEAD}"), path
        self.workflow_calls += 1
        if self.workflows is None:
            raise pr_wait.GhError("HTTP 404: Not Found", False)
        target = path.split("/contents/", 1)[1].split("?", 1)[0]
        if target == ".github/workflows":
            return self.done("\n".join(sorted(self.workflows)))
        return self.done(base64.b64encode(self.workflows[target].encode()).decode())

    @staticmethod
    def done(stdout, stderr="", code=0):
        return subprocess.CompletedProcess(["gh"], code, stdout=stdout, stderr=stderr)

    def graphql(self, args):
        cursor = next((a.split("=", 1)[1] for a in args if a.startswith("threads=")), None)
        if cursor is None:
            self.polls += 1
            if self.polls > self.max_polls:
                raise PollLimit()
        index = 0 if cursor is None else int(cursor.removeprefix("page"))
        has_older = index + 1 < len(self.thread_pages)
        pr = {
            "url": f"https://github.com/{REPO}/pull/{PR}",
            "state": "OPEN",
            "headRefOid": HEAD,
            "baseRefName": "dev",
            "mergeStateStatus": "CLEAN",
            "author": {"login": "jeff", "__typename": "User"},
            "baseRef": {"target": {"oid": BASE_OID}},
            "comments": {"nodes": []},
            "reviews": {"nodes": self.reviews},
            "reviewThreads": {
                "pageInfo": {"hasPreviousPage": has_older, "startCursor": f"page{index + 1}" if has_older else None},
                "nodes": self.thread_pages[index],
            },
        }
        body = {"data": {"viewer": {"login": "jeff"}, "repository": {"pullRequest": pr}}}
        return self.done(json.dumps(body))


class FakeClock:
    def __init__(self):
        self.now = 1_000_000.0

    def time(self):
        return self.now

    def sleep(self, seconds):
        self.now += seconds


class Run:
    def __init__(self, code, lines, clock, fake):
        self.code, self.lines, self.clock, self.fake = code, lines, clock, fake


def watch(fake: FakeGitHub, until: str = "ready", interval: int = 20) -> Run:
    """Run a Watcher against the fake until it exits or hits the poll limit.
    The code is the exit code, or None when the poll limit ended the run."""
    clock = FakeClock()
    out = io.StringIO()
    with tempfile.TemporaryDirectory() as state_dir, \
            mock.patch.object(pr_wait, "gh", fake), \
            mock.patch.object(pr_wait, "STATE_DIR", Path(state_dir)), \
            mock.patch.object(pr_wait, "time", types.SimpleNamespace(time=clock.time, sleep=clock.sleep)), \
            contextlib.redirect_stdout(out), \
            contextlib.redirect_stderr(io.StringIO()):
        watcher = pr_wait.Watcher(REPO, PR, until, interval)
        code = None
        try:
            watcher.run()
        except SystemExit as stop:
            code = stop.code
        except PollLimit:
            code = None
    return Run(code, out.getvalue().splitlines(), clock, fake)


class RequiredCheckDiscovery(unittest.TestCase):
    """F6: an unavailable required-check endpoint is not the same as no protection."""

    def test_transient_rules_failure_is_retried_not_cached_as_empty(self):
        fake = FakeGitHub(
            checks=[check("build", "pass")],
            rules=[pr_wait.GhError("HTTP 503: Service Unavailable", True), ["required-ci"]],
        )
        run = watch(fake, until="green")
        self.assertNotEqual(run.code, 0, run.lines)
        self.assertGreater(fake.rules_calls, 1)

    def test_rules_endpoint_that_stays_down_stops_the_watcher(self):
        fake = FakeGitHub(
            checks=[check("build", "pass")],
            rules=[pr_wait.GhError("HTTP 503: Service Unavailable", True)],
        )
        run = watch(fake, until="green")
        self.assertEqual(run.code, 1, run.lines)
        self.assertIn("GitHub unreachable", run.lines[-1])

    def test_rules_found_after_retry_gate_the_run(self):
        fake = FakeGitHub(
            checks=[check("build", "pass"), check("required-ci", "pass")],
            rules=[pr_wait.GhError("HTTP 503: Service Unavailable", True), ["required-ci"]],
        )
        run = watch(fake, until="green")
        self.assertEqual(run.code, 0, run.lines)
        self.assertIn("required 1/1 green", run.lines[-1])


class ReviewThreadPagination(unittest.TestCase):
    """F7: an unresolved thread outside the newest 100 still blocks ready."""

    def test_unresolved_thread_on_an_older_page_blocks_ready(self):
        fake = FakeGitHub(
            checks=[check("build", "pass")],
            reviews=[greptile_review()],
            thread_pages=[[thread(True, "new")], [thread(False, "old")]],
        )
        run = watch(fake)
        self.assertEqual(run.code, 1, run.lines)
        self.assertIn("blocked by 1 unresolved threads", run.lines[-1])
        self.assertIn("discussion_old", run.lines[-1])

    def test_all_pages_resolved_is_ready(self):
        fake = FakeGitHub(
            checks=[check("build", "pass")],
            reviews=[greptile_review()],
            thread_pages=[[thread(True, "new")], [thread(True, "old")]],
        )
        run = watch(fake)
        self.assertEqual(run.code, 0, run.lines)
        self.assertTrue(run.lines[-1].startswith(f"#{PR} ready on"), run.lines)


class BotCheckEvidence(unittest.TestCase):
    """F16: a bot check that ended without reviewing does not satisfy ready."""

    def test_cancelled_greptile_check_is_not_a_review(self):
        fake = FakeGitHub(checks=[check("build", "pass"), check("Greptile Review", "cancel")])
        run = watch(fake)
        self.assertNotEqual(run.code, 0, run.lines)

    def test_skipped_greptile_check_is_not_a_review(self):
        fake = FakeGitHub(checks=[check("build", "pass"), check("Greptile Review", "skipping")])
        run = watch(fake)
        self.assertNotEqual(run.code, 0, run.lines)

    def test_passed_greptile_check_is_a_review(self):
        fake = FakeGitHub(checks=[check("build", "pass"), check("Greptile Review", "pass")])
        run = watch(fake)
        self.assertEqual(run.code, 0, run.lines)
        self.assertTrue(run.lines[-1].startswith(f"#{PR} ready on"), run.lines)

    def test_cancelled_check_with_a_review_on_the_head_is_a_review(self):
        fake = FakeGitHub(
            checks=[check("build", "pass"), check("Greptile Review", "cancel")],
            reviews=[greptile_review()],
        )
        run = watch(fake)
        self.assertEqual(run.code, 0, run.lines)


class NoCiChecks(unittest.TestCase):
    """F17: a PR with no CI checks can finish, but only after a grace period."""

    def test_no_checks_at_all_goes_green_after_the_grace_period(self):
        fake = FakeGitHub(checks=[], max_polls=30)
        run = watch(fake, until="green")
        self.assertEqual(run.code, 0, run.lines)
        self.assertTrue(run.lines[-1].startswith(f"#{PR} green on"), run.lines)
        started = 1_000_000.0
        self.assertGreaterEqual(run.clock.now - started, pr_wait.NO_CI_GRACE_SECONDS)

    def test_bot_only_repo_is_ready_once_greptile_reviewed(self):
        fake = FakeGitHub(checks=[check("Greptile Review", "pass")], reviews=[greptile_review()], max_polls=30)
        run = watch(fake)
        self.assertEqual(run.code, 0, run.lines)
        self.assertTrue(run.lines[-1].startswith(f"#{PR} ready on"), run.lines)

    def test_no_checks_does_not_report_checks_finished(self):
        fake = FakeGitHub(checks=[], max_polls=3)
        run = watch(fake, until="any-change")
        self.assertFalse(any("checks finished" in line for line in run.lines), run.lines)


PR_WORKFLOW = "on:\n  pull_request:\n    branches: [dev]\njobs:\n  build:\n    runs-on: ubuntu-latest\n"
PUSH_WORKFLOW = "on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n"
CRON_WORKFLOW = (
    "# Never runs for a push or a pull_request.\non:\n  schedule:\n    - cron: '0 3 * * *'\n"
    "  workflow_dispatch:\njobs:\n  nightly:\n    runs-on: ubuntu-latest\n"
)


class LateCiChecks(unittest.TestCase):
    """F54: the no-CI timer alone is not proof that a repo has no CI."""

    def test_pr_workflow_waits_for_checks_that_register_after_the_grace_period(self):
        # Poll 10 runs at 180 seconds of fake time, past the 120 second grace.
        fake = FakeGitHub(
            checks=[check("build", "pass")], checks_from_poll=10,
            workflows={".github/workflows/ci.yml": PR_WORKFLOW}, max_polls=30,
        )
        run = watch(fake, until="green")
        self.assertEqual(run.code, 0, run.lines)
        self.assertIn("1 pass", run.lines[-1])
        self.assertGreaterEqual(fake.polls, 10, run.lines)

    def test_pr_workflow_whose_checks_never_appear_exits_1_with_a_hint(self):
        fake = FakeGitHub(checks=[], workflows={".github/workflows/ci.yml": PR_WORKFLOW}, max_polls=200)
        run = watch(fake, until="green")
        self.assertEqual(run.code, 1, run.lines)
        self.assertIn("no checks appeared", run.lines[-1])
        self.assertIn(".github/workflows/ci.yml", run.lines[-1])
        self.assertGreaterEqual(run.clock.now - 1_000_000.0, pr_wait.NO_CHECKS_TIMEOUT_SECONDS)

    def test_pr_workflow_blocks_ready_for_a_bot_only_check_set(self):
        fake = FakeGitHub(
            checks=[check("Greptile Review", "pass")], reviews=[greptile_review()],
            workflows={".github/workflows/ci.yml": PR_WORKFLOW}, max_polls=200,
        )
        run = watch(fake)
        self.assertEqual(run.code, 1, run.lines)
        self.assertIn("no checks appeared", run.lines[-1])

    def test_bot_only_ready_line_says_no_ci_configured(self):
        fake = FakeGitHub(checks=[check("Greptile Review", "pass")], reviews=[greptile_review()], max_polls=30)
        run = watch(fake)
        self.assertEqual(run.code, 0, run.lines)
        self.assertIn("no CI configured", run.lines[-1])

    def test_no_workflows_says_no_ci_configured(self):
        fake = FakeGitHub(checks=[], max_polls=30)
        run = watch(fake, until="green")
        self.assertEqual(run.code, 0, run.lines)
        self.assertIn("no CI configured", run.lines[-1])

    def test_push_workflow_waits_for_checks_that_register_after_the_grace_period(self):
        # gh pr checks lists push runs on the head too, so they register late the same way.
        fake = FakeGitHub(
            checks=[check("build", "pass")], checks_from_poll=10,
            workflows={".github/workflows/ci.yml": PUSH_WORKFLOW}, max_polls=30,
        )
        run = watch(fake, until="green")
        self.assertEqual(run.code, 0, run.lines)
        self.assertIn("1 pass", run.lines[-1])

    def test_push_workflow_whose_checks_never_appear_exits_1(self):
        fake = FakeGitHub(checks=[], workflows={".github/workflows/ci.yml": PUSH_WORKFLOW}, max_polls=200)
        run = watch(fake, until="green")
        self.assertEqual(run.code, 1, run.lines)
        self.assertIn("no checks appeared", run.lines[-1])

    def test_schedule_only_workflow_takes_the_no_ci_path(self):
        fake = FakeGitHub(checks=[], workflows={".github/workflows/nightly.yml": CRON_WORKFLOW}, max_polls=30)
        run = watch(fake, until="green")
        self.assertEqual(run.code, 0, run.lines)
        self.assertIn("no CI configured", run.lines[-1])

    def test_trigger_forms_that_run_on_pull_requests(self):
        for text in (
            "on: pull_request\n",
            "on: [push, pull_request]\n",
            "on: [push]\n",
            chr(0xFEFF) + "on: push\n",
            '"on":\n  pull_request_target:\n',
            "on:\n- push\n- pull_request\njobs: {}\n",
            "name: ci\non:\n  push:\n  pull_request:\n    paths: ['src/**']\njobs: {}\n",
        ):
            self.assertTrue(pr_wait.triggers_on_pr(text), text)

    def test_pull_request_outside_the_on_block_does_not_count(self):
        for text in (
            "on: workflow_dispatch\njobs:\n  a:\n    if: github.event_name == 'pull_request'\n",
            "on: workflow_dispatch  # push and pull_request runs live elsewhere\njobs: {}\n",
            CRON_WORKFLOW,
            "on:\n  pull_request_review:\njobs: {}\n",
            "jobs:\n  a:\n    steps: [pull_request]\n",
        ):
            self.assertFalse(pr_wait.triggers_on_pr(text), text)

    def test_workflows_are_read_once_per_head(self):
        fake = FakeGitHub(checks=[], workflows={".github/workflows/nightly.yml": CRON_WORKFLOW}, max_polls=30)
        watch(fake, until="green")
        self.assertEqual(fake.workflow_calls, 2)


if __name__ == "__main__":
    unittest.main()
