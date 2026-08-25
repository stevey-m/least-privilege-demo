# Copilot Instructions — least-privilege-demo

This repo is a portfolio/demo project showing least-privilege identity
practices for humans, non-human identities (CI/CD, deploy), and AI
agents — RBAC modeling, OIDC deployment, signed commits, supply-chain
security, and review/deployment gates. It is intentionally small and
static (no backend, no build step for the site itself).

## Code conventions

- Plain vanilla JavaScript (`rbac.js`, inline `<script>` in
  `index.html`) — no frameworks, no bundler, no TypeScript.
- Functions in `rbac.js` use JSDoc-style comment blocks
  (`@param`, `@returns`) — match this style for any new function.
- Fail closed, not open: unrecognized roles/resources/actions should
  always resolve to `false`/denied, never default to allowed. This is
  a deliberate security property of `can()` — do not change this
  default behavior without flagging it explicitly as a real change,
  not a fix.
- Keep the site's dependency footprint minimal. Don't add npm
  packages unless there's a genuine reason — an unused dependency was
  previously found and removed (see `SECURITY_DECISIONS.md`, Phase 4)
  specifically because it undercut the repo's own least-privilege
  narrative.

## Guardrails already in place — don't try to work around these

- `rbac.js` and everything under `.github/workflows/` and
  `.github/codeql/` are CODEOWNERS-protected — PRs touching these
  paths are expected to request review, and that's intentional.
- `main` has a branch ruleset requiring PR review before merge, with
  self-approval disabled. A PR you open will not be mergeable without
  a human approval — this is expected behavior, not a bug to route
  around.
- CI (syntax-check across Node 18/20/22), CodeQL (JavaScript and
  GitHub Actions), and Dependency Review all run on every PR and are
  expected to pass. If one of these fails, fix the underlying issue —
  don't disable or weaken the check itself to make it pass.
- The GitHub Pages deploy requires manual approval via a protected
  environment (`github-pages`) — don't add steps intended to bypass or
  auto-approve this.

## Where to look before making a change

- `SECURITY_DECISIONS.md` documents *why* things are built the way
  they are, phase by phase, including real bugs found and fixed along
  the way. If a change would touch something documented there,
  reference the relevant phase rather than re-deriving the reasoning
  from scratch.
- `ROADMAP.md` shows what's done vs. planned. Don't assume an
  unplanned feature is wanted just because it would be technically
  interesting to add.

## Scope discipline

Keep changes scoped to what was actually asked. This repo has
intentionally minimal surface area — a demo repo that accumulates
unrequested "nice to have" additions works against its own purpose as
a clear, auditable example.
