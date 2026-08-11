# Appendix — GitHub Copilot App: Orientation Notes

A standalone reference note, separate from the phase guides — useful
on its own for anyone (including a non-developer, or someone wanting
customer-call fluency rather than hands-on building) getting oriented
on GitHub's current Copilot surfaces. Relevant to Phase 7 (agent
identity) and Phase 8 (Copilot depth) in this repo, but written to
stand alone.

**This entire space has moved fast — GitHub shipped major changes to
these tools between June and August 2026 alone, with weekly
changelog entries since.** Treat every click-path below as
"approximately right as of when this was written," not gospel — the
concepts (what each surface is *for*) are far more stable than the
exact menus. When in doubt, GitHub's own changelog
(`https://github.blog/changelog/`) and docs
(`https://docs.github.com/copilot`) are the source of truth.

---

## The current landscape, in plain terms

There are three main **entry points** for working with GitHub
Copilot's agent features today — VS Code, the CLI, and the desktop
app — plus one important **capability** that isn't tied to any single
entry point: the coding agent. These get confused constantly (even
among developers), so it's worth being precise:

- **Agent mode** — Copilot working *synchronously, alongside you*,
  live in an editor: it plans, edits multiple files, runs terminal
  commands, and iterates on test failures while you watch and steer.
  You're both looking at the same session in real time.
- **The coding agent** — Copilot working *asynchronously, in the
  cloud*: you assign it a GitHub Issue (like assigning it to a
  teammate), walk away, and come back later to a ready pull request.
  This is what Phase 7 in this repo uses. It runs independently of
  any editor being open.

Those two capabilities show up across all three entry points below —
none of them "owns" one or the other exclusively.

### Entry point 1 — VS Code
The original, most developer-centric surface, and still fully
current — not being phased out. Agent mode here reached general
availability on both VS Code and JetBrains in March 2026 (previously
VS Code-only). You open Copilot Chat, switch the mode picker to
**Agent**, and it works live in your editor — creating files, editing
code, running the terminal, iterating until tests pass. You can also
hand a task off to the async coding agent from inside VS Code rather
than working through it live yourself; look for an **Agents panel**
or similar (naming has shifted a few times, so check the current
Copilot Chat sidebar if this exact label doesn't match). VS Code is
also where **custom agents**, **agent skills**, and **MCP
connections** (linking Copilot to external tools/data sources) are
most mature — worth knowing if a customer asks about extensibility
specifically.

### Entry point 2 — Copilot CLI
A terminal-based tool (`github/copilot-cli`) for people who live in a
command line. Got a significant redesign alongside the app's launch:
voice input, a new tabbed interface for browsing PRs/issues/gists
without leaving the terminal, and scheduled recurring tasks. Can hand
a task to the async coding agent from the terminal too (a shortcut
like `&` sends the current task to the cloud agent to keep running
while you do something else — verify the current key in the CLI's own
help, as this kind of shortcut is exactly the sort of detail that
shifts between releases).

### Entry point 3 — GitHub Copilot app
A dedicated desktop application (Windows, Mac, Linux), generally
available since June 2026 and open to every Copilot plan (including
free) since July 2026. GitHub's newer, more approachable entry point
— aimed partly at people who don't want to work inside VS Code or a
terminal at all. A visual dashboard rather than a code editor,
oriented around managing multiple coding-agent sessions in parallel
rather than writing code live yourself.

**They're linked, not separate silos:** a session started in the CLI
can be opened directly in the desktop app via an `/app` command, and
the app itself has an integrated terminal and browser built in. None
of the three was discontinued or "replaced" by another — all three
continue to be actively developed in parallel, with GitHub
positioning the app as a unifying home base for keeping track of
sessions started anywhere.

## What the desktop app specifically adds

At its core, it's a control center for **agent sessions** — instances
of Copilot working on a task (assigned from an issue, a PR, or a
typed prompt), each running in its own isolated Git worktree so
multiple sessions can work on the same repo without interfering with
each other.

Notable pieces, as of GA:
- **"My Work" view** — one dashboard showing active sessions, issues,
  PRs, and background automations across every connected repo, rather
  than hunting through separate browser tabs.
- **Canvases** — a shared, bidirectional workspace where you and the
  agent both see and can act on the same plan, PR, terminal, or
  browser session — meant to make an agent's progress visible and
  steerable rather than buried in a chat transcript.
- **Cloud automations** — scheduling agent work to run on a timer or
  in response to GitHub events (e.g. a new issue), independent of
  your machine being on.
- **Remote control** — starting a session on desktop or CLI and
  checking on or steering it later from github.com or the GitHub
  mobile app.
- **Sandboxing and policy support** — both cloud and local sandboxing
  for agent-run code, with org policy controls (relevant for
  Enterprise/Business admins).

## Access notes worth knowing

- Available on every Copilot plan, including Copilot Free — no paid
  subscription strictly required to try it (bring-your-own-key mode
  exists for running sessions against your own model provider too).
- **On Copilot Business or Enterprise plans specifically, an
  org/enterprise admin must enable Copilot CLI in policy settings**
  before the desktop app is accessible to members of that
  organization. If you're on a company-managed account and the app
  won't sign in, this policy setting is the first thing to check.

## Getting started — a few concrete things to try, one per entry point

1. **VS Code:** open Copilot Chat, switch the mode picker to
   **Agent**, and give it a small, safe, real-time task in a scratch
   file or repo — watch it plan, edit, and run terminal commands live
   while you stay in the loop. This is the fastest way to feel the
   difference between "suggesting code" and "agent mode."
2. **CLI:** install it (`npm install -g @github/copilot`), start a
   session, and try the `/app` command to see the hand-off into the
   desktop app directly.
3. **Desktop app — download and sign in.**
   `https://github.com/features/ai/github-app` has the current
   download links. Sign in with your normal GitHub account.
4. **Desktop app — start a session from an existing issue.** If
   Phase 7's coding agent test issue is still open in
   `least-privilege-demo`, try opening the app, finding that issue,
   and watching how the app represents an in-progress agent session
   compared to how it looks on github.com's web UI.
5. **Desktop app — try the "My Work" view** with a couple of
   different repos connected, to get a feel for what a consolidated
   dashboard looks like versus tab-switching on github.com.
6. **Desktop app — open the integrated terminal inside a session**
   and try a read-only git command (`git log`, `git status`) to see
   how the app's terminal relates to the underlying repo state.

## Why this is worth knowing beyond this repo

For anyone in a customer-facing role, the useful framing to hold onto
isn't the exact button layout (that will keep changing) — it's the
shape of the problem GitHub is solving: as AI agents write more code,
the harder problem becomes **tracking and reviewing what they did**,
not generating the code itself. Every surface described here (My
Work, Canvases, remote control, sandboxing) is really about that
review-and-oversight problem, not about writing code faster. That
framing tends to answer more real customer questions than a feature
list does.
