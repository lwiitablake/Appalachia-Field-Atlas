# v3.3.13 — upload once, review on GitHub

This separate development copy preserves v3.3.12. It adds an owner-only connection for lwiitablake/Appalachia-Field-Atlas. No real token is included. No real repository writes were performed during testing.

## Install the update

1. In GitHub Desktop, Fetch origin and Pull origin first.
2. Extract **Appalachia-Field-Atlas-v3.3.13-UPDATE.zip**. Copy its contents into your local repository root, beside index.html. Replace matching files. This update contains application code, tests and instructions, not your data/ directory or existing photos. Keep .git untouched.
3. Commit as `Add owner photo uploader v3.3.13` and Push origin. Wait for the normal site deployment. Refresh the atlas and confirm v3.3.13 in the header.
4. The complete version folder is a development snapshot; use the UPDATE ZIP to avoid overwriting newer photo contributions with that snapshot.

## Connect your token

1. Click **Owner upload** in the atlas navigation.
2. Paste your fine-grained token into **Personal access token** and click **Verify owner connection**.
3. It must belong to `lwiitablake`, select only `Appalachia-Field-Atlas`, and have **Contents: Read and write** and **Pull requests: Read and write**. Metadata remains read-only. No Actions, Workflows, Administration or account permissions are required.
4. Wait for **Owner connected**, then close the connection window. The input is cleared after verification. The token remains only in JavaScript memory until Disconnect or reload; browser scripts/extensions on the page could access an active session. Use a trusted browser and a short token expiration.

Your local journal login is independent and is not required for owner upload. The public Owner upload button does not grant permission: GitHub and the app verify the repository owner. Other visitors retain the existing issue-submission flow.

## Upload and publish

1. Open the exact map location/item. Click **Submit photos & notes**.
2. Drag and drop or browse for up to eight PNG, JPEG or WebP images (8 MB each). Existing per-photo view, tags, caption, required alt text, ordering and location notes are retained. This form submits one location at a time; the local organizer can help assign different sets.
3. Confirm that you took the screenshots and consent to publication. Click **Upload photos & create review request** once. Keep the tab open until completion.
4. Images are decoded and re-encoded as WebP at up to 3072 pixels on the longest edge, stripping embedded metadata. Originals on your device are untouched. This does not remove visible private information; inspect images before submission.
5. Click **Open photo review on GitHub**. Inspect the photos and Files changed. The pull request adds images, gallery metadata and any location note; existing metadata is read from the latest default-branch commit and preserved.
6. Click **Merge pull request**, then **Confirm merge** when satisfied. You do not need to approve your own pull request as a separate review. If repository rules require another reviewer, follow those rules. Merge starts normal site deployment; you do not edit an issue, attach files again or manually run Actions.
7. Once deployment succeeds, reload the atlas and reopen that location. Do not delete an unmerged upload branch. Deleting the branch after successful merge is fine.

## Errors and recovery

- Invalid/expired token: reconnect using a valid token. Disconnect clears the in-memory credential.
- Contents or Pull requests denied: check the two permissions, repository selection and token expiration. Read-only verification alone cannot prove that both write permissions were granted.
- If the branch was saved but opening the pull request failed, **Retry opening the existing review request** resumes the saved upload; it does not re-upload the images. Owner upload can also finish this pending request. Keep the tab open to retain recovery state.
- Reloading loses in-memory recovery. Check the repository's `atlas-photos/…` branch and existing pull requests before submitting again; open a pull request from that branch if necessary.
- Concurrent publication can cause a merge conflict in details.json/community.json. Resolve it while preserving both contributions; do not overwrite other photos. The uploader never force-pushes or merges automatically.
- Review branches and their images are public immediately because the repository is public. They are withheld from the live map until merge, not hidden from GitHub visitors.

## Verification and sources

See QA-V3.3.13.md. End-to-end checks use simulated GitHub responses and a fake token. The first real upload is still needed to verify your account permissions and repository rules. Never send your token in chat, screenshots, issues, commits or pull requests.

- [GitHub fine-grained tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Git blobs](https://docs.github.com/en/rest/git/blobs), [trees](https://docs.github.com/en/rest/git/trees), [commits](https://docs.github.com/en/rest/git/commits), [references](https://docs.github.com/en/rest/git/refs)
- [Pull requests](https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request)

Photo copyrights and contributor consent remain distinct from software/editorial licenses. Existing credits and rights are unchanged.
