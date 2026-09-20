# WCAG 2.1 AA review — 2026-09-20

Target: WCAG 2.1 Level AA. This is a focused code, DOM, contrast and browser interaction review, not a declaration of full conformance. Reference: [W3C WCAG 2.1](https://www.w3.org/TR/WCAG21/).

## Changes and checks

- Native square screenshot/directions checkboxes have associated labels, a fieldset legend and instructions. Selecting both uses OR, including records that have both. Neither selected imposes no evidence restriction. Existing category/map/search filters still apply. Browser checks returned 1 screenshot result and 28 combined results with the default categories and map. Two regression tests cover the selection combinations and exact-description support.
- Bright blue #42c5ff outlines use a thin dark separator from the category fill, yellow ring and map. Written evidence labels are available in tooltips, details and result accessible names, so color is not the only source of the information (1.4.1).
- Measured count text on selected-category backgrounds was below 4.5:1; darkened muted text and category stars. Darkened form borders/placeholders; made map control backgrounds opaque and strengthened keyboard focus styling (1.4.3, 1.4.11, 2.4.7). This was a targeted computed-style contrast review, not exhaustive testing of every map image pixel or UI state.
- Fixed mobile skip-to-search opening and focusing the drawer (2.4.1). Changed the global single-character shortcut to Ctrl/Command+/ (2.1.4). Preserved keyboard focus when category controls rerender and when notes minimize; the latter was verified to focus Open notes (2.4.3).
- Escape dismisses notes/search and closes open map tooltips. Native dialog Escape dismissal restores focus to the invoking login button, verified in the browser. Gesture operations retain buttons and keyboard alternatives (2.1.1, 2.5.1).
- Login/sign-up offer 15-minute, 1-hour or 5-hour inactivity intervals before a session starts, preserving the 15-minute default and allowing a 20-fold extension (2.2.1). Reload still locks the journal. The selector and its options were browser-verified; elapsed five-hour behavior was not timed live.
- Inspected screenshot alt text, button names, dialog labels and page language; the inspected detail state had no duplicate IDs or unnamed visible buttons. Filter result counts use an existing polite live region (1.1.1, 1.3.1, 3.1.1, 4.1.2, 4.1.3).
- At a browser-reported viewport width of 320 CSS pixels, document width was also 320 pixels: no page-level horizontal overflow in the inspected state (1.4.10). Added wrapping safeguards for narrow map controls and navigation.
- All 31 automated unit/regression tests pass, including encryption, data integrity, gallery gestures and evidence filtering. These tests are not an automated WCAG scanner.

## Remaining validation before claiming conformance

Complete hands-on NVDA and VoiceOver testing, real iOS/Android gesture and zoom testing, 200% text resizing, 400% browser zoom, WCAG text-spacing overrides, all authenticated/error/community states, and hover tooltip persistence/hoverability. No axe scan or full assistive-technology audit was performed in this pass. Map pins have an equivalent searchable result list; assess that alternative with screen-reader users. Review the full Level A and AA criteria across all pages and workflows before publishing a conformance claim.


## v3.3.1 release check

Repeated focused accessibility checks on the correction release. Native world/region/interior select controls have explicit labels. The 320px browser viewport reported document width 320px and the license footer inside the viewport. No duplicate IDs or unnamed visible buttons were found in the inspected detail state; the screenshot has descriptive alt text. Keyboard activation of Skip to search opened the mobile drawer and focused search. Keyboard Enter on inline zoom increased the displayed scale to 150%; Reset restored 100%. Zoom uses labeled buttons, an output status and an Expand alternative; disabled minimum/maximum controls reflect their state.

Computed foreground/background contrast on the newly visible elements: credits navigation link 8.10:1, map-credit text 11.57:1, zoom percentage 11.07:1, license footer 11.44:1. These checks exceed the 4.5:1 normal-text threshold for these samples; they are not an exhaustive scan. New controls retain focus-visible styling. Blue evidence remains available as text and via filters, not color alone.

All 36 regression tests passed. Added release-version/module consistency and screenshot-filter/evidence agreement checks. RELEASE-CHECKLIST.md requires accessibility checks on every release. Full screen-reader, real-device pinch, all-state zoom/text-spacing and conformance validation remain outstanding as described above. No claim of full WCAG 2.1 AA conformance is made.
