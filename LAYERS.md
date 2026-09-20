# Map backgrounds and location layers

App version 1.1.0. Data: Mappalachia 2.0.5.2, Fallout 76 1.7.26.13, published September 15, 2026. This is a dated snapshot, not a live game connection.

## Background controls

Choose **Map background** in the search sidebar:

| Background | Purpose and limitations |
| --- | --- |
| Satellite / terrain | Rendered overhead game terrain, not real satellite photography. Best for coordinate placement. Roofs and floors can conceal objects. |
| Illustrated game map | In-game illustrated Appalachia map supplied with this release, including artwork for Burning Springs and Skyline Valley. Landmark drawings are stylized rather than precise building footprints. |
| Military map | Alternate upstream military artwork. Labels and depicted terrain may predate expansions; use satellite for current terrain context. |

Changing the background keeps pins, zoom, filters and journal state. **Background visibility** changes image opacity from 20% to 100%, leaving markers readable. These are alternative base maps, not simultaneously stacked blend/comparison layers.

Only Appalachia has all three source backgrounds. Other spaces use their overhead render and show an explanatory note. Your selected Appalachia style returns when you switch back. Detail-card pictures always use overhead terrain crops so the picture remains useful for locating a point regardless of the selected artwork.

## Location controls

**Show all locations** enables the four location categories below; **Hide all locations** disables them. Both preserve loot-category choices. Individual category buttons toggle each layer independently. **All layers** also controls loot and personal markers. Search, map selection, progress, tags and the written-guide filter still apply. Clear restrictive filters to see the full location index.

| Layer | Entries | Meaning and precision |
| --- | ---: | --- |
| Map destinations | 458 | All MapMarker rows. Pins use the exact coordinates in this export. Travel availability is unknown. |
| Other named areas | 91 | Additional named Location rows not merged with a corresponding destination. Pins represent associated source cells, not exact entrances. |
| Regions | 144 | Region/subregion Location rows, identified by source editor IDs. These include broad or overlapping data areas, not just the main geographic regions. |
| Interior maps | 204 | One directory entry per non-Appalachia source space, positioned at the render center. Includes interiors, shelters, expeditions, instanced variants and potentially inaccessible spaces. |

Select **All maps & interiors** to search across all 205 spaces. The map itself displays one space at a time. Selecting a result opens its corresponding space. Selecting a particular interior shows that space’s records. An interior directory pin is not an entrance on the Appalachia surface map.

Enable **Location labels** for persistent labels on individual location pins. At distant zoom levels pins are grouped to avoid displaying thousands of overlapping labels; zoom in to see individual names. Selecting a named-area or region record outlines its associated source cells. These coarse cells are data associations, not surveyed boundaries. Overlapping areas and similarly named records are retained when their source associations differ.

Every new record supports local stars, checks, tags and notes, just like loot points. A local profile is required to save. Existing reference and destination IDs remain intact; no journal migration or deletion is needed. Map display choices are session preferences and reset on reload.

## What “all” covers

The source contains 672 Location rows: 421 merge into matching destination names/cells, 235 remain as additional named records, and 16 have no display name. All 458 MapMarker rows are included. All 205 Space rows have bundled renders. This accounts for the entire pinned export at those levels, but it is not a claim to catalog every community-named unmarked cabin, cave, Easter egg, event object or runtime spawn.

The database does **not** export fast-travel eligibility, discovery status, quest requirements, temporary access, or player-specific travel availability. The app therefore includes locations regardless of travel classification and does not invent a travel/non-travel split. An exact map-marker coordinate does not prove that fast travel is currently available.

The whole atlas contains **2,901 records**: 2,004 selected loot references, 693 Appalachia location/area records, and 204 map-directory entries. The original loot coverage is unchanged. Most point descriptions remain coordinate-based; seven areas have separately attributed written guides. No new room-level directions or close-up photos were fabricated for this update.

## Sources and reuse

- [Mappalachia pinned release](https://github.com/AHeroicLlama/Mappalachia/releases/tag/2.0.5.2): database and imagery.
- [Mappalachia FileIO.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Mappalachia/FileIO.cs): alternate background selection.
- [Mappalachia Map.cs](https://github.com/AHeroicLlama/Mappalachia/blob/master/Mappalachia/Map.cs): common coordinate projection.
- [SOURCES.md](SOURCES.md): full credits, modifications, licenses and the documented fair-use rationale for Bethesda imagery. Public availability is not public-domain status.
- [DATA-MAINTENANCE.md](DATA-MAINTENANCE.md): reproducible import, stable IDs and update procedure.
