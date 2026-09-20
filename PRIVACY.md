# V3 public community feature

Private stars, notes, tags, checklists and profiles still use the local encrypted journal described below. The separate **Submit to community** action prepares a GitHub issue URL containing only the contribution explicitly entered in that form, its type, and the selected public game record ID. It does not copy private journal notes, tags, passphrases or profile names. Nothing is submitted merely by preparing the link; the visitor follows it and finishes submission on GitHub.

GitHub account sign-in is required for public submission. The issue, GitHub username and content are public. After maintainer approval, the public entry is committed to `data/community.json` and delivered to all visitors as part of the static site. Display toggles do not delete contributions. GitHub issue history and repository history can retain information after a map entry is removed. Do not submit private information. There is no background browser API polling or automatic private-to-public synchronization.

The publishing workflow uses an ephemeral GITHUB_TOKEN on GitHub's runner to read the approved issue and commit its public entry. This token is never included in the app or browser. See START-HERE-V3.md for approval, removal and hosting setup.

---

# Privacy and local profiles

## What leaves the device

The app has no account server, email field, analytics, telemetry, database client, remote fonts, CDN calls, advertising, or cloud progress sync. It fetches its own same-origin map/data files. It does not send profiles, passphrases, notes, tags, stars, checkmarks or marker coordinates to the site owner.

GitHub Pages (or your chosen host) necessarily receives ordinary web requests and may process metadata such as IP addresses under its policies. Source links lead to external sites only when opened. The page uses a no-referrer policy and external links use `noopener noreferrer`.

The developer-only release-check script contacts GitHub's public API when manually run. The app itself never runs it.

## Stored locally

Each browser localStorage entry is named `field-atlas.v1.<normalized-profile-name>`. The profile nickname, version, KDF iteration count, random salt, IV and revision number are readable metadata. Use a nickname, not an email address or private identifier.

The encrypted payload contains the progress records, category favorites, personal markers, tags and notes. Encryption uses browser Web Crypto: PBKDF2-HMAC-SHA-256 with 600,000 iterations, a random 16-byte salt, and a nonextractable AES-256-GCM key. Each save gets a new random 12-byte IV. Envelope identity/version/revision are authenticated as additional data. A profile's key is retained in memory only while unlocked. Passphrases are not intentionally written to storage, backups, logs, or the network.

The passphrase is not recoverable. There is no identity verification, email recovery, remote reset or server account. Closing/reloading the page requires unlocking again. The idle lock runs after 15 minutes without a pointer-down or key-down event, subject to browser timer scheduling.

## Security boundaries and limitations

- This is encrypted local storage, not server authentication or access control. A person can modify their own downloaded app and bypass UI gating; that does not decrypt an existing profile without its passphrase.
- Weak passphrases can be guessed offline from an encrypted backup. Use long, unique phrases. A local login cannot prevent offline guessing by someone who can copy the storage.
- JavaScript and browser extensions with access to this origin can read an unlocked journal and capture typed passphrases. Encryption does not protect against malware, a malicious extension or a compromised host while unlocked.
- The page CSP blocks remote scripts and network destinations. Leaflet's styles require inline styles. The app escapes user-authored text before inserting HTML and validates imported journal structures. This reduces risk but is not a formal security audit.
- Browsers do not offer guaranteed zeroization of JavaScript strings or garbage-collected memory. Logging out drops app references; it is not a forensic memory wipe.
- GitHub Pages repositories beneath one `username.github.io` origin share localStorage access. Pathnames are not a security boundary. Use a dedicated origin if you also host untrusted applications.
- Saves detect completed changes from other tabs and lock on storage events. Avoid editing the same profile in multiple tabs concurrently; localStorage is not a transactional multiwriter database.
- Idle lock is convenience protection; explicitly lock the journal before leaving a shared device.
- Browser cleanup, quotas, private mode, device loss and origin changes can remove or isolate stored profiles.

## Backups and deletion

Exported JSON contains the encrypted envelope and the readable nickname. It does not contain a plaintext journal. Backups need the same passphrase; keeping both together defeats much of their protection.

Restore verifies the encryption and journal shape before saving. Restoring over an existing profile requires explicit selection of the replace checkbox. Replacement uses the backup contents; it does not merge journals. Unknown/removed official item IDs can remain in a backup for future data compatibility.

Delete profile removes that localStorage entry only. Copies in downloaded backup files, browser backups or synchronized browser data must be managed separately by the user.

## Technical references

- [MDN: SubtleCrypto.deriveKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey)
- [MDN: AesGcmParams](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — reference for PBKDF2 work factor; the app derives an encryption key rather than storing a server password hash.
- [GitHub General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
