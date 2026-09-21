# Photos and moderation — v3.3.2

## Organize your own originals

Keep full-resolution originals outside the public repository, organized by stable atlas record ID:

```
Fallout76-screenshots/
  ref-0073BD97-high-knob-lookout/
    2026-09-20/
      01-overview.jpg
      02-approach.jpg
      03-detail.jpg
      04-extra.jpg
      notes.md
```

Start with a wide view of the landmark, then the approach/staircase/door, then the precise shelf or item spawn. Include additional viewpoints when useful. Record capture date, platform, directions, whether the item was actually present, and any uncertainty. A potential spawn is not a guaranteed item. Avoid chat overlays, account information and other private details.

## User and moderator submission editor

Open a location and choose **Submit photos & notes**. Select 1–8 PNG/JPEG/WebP images, each at most 8 MB; label each view and provide a meaningful caption. Add location notes and acknowledge the rights/publication statement. Download the generated Markdown notes for your records and open the prefilled GitHub issue. Attach the ORIGINAL selected images to that issue in the listed order, then submit. GitHub uploads are a separate explicit step: the static atlas does not silently upload files or contain an API secret. Draft image previews stay in memory; download the notes before closing. The selected original files remain on your device.

This same editor is used for the owner's submissions. **Publishing/approval is moderator-only and takes place in authenticated GitHub, not a browser-local profile.** The public Moderator review link is navigation, not an access-control boundary. Nonmoderators can see its instructions but cannot gain publish rights by opening it. A fully private moderator UI inside the atlas would require the backend discussed in CLOUD-LOGIN.md.

Submissions and attachments in this public repository are public BEFORE approval. Approval controls inclusion on the atlas, not confidentiality. Do not submit confidential images. GitHub accounts are required to submit; the local atlas profile is unrelated.

## Your moderator account

The delivered `moderators.json` lists **lwiitablake**. The workflow independently checks the signed-in workflow actor's repository permission: admin, maintain or write is required as well as allowlist membership. The archive does not change your live GitHub permissions. As repository owner, use your existing GitHub account. To add another moderator, deliberately grant suitable repository access in GitHub and add their exact GitHub username to moderators.json. Repository administrators can change code/policies; the allowlist does not supersede their administrative power. Never store a GitHub personal token in Pages JavaScript.

## Review and publish

1. Open the **Moderator review** link, then the submission queue. Inspect every image, caption, matching record ID, order, privacy, ownership assertion and reuse basis. Reject unsuitable submissions by closing the issue; nothing is imported automatically.
2. In GitHub Actions choose **Review and publish photos → Run workflow**. Enter the issue number; leave Publish unchecked. The workflow validates the submission and reports a review hash in its summary.
3. Review the exact issue body/images. Rerun with Publish checked and the review hash. Any change to the issue body causes rejection. Attaching an image after preview requires a new preview.
4. On success the workflow downloads only approved GitHub attachment URLs, checks/decodes the image formats, limits resolution to 2000px, strips metadata by re-encoding, and commits WebP files plus gallery metadata and community notes. It then deploys Pages directly, because a commit made by GITHUB_TOKEN does not normally trigger another push workflow.
5. Check the gallery and source credit. Reimporting the same issue replaces its gallery entries and comment instead of duplicating them. Notes appear as credited community comments; approval does not silently convert them into independently verified exact-pin directions.

GitHub Issues and Actions must be enabled and Pages must use GitHub Actions. Workflow token writes and any branch/environment protection rules must allow the approved publication. The new workflow must first be pushed to the default main branch. Live GitHub authorization, attachment redirects and deployment have not been exercised from this local environment; failures stop publication and appear in the workflow log. A repository owner may need to approve an environment or adjust their own branch rules; do not disable protections blindly.

## Security and rights

Issue content is parsed as bounded JSON, never executed. Only known record IDs and GitHub image attachment URLs are accepted; redirects are restricted. Raw uploads are not shipped; verified JPEG/PNG/WebP files are converted into fresh images without source metadata. Approval is a human decision and the ownership assertion is not proof. Game screenshots retain Bethesda/ZeniMax rights; contributor consent does not turn them into public-domain or wholly CC-licensed art. Credits identify the GitHub contributor and link the source issue. Other original sources are preserved.

Sources: [GitHub file attachments](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files), [manual workflows and write access](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow), [GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token).


Photo selection also supports dropping files onto the outlined area. Browse files remains available for keyboard and touch users. New batches append to the current photo set and preserve captions, tags and alt text; invalid selections preserve the existing draft. Dropping files only creates local previews, not a GitHub upload.

Batch editor: add up to eight photos per location, in one or several batches. Each image requires at least one subject tag, a visible caption, and separate alt text. Choose the distance/view and use Move earlier, Move later, or Remove photo to curate the set. Location notes apply to the whole set. New metadata uses schema 2; older schema 1 submissions remain reviewable. Published galleries show captions and tags and use the separate alt text for the image description. Attach originals in the final displayed order in GitHub. Drafts remain in memory until downloaded and are not automatically restored after closing/reloading.
