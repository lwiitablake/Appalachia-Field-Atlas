# v3.3.12 — results placement and terrain blending

Separate copy of v3.3.11; earlier folders are preserved. Main search discoveries now appear directly below the search. Selecting individual checklist items moves the same discovery list below that checklist; typing in the main search returns it beneath the search. The list has a bounded height so map controls remain reachable.

Artwork over terrain: 100% displays illustrated/military artwork; 0% displays the overhead terrain underneath. These backgrounds share atlas bounds, but drawn landmarks are stylized and are not guaranteed to coincide exactly. The slider does not move or recalibrate any markers. Overhead-only and interior backgrounds stay fully visible and disable this slider.

Uploads remain unchanged, as requested. No authentication service or token handling was added.

## Streamlined photo upload options

**GitHub sign-in plus a small authentication backend:** sign in once, select/drop photos, enter captions and alt text, and submit. A server verifies moderator permission and writes approved photos plus their metadata to GitHub. Ordinary users submit to a review queue; moderators approve in the app. GitHub Pages can continue hosting the atlas, but cannot itself run the authentication server. Setup requires a GitHub App, a backend host, server-held credentials, and deployment configuration. A GitHub App can scope access to this repository. This is the recommended permanent interface.

**Owner-only session token:** less setup; enter a short-lived fine-grained token restricted to this repository with Contents write access. The browser can upload files and metadata through GitHub's API. Keep the token only in memory, never in local storage, source files, screenshots, or the repository. It would need to be entered again after reload. This provides direct owner publication but is not a general public-user moderation system. Multi-file publication should be committed atomically to avoid partial uploads. Branch protections may require a pull request.

Either option can remove the repeated issue editing, attachment uploads and manual Actions dispatch. Normal deployment checks can still run automatically after publication. Simply selecting files in the existing static form does not transfer their bytes to GitHub.

Original documentation:
- https://docs.github.com/en/rest/repos/contents
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app

## Install
Pull your repository first and preserve photo/data updates made after the v3.3.11 baseline. Extract the ZIP and copy its contents into the repository root, including .github, keeping .git untouched. Commit and push; wait for deployment and confirm v3.3.12 in the header. This package has not been pushed for you. No game data or photos were refreshed in this UI build.
