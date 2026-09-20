<#
.SYNOPSIS
  Per-file atomic git commit and push script with strict Gemini privacy & security guardrails.

.DESCRIPTION
  Iterates through all changed, added, or deleted files one by one, stages each file individually,
  generates a conventional commit message, creates an individual commit, and pushes it to remote.
  Strictly excludes any secret files, credentials, or environment files.
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [string]$Remote = "origin",
    [string]$Branch = ""
)

# 1. Privacy & Security Exclusion Rules (Enforced by Gemini Security Policy)
$ForbiddenPatterns = @(
    "^\.env(\..+)?$",
    ".*\.pem$",
    ".*\.key$",
    ".*id_rsa.*",
    ".*credentials.*",
    ".*\.pfx$",
    ".*\.pkcs12$",
    ".*node_modules/.*",
    ".*\.next/.*",
    ".*\.tsbuildinfo$",
    ".*\.DS_Store$"
)

function Test-IsSecretOrSensitiveFile([string]$FilePath) {
    $normalized = $FilePath.Replace('\', '/')
    foreach ($pattern in $ForbiddenPatterns) {
        if ($normalized -match $pattern) {
            return $true
        }
    }
    return $false
}

# 2. Verify git repository
$null = git rev-parse --is-inside-work-tree 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Current directory is not a git repository."
    exit 1
}

# 3. Detect current branch if not provided
if (-not $Branch) {
    $Branch = (git branch --show-current).Trim()
    if (-not $Branch) {
        Write-Error "Could not detect active git branch."
        exit 1
    }
}

# 4. Gather changed files (Modified, Added, Deleted, Untracked)
$statusLines = git status --porcelain -uall
if (-not $statusLines) {
    Write-Host "Working tree clean. No files to commit." -ForegroundColor Green
    exit 0
}

$filesToProcess = @()

foreach ($line in $statusLines) {
    if ($line.Length -lt 4) { continue }
    $statusCode = $line.Substring(0, 2).Trim()
    $filePath = $line.Substring(3).Trim().Trim('"')

    # Handle file renames "old -> new"
    if ($filePath -match " -> ") {
        $filePath = ($filePath -split " -> ")[1].Trim()
    }

    # Security check
    if (Test-IsSecretOrSensitiveFile $filePath) {
        Write-Warning "SKIPPING sensitive/secret file to comply with security policy: $filePath"
        continue
    }

    $filesToProcess += [PSCustomObject]@{
        Status = $statusCode
        Path   = $filePath
    }
}

if ($filesToProcess.Count -eq 0) {
    Write-Host "No eligible non-sensitive files found for commit." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($filesToProcess.Count) eligible file(s) for atomic commit and push." -ForegroundColor Cyan

# 5. Helper function to generate semantic commit message
function Get-CommitMessage([string]$Path, [string]$Status) {
    $normalized = $Path.Replace('\', '/')
    $fileName = Split-Path $Path -Leaf
    $parent = Split-Path $Path -Parent
    $dirName = if ($parent) { Split-Path $parent -Leaf } else { "core" }

    $type = "feat"
    $scope = if ($dirName -and $dirName -ne ".") { $dirName } else { "core" }

    if ($normalized -match "\.test\.[tj]sx?$|tests?/|__tests__/") {
        $type = "test"
        return "$type($scope): add unit test for $fileName"
    }

    if ($normalized -match "\.md$|docs/") {
        $type = "docs"
        return "$type($scope): update documentation in $fileName"
    }

    if ($normalized -match "\.css$|\.scss$") {
        $type = "style"
        return "$type($scope): update styling in $fileName"
    }

    if ($normalized -match "config|tsconfig|\.json$") {
        $type = "chore"
        return "$type($scope): update configuration in $fileName"
    }

    if ($normalized -match "prisma/|db/") {
        $type = "feat"
        return "$type(db): update database schema or migrations in $fileName"
    }

    if ($normalized -match "api/") {
        $type = "feat"
        return "$type(api): update endpoint $fileName"
    }

    return "$type($scope): update $fileName"
}

# 6. Execute atomic commit & push per file
$index = 1
foreach ($item in $filesToProcess) {
    $filePath = $item.Path
    $msg = Get-CommitMessage -Path $filePath -Status $item.Status

    Write-Host "[$index/$($filesToProcess.Count)] Staging and committing: $filePath" -ForegroundColor Blue
    Write-Host "      Message: $msg" -ForegroundColor DarkGray

    if ($DryRun) {
        Write-Host "      [DRY-RUN] git add -- `"$filePath`""
        Write-Host "      [DRY-RUN] git commit -m `"$msg`""
        Write-Host "      [DRY-RUN] git push $Remote $Branch"
    } else {
        # Stage single file
        git add -- "$filePath"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to stage $filePath. Skipping."
            continue
        }

        # Commit single file
        git commit -m "$msg"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to commit $filePath. Skipping push."
            continue
        }

        # Push single commit to remote
        Write-Host "      Pushing commit to $Remote/$Branch..." -ForegroundColor DarkCyan
        git push $Remote $Branch
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to push $filePath to $Remote/$Branch. Halting to avoid desynchronization."
            exit 1
        }
        Write-Host "      Successfully pushed $filePath" -ForegroundColor Green
    }
    $index++
}

Write-Host "All eligible files have been committed and pushed individually!" -ForegroundColor Green
