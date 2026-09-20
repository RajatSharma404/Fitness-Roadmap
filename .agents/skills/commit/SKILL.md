---
name: commit
description: >-
  Commits and pushes changes atomically one file at a time so that each modified or created file
  has its own distinct commit on GitHub. Use this skill when the user types /commit, asks to
  "commit and push", "commit one file at a time", "push per-file commits", or requests an atomic git sync.
---

# Atomic Per-File Commit & Push Skill

This skill automates committing and pushing repository changes **one file at a time**, creating a clean, traceable GitHub commit history where every single file has its own isolated commit and diff. It strictly enforces Gemini Privacy and Security policies to ensure zero credentials or private files are ever committed.

---

## 1. Trigger Conditions

Activate this skill when:
- The user issues `/commit`
- The user asks to: "commit and push", "commit one file at a time", "commit each file separately", "push changes to github"
- The user requests an atomic git workflow

---

## 2. Privacy & Security Policy Compliance (Gemini Guardrails)

> [!CAUTION]
> **Strict Secret & Credential Exclusion**
> The agent and script MUST NEVER stage or commit any secret or sensitive file, including but not limited to:
> - Environment configuration: `.env`, `.env.local`, `.env.production`, `.env.*`
> - Keys & Certificates: `*.pem`, `*.key`, `*.pfx`, `id_rsa`, `id_ed25519`
> - Token & Credential Stores: `credentials.json`, `service-account*.json`, `.npmrc` with auth tokens
> - System & Cache Bloat: `.DS_Store`, `Thumbs.db`, `.tsbuildinfo`, `.next/`, `node_modules/`

Before running commits:
1. Run a pre-flight inspection of `git status --porcelain`.
2. If an untracked `.env*` or secret file is detected, verify that it is listed in `.gitignore`.
3. If not in `.gitignore`, immediately add it to `.gitignore` before proceeding.

---

## 3. Execution Workflow

### Step 1: Pre-Flight Safety Verification
Run:
```powershell
git status -s
```
Inspect all changed files. Confirm that no secret files are pending.

### Step 2: Per-File Atomic Staging, Committing, and Pushing
For each file in the change list:
1. **Stage ONLY that file**:
   ```powershell
   git add -- "<path/to/file>"
   ```
2. **Generate a scoped semantic conventional commit message**:
   - Tests: `test(<scope>): add unit test for <filename>`
   - Components: `feat(<scope>): update <componentName> component`
   - APIs: `feat(api): update <endpoint> route`
   - Configs: `chore(config): update <configName>`
   - Styles: `style(<scope>): update <filename> styles`
   - Docs: `docs(<scope>): update <filename>`
3. **Commit the staged file**:
   ```powershell
   git commit -m "<type>(<scope>): <concise message>"
   ```
4. **Push immediately to the active tracking branch**:
   ```powershell
   git push origin <active-branch>
   ```
5. **Verify**: Ensure the commit succeeded before advancing to the next file.

### Step 3: Automated Execution with Helper Script
You can execute the built-in helper script:
```powershell
# Dry run to preview each commit and push
powershell -ExecutionPolicy Bypass -File .agents/skills/commit/scripts/commit_per_file.ps1 -DryRun

# Live execution
powershell -ExecutionPolicy Bypass -File .agents/skills/commit/scripts/commit_per_file.ps1
```

---

## 4. Auto-Updating / Self-Evolution Mechanism

If the project:
1. Adopts a new secret management pattern (e.g. `.secrets/`, `vault.env`, `sentry.properties`)
2. Introduces new directory structures or scopes (e.g. `apps/`, `packages/`, `lambdas/`)
3. Changes remote branching strategies

The agent MUST:
1. Add the newly discovered pattern to the `$ForbiddenPatterns` array in [commit_per_file.ps1](./scripts/commit_per_file.ps1).
2. Update the scope mapping rules in this `SKILL.md`.
3. Inform the developer of the security update.
