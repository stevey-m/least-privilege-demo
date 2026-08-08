# Phase 5 — Review & Deployment Gates: How to Use / How to Test

Per `ROADMAP.md`, three pieces: CODEOWNERS, a protected environment
requiring manual approval before deploy, and repository rulesets on
`main`. Only the environment protection rule (section 3) is a pure
Settings toggle with no file involved — CODEOWNERS and the ruleset
both start from scratch. Commands given for both **PowerShell
(Windows)** and **bash/zsh (Mac/Linux)** where relevant.

**Do section 1 (CODEOWNERS) before section 2 (ruleset).** The ruleset
requires review before merging any PR, including CODEOWNERS testing
in section 1 — doing 2 first means fighting the self-approval block
for something unrelated to what you're testing. Section 3 (environment
protection) is independent and can be done any time.

---

## 1. CODEOWNERS — route sensitive files through mandatory reviewers

**What it is:** A file that maps paths to required reviewers. Any PR
touching a matched path automatically requests review from the named
owner(s), and — once required via a ruleset — can't be merged without
their approval. This is the difference between "someone happened to
review it" and "changes to the RBAC logic *cannot* merge without
review," which is the actual point for a least-privilege story.

### How to use it
1. **Create the file locally and push it, rather than using the
   GitHub web UI's "Create new file" button.** Either works, but doing
   it locally matches the workflow you'll use for everything else in
   this repo, and keeps you in the habit of working on a branch rather
   than editing `main` directly in the browser.

   Start a new branch first (never commit straight to `main`):

   PowerShell:
   ```powershell
   cd C:\Users\steve\GIT\least-privilege-demo
   git checkout main
   git pull origin main
   git checkout -b add-codeowners
   ```

   bash/zsh:
   ```bash
   cd ~/GIT/least-privilege-demo
   git checkout main
   git pull origin main
   git checkout -b add-codeowners
   ```

2. **Create the `.github` folder if it doesn't already exist, then the
   file inside it** — note: the filename is exactly `CODEOWNERS`, no
   extension.

   PowerShell:
   ```powershell
   New-Item -ItemType Directory -Path ".github" -Force
   New-Item -ItemType File -Path ".github\CODEOWNERS"
   notepad .github\CODEOWNERS
   ```
   (`notepad` opens it for editing — any editor works, including VS
   Code via `code .github\CODEOWNERS` if you have it installed.)

   bash/zsh:
   ```bash
   mkdir -p .github
   touch .github/CODEOWNERS
   nano .github/CODEOWNERS
   ```

3. **Paste this into the file, save, and close the editor:**
   ```
   # RBAC logic — changes here should always get a second look
   /rbac.js @stevey-m

   # Workflow and security config — same reasoning
   /.github/workflows/ @stevey-m
   /.github/codeql/ @stevey-m
   ```
   Replace `@stevey-m` with your actual GitHub username if different.

4. **Commit and push the branch:**
   ```
   git add .github/CODEOWNERS
   git status
   git commit -m "docs: add CODEOWNERS for rbac.js and workflow files"
   git push origin add-codeowners
   ```
   (Same commands on PowerShell and bash — this part is pure Git.)

5. **Open the pull request.** After the push, GitHub's terminal output
   will include a direct link like
   `https://github.com/<you>/least-privilege-demo/pull/new/add-codeowners`
   — open that in a browser, review the diff, and click **Create pull
   request**.

6. **Merge it.** Since no ruleset exists yet at this point (that's
   section 2 below), you can merge this first PR yourself without
   restriction — click **Merge pull request** on the PR page, confirm.

7. Update your local `main` so it matches:
   ```
   git checkout main
   git pull origin main
   ```

### How to test it — step by step
1. **Create a test branch and make a small change to `rbac.js`:**
   ```
   git checkout -b test-codeowners-rbac
   ```
   Open `rbac.js` in an editor and make any trivial change (e.g. add a
   comment line like `// codeowners test`), save it.
2. **Commit and push:**
   ```
   git add rbac.js
   git commit -m "test: verify CODEOWNERS routes rbac.js reviews"
   git push origin test-codeowners-rbac
   ```
3. **Open the PR** the same way as step 5 above (follow the link in
   the push output, or go to the repo on GitHub — it'll show a yellow
   banner offering "Compare & pull request").
4. **On the PR page, look at the "Reviewers" panel** on the right side
   — confirm it automatically shows you (or whoever you mapped) as a
   requested reviewer. That's CODEOWNERS routing working.
5. **Close this test PR without merging** (there's a "Close pull
   request" link near the bottom) — it was only to confirm the
   routing, the throwaway comment doesn't need to go into `main`.
   Delete the local branch too if you want to tidy up:
   ```
   git checkout main
   git branch -D test-codeowners-rbac
   git push origin --delete test-codeowners-rbac
   ```
6. **Repeat with an unrelated file to confirm scoping:** same steps,
   but edit `README.md` instead of `rbac.js`. Open that PR and confirm
   the Reviewers panel does **not** auto-populate — proves CODEOWNERS
   is only matching the paths you listed, not applying to every PR.
   Close/delete this test branch the same way as step 5.

---

## 2. Repository ruleset on `main` — require CODEOWNERS approval

**What it is:** CODEOWNERS on its own only *requests* review — it
doesn't block a merge. A ruleset with "Require review from Code
Owners" turns that request into a real gate.

### How to use it — click path
1. On GitHub, go to your repo, then **Settings** (top tab, gear icon
   area) → in the left sidebar, **Rules → Rulesets** → **New ruleset**
   → **New branch ruleset**.
2. Give it a name, e.g. `main-protection`.
3. Under **Enforcement status**, leave it as **Active** (or set it —
   this can also be done last, see step 6).
4. Under **Target branches**, click **Add target** → **Include default
   branch** (this targets `main` without you having to type it).
5. Scroll to **Branch rules** and check these boxes:
   - **Require a pull request before merging**
   - Under the options that expand below that, check **Require review
     from Code Owners**
   - Find **Required approvals** and set it to **1** (it defaults to
     0 — easy to miss, and leaves the requirement effectively
     toggled-on-but-not-enforced if left alone)
6. Scroll to **Bypass list** → **Add bypass** → add yourself, but set
   the mode dropdown next to your name to **"For pull requests
   only"**, not the default **"Always allow."** ("Always allow" would
   let you skip the *entire* ruleset including direct pushes to
   `main` — "For pull requests only" scopes the bypass to just
   skipping review on your own PRs while still blocking direct
   pushes.)
7. Scroll up, confirm **Enforcement status** is **Active**, click
   **Create** at the bottom.

### How to test it — step by step
1. **Confirm direct pushes are blocked.** Try pushing straight to
   `main` without a PR:
   ```
   git checkout main
   echo "test" >> README.md
   git add README.md
   git commit -m "test: attempt direct push to main"
   git push origin main
   ```
   This should be **rejected** — Git will print an error naming the
   ruleset. Undo the local commit so you don't accidentally push it
   later:
   ```
   git reset --hard origin/main
   ```
2. **Confirm self-approval is blocked.** Open the CODEOWNERS test PR
   flow again (or reuse the `test-codeowners-rbac` steps from section
   1) — with the change pushed and the PR open, go to the **Files
   changed** tab, click **Review changes**, select **Approve**, and
   submit. GitHub should refuse this with a message like "you cannot
   approve a pull request created by you" — even though you're the
   admin. That rejection is the proof the control is real, not
   cosmetic.
3. **Confirm the merge button is genuinely blocked** on that PR until
   an approval exists from someone other than you. As a solo
   maintainer this is a real limitation to note honestly in
   `SECURITY_DECISIONS.md` — you'd either use your scoped bypass
   deliberately (documented as intentional, not a workaround) or need
   a second collaborator/account to fully exercise this control
   end-to-end.
4. Close/delete the test branch and PR when done, same as section 1
   step 5.

---

## 3. Protected environment — manual approval before deploy

**What it is:** A GitHub Environment (e.g. `production`) that the
`deploy.yml` workflow targets, configured to pause and wait for a
named approver before the deploy job actually runs — even though the
workflow triggers automatically. This is the just-in-time /
break-glass pattern: the deploy *can* happen, but a human has to
consciously let it through each time, rather than every merge to
`main` silently going live.

### How to use it — step by step

**First, a correction to the general approach above:** this repo's
`deploy.yml` already targets an environment named `github-pages` —
GitHub's `actions/deploy-pages` action creates and manages this
automatically, it isn't something you name yourself. So there's no
YAML edit needed here; you just need to add the approval requirement
to that existing environment.

1. On GitHub: repo → **Settings → Environments**. You should already
   see `github-pages` listed (auto-created by the first successful
   Pages deploy) — click into it rather than creating a new one.
2. Under **Deployment protection rules**, check **Required
   reviewers**, add yourself in the box that appears, click **Save
   protection rules**.
3. That's the whole change — no branch, no commit, no PR needed for
   this part, since it's a repo setting rather than a file.

### How to test it — step by step
1. Trigger a deploy — merge any PR to `main` (the `docs-close-can-finding`
   PR or the CODEOWNERS PR below both work fine for this).
2. Go to the **Actions** tab and click into the running "Deploy to
   GitHub Pages" workflow run.
3. Confirm the deploy job shows **Waiting** (not running immediately)
   — this is the proof the gate is real. There should be a button or
   banner saying something like "Review deployments."
4. Click it, select the `github-pages` environment, click **Approve
   and deploy**.
5. Confirm the job then proceeds and completes normally — check
   **Settings → Pages** for the live URL and confirm the site still
   loads correctly afterward.
6. Note for `SECURITY_DECISIONS.md`: this adds a manual step to every
   deploy — a real tradeoff (slower iteration) in exchange for a human
   checkpoint before anything goes live. State that tradeoff
   explicitly rather than presenting the gate as free.

---

## Once all three are done

Update `SECURITY_DECISIONS.md` with a Phase 5 entry — same format as
Phases 1/3/4: the decision, the rationale, and what was actually
verified (a real rejected self-approval, a real "Waiting" deploy run
that required manual approval, not just "the settings are toggled
on"). Be explicit about the solo-maintainer caveat on CODEOWNERS
rather than letting the guide imply a multi-person review process
that doesn't exist here.
