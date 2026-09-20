# Source register, attribution and rights

Reviewed September 19, 2026. Source citations are also built into the map footer, every detail card and the Sources dialog. This document separates software licenses from Bethesda's underlying game rights. Publicly accessible does not mean public domain.

## 1. Coordinates, map renders and data model

**AHeroicLlama and Mappalachia contributors.** *Mappalachia*, release 2.0.5.2, September 15, 2026.

- [Project, credits and rights statement](https://github.com/AHeroicLlama/Mappalachia)
- [Pinned release](https://github.com/AHeroicLlama/Mappalachia/releases/tag/2.0.5.2)
- [Release asset](https://github.com/AHeroicLlama/Mappalachia/releases/download/2.0.5.2/Mappalachia.zip)
- [GPL-3.0 license](https://github.com/AHeroicLlama/Mappalachia/blob/master/LICENSE.md); a full copy is in `licenses/GPL-3.0.txt`.
- [World/cell coordinate bounds: Space.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Library/Space.cs)
- [World-to-image transformation: Map.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Mappalachia/Map.cs)
- [Background-rendering methodology](https://github.com/AHeroicLlama/Mappalachia/blob/master/Docs/Developer/BackgroundRendering.md)
- [fo76utils](https://github.com/fo76utils/fo76utils), credited upstream for the game-world rendering tools; not bundled or executed by this app.

Consumed source fields: `Meta`, `Space`, `Position`, `Entity`, `MapMarker`, `Cell` and `Location` in the release's SQLite database. Only the selected coordinate records and required map metadata are shipped. Every source image's archive path is preserved in `data/atlas.json → spaces → sourceImage`.

**Changes made:** selected a limited set of item categories; exported to JSON; preserved stable game reference identifiers; associated cell names or nearest markers; calculated descriptive horizontal bearings/distances; converted upstream JPEG overhead images to WebP (interiors downscaled to at most 1536 pixels per side); drew map pins and a detail crosshair; cropped the same source render for individual detail cards. No AI-generated scenery or invented placements are used. No upstream executable, raw SQLite database, proprietary font, extracted icon set, or game texture archive is redistributed.

The downloaded release SHA-256 matched the digest provided in GitHub's release metadata:

```text
8dd87bf81a5807d47a3e42922ad8de429640b0df5a1ae65baf8bdb2435334506
```

**Rights:** Mappalachia's code/project work is GPL-3.0. Its maintainers separately describe game-derived data/assets as shared on a fair-use understanding for community maps. That statement is not an express grant from Bethesda and does not put game assets under GPL. Bethesda Softworks LLC / ZeniMax retain their rights. This app is unaffiliated and unendorsed.

### Fair-use basis documented for this particular use

The imagery is used as a reduced-resolution reference surface for an interactive, attributed location index, with individual coordinate annotations and explanatory context. It is not presented as standalone game art for sale. Interior renders are substantially reduced, all 205 source spaces are bundled for the map directory, and detailed screenshots from unrelated guide creators are not copied. The app is supplied without ads or monetization.

Factors weighing in favor include the informational mapping/annotation purpose and limited image quality/detail. Factors requiring care include the creative nature of the game artwork and the fact that an entire rendered area is needed to orient a map. A fan tool's noncommercial purpose and attribution alone do not establish fair use. The use is not a substitute for playing/purchasing the game, but no market-impact assessment or judicial ruling is claimed. Changes to commercial use, distribution scale, imagery quality or presentation can change the analysis.

Reference: [U.S. Copyright Office, More Information on Fair Use](https://www.copyright.gov/fair-use/more-info.html). Fair use is assessed case by case. This is a documented reuse rationale, not guaranteed permission or legal advice. If your publication standard requires an express Bethesda license for all art, obtain that permission or replace these images before publishing; do not describe them as openly licensed or public domain.

### Alternate backgrounds and expanded locations (app 1.1)

The same pinned archive supplies `img/wrld/Appalachia_menu.jpg` (illustrated game map) and `img/wrld/Appalachia_military.jpg` (military map). Both are converted to WebP at no more than 4096 pixels per side. They retain Bethesda/ZeniMax rights and the same documented upstream fair-use basis; they are not public-domain or GPL-licensed art. Their individual paths and notes are recorded under each space’s `backgrounds` field.

[Upstream FileIO.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Mappalachia/FileIO.cs) selects these alternate images without a separate coordinate transform; [Map.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Mappalachia/Map.cs) supplies the common world-to-image projection. The atlas preserves those shared bounds. Illustrated features are stylized; the military drawing may depict older geography. Detail-card crops continue to use the terrain render for coordinate context.

`scripts/build_layers.py` includes all 205 Space rows and supplements map markers with named Location rows. It derives representative pins from associated Cell rows and visibly labels them approximate. Region classification follows source editor IDs beginning with Region/SubRegion, not a hand-verified geographic taxonomy. It merges a named Location into a destination only when normalized names agree and the destination occupies one of that Location’s cells. Otherwise the entry remains separately discoverable. See [LAYERS.md](LAYERS.md) for counts, precision and exclusions.

## 2. Adapted written area guides

**Nukapedia / Fallout Wiki contributors**, respective articles, retrieved through publicly indexed article text. The app uses short paraphrased location instructions, with changes for concise interface presentation. It does not reproduce the articles' background lore, gallery photographs, or Prima guide quotations.

| Area | Original article and contributor history |
| --- | --- |
| Landview Lighthouse | [Article](https://fallout.fandom.com/wiki/Landview_Lighthouse) · [history](https://fallout.fandom.com/wiki/Landview_Lighthouse?action=history) |
| Alpine River Cabins | [Article](https://fallout.fandom.com/wiki/Alpine_River_Cabins) · [history](https://fallout.fandom.com/wiki/Alpine_River_Cabins?action=history) |
| Tyler County Fairgrounds | [Article](https://fallout.fandom.com/wiki/Tyler_County_Fairgrounds) · [history](https://fallout.fandom.com/wiki/Tyler_County_Fairgrounds?action=history) |
| High Knob Lookout | [Article](https://fallout.fandom.com/wiki/High_Knob_Lookout) · [history](https://fallout.fandom.com/wiki/High_Knob_Lookout?action=history) |
| Stony Man Lookout | [Article](https://fallout.fandom.com/wiki/Stony_Man_Lookout) · [history](https://fallout.fandom.com/wiki/Stony_Man_Lookout?action=history) |
| Dino Peaks Mini Golf | [Article](https://fallout.fandom.com/wiki/Dino_Peaks_Mini_Golf) · [history](https://fallout.fandom.com/wiki/Dino_Peaks_Mini_Golf?action=history) |
| Pleasant Valley cabins | [Article](https://fallout.fandom.com/wiki/Pleasant_Valley_cabins) · [history](https://fallout.fandom.com/wiki/Pleasant_Valley_cabins?action=history) |

Reuse basis: [wiki content/attribution policy](https://fallout.fandom.com/wiki/Fallout_Wiki:Content_policy) and [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The adapted text in `data/guides.json` is offered under CC BY-SA 3.0 as well. Credit the named wiki contributors, link the source and license, and indicate adaptations when redistributing it. The software's GPL notice does not replace this license. See also [CC BY-SA 3.0 legal code](https://creativecommons.org/licenses/by-sa/3.0/legalcode).

Review dates identify when the source text was checked, not in-game revalidation. Written guides are area-wide; exact pin-to-prose correspondence remains unverified. Do not imply each sentence has been checked against each form ID. Wiki images have their own rights; none were bundled under an assumption that the text license covers them.

## 3. Map library

**Volodymyr Agafonkin and Leaflet contributors.** *Leaflet*, version 1.9.4.

- [Project](https://leafletjs.com/)
- [Official download and integrity hashes](https://leafletjs.com/download.html)
- [Source for version 1.9.4](https://github.com/Leaflet/Leaflet/tree/v1.9.4)
- [BSD-2-Clause license](https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE); bundled in `licenses/Leaflet-BSD-2-Clause.txt`.

`vendor/leaflet.js` and `vendor/leaflet.css` are locally bundled distribution files. The app supplies its own marker symbols; Leaflet's default PNG markers/layer selector are not used. Do not remove Leaflet's copyright/license notices. No OpenStreetMap tiles or data are used: Fallout world coordinates are not geographic coordinates.

## 4. Current-update context

- **Bethesda Softworks**, [Fallout 76: The Slasher Release Notes](https://fallout.bethesda.net/en-US/news/fallout-76-the-slasher-release-notes), September 15, 2026.
- **Bethesda Softworks**, [Fallout 76: “The Slasher” Cuts In on September 15](https://fallout.bethesda.net/en-US/news/fallout-76-the-slasher-cuts-in-on-september-15), August 18, 2026.
- **Bethesda Softworks**, [Burning Springs Release Notes](https://bethesda.net/en-US/news/fallout-76-burning-springs-release-notes), expansion context.

These are context links; their marketing artwork and article text are not bundled. The shipped game-version value was independently read from the release database.

## 5. Implementation references

Original application implementation prepared for this project with OpenAI Codex. No existing Fallout map site's HTML, UI implementation or proprietary guide dataset was copied.

- [Leaflet API reference](https://leafletjs.com/reference.html) and [CRS.Simple guide](https://leafletjs.com/examples/crs-simple/crs-simple.html): non-geographic map behavior.
- [MDN: SubtleCrypto.deriveKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey): browser key derivation.
- [MDN: AES-GCM parameters](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams): encryption parameters.
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): browser-local persistence and origin boundaries.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): PBKDF2-HMAC-SHA-256 work-factor reference.
- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): branch publishing instructions.
- [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement): host privacy context.
- [Supabase passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless): evaluated for the original email-link idea, then not used after the decision to use strictly local profiles. No Supabase code or service is in the app.

## 6. Original work and distribution

Original source files, UI styles, generic text marker symbols, favicon, tests and developer scripts are supplied under GPL-3.0-only. Retain the source and license when redistributing; do not apply that license to separately identified third-party game assets or wiki text. The full corresponding source of this static app is the files supplied here; there is no hidden compiled application bundle or server component.

For corrections, keep the source entry, evidence and modification date together. For a rights concern, remove or replace the specific asset before republishing and update the source register. Do not remove attribution merely because an asset is cached locally.


## V3 original artwork and workflow references

V3 icons in `icons.js` are original single-color SVG geometry: bobblehead silhouette, magazine, Caps C emblem, battery, pin, map, mountain/region, door and flag; power armor uses PA text. No Bethesda/Vault Boy artwork or Caps font was copied. These original shapes are GPL-3.0-only with the app. The C is a custom emblem, not an identified authentic Caps typeface. UI text uses the user's available Segoe UI/Arial/sans-serif system stack; no proprietary font file is distributed. Blue/yellow source outlines are interface colors, not copied branded assets.

Community workflow references: [GitHub issue creation](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue), [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [workflow permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [repository renaming](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository). The workflow uses GitHub's official actions/checkout, actions/upload-pages-artifact, and actions/deploy-pages actions on GitHub's runner; their code is not bundled in this ZIP.

No new third-party spot photos or exact-pin prose were added in v3. Existing map/data source dates remain unchanged. `EDITORIAL.md` describes evidence requirements for future blue/yellow badges. Public contribution authors and issue links remain visible with published comments. Review rights before republishing contributed text; the repository's software license does not automatically establish rights in submissions.


## V3.1 research and native terrain

See [V3.1-CHANGES.md](V3.1-CHANGES.md) for direct links to Ghoul Earth (reviewed, not reused), the Landview screenshot gallery (linked, not copied), and the 98 NAR Regional / New Appalachian Railroad explanations. Reviewed September 20, 2026. The optional native terrain quadrants preserve decoded pixels from the same pinned Mappalachia APPALACHIA.jpg without added lossy compression. This adds no new source imagery or license; the existing Bethesda rights and contextual mapping rationale still apply. `scripts/build_native.py` reproduces these four credited quadrants and verifies pixel equality.

## v3.2 embedded screenshots

See [V3.2-CHANGES.md](V3.2-CHANGES.md#screenshot-rights-and-scope) for image-specific direct links, uploader credits, historical scope, modifications and fair-use rationale. These game screenshots are not covered by the prose Creative Commons license.
