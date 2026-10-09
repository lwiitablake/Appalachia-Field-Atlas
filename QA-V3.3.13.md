# v3.3.13 QA

64 Node tests passed, including owner identity rejection, preservation of latest metadata, branch-only writes, retry without duplicate images, and token disconnect. Automated browser tests used a fake token and simulated GitHub responses; no live repository writes were performed. The browser decoded and re-encoded a valid PNG as WebP, uploaded it with metadata, displayed a PR link, and retained no token in localStorage/sessionStorage. Reload disconnected the owner session. Files/metadata were uploaded without issue or Actions calls.

Four axe-core checks (owner connection, desktop upload form, mobile upload form, mobile success) reported zero WCAG 2.1 A/AA automated violations. Color-contrast incomplete checks need human review; the mobile output was visually inspected. This is a targeted review, not a full WCAG certification or real-device/screen-reader audit. Native drag/drop support remains unchanged alongside Browse files. Real token permissions, API limits, branch protection and live merge/deployment still require the first real submission. See qa/v3313-accessibility.json.

The UPDATE ZIP excludes map data and existing image assets. It preserves newer repository photo contributions when installed over the current app. The complete folder remains a development snapshot, not a fresh GitHub clone.
