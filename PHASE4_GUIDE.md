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

### Files, as they need to end up
- `.github/workflows/codeql.yml` — the advanced-setup workflow,
  referencing the config file below via `config-file:`
- `.github/codeql/codeql-config.yml` — points at both the standard
  `security-and-quality` suite and the custom query folder
- `.github/codeql/custom-queries/javascript/no-eval.ql` — a custom
  query flagging any use of `eval()`, with a short rationale specific
  to this repo: dynamic code execution is exactly the kind of pattern
  that could bypass the RBAC checks built in Phase 1
- `.github/codeql/custom-queries/javascript/qlpack.yml` — declares the
  custom query as a CodeQL package so it can be loaded

**Real-world gotcha (this happened here, not hypothetical):** these
files can end up in the wrong place two different ways. First, it's
easy to `git add`/commit them at the repo root instead of the nested
`.github/codeql/...` paths the config expects — a plain `git mv` into
place fixes it. Second, and more subtly: if you ever visit
**Security → Code scanning** and use GitHub's setup wizard there, it
can silently generate its own `.github/workflows/codeql.yml` (a
"CodeQL Advanced" template) that **overwrites your custom one** —
including dropping the `config-file:` reference to your custom query
entirely. If your custom query stops showing up, check whether the
workflow file still references `config-file:
./.github/codeql/codeql-config.yml`; if not, the wizard likely
clobbered it, and you'll need to re-merge your config-file reference
back into GitHub's current template (checkout/codeql-action versions
change over time, so match those from the current template rather
than reusing old ones verbatim).

### How to use it
1. **Settings → Advanced Security → Code scanning.** If default setup
   was previously enabled here, disable/remove it first — running both
   default and advanced setup for the same language can conflict.
2. Commit and push the files listed above, at the correct nested
   paths (identical steps on Windows or Mac — this is all Git, no
   OS-specific commands).
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

**Verified here:** step 3's fire test passed — a real alert appeared
citing `js/least-privilege-demo/no-eval` with the custom description
text, confirming the custom query genuinely executes. The eval() line
was then removed in a follow-up PR; **whether the alert actually
closed afterward has not yet been confirmed** — check
Security → Code scanning alerts and update this line once verified.

**Known open issue:** a PR was observed with a `Code scanning results
/ CodeQL` check showing **neutral — "1 configuration not found"**,
while a separate `CodeQL Advanced / Analyze` check ran successfully in
parallel on the same PR. This suggests two CodeQL configurations may
currently coexist (see the gotcha above), or the custom config isn't
being picked up consistently on every PR. Not yet root-caused — worth
checking **Settings → Advanced Security → Code scanning** for a
duplicate/conflicting setup before treating this phase as fully clean.

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
1. Add a `package.json` (if one doesn't exist — this repo had none, so
   this step wasn't optional) and intentionally install an **old,
   known-vulnerable** version of a small package — check the
   [GitHub Advisory Database](https://github.com/advisories) for a
   real example with a specific vulnerable version range.

   **Prerequisite check first:** confirm Node/npm are actually
   installed (`node --version`, `npm --version`). Not a given on every
   machine — here, Node wasn't installed at all and had to be
   installed from [nodejs.org](https://nodejs.org) (LTS) before `npm
   init` would work. As with the earlier `gpg`/signing-key PATH
   issues, a fresh terminal is needed after install for PATH changes
   to take effect.

   PowerShell / bash (npm commands are identical on both):
   ```
   npm init -y
   npm install <package>@<old-vulnerable-version>
   ```
2. Commit `package.json` and `package-lock.json` on a new branch, open
   a PR into `main`.
3. Confirm the **Dependency Review** check appears on the PR, fails,
   and the summary comment names the specific vulnerable package and
   advisory.
4. Update to a patched version (`npm install <package>@latest`), push
   to the same branch, confirm the check now passes and the PR becomes
   mergeable.
5. Merge the PR once both the fail and pass states are confirmed —
   keeping the (now-patched) dependency in the repo is fine; it's real
   evidence the control was exercised, not just configured.

**Verified here:** tested with `lodash@4.17.15`. The check failed and
named six real advisories by GHSA link — three high severity (command
injection, prototype pollution, code injection via `_.template`) and
three moderate (ReDoS and two further prototype pollution variants) —
at the `fail-on-severity: moderate` threshold. Upgrading to
`lodash@latest` on the same branch flipped the check to passing, and
the PR was merged, confirming the control responds correctly in both
directions rather than just failing once.

---

## Status

Both pieces are implemented and verified against the live repo — see
`SECURITY_DECISIONS.md` Phase 4 for the decision rationale and
evidence summary. Two things remain open before calling this phase
fully clean:
1. Confirm the CodeQL alert from the `eval()` test actually closed
   after the follow-up removal PR merged.
2. Root-cause the "1 configuration not found" neutral check observed
   alongside the parallel "CodeQL Advanced" workflow.
