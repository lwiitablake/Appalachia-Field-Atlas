# Data provenance, accuracy and updates

## Pinned edition

- Upstream: [AHeroicLlama/Mappalachia](https://github.com/AHeroicLlama/Mappalachia).
- Release: [2.0.5.2](https://github.com/AHeroicLlama/Mappalachia/releases/tag/2.0.5.2), published 2026-09-15.
- Database `Meta.GameVersion`: `1.7.26.13`.
- Release asset: `Mappalachia.zip` (657,515,945 bytes at retrieval).
- The SHA-256 of that archive is recorded in `data/atlas.json → meta.archiveSHA256`.
- Research review: 2026-09-19. Dates describe the source snapshot/review, not an in-game visit to every point.
- [Bethesda's September 15 release notes](https://fallout.bethesda.net/en-US/news/fallout-76-the-slasher-release-notes) provide update context; our version statement comes from the actual extracted database.

The import consumes only `data/mappalachia.db` and the matching overhead renders and alternate Appalachia background images. It does not execute the upstream executable or redistribute that executable, the full raw database, textures, fonts or upstream map icons.

## Included positions

The import script explicitly allowlists the general bobblehead and magazine leveled-list references, the Unstoppables-specific magazine reference, caps stash variants, two placed fusion-core lists, and selected power-armor furniture lists. All upstream map markers are included. Consult `scripts/build_data.py` for exact editor IDs.

It intentionally excludes decorative magazine racks, burnt magazines, power-armor workbenches, static props, Nuclear Winter `zzz_` references, generic NPC references, and quest-specific reward systems from the loot layers. Do not claim these counts cover all items obtainable in the game.

The dataset preserves interiors, instanced/dungeon variants and expansion spaces as separate maps. Some share a display name; the selector includes their editor IDs. Being present in game files does not guarantee a reference is enabled, reachable or available during a particular quest, expedition or event. These states require additional gameplay validation.

## Coordinates and images

Every loot point retains its placed-reference form ID, base form ID, editor ID, space ID and XYZ coordinates (rounded to four decimal places). A loot ID is `ref-<8-digit hex instanceFormID>`. Location marker IDs hash their space, label and rounded position. This avoids dependence on upstream table row order, although a moved/renamed map marker may get a new ID.

Projection follows upstream [Space.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Library/Space.cs) and [Map.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Mappalachia/Map.cs):

```text
Leaflet X = (worldX - (centerX - range/2)) / range * 4096
Leaflet Y = (worldY - (centerY - range/2)) / range * 4096
Image X = Leaflet X
Image Y = 4096 - Leaflet Y
```

Leaflet uses a non-geographic `CRS.Simple` coordinate system. These are game coordinates, never Earth latitude/longitude. Bounds and center come from each `Space` row. North angles are retained in metadata; interior renders use their local XY orientation, which may differ from the in-game compass. Images are not rotated separately from their points.

Area names are associated through source cell-location mappings (`floor(X/4096), floor(Y/4096)`). When no association is available, the nearest map marker in the same space supplies a contextual label. A nearest landmark is an aid, not proof of membership in a location. Directions describe the nearest marker and horizontal game-unit distance; we do not convert to unverified meters or invent a walkable route.

Detail images crop the same overhead source around the selected coordinate and add an original crosshair. They can obscure loot below roofs or on another floor. They are not an eye-level photograph. Every image carries a source and Bethesda rights notice.

## Expanded location import

`build_data.py` calls `build_layers.py` after the loot import. This adds all source spaces and the illustrated/military backgrounds. All 672 Location rows are accounted for: 421 match destination names and cells, 235 are additional named records, and 16 have no display name and are omitted from the named index. The 235 additional records comprise 91 named areas and 144 region/subregion records. All 458 MapMarker rows remain.

Supplemental IDs are `loc-<8-digit Location form ID>` and `space-<8-digit Space form ID>`. Existing loot and destination IDs are preserved. Representative area pins use the center of an associated 4096-unit cell nearest the mean of the associated cells; all source cells are retained for a selected-area outline. Directory pins use the source render center. Neither type claims an exact entrance or fast-travel destination.

For a future release, check missing/empty cell associations, changes to region editor IDs, alternative map file names, background alignment and source imagery age. Do not infer travel status from a marker label or icon: that information is not in this export. See [LAYERS.md](LAYERS.md).

## Written guides

Seven areas contain paraphrased CC BY-SA 3.0 wiki guidance in `data/guides.json`. Each record includes its source URL, contributor credit, license and review date. All excerpts were kept short and adapted; images from those wiki articles were not copied.

An area with multiple spots lists those spots together. Until someone verifies the correspondence between prose and exact form ID, the app does not assign a room/shelf description to a specific pin. Coordinate-derived directions remain explicitly separate. To add an exact guide, verify the reference in-game or against a source that identifies that reference, record the evidence, then extend the schema/UI to display that confirmed match. Do not infer one merely from list order.

## Check for an update

Run from the app directory:

```sh
node scripts/check-upstream.mjs
```

This manually checks GitHub's latest release and reports whether it differs. It never overwrites the shipped data. Review the release notes and distinguish live releases from PTS or prerelease content.

For a new edition:

1. Download the official upstream release ZIP and record its SHA-256 and published date.
2. Inspect `Meta.GameVersion`, `Space`, `Position`, `Entity`, `MapMarker`, `Cell`, and `Location` schema changes.
3. Review the editor-ID allowlist. Add newly introduced categories or variants only when their semantics are understood.
4. Update the explicit release, expected game version, dates and source URL in `scripts/build_data.py`.
5. With Python 3.11+ and Pillow installed, run `python scripts/build_data.py /path/to/Mappalachia.zip` from the app folder. No network is used by the converter.
6. Compare record identities, counts, coordinates, removed references and image availability with the previous edition. Preserve journal identities where the underlying reference remains the same.
7. Review representative anchors in the Forest, Burning Springs, Skyline Valley and at least one rotated interior. Check image/coordinate alignment and any new map extents.
8. Recheck affected written guides and rights notices. Keep old review dates if guides were not rechecked; do not stamp every guide “verified” automatically.
9. Update count/version assertions and coverage documentation deliberately, then run `npm test` and the browser checks in `TESTING.md`.
10. Commit the reviewed data, changed images, script, attribution and documentation. GitHub Pages republishes the new snapshot.

Do not automate unreviewed ingestion. Upstream availability, license terms, schema changes, scripted spawns and region layout can all change.
