# AI Dev Scenarios — Practicing with the GitHub Copilot App

A handful of low-stakes, hands-on scenarios for building real comfort
with the Copilot app, using `least-privilege-demo` as the sandbox.
Not a phase — no security decision to verify here, just practice.
Do these whenever, in any order, at your own pace.

## 1. Orientation — ask, don't build

Open the app, select this repo, and just ask it questions — no task,
no edit:
- "What does `rbac.js` do?"
- "What security controls does this repo have on `main`?"
- "Summarize what `copilot-instructions.md` tells you about this repo."

Goal: get a feel for how it answers from context alone, before ever
asking it to change anything.

## 2. A small, real, safe task

Assign it something genuinely useful and low-risk — not adversarial
this time:
> "Add a short code comment above `ROLE_PERMISSIONS` in rbac.js
> explaining that this is the single source of truth for role
> permissions."

Watch the resulting PR go through the same review/CI gates as every
other one in this repo. This is what "normal," non-adversarial usage
looks like day to day.

## 3. Steering mid-task

Start a task, then — while it's still working — send a follow-up
message changing direction slightly, e.g. start with "add a footer to
index.html," then mid-session add "actually, keep it to one line."
Goal: get a feel for how responsive it is to redirection while a
session is live, not just at the start.

## 4. The "My Work" dashboard, for real

Connect a second repo (`copilot-github-sandbox` is a good candidate)
alongside this one, and use the My Work view to glance at both without
switching browser tabs. Notice what it surfaces (open sessions, PRs,
issues) and what it doesn't.

## 5. Re-enable automations, briefly, on purpose

Phase 7 disabled "Allow automations" deliberately. As a bounded
experiment: temporarily re-enable it, set up one harmless scheduled or
event-triggered automation (e.g. "run a syntax check summary weekly"),
observe it fire once, then turn "Allow automations" back off.
Goal: see the feature work firsthand before deciding you don't need it
long-term, rather than only knowing it from the settings description.

## 6. Compare a canvas session to a plain PR

If the app's canvas/shared-workspace view is available, assign a task
through it instead of a plain issue, and compare the experience to
Scenario 2 above — is it clearer to follow along, or just different?

---

These are meant to build fluency, not produce artifacts — none of
these need a `SECURITY_DECISIONS.md` entry unless one of them
surfaces something genuinely surprising (the way the Phase 8
adversarial tests did). If that happens, it's worth capturing the
same way: precisely, with the real evidence, positive or negative.
