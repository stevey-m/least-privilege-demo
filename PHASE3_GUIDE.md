# Phase 3 — Human & Non-Human Identity: How to Use / How to Test

Three pieces this phase, each with a "how to use" and "how to test."
Commands are given for both **PowerShell (Windows)** and **bash/zsh
(Mac/Linux)**, since this was built on Windows but is meant to be
reproducible on Mac too. Notes below reflect real issues hit along the
way, not just the idealized path.

---

## 1. Non-human identity (NHI) — OIDC deploy to GitHub Pages

**What it is:** Instead of storing a long-lived deploy token or API key
as a secret, the workflow requests a short-lived OpenID Connect (OIDC)
token from GitHub at run time, scoped only to this one deployment. This
is the workload-identity equivalent of "just-in-time access" for humans
— no standing credential exists to be stolen, leaked, or forgotten.

No OS-specific commands in this step — it's all GitHub UI and a commit
push, identical on any platform.

### How to use it
1. `deploy.yml` (in `.github/workflows/`) is already written. The key
   part is the `permissions:` block — `id-token: write` is what lets
   the workflow mint that short-lived token instead of needing a secret.
2. **Commit and push your changes** (whatever's staged locally —
   `deploy.yml` doesn't need to be its own separate commit). Nothing
   GitHub-Pages-specific happens yet; this just adds files to the repo.
3. **Then**, on GitHub, go to **Settings → Pages** → under "Build and
   deployment," set Source to **GitHub Actions** (not "Deploy from a
   branch" — that older method doesn't use OIDC). This has to happen
   after pushing, since there's nothing for the setting to point to
   until the workflow file actually exists in the repo.
4. Because the Pages source wasn't set yet at the moment you first
   pushed, that first run likely didn't produce a successful deployment
   (job showed as skipped or failed) — expected, not a mistake. Trigger
   a fresh run with any small commit, or **Actions tab → "Re-run all
   jobs"** on the existing run.

### How to test it
1. **Actions** tab — confirm the "Deploy to GitHub Pages" run completes
   with all steps green.
2. **Settings → Pages** shows your live URL
   (`https://<username>.github.io/least-privilege-demo/`) — open it,
   confirm the RBAC demo works there identically to local.
3. **Settings → Secrets and variables → Actions** — confirm no deploy
   token or credential is stored there. That absence is the proof.

---

## 2. PKI in practice — signed commits

**What it is:** A cryptographic signature attached to each commit,
proving it really came from you. GitHub shows a "Verified" badge on
signed commits, and — once required via a ruleset — will actually
reject unsigned pushes outright.

**Note on GPG vs SSH signing:** GPG signing on Windows has a real
history of agent/keyring flakiness — hit a `Couldn't load public key`
error here that traced back to GPG's background agent (`keyboxd`)
losing track of a key it definitely had, compounded by Git Bash and
PowerShell resolving `gpg` to different (or no) binaries. **SSH-based
signing turned out to be the more reliable path** — no agent, no
keyring daemon, just a key file. On Mac, GPG (via Homebrew) is
generally more consistent since there's only one shell environment to
worry about, but SSH signing is still simpler and worth defaulting to
either way.

### How to use it (SSH signing)

**Check for an existing key first, before generating a new one:**

PowerShell (Windows):
```powershell
Get-ChildItem -Path "C:\Users\<you>" -Recurse -Filter "id_*.pub" -ErrorAction SilentlyContinue
```

bash/zsh (Mac):
```bash
find ~ -iname "id_*.pub" 2>/dev/null
```

**If none exists, generate one:**

PowerShell:
```powershell
ssh-keygen -t ed25519 -C "<your-email>" -f "C:\Users\<you>\.ssh\id_ed25519"
```

bash/zsh:
```bash
ssh-keygen -t ed25519 -C "<your-email>" -f ~/.ssh/id_ed25519
```

**Point Git at it** — on Windows, use forward slashes even though it's
Windows, since Git's config file treats backslash as an escape
character and will silently corrupt a backslash path. On Mac this
isn't an issue since paths are forward-slash natively.

PowerShell:
```powershell
git config --global gpg.format ssh
git config --global user.signingkey "C:/Users/<you>/.ssh/id_ed25519.pub"
git config --global commit.gpgsign true
```

bash/zsh:
```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

**Copy the public key to add to GitHub:**

PowerShell:
```powershell
Get-Content "C:\Users\<you>\.ssh\id_ed25519.pub"
```

bash/zsh:
```bash
cat ~/.ssh/id_ed25519.pub
```

On GitHub: **Settings → SSH and GPG keys → New SSH key** → paste it in
→ set **Key type to "Signing Key"** (not Authentication — easy to
miss, and a key added as Authentication-only won't verify signatures).

**Require it via a ruleset** (GitHub UI, same on any platform) rather
than the older "Classic branch protection": **Rules → Rulesets → New
ruleset → New branch ruleset** → target the default branch → check
**Require signed commits** → set Enforcement to **Active** → Create.

### How to test it
1. Commit and push. Confirm the commit shows a green **Verified**
   badge on GitHub.
2. Confirm the requirement is actually enforced, not cosmetic: the
   ruleset should reject an unsigned commit if you try (e.g. by
   temporarily unsetting `commit.gpgsign`) — a real rejection message
   citing "Commits must have verified signatures" is the proof.
3. If a push is rejected as unverified even though you signed it, the
   key almost certainly isn't registered on GitHub yet for *this*
   machine — a key added for one laptop doesn't cover another (this
   will matter directly when you move to Mac — you'll need to generate
   and register a separate key there, or copy the same private key
   over if you want one identity across both machines).

---

## 3. Secret scanning + push protection

**What it is:** GitHub scans commits for patterns that look like real
credentials and can block a push before the secret ever reaches the
repo's history.

**As of the current GitHub UI, this setting lives under Settings →
Advanced Security → Secret Protection**, not a separate "Code security"
page as older docs describe. The control itself is a toggle labeled
**Enable / Disable** (not "On/Off" as some documentation phrases it).

No OS-specific commands for enabling it — this step is GitHub UI only.

### How to use it
1. **Settings → Advanced Security → Secret Protection** → set **Push
   protection** to **Enable**.

### How to test it — and two real gotchas to know about
1. **Don't use the common AWS example key
   (`AKIAIOSFODNN7EXAMPLE`) as your test secret** — it's GitHub's own
   documented placeholder, used everywhere, and appears to be
   allowlisted so it doesn't trigger false alerts. Testing with it will
   make push protection look broken when it isn't.
2. **Don't embed a literal, realistic-looking fake secret directly in
   this guide (or any committed file) either** — a genuinely
   confirmed incident: an earlier version of this exact guide
   contained a realistic Slack-bot-token-shaped example string, and
   push protection correctly blocked *this documentation file itself*
   the moment it was committed, since the example matched Slack's
   real token format closely enough to trigger detection. Construct
   your own test string locally instead of copying one from written
   material: something in the shape of `xoxb-` followed by two
   dash-separated groups of roughly 10–13 digits and a ~24-character
   alphanumeric suffix. Generate it yourself (e.g. a quick throwaway
   script or manual typing), don't paste one from a guide or the web.
3. Commit and push it. Push protection should reject the push outright
   with a `GH013` error naming the exact secret type, commit, and file.
4. **To clean up, amend rather than layer a new commit on top** — if
   you've already tried to push the secret commit and it was rejected,
   it never reached the remote, so `git commit --amend` +
   `git reset --hard origin/main` (if things get tangled with a merge)
   is the way back to a clean state without leaving the secret sitting
   in history. Both commands are identical on PowerShell and bash —
   this is Git behavior, not OS-specific.
5. Confirm the final clean state: `git log --oneline -5` matches
   `origin/main`, working tree clean, and the file no longer contains
   the fake secret.

**A subtlety worth understanding:** push protection scans the *whole
set of commits* in a push, not just the final file state. Deleting the
secret in a later commit and pushing both together still gets blocked,
because the earlier commit in that push still contains it. The clean
fix is removing it from history (amend, or reset to a point before it
existed), not adding a "removed the secret" commit on top.

---

## Once all three are done

Update `SECURITY_DECISIONS.md` with the real reasoning — including
what actually got tested and how (e.g. "a push containing a fake
secret was rejected by push protection and never reached shared
history" is stronger evidence than "the toggle is enabled").
