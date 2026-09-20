# Install v3 and publish reviewed community contributions

This is a separate v3 release. The earlier v2 folder and ZIP are unchanged. You do not need to delete private browser profiles: their storage format and location IDs remain compatible. Export an encrypted backup before updating as a precaution. Local preview uses a different origin from your live website.

## 1. Upload the entire folder structure

Use GitHub Desktop, since selecting individual files in a browser previously flattened this repository's folders.

1. Open your existing atlas repository in GitHub Desktop and choose **Repository → Show in Explorer**.
2. Extract **Fallout76-Field-Atlas-v3.1-GitHub.zip** into a separate folder.
3. Copy everything **inside** that extracted folder into the cloned repository directory. Include `.github`, `assets`, `data`, `licenses`, `scripts`, `tests`, `vendor`, and the root files. Replace matching files. Do not copy an extra enclosing folder and do not upload the ZIP itself.
4. Do not overwrite `data/community.json` on future updates after you have begun publishing contributions; retain your published entries. This initial v3 file is empty.
5. In GitHub Desktop, enter **Install atlas v3** as the commit summary. Click **Commit to main**, then **Push origin**.
6. On GitHub, confirm that **`.github/workflows/publish.yml`**, **`data/atlas.json`**, **`data/details.json`**, **`data/community.json`**, **`vendor/leaflet.js`**, and **`assets/maps/2480661.webp`** exist at those exact paths.

Old misplaced copies at the repository root are unused; they do not substitute for these folders. They can be removed later after confirming v3 works.

## 2. Enable the included publishing workflow

1. In the repository, open **Settings → General → Features** and ensure **Issues** is enabled.
2. Open **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**. This replaces the previous branch-based publishing choice for v3's reviewed community workflow.
3. Open **Actions → Publish atlas → Run workflow**. Select **main**, leave **issue_number** empty, and run it.
4. Wait for both **build** and **deploy** to show success. Open the website URL under **Settings → Pages**, then refresh with Ctrl+Shift+R.

No personal access token, email provider, external database, or password belongs in the app. The workflow receives GitHub's built-in, temporary Actions token on GitHub's runner. Repository/organization policy must allow the workflow's declared write permissions and the Pages deployment. If a protected branch blocks the bot's commit, it fails visibly; review your branch policy or publish changes through your normal reviewed pull-request process. The workflow does not bypass protection rules.

## 3. Review and publish a community contribution

1. A visitor selects a sourced map record, chooses **Submit to community**, enters a comment/tag or selects a community star, and chooses **Prepare GitHub submission**.
2. They follow **Open GitHub to review and submit**, sign in to GitHub, and finish creating the issue. Their GitHub username and submitted content are public. Local profile login is unrelated.
3. You read the issue, verify the record ID/location, check accuracy and whether the content is suitable for publication. Do not publish private information or unlicensed copied guide text.
4. To approve it, open **Actions → Publish atlas → Run workflow** and enter that issue's number in **issue_number**. Running this workflow with an issue number is your approval action. Closing or labeling an issue alone does not publish it.
5. The workflow validates the payload, commits the entry to **data/community.json**, and deploys the site in the same run. After a successful deployment, visitors can refresh to see it.
6. Close the issue with your usual review note if desired. Re-running the same issue replaces that issue's entry rather than duplicating it. Community stars count once per GitHub author per location.

To reject a submission, do not run the publishing workflow for it. To remove an already published contribution, delete its entry from `data/community.json` and commit/push; the normal push deployment republishes the site. Public issue history and Git history are separate from the map's display. Visitors can request a correction/removal through an issue. Community stars are simple reviewed endorsements, not an abuse-resistant voting system or GitHub repository stars.

The app reads a bundled snapshot, not the GitHub API on every visit. Comments, tags, and stars each have an on/off checkbox under **Sources & community display**. Toggling visibility changes the display, not the published data. There are no community submissions included in this delivery.

## 4. Rename the repository

In **Settings → General**, use the **Repository name** field and enter just one of these names, without quotation marks, spaces, a URL, or `.git`:

```text
Fallout-76-Appalachia-Field-Atlas
```

That is the standard spelling of Appalachia. Your requested `Fallout-76-Appalacia-Field-Atlas` omits the `h`; it also uses an ordinary repository-name format. Choose whichever you intend, then click **Rename**. If GitHub reports invalid formatting, manually type the name to eliminate hidden characters copied from formatted text. If it reports that the name already exists, choose a name not used by another repository on your account. Without the exact error message, the cause cannot be diagnosed more precisely.

After renaming, use the new URL in **Settings → Pages**. GitHub redirects repository URLs, but project Pages URLs are an exception; old website bookmarks may stop working. All map assets use relative paths. On `*.github.io`, community submission links automatically derive the owner and repository from the current site URL. For localhost or a custom domain, update `site-config.json` to the intended `owner/repository`.

Update GitHub Desktop's remote in **Repository → Repository settings → Remote** if it still shows the old repository URL. A repository rename normally keeps the same `username.github.io` browser origin, so this app's local profiles remain under that origin. Moving to a different hostname requires exporting and restoring profiles manually.

## 5. What changed visually

- Sans-serif headings, brand, dialogs and map titles; original filled bobblehead/magazine icons, a red Caps C emblem, PA lettering and conventional map/battery/flag shapes.
- Wider, short hover cards and a wider desktop detail panel; source placement details are collapsible.
- World X/Y/Z coordinates lead the detail panel. No unsupported conversion to meters or player-facing coordinate system is invented.
- A map-first phone layout with **Search & layers** opening a drawer and selected records opening a scrollable bottom sheet.
- Blue outline: sourced spot photograph. Yellow outline: written guide. Two thin outlines: both. No source outline: coordinate/map data only. A dashed white outline indicates selection.

The existing seven area guides receive yellow outlines for their relevant item categories and explicitly say they are area guides, not verified exact-pin descriptions. The shipped dataset currently contains **no licensed close-up spot photographs**. Overhead crops do not trigger blue badges. The blue/both system is implemented for properly sourced additions; it does not falsely relabel existing crops as photos.

## Sources

- [GitHub: rename a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).
- [GitHub: custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [GitHub: creating issues and URL parameters](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue).
- [GitHub: workflow syntax and permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
- [SOURCES.md](SOURCES.md): retained map/data credits and image rights.
- [EDITORIAL.md](EDITORIAL.md): how to add credited photos and detailed text.
