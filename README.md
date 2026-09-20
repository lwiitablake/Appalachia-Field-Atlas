# Appalachia Field Atlas — v3.1

A static, independently made Fallout 76 web app for GitHub Pages. Search sourced loot positions, explore maps and interiors, and keep an encrypted journal in your own browser.

**No email, backend, external authentication, analytics, API keys, build step, or paid service is required.** This follows the requested strictly local profile design. “Sign up” creates a profile on that browser only; “Log in” decrypts it with its passphrase. It is not an online account or verified identity.

See [V3.1-CHANGES.md](V3.1-CHANGES.md) for the game-map default, Map key, highlighted directions, acronym help, screenshot examples and optional source-quality terrain.

## V3 interface and community update

V3 adds wider compact hover cards, sans-serif typography, original filled icons, prominent world coordinates, blue/yellow source badges, a phone search drawer and a bottom detail sheet. Public GitHub contributions are opt-in and reviewed before being committed and deployed; personal journal data remains private. See [START-HERE-V3.md](START-HERE-V3.md).

## What is included

| Layer | Sourced positions, across all included spaces |
| --- | ---: |
| Bobbleheads | 683 |
| Magazines | 718 |
| Caps stashes | 287 |
| Fusion cores | 205 |
| Power armor | 111 |
| Map destinations | 458 |
| Additional named areas | 91 |
| Regions and subregions | 144 |
| Interior/map directory entries | 204 |
| **Total** | **2,901** |

- Search names, categories, reference IDs, personal notes and tags.
- Three Appalachia backgrounds: satellite/terrain, illustrated game map, and military map; adjustable background visibility.
- Individual destination, named-area, region, and interior-directory toggles; one-button show/hide all locations; optional location labels.
- All 205 source maps, including spaces with no selected loot. Interiors use their available overhead render.
- Pan, zoom, low-zoom grouping, category filters, interior selection, and accessible result lists. See [LAYERS.md](LAYERS.md) for controls, accuracy and complete source accounting.
- Hover descriptions; click for a right-side detail panel with a sourced overhead picture and coordinates.
- Stars for individual locations/items **and** entire item categories. Separate filters expose both kinds of favorites.
- Checkmarks, six suggested tags, custom tags, notes, and up to 2,000 custom markers per profile.
- Encrypted local profiles, manual encrypted backup/restore, explicit logout, and 15-minute idle locking.
- All scripts, images and mapping dependencies are bundled and served from your own site. External source links load only when someone opens them.
- Responsive desktop/mobile layout, keyboard map navigation, native dialogs, focus indicators and a search/list alternative to pointer-only map markers.
- Full source and license notices; a reproducible import script and meaningful automated tests.

## Know exactly what you are publishing

The data snapshot is **Mappalachia 2.0.5.2**, published **September 15, 2026**, for **Fallout 76 1.7.26.13**. It includes the expanded Appalachia geography, including Burning Springs and Skyline Valley. Coordinates and images come from the same release. It is not a live map and will not silently update itself. See [DATA-MAINTENANCE.md](DATA-MAINTENANCE.md).

**Coverage limitation:** these are placed references in the selected categories, not every collectible, quest reward or runtime spawn. They are possible spawn points, not guarantees that an item is present or accessible. Generic bobblehead/magazine positions do not identify a guaranteed specific variant.

**Location coverage:** all map markers, all nonempty named Location records, and all spaces in the pinned export are represented. Named areas use approximate source-cell pins; directory entries are map centers, not entrances. This does not include every community-named unmarked landmark. Fast-travel eligibility is not exported, so it is not guessed.

**Directions limitation:** every sourced point has a coordinate-based description and map image when upstream supplies one. Seven areas also have credited, adapted written guides. Those area guides have not been matched individually to every reference ID. Most points do **not** yet have independently verified shelf-by-shelf instructions or close-up collectible photographs. The UI states this rather than inventing them. Expanding these guides is the principal remaining editorial work if you want that level of detail everywhere.

**Rights limitation:** public availability is not public-domain status. Mappalachia states a fair-use basis for Bethesda game imagery/data; its GPL license does not grant Bethesda's rights. This project documents that basis and the modifications, retains credits, and supplies a reduced-resolution noncommercial reference-map use. Fair use is case-specific, not guaranteed permission. Read [SOURCES.md](SOURCES.md) before changing the intended use. No ad code, monetization, third-party guide screenshots, or Bethesda logo is included.

## Upload v3 to GitHub Pages

**Follow [START-HERE-V3.md](START-HERE-V3.md) for the current upload, GitHub Actions deployment, community moderation and repository rename instructions.** The earlier branch deployment below is only an option if you do not use the reviewed community publishing workflow.

## Basic branch hosting (without the community publishing workflow)

1. Extract the delivery ZIP on your computer.
2. Create a public GitHub repository, for example `fallout76-atlas` (a public repository avoids needing a paid plan for private-repository Pages publishing).
3. Upload **the contents of this folder** to the repository root. `index.html` must be at the root, not inside an extra `fallout76-atlas` folder. Keep `assets`, `vendor`, `data`, and their subfolders intact. Large batches can be uploaded in several commits or with GitHub Desktop.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**. Select `main` and `/ (root)`, then Save.
6. Wait for GitHub's Pages deployment to finish. Open the URL GitHub displays, usually `https://YOUR-NAME.github.io/fallout76-atlas/`.
7. Use HTTPS. All app paths are relative, so project repositories and custom domains are supported without a base-path edit.
8. Search `Landview`, select a result, inspect its sources, then create a local profile and test a star. Reload: it should be locked; log in again and confirm the star remains.
9. Export an encrypted backup from the profile-name button and store it safely.

GitHub reference: [Publishing from a branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). GitHub's interface can evolve; follow the equivalent Pages publishing controls if labels change.

Do **not** upload the downloaded upstream ZIP, its raw SQLite database, research working files, or a private backup of your own journal. They are not in the delivery ZIP. The released site needs no GitHub token, SMTP credential or secret.

## Optional local preview

Install Node.js 20 or newer, open a terminal in this folder, and run:

```sh
npm start
```

Open `http://127.0.0.1:8765`. `npm install` is **not** needed: there are no runtime package dependencies. Stop the preview with Ctrl+C. Double-clicking `index.html` as a `file:` URL is not supported because the app loads JSON and uses browser cryptography.

Profiles are tied to the browser and site origin. Your localhost test profile will not appear automatically on GitHub Pages. Restore its exported backup there if desired. GitHub repositories under the same `username.github.io` host share a browser origin: see the privacy notes before co-hosting untrusted scripts.

## Using the journal

- **Guest:** all maps, search and sources work. Clicking a save action opens local login.
- **Create profile:** use a non-sensitive nickname and a long, unique passphrase (minimum 12 characters). There is no email or reset process.
- **Save:** stars/checkmarks/tags/markers save immediately. Notes require **Save note**.
- **Category favorites:** click the small star beside a category, then use **Starred item categories**.
- **Personal marker:** choose Add marker, then click the map. Keyboard users can focus the map, pan with arrows and press Enter in marker mode. Escape cancels.
- **Back up:** profile menu → Export encrypted backup. Restore requires the original passphrase. Existing profiles are replaced only when the replace checkbox is selected.
- **Lock:** profile menu → Lock / log out. Reloading also locks. Idle profiles lock after 15 minutes.
- **Delete:** the profile menu requires typing DELETE. Exported backup files are not deleted.

Private-browsing sessions may be temporary; storage quotas or browser cleanup can prevent or erase saving. A failed write produces “Not saved,” rather than falsely reporting success. Keep backups.

## Validation and source layout

```sh
npm test
```

Tests cover data identities/counts, coordinate round-trips, filters, encrypted profile persistence, wrong passphrases, tampered backups, restore replacement, conflicting completed saves, quota failures and malformed imports. See [TESTING.md](TESTING.md) for browser verification and limits.

| File / folder | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | User interface and map interactions |
| `model.js` | Coordinate projection, filtering and journal validation |
| `vault.js` | Local profile encryption and backup format |
| `data/atlas.json` | Pinned, attributed coordinates and map metadata |
| `data/guides.json` | Credited, CC BY-SA adapted area guides |
| `assets/maps/` | Reduced-resolution upstream overhead renders and two alternate Appalachia backgrounds |
| `vendor/` | Locally bundled Leaflet 1.9.4 |
| `scripts/` | Local server, data converter and upstream release checker |
| `tests/` | Node built-in test suite |
| `licenses/`, `SOURCES.md` | Reuse terms and source register |
| `PRIVACY.md` | Local storage and threat-model details |

Original app code is supplied under GPL-3.0-only. Wiki guide adaptations retain CC BY-SA 3.0. Leaflet retains BSD-2-Clause. Bethesda retains rights in game assets. This is an unofficial fan project, not affiliated with or endorsed by Bethesda or ZeniMax.
