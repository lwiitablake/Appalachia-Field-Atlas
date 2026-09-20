# V3.1 follow-up

26 tests pass. Native terrain quadrants match the decoded source pixels exactly. Browser checks confirmed the illustrated default, visible Map key with all category icons and double-outline examples, stronger side-panel separation and rounded written-directions card. See V3.1-CHANGES.md for scope and limitations.

# V3 verification

September 20, 2026: **24 automated tests passed**. The original 18 tests are retained; six additional tests cover source-badge semantics, world-coordinate formatting, renamed repository submission URLs, deduplicated community stars, issue payload validation and editorial assets/icons.

Browser verification at 1440×1000 and 390×844: initialization, Landview search, original SVG icons and red Caps emblem, wide 300px hover card, wider desktop details, yellow guide outlines, coordinate prominence, actual map crop, mobile map-first layout, search drawer, scrollable bottom sheet and no horizontal overflow. A test contribution link was prepared and checked for the correct repository/record/content; it was not submitted publicly. Comments/stars/tags visibility controls were checked separately.

The GitHub-hosted Actions workflow is supplied and its import logic is tested locally; it has not been executed in the user's repository. Deployment and repository permission policies must be verified after uploading. No live public issue was created, no repository renamed, and no remote site changed for this release. No new photo license or exact-pin guide was asserted. The remaining limits in the earlier report still apply.

## Prior version verification history

# Verification report and release checklist

Tested during preparation on September 19, 2026 (America/Los_Angeles).

## Automated results

`npm test`: **18 passed, 0 failed** using Node's built-in test runner. No package installation is required.

The tests exercise actual encryption and decryption, not mocked cryptography:

1. Pinned version, record counts, stable unique identities and expansion presence.
2. Valid spaces and locally present imagery for every map.
3. Projection boundary cases and coordinate round-trips across all 2,901 records.
4. Search by plurals, form IDs, notes and tags, and progress/favorite filters.
5. Written-guide filter excludes categories with no guide text.
6. Source and license fields on every written guide.
7. Guests cannot save; encrypted round-trips preserve stars, checks, tags, notes and custom markers.
8. Wrong passphrases and altered ciphertext are rejected.
9. Backups restore to separate storage; existing profiles require explicit replacement opt-in.
10. A second instance detects an intervening completed save.
11. Duplicate signup, weak passphrases and unsupported encryption envelopes are rejected.
12. Storage-quota failure preserves the previous envelope and throws an error.
13. Malformed coordinates and prototype-like item IDs are rejected.

14. All alternate backgrounds are bundled; unsupported styles fall back to the space’s satellite render.
15. Location source accounting, category counts and explicit unknown travel status.
16. Approximate pins lie in source cells; map directory pins use source render centers.
17. Location-only filters include the expected 693 Appalachia records and exclude loot.
18. Journal validation preserves legacy and new location identities.

The upstream release archive's SHA-256 matched the GitHub release metadata digest. Local Leaflet distribution hashes are checked during packaging against the official 1.9.4 download page. Asset existence checks cover all 205 map renders and both alternate Appalachia backgrounds.

## Browser checks performed

Checked in the Codex in-app browser, including 1440-pixel desktop and 390-pixel phone viewport overrides:

- App initializes with source version visible, imagery loaded and searchable points.
- Landview search produces two bobblehead and two magazine references in the default loot layers.
- Selecting a result opens its sourced map crop, coordinate directions and attributed area guide.
- Guest Star action opens login instead of saving.
- A throwaway local QA profile can sign up and unlock.
- Star, checkmark, Farm route tag and a note save; reload locks the profile; logging in again restores those values.
- A personal marker can be created by the keyboard map-center flow, survives reload, and appears in search after unlocking.
- A category star is usable through the Starred item categories filter.
- Blackwater Mine opens its own interior render with local-coordinate points.
- Mobile layout fits the viewport horizontally and opens a scrollable detail sheet.
- Map controls are contained below the detail sheet's stacking layer.
- No console errors/warnings were reported during the tested interaction sequence.

### Version 1.1 layer checks

- Illustrated and military backgrounds load; the opacity control updates the image to 95% without fading markers.
- Choosing The Wayward while the game-map style is selected falls back to its overhead render with an explanatory note. Returning to Appalachia restores the illustrated style.
- Show all locations increases default Appalachia results from 698 to 1,391. Hide all locations returns to 698 without disabling the loot layers.
- All maps plus All layers exposes all 2,901 records.
- Flatwoods Tavern search opens an approximate-area card; the map visibly outlines its two source cells and shows its optional name label.
- The updated detail sheet fits a 390-pixel phone viewport without horizontal overflow.
- Every one of the 2,462 previously shipped record IDs remains present in version 1.1.
- No console warnings/errors were captured in the layer verification sequence. These checks do not establish that every drawn landmark aligns precisely with terrain; illustrated backgrounds are stylized.

## What these checks do not prove

- No live game session was used to visit every point or verify spawn availability, floor, shelf, quest gating or object movement.
- Coordinate projection is checked against source math; this is not a claim of a field survey of every marker.
- The 15-minute timer implementation was inspected; an uninterrupted 15-minute idle browser session was not used as a release gate.
- Encrypted backup/restore logic was exercised in automated tests; every OS/browser file-picker variation was not tested.
- This is not a formal cryptographic, penetration-testing or WCAG conformance certification.
- Safari, Firefox, mobile operating systems and GitHub's final hosted origin were not separately tested in this environment.
- No site was published to GitHub on the user's behalf. The package is ready for the user to upload and validate at their final URL.

## Before/after publishing to your own GitHub repository

1. Confirm HTTPS and relative asset paths load under the repository URL.
2. Create a fresh test profile on that origin. Save a star, checkmark, note and custom marker.
3. Reload, log in, and verify each saved value.
4. Export a backup, restore it in another browser with the correct passphrase, then try an incorrect passphrase and confirm rejection.
5. In two tabs, modify the same profile and confirm the other tab locks instead of silently showing old state.
6. Test your preferred phone/browser with touch zoom, the interior selector and the detail sheet.
7. Inspect source credits and the dated edition in the UI. Keep the license notices in the repository.
8. Delete only your disposable test profiles when done, after exporting anything you want to retain.

If a future upstream release changes the expected dataset, update the test assertions as part of a reviewed data migration; do not simply remove failing checks.
