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

**What it's testing:** whether you can redirect a live session, or
whether it only listens at the start and then runs to completion
regardless of what you say partway through.

### Steps
1. In the app, start a new session on this repo with:
   > "Add a short footer to index.html with the text 'Built as a
   > least-privilege demo.'"
2. As soon as it starts working (before it finishes — watch for the
   point where it's mid-edit or about to open a PR), send a follow-up
   in the same session:
   > "Actually, keep it to one line and put it right under the
   > closing </main> tag, not in a separate footer element."
3. Watch what happens: does it stop and adjust the in-progress work,
   restart from scratch with the new instruction, or ignore the
   follow-up and finish what it originally started?
4. When it opens the PR, check the actual diff against what you asked
   for the *second* time, not the first.

### What to note
- How long after your follow-up did it visibly react?
- Did the final result match your correction, your original request,
  or some mix of both?
- Close the PR without merging once you've seen the result — this one
  is purely for observing behavior, not a change you need on `main`.

## 4. The "My Work" dashboard, for real

**What it's testing:** whether the consolidated dashboard is actually
useful day-to-day, or just a nice idea on paper.

### Steps
1. In the app, find wherever repos are added/connected (a "+" or repo
   picker, same place you connected `least-privilege-demo` originally).
2. Add `copilot-github-sandbox` alongside it.
3. Open the **My Work** view (or equivalent dashboard/home screen) and
   look at what's shown across both repos at once — open sessions,
   recent PRs, issues, anything else.
4. Start a trivial session on `copilot-github-sandbox` (e.g. "what does
   this repo's CI workflow do?") while `least-privilege-demo` still has
   activity in its history, and confirm both show up in the same view
   without switching context manually.

### What to note
- What does the dashboard surface well (e.g. active sessions) versus
  what's missing or requires clicking into the repo directly (e.g.
  CI status, open alerts)?
- Is this something you'd actually use daily with more repos
  connected, or does it feel like overhead for just two?

## 5. Re-enable automations, briefly, on purpose

**What it's testing:** seeing the feature work firsthand, since Phase
7 disabled it based on reasoning alone, not observed behavior.

### Steps
1. Go to **Settings → Copilot → Cloud agent** on `least-privilege-demo`
   (same panel from Phase 7).
2. Turn **"Allow automations"** back **On**.
3. Set up one harmless, bounded automation — e.g. a scheduled task
   along the lines of "once, run a syntax check summary and comment
   the result on an issue" (avoid anything recurring forever; a
   one-off is enough to observe the behavior).
4. Wait for it to fire (or trigger the event it's watching for, if
   event-based rather than scheduled).
5. Confirm it actually ran, then turn **"Allow automations" back Off**
   — this is a deliberate, bounded experiment, not a standing change.

### What to note
- Did it run unattended exactly as configured, with no one
  triggering it directly?
- Would the "only allow automations triggered by users with write
  access" sub-setting have meaningfully changed what could happen
  here, or does the top-level "Allow automations" toggle alone cover
  the real risk?
- Confirm the toggle is back **Off** before moving on — don't leave
  this enabled after the experiment.

## 6. Compare a canvas session to a plain PR

**What it's testing:** whether the canvas/shared-workspace view (if
available in your version of the app) is a meaningfully different way
to work, or just a different skin on the same underlying session.

### Steps
1. Look for a canvas or shared-workspace option when starting a new
   session (naming and availability may vary by app version — if you
   don't see one, note that and skip this scenario for now rather than
   forcing it).
2. Assign the same kind of small, safe task as Scenario 2 through the
   canvas view instead of a plain issue/prompt — e.g. "add a comment
   above `knownRoles()` explaining what it's used for."
3. While it works, use whatever the canvas offers (shared terminal,
   inline plan, live diff view) rather than just waiting for a
   finished PR.
4. Compare directly to how Scenario 2 felt: could you follow along
   with *what it was doing and why* more easily here, or did it just
   look different without adding real visibility?

### What to note
- Is the canvas genuinely more transparent, or mostly cosmetic?
- Would you reach for this by default going forward, or only for
  larger/riskier tasks where visibility actually matters more?

---

These are meant to build fluency, not produce artifacts — none of
these need a `SECURITY_DECISIONS.md` entry unless one of them
surfaces something genuinely surprising (the way the Phase 8
adversarial tests did). If that happens, it's worth capturing the
same way: precisely, with the real evidence, positive or negative.
