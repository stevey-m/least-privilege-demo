# least-privilege-demo — Roadmap

Ten objectives, built in phases so each one has something real to build
on top of. See README.md for the full objective descriptions.

## Phase 1 — RBAC demo (done)

`rbac.js` + the permission-checker UI in `index.html`. Gives every later
phase (CODEOWNERS, review gates, agent scoping) a real feature to
protect instead of a placeholder.

## Phase 2 — Security Decisions doc

Write `SECURITY_DECISIONS.md` — a short design-doc explaining *why*
each choice below was made, as you make it. Written like a case study,
not a checklist; this is the piece that reads best in an interview.

## Phase 3 — Human & non-human identity

- **NHI:** Deploy to GitHub Pages via OIDC federation — no stored
  deploy token or long-lived secret.
- **PKI:** Require signed commits on `main`.
- **Secrets:** Enable secret scanning + push protection; deliberately
  trigger and resolve one flagged "leak" to demonstrate the control.

## Phase 4 — Supply chain & code security

- CodeQL with at least one custom query (not just the default setup).
- Dependency review action blocking PRs that introduce a known-vulnerable
  dependency.

## Phase 5 — Review & deployment gates

- **CODEOWNERS** — route changes to `rbac.js` and workflow files through
  mandatory reviewers.
- **Protected environment** — require manual approval before deploy
  (break-glass / just-in-time access pattern).
- Repository rulesets on `main` (replaces basic branch protection).

## Phase 6 — CI/CD depth

- Convert to a reusable workflow structure.
- Matrix build (multiple Node versions).
- Working deploy job to GitHub Pages — live demo URL for the resume/portfolio.

## Phase 7 — Agent identity

- Once using the Copilot coding agent, explicitly scope its `GITHUB_TOKEN`
  permissions to the minimum needed (e.g. read issues, write only to its
  own branch) rather than accepting default broad permissions.

## Phase 8 — Copilot depth

- Add `.github/copilot-instructions.md` tailored to this repo's
  conventions.
- Document any Copilot Chat "agent mode" or CLI usage tried along the way.

## Phase 9 — Issues & PRs

Open real issues for each phase above (even retroactively for completed
work), work at least one through a full branch → PR → Copilot review →
merge cycle.

---

## Suggested build order

1. RBAC demo — done.
2. Security Decisions doc — start now, keep updating as you go.
3. Human & non-human identity (OIDC, signed commits, secret scanning).
4. Supply chain & code security.
5. Review & deployment gates.
6. CI/CD depth.
7. Agent identity.
8. Copilot depth — layer in throughout, not a discrete step.
9. Issues & PRs — apply to all phases above.
