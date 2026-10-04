# Start here — v3.3.10

This is a complete new copy based on GitHub commit fe81934, retrieved October 4, 2026. Previous development folders and the separate GitHub snapshot are preserved. Nothing has been pushed or deployed by this build.

## Install with GitHub Desktop
1. Fetch origin and pull your Appalachia-Field-Atlas repository first. If newer photo publications have appeared since this snapshot, preserve those newer data/details.json, data/community.json and photo assets before replacing files.
2. Extract Fallout76-Field-Atlas-v3.3.10.zip. Copy its CONTENTS into your local repository root, beside index.html. Do not put the enclosing version folder inside the repository. Include the hidden .github folder. Never replace/delete your repository's .git folder.
3. Review the changes in GitHub Desktop, commit with summary "Update atlas to v3.3.10", and Push origin.
4. Wait for the Publish atlas workflow and Pages deployment to succeed. Reload the website; its header should show v3.3.10.

## New controls
- Toilet paper (515), plungers (289), safes (632) and fishing have square checkboxes in the layers list. Counts include interiors; overworld totals will be smaller.
- Expand More items & interactables. Search a name, then check it to load its positions. The catalog contains 4,250 named types and 193,581 additional placements. Only selected types load, to avoid rendering everything at once. Reloading clears these temporary type selections.
- Interior resources start OFF. You can enable the gray entrance markers manually. Choosing an interior map enables interior resources so that map can show its contents.
- Expand Fishing: species & season to select a fish and availability category. Choosing one enables the fishing layer. These 49 species use 69 area references, not exact casting points. Monthly axolotl rotations change at the first Tuesday reset; server seasons are not calendar seasons. Check the linked original guidance and live in-game notices.
- Photo arrows and dots are immediately below the image. Subtle side arrows also change photographs. Photo notes have their own highlighted card. Zoom, reset, drag/pan and the existing photo submission/review workflow remain available.

## Coverage and rights
Named source placements include doors, terminals, flora, furniture, containers and items useful for daily challenges. This is not a complete list of all daily quest objectives or a promise that every object is usable: quests, scripts, locks and world state can restrict access. Static decorations are excluded. Fishing coverage is a sourced regional guide, not a survey of every fishable water boundary or every fish species.

The newest published Mappalachia edition checked for this build was 2.0.5.2 / game 1.7.26.13. That does not independently verify every placement against the live game. No new web photographs were copied. Original source links and distinct underlying game-asset rights remain in SOURCES.md and each fishing guide. Use Atlas Source Review after updates; see ATLAS-SOURCE-REVIEW.md.

The latest baseline photos and their metadata were retained byte-for-byte. Read QA-V3.3.10.md for test scope and limits.
