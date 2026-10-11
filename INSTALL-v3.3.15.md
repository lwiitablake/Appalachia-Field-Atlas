# v3.3.15 photo recovery update

Use the UPDATE zip for your existing repository. The complete folder is a backup snapshot, not the preferred way to update a repository receiving new photos.

1. In GitHub Desktop, select Appalachia-Field-Atlas, click Fetch origin, then Pull origin if offered.
2. Extract `fallout76-atlas-v3.3.15-UPDATE.zip`. Copy its contents into the repository's top-level folder, alongside index.html. Merge folders and replace the matching files. Include the `.github` folder. Do not put the enclosing ZIP folder inside the repository.
3. Commit as `v3.3.15 photo recovery and publishing maintenance`, then Push origin.
4. Open GitHub Actions and wait for **Publish atlas** to finish successfully. Pages Settings should use **GitHub Actions** as the source.
5. Reload the website. Search `0030877B` (Wavy Willard's bobblehead) and `0030877D` (magazine). Each has three restored photographs. Interior photos such as Monongah Mine require selecting the interior or enabling interior/submap points.

The update ZIP deliberately omits data/details.json, data/community.json and existing photo files. Its workflow adds only six confirmed missing photo references and two notes to your current data, preserving newer contributions. A committed migration marker makes this recovery run only once, so later intentional deletions remain deleted. The previously removed Ranger Lookout map-view photo is not restored.

## Findings

The audited repository snapshot was commit 53fa16f, with 58 linked photos. Commit 73ae0d2 (v3.3.12) had removed six Wavy Willard's references and two notes, although the image files remained. This copy restores the original metadata from before that update: 64 photos across 21 records. Credits, sources and descriptions are retained.

The latest inspected photo-publication runs succeeded. Photos becoming visible again may reflect deployment completion or browser caching; the timing alone does not establish which. Actions notices concerned Node action versions and the upcoming Ubuntu runner change. This package uses Node-24-compatible actions and Ubuntu 24.04, and stamps the site update date in both publishing workflows. The game-data date remains separate.

## Owner token

A personal access token is reusable, not single-use. The app deliberately keeps it only in memory; refresh, navigation or closing the tab disconnects the app. Re-enter the same still-valid token using Owner upload. Keep it in your password manager, never in an issue, repository file or chat.

If GitHub actually rejects it (HTTP 401), check https://github.com/settings/personal-access-tokens for expiration or revocation and replace it if necessary. A permission error is different from expiry. This version no longer labels every authentication failure as an expired token and allows reconnecting while preserving a pending upload recovery. It does not store tokens permanently or change your GitHub token settings.

GitHub reference: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation

Workflow release references: https://github.com/actions/setup-node/releases ; https://github.com/actions/setup-python/releases ; https://github.com/actions/deploy-pages/releases ; https://github.com/actions/upload-artifact/releases

No live repository write or real-token test was performed. Deployment is complete only after you push and GitHub reports success.
