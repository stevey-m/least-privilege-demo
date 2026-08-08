# Security Architecture Decisions

This doc explains the *why* behind each security-relevant choice in this
repo, not just the *what*. Updated as each phase of ROADMAP.md is built.

## Current Status (at a glance)

| Phase | Status |
|---|---|
| 1 — RBAC demo | ✅ Implemented and verified |
| 2 — Writing decisions down | 🔄 Ongoing |
| 3 — Human & non-human identity | ✅ Implemented and verified |
| 4 — Supply chain & code security | ✅ Implemented and verified |
| 5 — Review & deployment gates | ✅ Implemented and verified |
| 6 — CI/CD depth | ⏳ Planned, not started |
| 7 — Agent identity | ⏳ Planned, not started |
| 8 — Copilot depth | ⏳ Planned, not started |

---

## Phase 1 — RBAC demo ✅ Implemented and verified

**Decision: model permissions as `role -> resource:action` strings, not
role -> boolean flags per feature.**

A flags-based model (`canEditDocs: true`) tends to sprawl into one flag
per feature and gets harder to reason about as the app grows. The
`resource:action` string model (`document:write`) scales more predictably
— adding a new resource or action is additive, not a schema change, and
it mirrors how real IAM policy statements are usually expressed (a
principal, a resource, an action).

**Decision: unknown roles are denied by default (`can()` returns `false`
for any role not in `ROLE_PERMISSIONS`), rather than falling through to
an implicit allow.**

This is a deliberate least-privilege / fail-closed choice. A typo'd or
newly-introduced role should never accidentally inherit broad access —
the safe failure mode is "nothing is allowed" until a role is explicitly
defined with explicit permissions, not the reverse.

**Decision: each role's permission list is defined explicitly and in
full, rather than computed by inheritance (e.g. "editor = viewer +
extra").**

Inheritance chains are convenient short-term but make it harder to
audit *exactly* what a given role can do without mentally walking the
chain — especially relevant for a demo whose whole point is
legibility. Explicit lists cost a little duplication but make each
role's access self-contained and reviewable at a glance.

**Decision: kept entirely client-side / static, with no real backend or
persisted state.**

This repo demonstrates *permission modeling concepts*, not a production
auth system — a real system would need server-side enforcement (never
trust a client-side check alone), token-based identity, and persistence.
Scoping this phase to the model itself, without the added surface area
of a real backend, keeps the demo focused and avoids implying it's more
production-ready than it is.

---

## Phase 2 — Writing decisions down as they're made 🔄 Ongoing

No separate technical decision — this phase is the discipline of writing
decisions down as they're made, rather than reconstructing them later
from memory or commit messages. This document is the artifact of that
discipline, and stays ongoing for as long as the repo keeps evolving.

---

## Phase 3 — Human & non-human identity ✅ Implemented and verified

**Decision: deploy to GitHub Pages via OIDC instead of a stored deploy
token or long-lived secret.**

The workflow requests a short-lived, scoped credential from GitHub at
run time rather than relying on a static secret sitting in repo
settings — no standing credential exists to leak, rotate, or forget.
Verified live: the site deploys successfully, and no deploy
token/credential is present anywhere in the repo's stored secrets.

**Decision: use SSH-based commit signing rather than GPG.**

GPG signing was the original plan, but hit real reliability issues on
Windows — a background agent/keyring component intermittently failed to
locate a key that was demonstrably present, compounded by inconsistent
`gpg` binary resolution across shells. SSH-based signing avoided this
entirely (no agent, no keyring daemon) and proved reliable in practice.
Verified live: commits show as "Verified" on GitHub, and a ruleset
requiring signed commits genuinely rejects an unsigned push attempt.

**Decision: enable secret scanning with push protection, and prove it
blocks a real secret rather than just trusting the toggle.**

Push protection was tested by deliberately attempting to push a
realistic fake secret. The push was rejected outright — the secret
never reached shared repository history. This is stronger evidence
than "the setting is enabled": it demonstrates the control actively
intercepts a real attempt, not just that the feature exists.

---

## Phase 4 — Supply chain & code security ✅ Implemented and verified

**Decision: use CodeQL's advanced setup (custom config + custom query
pack) rather than the default auto-generated setup, so a
repo-specific query could be added.**

The default setup only runs GitHub's standard query suites and doesn't
allow adding custom queries. A custom query flagging `eval()` usage was
added given the RBAC logic elsewhere in the repo — dynamic code
execution is a meaningful risk to call out specifically in a
least-privilege-focused demo, beyond what the standard suites already
cover. Verified live: a deliberately-introduced `eval("1+1")` test line
in `rbac.js` produced a real alert with rule ID
`js/least-privilege-demo/no-eval` and the custom query's description
text — confirming the custom query genuinely executes, not just that
the workflow runs.

**Decision: add a dedicated `dependency-review` workflow with
`fail-on-severity: moderate`, and prove it blocks a real vulnerable
package rather than trusting the configuration alone.**

Tested by installing a known-vulnerable version of `lodash`
(`4.17.15`) on a branch and opening a PR. The check failed and listed
six distinct advisories by name and GHSA link (three high severity —
command injection, prototype pollution, code injection via
`_.template`; three moderate — ReDoS and two further prototype
pollution variants). Upgrading to the latest `lodash` on the same
branch flipped the check to passing, confirming the control responds
correctly in both directions (blocks the bad state, clears on
remediation) rather than just failing once and never re-evaluating.

**Open item — resolved:** the root cause of the "1 configuration not
found" warning was identified: the live `codeql.yml` workflow's matrix
only defined `javascript-typescript`, while `main`'s scanning history
still expected a second `actions`-language configuration (almost
certainly a remnant of the earlier GitHub-auto-generated "CodeQL
Advanced" template that had briefly overwritten the custom workflow).
Resolved by explicitly adding `language: actions` to the matrix —
GitHub Actions workflow YAML is itself a real attack surface (script
injection via untrusted PR titles/branch names, secrets misuse,
overly-broad `permissions:` blocks), so scanning it fits this repo's
security focus rather than being scope creep.

**Accepted finding:** CodeQL flagged `can()` in `rbac.js` as an
"unused function." This is a known limitation of the analysis, not
real dead code — `can()` is called from an inline `<script>` block in
`index.html`, and CodeQL's JavaScript analysis doesn't trace calls
from inline HTML script blocks back into a separately-loaded `.js`
file. Verified this is the explanation (not a real problem) by
confirming the call site exists in `index.html`. Documented here as an
accepted/known finding rather than restructuring the script-loading
model solely to satisfy the scanner. Manually dismissed in
**Security → Code scanning alerts** with reason "Used in tests / false
positive" and a note referencing this explanation, so the audit trail
in GitHub reflects a documented decision rather than an alert that
silently disappeared.

**Resolved finding:** CodeQL also flagged `permissionsFor()` and
`knownRoles()` in `rbac.js` as genuinely unused — accurate at the
time, since they were written but never called from the UI. Fixed by
adding a live "Permissions for this role" readout and a "Known roles"
note to `index.html`, so both functions are now exercised by the
actual demo rather than being dead code kept only for the sake of a
docblock.

---

## Phase 5 — Review & deployment gates ✅ Implemented and verified

**Decision: add a CODEOWNERS file mapping `rbac.js` and workflow/CodeQL
config paths to the maintainer, so PRs touching sensitive files are
flagged for review rather than relying on remembering to look closely.**

Verified: a test PR modifying an unrelated file (`README.md`) did not
trigger any automatic reviewer request, confirming the path matching
is scoped correctly rather than firing on every PR. A test PR modifying
`rbac.js` did not show an automatic reviewer request either — but this
is expected, not a failure: GitHub never auto-requests the PR author as
their own reviewer, even when CODEOWNERS technically matches them. As
sole maintainer, this specific positive case can't be directly observed
from the author's seat; real proof of enforcement came instead from the
ruleset testing below.

**Decision: add a repository ruleset (`main-protection`) on `main`
requiring a pull request, review from Code Owners, and 1 approval
before merging — and prove each restriction with a real attempt rather
than trusting the toggles.**

Verified live, in order:
- **Direct push to `main` rejected** — Git returned "push declined due
  to repository rule violations," a real ruleset-level rejection, not
  a routine Git error.
- **Self-approval refused** — attempting to approve a PR authored by
  the same account was explicitly rejected by GitHub ("PR author
  authors cannot approve"), even with admin/owner permissions.
- **Merge blocked without a qualifying approval** — the PR's merge
  button stayed disabled, showing "At least 1 approving review is
  required by reviewers with write access."

**Decision: add a scoped bypass ("For pull requests only") for the
maintainer, rather than leaving the bypass list empty indefinitely or
using the broader "Always allow" mode.**

With an empty bypass list and no second reviewer available, real PRs
became permanently unmergeable — a genuine solo-maintainer limitation,
not a flaw in the control itself. "For pull requests only" scopes the
exception to skipping review on the maintainer's own PRs specifically,
while direct pushes to `main` remain blocked (confirmed unchanged by
this addition). Verified live: after adding the bypass, a PR still
showed the review requirement as present and unmet, but exposed a
distinct, explicit **"Merge without waiting for requirements to be met
(bypass rules)"** action — a deliberate, visible action rather than a
silent full exemption, giving a clear audit trail on any PR merged this
way.

**Decision: enable Required reviewers on the `github-pages` deployment
environment, with "Prevent self-review" deliberately left off.**

Enabling "Prevent self-review" here would recreate the same
solo-maintainer bind as the ruleset — deploys would be permanently
stuck at "Waiting" with no second person able to approve them. The
security value being demonstrated is the *pause itself*: a deploy
cannot silently happen the instant a PR merges; a human must
consciously look at it and approve, even if that human is the same
person who merged the code. This protects against, for example, an
automated or compromised process pushing straight to a live deploy
with zero human involvement — a different and still meaningful threat
model from "a second person catches something the first person
missed," which isn't available here. Verified live: a real merge to
`main` produced a deploy run that stopped at status "Waiting," with
GitHub explicitly logging "stevey-m requested your review to deploy to
github-pages." After manual approval, the same run logged "stevey-m
approved now → github-pages" and completed successfully.

**Solo-maintainer caveat, stated explicitly:** every review-based
control in this phase (CODEOWNERS routing, mandatory PR review,
deployment approval) currently resolves to the same single person
approving their own work via a documented, scoped bypass — not a real
second set of eyes. The value demonstrated here is the *pattern* and
its *mechanics* (a control that genuinely blocks direct action and
requires a deliberate, logged exception to proceed), not a claim that
independent review is actually happening in this repo today.

## Phase 6 — CI/CD depth ⏳ Planned, not started

*To be filled in once the reusable workflow structure, matrix build,
and deploy job exist.*

## Phase 7 — Agent identity ⏳ Planned, not started

*To be filled in once the Copilot coding agent's token permissions are
explicitly scoped.*

## Phase 8 — Copilot depth ⏳ Planned, not started

*To be filled in once `.github/copilot-instructions.md` exists and any
Copilot Chat agent-mode / CLI usage has been tried and is worth noting.*
