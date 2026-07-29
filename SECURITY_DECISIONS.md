# Security Architecture Decisions

This doc explains the *why* behind each security-relevant choice in this
repo, not just the *what*. Updated as each phase of ROADMAP.md is built.

---

## Phase 1 — RBAC demo

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

## Phase 2 — (this doc)

No separate technical decision — this phase is the discipline of writing
decisions down as they're made, rather than reconstructing them later
from memory or commit messages.

---

## Phase 3 — Human & non-human identity *(not yet built)*

*To be filled in once OIDC deployment, signed commits, and secret
scanning/push protection are implemented.*

## Phase 4 — Supply chain & code security *(not yet built)*

*To be filled in once CodeQL custom queries and dependency review are
added.*

## Phase 5 — Review & deployment gates *(not yet built)*

*To be filled in once CODEOWNERS, protected environments, and
repository rulesets are configured.*

## Phase 6 — CI/CD depth *(not yet built)*

*To be filled in once the reusable workflow structure, matrix build,
and deploy job exist.*

## Phase 7 — Agent identity *(not yet built)*

*To be filled in once the Copilot coding agent's token permissions are
explicitly scoped.*

## Phase 8 — Copilot depth *(not yet built)*

*To be filled in once `.github/copilot-instructions.md` exists and any
Copilot Chat agent-mode / CLI usage has been tried and is worth noting.*
