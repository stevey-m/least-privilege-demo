# Phase 6 — CI/CD Depth: How to Use / How to Test

Per `ROADMAP.md`, three pieces: a reusable workflow structure, a
matrix build across multiple Node versions, and a working deploy job.
The deploy job already existed and was already verified working
during Phase 5's environment-protection testing — that piece only
needed a small wrap-up step. The other two were genuinely new, and
turned out to be more fragile in practice than expected — this guide
reflects what actually happened, not just the intended steps.

## Important: how to write YAML files on this machine

**Do not hand-edit workflow YAML in Notepad, and do not use
multi-line PowerShell here-strings (`@"..."@`) pasted into the
terminal.** Both caused real, hard-to-spot failures during this phase:
Notepad's paste/auto-indent silently shifted an entire file's
indentation; a later edit introduced a literal tab character mixed
into space-indented YAML (YAML forbids tabs for indentation); and a
multi-line here-string paste failed to close properly, leaving the
terminal stuck waiting for more input.

**Use this method instead** — it writes the exact bytes to the file
in one command, with zero editor or terminal formatting involved:

1. Write the exact file content you want as plain text.
2. Base64-encode it (any online encoder, or ask for it pre-encoded).
3. Run a single line in PowerShell:
   ```powershell
   [System.IO.File]::WriteAllText("$PWD\path\to\file.yml", [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("<encoded content here>")))
   ```
4. Always verify immediately after writing, before committing:
   ```powershell
   Select-String -Path path\to\file.yml -Pattern "`t"
   Get-Content path\to\file.yml -Raw
   ```
   The first command must return nothing (no tabs found); the second
   lets you visually confirm the indentation and structure are exactly
   right before it ever reaches GitHub.

This isn't overkill — it's what actually worked after two other
approaches failed mid-phase.

---

## 1. CI workflow — syntax validation across a Node matrix

**What it is:** A workflow running on every PR and push to `main`,
checking `rbac.js` is at least syntactically valid, across Node
18/20/22 — catching a typo before it reaches CodeQL or deploy.

### How to use it — step by step
1. Branch:
   ```powershell
   cd C:\Users\steve\GIT\least-privilege-demo
   git checkout main
   git pull origin main
   git checkout -b add-ci-workflow
   ```
2. Write `.github/workflows/ci.yml` using the base64 method above,
   with this content:
   ```yaml
   name: CI

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   permissions:
     contents: read

   jobs:
     syntax-check:
       runs-on: ubuntu-latest
       strategy:
         fail-fast: false
         matrix:
           node-version: [18, 20, 22]
       steps:
         - name: Checkout repo
           uses: actions/checkout@v4

         - name: Set up Node ${{ matrix.node-version }}
           uses: actions/setup-node@v4
           with:
             node-version: ${{ matrix.node-version }}

         - name: Check rbac.js syntax
           run: node --check rbac.js
   ```
   **Two details that matter and are easy to get wrong:**
   - `fail-fast: false` is required, or GitHub cancels the other two
     Node versions the moment the first one fails — silently reducing
     "tested against 3 versions" to "tested against whichever failed
     first."
   - The `permissions: contents: read` block isn't optional polish —
     without it, GitHub Advanced Security flags a real Medium-severity
     finding ("Workflow does not contain permissions") for granting
     the `GITHUB_TOKEN` broader implicit access than the job needs.
   - If `package.json` doesn't exist in the repo (it shouldn't, unless
     you're using it for something else — see the Phase 4 cleanup
     note about the leftover `lodash` test dependency), don't add an
     `npm ci` step; `node --check` needs nothing installed.
3. Commit and push:
   ```powershell
   git add .github/workflows/ci.yml
   git commit -m "ci: add syntax-check workflow across Node 18/20/22"
   git push origin add-ci-workflow
   ```
4. Open the PR, confirm all three Node-version checks appear and
   pass, merge.

### How to test it — the deliberate-break procedure
1. Branch:
   ```powershell
   git checkout main
   git pull origin main
   git checkout -b test-ci-syntax-break
   ```
2. Open `rbac.js`, delete one closing `}` anywhere in the file, save.
3. Commit and push:
   ```powershell
   git add rbac.js
   git commit -m "test: deliberately break rbac.js syntax to verify CI catches it"
   git push origin test-ci-syntax-break
   ```
4. Open the PR. Confirm all three `syntax-check` jobs fail, and click
   into one to confirm the log shows a real `SyntaxError` (e.g.
   `SyntaxError: Unexpected end of input`) at roughly the line you
   edited — not an unrelated error.
5. Restore the file:
   ```powershell
   notepad rbac.js
   ```
   Add the `}` back exactly where it was (plain code edits like this
   are fine in Notepad — it's YAML indentation specifically that's
   fragile), save.
6. Commit and push:
   ```powershell
   git add rbac.js
   git commit -m "test: restore rbac.js syntax, confirm CI passes again"
   git push origin test-ci-syntax-break
   ```
7. Confirm all checks pass. Since this branch now only contains a
   revert-to-original state for `rbac.js` plus whatever real workflow
   fixes you made along the way, either merge it (if it carries a real
   fix worth keeping on `main`) or close it without merging (if it's
   purely the test), then clean up:
   ```powershell
   git checkout main
   git branch -D test-ci-syntax-break
   git push origin --delete test-ci-syntax-break
   ```

---

## 2. Reusable workflow structure

**What it is:** A separate workflow file
(`.github/workflows/reusable-node-setup.yml`) that performs checkout +
Node setup, callable from other workflows via `workflow_call` — a
single source of truth for that setup logic.

**Honest framing:** at this repo's size, three workflows each doing a
two-line checkout isn't heavy duplication this solves. The value here
is demonstrating the *pattern*, which matters more as a repo grows —
worth building and being able to speak to, without overstating what it
saves today.

### How to use it — step by step
1. Branch:
   ```powershell
   git checkout main
   git pull origin main
   git checkout -b add-reusable-workflow
   ```
2. Write `.github/workflows/reusable-node-setup.yml` (base64 method):
   ```yaml
   name: Reusable Node Setup

   on:
     workflow_call:
       inputs:
         node-version:
           required: true
           type: string

   jobs:
     setup:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout repo
           uses: actions/checkout@v4

         - name: Set up Node ${{ inputs.node-version }}
           uses: actions/setup-node@v4
           with:
             node-version: ${{ inputs.node-version }}
   ```
3. Update `.github/workflows/ci.yml` (base64 method — this is a full
   rewrite, not a partial edit, given how easily partial edits went
   wrong earlier in this phase):
   ```yaml
   name: CI

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   permissions:
     contents: read

   jobs:
     setup:
       strategy:
         fail-fast: false
         matrix:
           node-version: [18, 20, 22]
       uses: ./.github/workflows/reusable-node-setup.yml
       with:
         node-version: ${{ matrix.node-version }}

     syntax-check:
       needs: setup
       runs-on: ubuntu-latest
       strategy:
         fail-fast: false
         matrix:
           node-version: [18, 20, 22]
       steps:
         - name: Checkout repo
           uses: actions/checkout@v4

         - name: Set up Node ${{ matrix.node-version }}
           uses: actions/setup-node@v4
           with:
             node-version: ${{ matrix.node-version }}

         - name: Check rbac.js syntax
           run: node --check rbac.js
   ```
   **Real limitation, not a mistake:** `workflow_call` jobs run on
   isolated runners — `setup` cannot hand its checked-out files to
   `syntax-check`. `needs: setup` only orders execution; it does not
   pass the matrix down either, which is why `syntax-check` repeats
   its own `strategy: matrix:` block rather than inheriting one. Both
   jobs independently declare the full Node matrix and both run all
   three versions — that's intentional, not leftover duplication.
4. Commit and push both files together:
   ```powershell
   git add .github/workflows/ci.yml .github/workflows/reusable-node-setup.yml
   git commit -m "ci: factor Node setup into a reusable workflow"
   git push origin add-reusable-workflow
   ```
5. Open the PR, confirm you see six CI checks — `setup (18/20/22)`
   and `syntax-check (18/20/22)` — all passing, merge.

### How to test it — step by step
1. Repeat the exact deliberate-break procedure from Section 1 (new
   branch, remove a `}` from `rbac.js`, push, open PR).
2. Confirm the split result: `setup (18/20/22)` all **pass**
   (checkout + Node install don't touch `rbac.js`, so they have no
   reason to fail), while `syntax-check (18/20/22)` all **fail** with
   the real `SyntaxError` — same as Section 1. This confirms the two
   job types are genuinely decoupled, not just visually separated in
   the file.
3. Restore `rbac.js`, push, confirm all pass, close/clean up the
   branch the same way as Section 1.

---

## 3. Deploy job — wrap-up only

The deploy-to-Pages workflow already existed and was already verified
live during Phase 5 (a real merge triggered a deploy that paused for
approval and completed successfully). Nothing new to build.

### How to use it
1. Go to **Settings → Pages**, copy the live URL shown there (e.g.
   `https://stevey-m.github.io/least-privilege-demo/`).
2. Branch, add it near the top of `README.md`:
   ```powershell
   git checkout main
   git pull origin main
   git checkout -b add-live-demo-link
   notepad README.md
   ```
   (plain Markdown text — Notepad is fine here, it's only YAML
   indentation that's been the problem)
   ```markdown
   **Live demo:** https://stevey-m.github.io/least-privilege-demo/
   ```
3. Commit, push, open PR, merge:
   ```powershell
   git add README.md
   git commit -m "docs: add live demo link to README"
   git push origin add-live-demo-link
   ```

### How to test it
Click the link from the README on GitHub itself (not a local copy)
and confirm the RBAC demo loads and actually works — role dropdown,
permissions readout, known-roles note all functioning on the live
deployed site, not just locally.

---

## Once all three are done

Update `SECURITY_DECISIONS.md` with a Phase 6 entry covering: the real
YAML fragility encountered and how it was ultimately solved (the
base64 write method), the `fail-fast` and `permissions` findings, the
reusable-workflow limitation stated plainly, and confirmation the live
demo URL works and reflects current code.
