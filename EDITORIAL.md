# Source badges and editorial additions

`data/details.json` maps a stable record ID to verified editorial material. It starts empty. Existing `data/guides.json` remains the source for seven area-wide guides. The app never infers that an area-wide description identifies a specific form ID.

Example schema (illustrative only; do not publish these example URLs as evidence):

```json
{
  "ref-003C757A": {
    "description": "Independently verified directions for this exact reference.",
    "source": "https://example.com/original-guide",
    "credit": "Original author; adapted by contributor",
    "license": "CC BY-SA 4.0",
    "photos": [{
      "path": "assets/photos/verified-spot.webp",
      "alt": "Description of the spot and visible landmarks",
      "source": "https://example.com/original-photo",
      "credit": "Photographer name",
      "license": "CC BY 4.0"
    }]
  }
}
```

Add only a photo whose reuse terms you have verified for this use and whose location matches the pin. Retain a direct source URL, author, license, modification history and any required notices. A publicly accessible web image is not automatically reusable. Do not treat wiki text licenses as covering wiki photographs. Copying Bethesda game imagery has its own underlying rights considerations even when a screenshot author grants permission; retain the source register's distinction.

Store approved images under `assets/photos/`, not a third-party hotlink. This keeps page loads on the hosting origin. For JPEG/PNG additions, also add their MIME types to the local preview server if needed. WebP works with the included server. Update SOURCES.md for every addition and retain any required share-alike terms for text adaptations.

The badge rules are implemented in `editorial.js` and tested: blue requires a locally referenced photo plus source, credit, license and alt text; yellow requires credited exact-pin text or an existing guide for that area's actual item category. A card states the distinction in words so meaning does not depend only on color. The asset checks verify files and metadata, not the truth of a contributor's rights or geographic claim; human review remains necessary.

General community comments do not become verified yellow-guide evidence automatically. The issue publishing workflow handles comments, tags and stars only. Photos or detailed editorial corrections require manual review/editing of this schema, assets and source register.
