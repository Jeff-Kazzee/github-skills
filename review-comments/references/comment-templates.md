# Comment templates

Copy a template, fill every `{{field}}`, and delete any line marked optional that you do not
need. Each template names the examples in [sources.md](sources.md) it is shaped from. The
filled versions adapt those examples. Their SHAs, line numbers and outputs are illustrative,
so never copy them into a real review.

The first word is always the label, followed by a colon: `blocking:`, `nit:`, `question:`,
`suggestion:` or `praise:`. A question whose answer gates the merge is `question (blocking):`.
Everything that is not labelled `blocking` is optional for the author.

## Blocking defect with evidence

Shaped from Node.js 67183 r4471871654, Rails 59631 r4473075093, CPython 160812
r4503805568 and Rust 163758 r4502988236.

````markdown
blocking: {{What goes wrong, in one sentence, naming the input or state}}.

{{Evidence. One of: the command you ran and its output on head {{short sha}}, a minimal
repro, or the cited lines that establish it plus what stopped you running it.}}

```{{language}}
{{repro, command, or output}}
```

{{The fix you expect, or the fix you would accept. Optional when the fix is obvious.}}
````

Filled:

````markdown
blocking: `bufferSize` is read twice, so a getter that returns `1` and then `0` still
reaches the native call with `0` and crashes the process.

On head 3f2a9c1e7b04, this exits with SIGABRT. On main it throws `ERR_OUT_OF_RANGE`.

```js
let n = 0;
fs.opendirSync('.', { get bufferSize() { return n++ ? 0 : 1; } });
```

Read it once into a local and validate the local.
````

## Nit

Shaped from Kubernetes 143760 r4500377936, Rails 59530 r4447328114 and Django 22192
r4493031062.

````markdown
nit: {{The polish point and its reason, in one sentence}}.

```suggestion
{{replacement lines}}
```
````

Filled:

````markdown
nit: the parent method is a generator, so return an empty generator here to keep the
return type consistent.

```suggestion
        yield from ()
```
````

## Question

Shaped from Kubernetes 143760 r4500369391, Rust 163758 r4503670749 and CPython 161536
r4503051470. Ask a real question that the author can answer in one reply. Say what you
expected, so the author sees your model of the code.

````markdown
question: {{The question}}? {{What you expected instead, or the case you are thinking of.}}
````

Filled:

````markdown
question: should this check `pod.Spec.Resources.Requests.Memory().IsZero()` rather than
`IsPodLevelResourcesSet`? A pod can set CPU at pod level and still leave memory unset.
````

## Suggestion with a suggestion block

Shaped from Node.js 66902 r4445951789, CPython 161543 r4502218529 and CPython 161321
r4504386971. Select exactly the lines you want replaced. The block replaces all of them, so
copy their indentation. An empty block deletes them. Add a note when GitHub renders the
change in a confusing way.

````markdown
suggestion: {{What changes and why, in one sentence}}.

```suggestion
{{replacement for every selected line}}
```

{{Optional: the intent in words, when the rendered diff hides it.}}
````

Filled:

````markdown
suggestion: these steps do not need npm, and `node --run` avoids the extra process.

```suggestion
node --run build:wasm
node --run build
node --run test
```
````

When the change spans lines outside the selection or several files, write numbered steps
instead of a block, as in Rust 163758 r4503520698.

## Praise

No praise comment in the sample was strong enough to model, so this follows Google
(comments.md, "Giving Guidance") and Chromium (cr_respect.md, "Mention the positives").
Name the specific thing and why it helps, the same as any other comment.

````markdown
praise: {{The specific thing}}. {{Why it helps the codebase or the reviewer.}}
````

Filled:

````markdown
praise: splitting the refactor into its own commit made the behavior change easy to
check. I could read the second commit in five minutes.
````

## Review summary: approve

Shaped from Rust 147696, Rust 165301, Node.js 66470 and Django 19984 (5792162313).

````markdown
{{What you checked and how, in one or two sentences. Name the head SHA.}}

{{Optional: the one thing done well, with why.}}

To merge: nothing required. {{Or: address {{the named comments}} first.}}
{{Optional: Remaining comments are nits or suggestions. Follow-ups: {{issue links}}.}}
````

Filled:

````markdown
I read every file at 7c41e09a2b11 and ran the unit tests, which pass. The fallback to the
old path covers every case where the new route cannot apply, so behavior is unchanged.

To merge: nothing required. The two remaining comments are nits.
````

## Review summary: request changes

Shaped from Node.js 66569, CPython 161321 (5815823317) and TypeScript 64988. Name every
blocking comment. A request for changes that names no required change is the anti-example
in Rails 59631 (5815098935).

````markdown
{{One sentence on the approach: agree, or the concern with it.}}

To merge:
1. {{Blocking item, with a link to its comment}}
2. {{Blocking item}}

{{Optional: Not reviewed yet: {{files or areas}}. I will review them {{when}}.}}
````

Filled:

````markdown
The fix is worth having and the approach is right. Two things block it.

To merge:
1. The `compileall` calls need the same `RUNSHARED_FOR_BUILD` change (comments on lines
   2015 and 2031).
2. The new test passes without the fix on a release build. Use the longer input from the
   issue so it fails first.
````

## Review summary: comment

Use Comment for a partial review, or when you only have questions. Shaped from Kubernetes
140473, Kubernetes 143579 (5808708821) and Django 19984 (3367490746). State the scope, so the
author knows what still needs a reviewer.

````markdown
{{Initial review | Review of {{scope}}}}. {{What you covered and what you did not.}}

{{The main point, if any.}}

To merge: {{what you need to see, or "undecided until I review {{scope}}"}}.
````

Filled:

````markdown
Review of the controller, not the tests yet. No major problems so far. Much of the
precondition logic lives in the admission plugins, so the controller should say so in a
comment.

To merge: an e2e test that the metrics are reported. I will review the tests by Friday.
````

## Re-review reply

Shaped from Django 22074 r4470642942, Rails 59631 (5781366131) and Node.js 67277
r4487274135. Reply in the thread you opened. Name the commit you checked.

````markdown
{{Resolved | Partly resolved | Still open}} at {{short sha}}: {{what you checked and what you saw}}.

{{If still open: the remaining case, with evidence, as in the blocking template.}}
````

Filled, resolved:

````markdown
Resolved at 263b630ef7: `"foo_#{super}"` returns `foo_id` again, and the new test fails
on the parent commit. Thanks.
````

Filled, still open:

````markdown
Partly resolved at 9b1d4e2a: the first case now raises. The case where async code runs
inside a sync `atomic()` block still writes outside the transaction.

```python
with transaction.atomic():
    async_to_sync(create_two_rows)()
```
````

Filled, the author pushed back and was right:

````markdown
You're right, `end` and `_end` have different pointer types, so the separate variable
is needed. Dropping this.
````
