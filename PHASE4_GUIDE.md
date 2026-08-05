# Phase 4 — Supply Chain & Code Security: How to Use / How to Test

Two pieces this phase: CodeQL with a custom query, and dependency
review gating PRs. Files referenced below are already created —
this guide is about wiring them in and proving they work.

---

## 1. CodeQL with a custom query

**What it is:** CodeQL scans your code for known vulnerability patterns
using pre-built query packs. A **custom query** goes further — you
write your own rule for a pattern specific to your codebase, not just
relying on the generic default set.

**Why "advanced setup" instead of the one-click default:** GitHub's
one-click **"Set up → Default"** option is quick but doesn't support
custom queries — it only runs the standard pack. To add a custom
query, you need **advanced setup**: a workflow file you control
(`codeql.yml`) plus a config file (`codeql-config.yml`) that references
both the standard suite and your custom query directory.

### Files already in place
- `.github/workflows/codeql.yml` — the advanced-setup workflow
- `.github/codeql/codeql-config.yml` — points at both the standard
  `security-and-quality` suite and the custom query folder
- `.github/codeql/custom-queries/javascript/no-eval.ql` — a custom
  query flagging any use of `eval()`, with a short rationale specific
  to this repo: dynamic code execution is exactly the kind of pattern
  that could bypass the RBAC checks built in Phase 1
- `.github/codeql/custom-queries/javascript/qlpack.yml` — declares the
  custom query as a CodeQL package so it can be loaded

### How to use it
1. **Settings → Advanced Security → Code scanning.** If default setup
   was previously enabled here, **disable/remove it first** — you
   can't run both default and advanced setup for the same language at
   once, they'll conflict.
2. Commit and push the files listed above (identical steps on Windows
   or Mac — this is all Git, no OS-specific commands).
3. The workflow triggers automatically on push/PR to `main`, and
   weekly on a schedule (catches newly-published patterns even with no
   code changes).

### How to test it
1. **Actions** tab — confirm the "CodeQL Analysis" run completes.
2. **Security → Code scanning alerts** — even a clean result (no
   alerts) confirms the scan genuinely ran, since the tab will show
   the last scan date and query pack used.
3. **Prove the custom query actually works, don't just trust it's
   included:** temporarily add a line like `eval("1+1")` anywhere in
   `script.js` or `rbac.js`, commit, push, and confirm a new alert
   appears in Code scanning alerts specifically citing your custom
   query (`js/least-privilege-demo/no-eval`), not just a generic
   built-in one. Then remove the line and confirm the alert closes on
   the next scan.

---

## 2. Dependency review

**What it is:** Scans dependencies **introduced in a pull request**
against known vulnerability databases, and can block the PR from
merging if a newly-added dependency has a known issue at or above a
severity threshold — catching the problem before merge, not after.

### File already in place
- `.github/workflows/dependency-review.yml` — runs on PRs targeting
  `main`, set to fail on `moderate` severity or higher, and posts a
  summary comment on the PR

### How to use it
1. Commit and push `dependency-review.yml`.
2. This repo currently has no dependencies, so there's nothing for it
   to flag yet — that's expected, not a problem. The check will still
   run and pass with "no dependency changes."

### How to test it — needs a real dependency to have something to catch
1. Add a `package.json` (if one doesn't exist) and intentionally
   install an **old, known-vulnerable** version of a small package —
   check the
   [GitHub Advisory Database](https://github.com/advisories) for a
   real example with a specific vulnerable version range.

   PowerShell / bash (npm commands are identical on both):
   ```
   npm install <package>@<old-vulnerable-version>
   ```
2. Commit `package.json` and `package-lock.json` on a new branch, open
   a PR into `main`.
3. Confirm the **Dependency Review** check appears on the PR, fails,
   and the summary comment names the specific vulnerable package and
   advisory.
4. Update to a patched version, push to the same branch, confirm the
   check now passes and the PR becomes mergeable.
5. Close the PR without merging once you've confirmed both the fail
   and pass states — no need to actually keep this dependency in the
   repo unless you want to build something with it later.

---

## Once both are done

Update `SECURITY_DECISIONS.md` — cover why advanced setup was needed
over default (custom query support), what the custom query specifically
catches and why it's relevant to this repo, and the real evidence from
testing (an alert that actually fired and closed, a PR that actually
got blocked and then passed).
