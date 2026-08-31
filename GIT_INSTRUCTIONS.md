# Git & Remote Configuration Guide

## Repository Information
- **Repository**: `kallistodevlpteam-cloud/kallisto-main`
- **Active Branch**: `ui`
- **Remote Name**: `origin`

## Environment & Token Configuration
The GitHub Personal Access Token (PAT) is saved in `.env` and `.env.local` (both are gitignored):
```env
GITHUB_TOKEN=<YOUR_GITHUB_PAT>
GITHUB_PAT=<YOUR_GITHUB_PAT>
GITHUB_REPO=kallistodevlpteam-cloud/kallisto-main
GITHUB_REMOTE_URL=https://<YOUR_GITHUB_PAT>@github.com/kallistodevlpteam-cloud/kallisto-main.git
```

## Configured Git Remote
The Git origin is configured with authenticated URL for seamless push and pull without repeated login prompts:
```bash
git remote set-url origin https://<YOUR_GITHUB_PAT>@github.com/kallistodevlpteam-cloud/kallisto-main.git
```

## Standard Git Operations

### 1. Pull Latest Changes from UI Branch
```bash
git pull origin ui
```

### 2. Stage, Commit, and Push Changes
```bash
git add .
git commit -m "Your commit message"
git push origin ui
```

### 3. Check Current Status and Remote
```bash
git status
git remote -v
```

### 4. Switch or Create Branches
```bash
# Switch to another remote branch
git checkout <branch-name>

# Create a new feature branch
git checkout -b feature/your-feature
git push -u origin feature/your-feature
```
