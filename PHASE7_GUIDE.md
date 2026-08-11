# Phase 7 — Agent Identity: How to Use / How to Test

Per `ROADMAP.md`: once using the Copilot coding agent, explicitly
scope its `GITHUB_TOKEN` permissions to the minimum needed, rather
than accepting default broad permissions. This phase is smaller than
5 or 6, but the *idea* — even an AI agent's identity should follow
least privilege, same as a human's — is central to this repo's whole
premise.

**Before starting, a heads-up:** GitHub's Copilot surfaces (the
coding agent, the desktop app, the CLI) have been changing quickly —
several major updates landed between June and August 2026 alone.
Some exact menu paths below may have shifted by the time you do this.
If a setting isn't where this guide says, check
[GitHub's Copilot coding agent docs](https://docs.github.com/copilot/using-github-copilot/coding-agent/about-assigning-tasks-to-copilot)
for the current location rather than assuming the guide is wrong —
this is one of the fastest-moving parts of GitHub's product surface
right now.

---

## 1. Assign a real task to the Copilot coding agent

**What it is:** GitHub's coding agent can be assigned a GitHub Issue
directly (similar to assigning it to a person) and will open a draft
PR with its attempted changes, working in its own isolated
environment/branch.

### How to use it — step by step
1. On GitHub, go to your repo → **Issues → New issue**.
2. Title it something small and safe to hand to an agent first, e.g.
   *"Add a short 'How RBAC denies unknown roles' note to README.md."*
   Keep the first real test low-stakes — a docs tweak, not a change to
   `rbac.js` or any workflow file.
3. In the **Assignees** panel on the right, look for **Copilot** as an
   assignable option (this requires Copilot coding agent to be
   enabled for the repo — if it's not listed, check
   **Settings → Copilot → Coding agent** and enable it there first).
4. Assign the issue to Copilot. It should start a background session
   and, after some time, open a pull request referencing the issue.

### How to test it
1. Watch the PR Copilot opens — read its description of what it did
   and why.
2. Confirm the existing controls from earlier phases apply to it
   exactly like any other PR: CODEOWNERS-based review requirement,
   the ruleset (no self-approval, no direct push), CI checks
   (syntax-check, CodeQL, Dependency Review) all still run against
   Copilot's PR the same as a human's.
3. This is itself a meaningful confirmation: an agent's changes don't
   get any special bypass through the controls built in Phases 4–6 —
   worth stating plainly as a real, tested fact rather than an
   assumption.

---

## 2. Scope the coding agent's `GITHUB_TOKEN` permissions

**What it is:** By default, tokens granted to automated actors
(including Copilot's coding agent, and any Actions workflow it
triggers) can carry broader permissions than a given task needs —
same class of problem as the "Workflow does not contain permissions"
CodeQL finding fixed in Phase 6, but for the agent's own identity
rather than a workflow file.

### How to use it — step by step
1. Check the **org/repo-level Copilot coding agent settings** — as of
   this writing, look under **Settings → Copilot → Coding agent** for
   an environment or permissions configuration section. GitHub has
   been iterating on exactly where this lives, so if it's not there,
   search the current docs for "coding agent permissions" or
   "coding agent environment" rather than assuming it's missing.
2. If the coding agent's changes run through a **custom GitHub Actions
   workflow** (rather than entirely through GitHub's managed agent
   infrastructure), the same fix from Phase 6 applies directly — add
   an explicit `permissions:` block to that workflow, scoped to only
   what the agent's task needs (e.g. `contents: write` only if it
   needs to push to its own branch, `pull-requests: write` if it opens
   PRs itself, nothing broader).
3. Where GitHub exposes an explicit **environment or scope setting for
   the coding agent** (as opposed to a workflow file you control
   directly), set it to the minimum the agent actually needs — for
   this repo, that's realistically: read the repo, write only to
   branches it creates itself, open PRs. It should not need
   `admin`, `workflows:write`, or the ability to push directly to
   `main` (which the ruleset from Phase 5 already blocks regardless).

### How to test it
1. Confirm via the PR from Section 1: what permissions did the agent's
   session actually appear to have? Did it only touch its own branch,
   or did anything suggest broader access?
2. **Prove the existing least-privilege controls hold even for an
   agent** — this is the more important test, and it's mostly already
   done by Phase 5's ruleset: confirm Copilot's PR is still blocked
   from merging without review, the same as a human's PR would be.
   Screenshot or note this explicitly — "the agent's PR was held to
   the same bar as a human's" is a stronger, more specific claim than
   "the agent has limited permissions," and it's one you can actually
   prove with what's already built.
3. Document exactly what scope was found/set and how it was verified
   — even a partial or "GitHub didn't expose this as configurable at
   the time of testing, so the effective control is the branch
   ruleset instead" finding is a legitimate, honest result worth
   writing up, not a failure.

---

## Once done

Update `SECURITY_DECISIONS.md` with a Phase 7 entry: what task was
assigned to the coding agent, what its resulting PR looked like, what
permission scoping was actually available to configure (name the real
setting found, or state plainly if none was exposed and the ruleset is
doing the enforcement instead), and confirmation that Phase 5's review
gates applied to the agent's PR exactly as they do to a human's.
