# least-privilege-demo

A static web app demonstrating least-privilege identity practices for
humans, workloads, and AI agents — RBAC, OIDC deployment, signed
commits, and scoped agent permissions — built with GitHub Copilot.

**Status: all 9 planned phases complete.** See `ROADMAP.md` for the
phase list and `SECURITY_DECISIONS.md` for the full reasoning and
tested evidence behind every choice below.

**Live demo:** https://stevey-m.github.io/least-privilege-demo/

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
/index.html                        - demo page with the RBAC permission checker
/rbac.js                           - role-based access control demo logic
/style.css                         - styling
/package.json, package-lock.json   - minimal, no real runtime dependencies

/ROADMAP.md                        - phased build plan, with status per phase
/SECURITY_DECISIONS.md             - design-doc write-up of every choice, phase by phase
/APPENDIX_COPILOT_APP.md           - standalone orientation note on GitHub's
                                      Copilot surfaces (VS Code, CLI, desktop app)

/PHASE3_GUIDE.md through PHASE7_GUIDE.md
                                    - step-by-step "how to use / how to test"
                                      guides for each phase, written for a
                                      GitHub beginner, including real gotchas
                                      hit along the way

/.github/CODEOWNERS                - routes rbac.js and workflow changes to
                                      mandatory review (Phase 5)
/.github/copilot-instructions.md   - repo conventions and guardrails for
                                      Copilot's coding agent and agent mode (Phase 8)
/.github/codeql/                   - custom CodeQL query + config (Phase 4)
/.github/workflows/                - CI, CodeQL, Dependency Review, and
                                      Pages deploy workflows
```

## How RBAC denies unknown roles

The `can(role, resource, action)` function in `rbac.js` follows a
**deny-by-default** pattern for unknown roles:

```js
const permissions = ROLE_PERMISSIONS[role];
if (!permissions) {
  return false; // unknown role: deny by default
}
```

If a caller passes a role string that does not exist in `ROLE_PERMISSIONS`
(e.g. `"superuser"` or an empty string), the lookup returns `undefined` and
the function immediately returns `false` — granting no access at all.
This is the least-privilege default: anything not explicitly permitted is
denied, so typos or novel role names fail closed rather than open.

This rule is deliberate enough that it's written into
`.github/copilot-instructions.md` — see `SECURITY_DECISIONS.md` Phase 8
for a real example of GitHub's Copilot coding agent declining a task
that would have violated it.

## Exploring this repo

The site itself needs no setup — either visit the live demo above, or
open `index.html` directly in a browser after cloning.

To understand how it was built and why, in order:
1. `ROADMAP.md` — what was built, phase by phase, and current status
2. `SECURITY_DECISIONS.md` — the reasoning and real tested evidence
   behind each phase, including bugs hit and how they were resolved
3. `PHASE3_GUIDE.md` through `PHASE7_GUIDE.md` — literal step-by-step
   instructions for reproducing each phase, written for someone new
   to GitHub
4. `APPENDIX_COPILOT_APP.md` — a standalone primer on GitHub's current
   Copilot surfaces (VS Code, CLI, desktop app), useful independent of
   this specific repo

## Reproducing this from scratch

If starting a similar project from nothing: create a repo, add
`index.html` / `rbac.js` / `style.css`, then work through `ROADMAP.md`
phase by phase using the corresponding `PHASE*_GUIDE.md` for each one.
