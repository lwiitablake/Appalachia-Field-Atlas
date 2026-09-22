# Atlas Source Review

Run this after a game update, or whenever you want to review credible changes. It is manual, not a scheduled crawler.

## Run the report

On GitHub choose **Actions → Atlas Source Review → Run workflow → main → Run workflow**. Open the completed run's summary or download the `atlas-source-review` artifact. Locally run `node scripts/atlas-source-review.mjs`.

The report checks the latest Mappalachia stable release against the bundled edition, counts every current item category, and identifies photo coverage gaps. A failed online check is reported as unknown, never “current.” It does not automatically browse every article or download pictures.

## Gather, verify, and review

1. Read [Bethesda patch notes](https://fallout.bethesda.net/en/news) and the [Mappalachia release](https://github.com/AHeroicLlama/Mappalachia/releases). Record game version, release URL, download date and SHA-256. Exclude PTS-only data unless explicitly labeled as such. Keep the existing published data as the baseline.
2. Check **all existing categories**: bobbleheads, magazines, caps, armor, fusion cores, locations, lunch pails and coolers. Compare stable reference IDs, coordinates, space IDs, container editor IDs and teleport links. Preserve user photos, captions, alt text, tags, attribution and notes. Removed or moved IDs require review; do not silently move a photograph to a different item.
3. For coordinate refreshes use `DATA-MAINTENANCE.md` and its pinned importer. After reviewing its version constants, run `python scripts/import-containers-entrances.py PATH/TO/mappalachia.db PATH/TO/Mappalachia.zip`. This local supplement replaces container records idempotently and rebuilds door-chain associations. It rejects a database game version that differs from the atlas. Review empty/quest-specific containers, missing entrances and counts in `data/v339-import-report.json`. Entrance markers represent access routes, not the indoor object's world position.
4. Use the direct reference leads in `data/source-watch.json` and search by exact location + item. Seek original game observations, original uploaders and version-specific evidence. A public webpage is not permission to copy it. Do not bypass authentication, robots restrictions, paywalls or rate limits. Do not scrape community maps or proprietary guide databases.
5. For every proposed description or image create a rights record using `source-review-template.json`. Record exact URL and revision, creator, license/permission URL, allowed uses, attribution wording, modifications, retrieval date and the relevant map/reference ID. A website's text license may not cover its images. Verify individual image-file pages; a video policy is not blanket screenshot permission. If rights are unclear, retain a source link and do not embed/download the image. Fair use is a context-dependent legal basis, not an open license or guaranteed permission.
6. Prefer your own screenshots with overview/approach/detail labels. For community photos use the current GitHub issue attachment and moderator review workflow. Require caption and meaningful alt text. Distinguish an exact item photo from a general area reference. Mark an unverified source as a lead rather than a confirmed update. Do not assign blue outlines to map placeholders or yellow outlines to generated coordinate descriptions.
7. A moderator verifies location, game version, rights, credit, caption and alt text before adding content. Use GPL terms for software, the actual applicable license for third-party text, and preserve underlying Bethesda rights. Do not relicense another creator's work under the site's editorial CC license. Keep written permission evidence privately if it contains personal information; publish a non-sensitive permission summary.
8. Run `node scripts/build-release.mjs`, `node --test tests/*.test.mjs`, and the accessibility checks in `ACCESSIBILITY-REVIEW.md`. Review desktop/mobile filters, gray entrance markers, gallery navigation, keyboard focus, contrast and attribution. Publish a new version only after reviewing the diff. Keep the prior release for rollback.

## This release's research result

v3.3.9 adds 494 lunch-pail and 905 cooler placed references from the existing pinned Mappalachia 2.0.5.2 database (game 1.7.26.13). Queries select actual CONT records with display names Lunch Pail, Cooler or Chem Cooler, plus Sunny's Lunch Pail. Water coolers, static decorations and consumable Lunchbox rewards are excluded. Empty and quest-specific variants can be present. Descriptions are original coordinate-derived placement context, not copied guide prose. No new web photographs or third-party guide descriptions were imported because exact-location reuse rights were not established in this review.

The Mappalachia project is GPL-3.0; its [disclaimer](https://github.com/AHeroicLlama/Mappalachia#legaldisclaimer) separately describes its game-data distribution as fair use. Underlying game assets remain Bethesda/ZeniMax's. This release retains the existing atlas's documented source basis; it does not assert that GPL grants rights to Bethesda imagery.
