# least-privilege-demo

//README

A static web app demonstrating least-privilege identity practices for
humans, workloads, and AI agents — RBAC, OIDC deployment, signed
commits, and scoped agent permissions — built with GitHub Copilot.

## Objectives

This repo exists to demonstrate applied identity and access management
thinking in a real GitHub CI/CD pipeline, not just Copilot usage.

1. **Least-privilege access modeling** — RBAC demo (viewer / editor / admin)
2. **Non-human identity (NHI)** — OIDC-based deployment; no static
credentials for the workload
3. **Secret scanning + push protection** — enabled and demonstrated
4. **PKI in practice** — signed commits, verifying human committer identity
5. **Supply-chain security** — CodeQL custom queries + dependency review
gating merges
6. **Review-gated changes** — CODEOWNERS routes sensitive paths to
mandatory reviewers
7. **Approval-gated deployments** — protected environments with required
reviewers
8. **Scoped agent identity** — Copilot coding agent's token permissions
minimized to least privilege
9. **Production-shaped CI/CD** — reusable workflows, matrix testing,
live deployed demo
10. **Deliberate AI-assisted development** — custom Copilot instructions
file, documented usage patterns

## Out of scope

Standing up real PKI/CA infrastructure (issuing certs, managing a trust
chain, revocation) is intentionally excluded. In practice that's owned
by a dedicated identity team, not an individual engineer — this repo
demonstrates *applying* PKI concepts (signed commits) rather than
*building* PKI infrastructure.

## Structure

```
/index.html   - demo page with the RBAC permission checker
/rbac.js      - role-based access control demo logic
/style.css    - styling
/ROADMAP.md   - phased build plan
/SECURITY\_DECISIONS.md - design-doc style write-up of each choice (Phase 2)
/.github/workflows/    - CI/CD, added in Phase 5
```

## Setup

1. Create the repo on GitHub (public).
2. Clone it locally, drop in `index.html`, `rbac.js`, `style.css`.
3. Open in VS Code with Copilot enabled and work through `ROADMAP.md`
phase by phase.

