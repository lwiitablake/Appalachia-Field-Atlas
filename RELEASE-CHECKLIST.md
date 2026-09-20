# Every release

1. Update package.json and release.js together. Generate the page title, loading status and version-specific runtime path from that version.
2. Run the complete tests, including the release consistency check, and regenerate the shipped runtime bundle from the tested source.
3. Check keyboard navigation, focus restoration, accessible names, image alternatives, text/non-text contrast, narrow-screen reflow, dialog dismissal and status updates. Check new interactions and record the scope and untested assistive-technology/device combinations in ACCESSIBILITY-REVIEW.md. Do not claim full WCAG conformance from unit tests.
4. Verify source filters and marker/cluster evidence indicators agree. Verify credits and licenses are visible without opening a location.
5. Package the complete directory with its manifest. Never mix individual files from different releases. Verify archive integrity and preserve prior releases.
