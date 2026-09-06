# Git Operations Rule

Whenever the user asks to push, pull, or do anything related to git that requires authentication, use the GitHub Personal Access Token (PAT) stored in the `.env` file (`GITHUB_TOKEN`).
You can use it by modifying the git remote URL to include the token: `https://<TOKEN>@github.com/<owner>/<repo>.git`, or by setting it in the environment if using GitHub CLI or other tools that support it.
