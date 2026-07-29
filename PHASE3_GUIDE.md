# Phase 3 — Human & Non-Human Identity: How to Use / How to Test

Three pieces this phase, each with a "how to use" and "how to test."

---

## 1. Non-human identity (NHI) — OIDC deploy to GitHub Pages

**What it is:** Instead of storing a long-lived deploy token or API key
as a secret, the workflow requests a short-lived OpenID Connect (OIDC)
token from GitHub at run time, scoped only to this one deployment. This
is the workload-identity equivalent of "just-in-time access" for humans
— no standing credential exists to be stolen, leaked, or forgotten.

### How to use it
1. `deploy.yml` is already written (in `.github/workflows/`). The key
   part is the `permissions:` block — `id-token: write` is what lets
   the workflow mint that short-lived token instead of needing a secret.
2. **Commit and push your changes** (whatever you've got staged locally
   — `deploy.yml` doesn't need to be its own separate commit, it can go
   with everything else). Nothing GitHub-Pages-specific happens yet;
   this is just adding files to the repo.
3. **Then**, on GitHub, go to **Settings → Pages** → under "Build and
   deployment," set Source to **GitHub Actions** (not "Deploy from a
   branch" — that older method doesn't use OIDC). You do this after
   pushing because there's nothing for the setting to point to until
   the workflow file actually exists in the repo.
4. Because the Pages source wasn't set yet at the moment you pushed in
   step 2, that first push likely didn't produce a successful
   deployment (the job may show as skipped or failed) — that's
   expected, not a mistake. Trigger a fresh run now by either making
   any small commit, or going to the **Actions** tab and choosing
   **"Re-run all jobs"** on the existing workflow run.

### How to test it
1. Go to the **Actions** tab — after the re-trigger in step 4 above,
   you should see a "Deploy to GitHub Pages" run complete successfully.
2. Click into it and confirm all four steps go green.
3. Visit **Settings → Pages** — it will show your live URL
   (`https://<username>.github.io/least-privilege-demo/`). Open it and
   confirm the RBAC demo works there, identical to local.
4. Check **Settings → Secrets and variables → Actions** — confirm there
   is no deploy token or credential stored there. That absence *is* the
   proof: the deployment authenticated without one.

---

## 2. PKI in practice — signed commits

**What it is:** A cryptographic signature (GPG or SSH key) attached to
each commit, proving it really came from you and wasn't tampered with
or spoofed. GitHub shows a "Verified" badge on signed commits.

### How to use it
1. Generate a signing key if you don't have one — GitHub's own guide
   covers both GPG and SSH signing:
   https://docs.github.com/en/authentication/managing-commit-signature-verification
   (SSH signing is simpler if you already have an SSH key set up for Git).
2. Add the public key to **Settings → SSH and GPG keys** on GitHub
   (as a *signing key*, not just an auth key, if using SSH).
3. Configure Git locally to sign commits by default:
   ```
   git config --global commit.gpgsign true
   git config --global gpg.format ssh   # if using SSH signing
   git config --global user.signingkey <path-to-your-key>
   ```
4. On GitHub: go to **Settings → Branches** (or **Rules → Rulesets**,
   see Phase 5) and require signed commits on `main`.

### How to test it
1. Make a commit and push it.
2. On GitHub, look at the commit — it should show a green **"Verified"**
   badge next to your name.
3. To prove the *requirement* is real, not just decorative: temporarily
   disable signing (`git config --global commit.gpgsign false`), try to
   push an unsigned commit directly to `main`, and confirm GitHub
   rejects it. Then re-enable signing.

---

## 3. Secret scanning + push protection

**What it is:** GitHub scans commits for patterns that look like real
credentials (API keys, tokens) and can block a push *before* the secret
ever reaches the repo's history — much stronger than catching it after
the fact.

### How to use it
1. Go to **Settings → Code security**.
2. Enable **Secret scanning** and **Push protection**.

### How to test it
1. In a scratch file (not `rbac.js` or anything real), paste a
   recognizable fake-but-realistic-looking token — GitHub's docs list
   safe test patterns, or use a real *revoked/expired* key you don't
   mind exposing. Do not use a live credential.
2. Try to commit and push it.
3. Push protection should block the push outright with an error
   pointing to the exact line and file. That block **is** the passing
   test — if the push succeeds, protection isn't working.
4. Remove the fake secret, commit again, and confirm the push now goes
   through normally.

---

## Once all three are done

Update `SECURITY_DECISIONS.md` — replace the Phase 3 "*not yet built*"
placeholder with the actual reasoning: why OIDC over a stored token, why
signed commits matter here, why push protection is preventive rather
than just detective.
