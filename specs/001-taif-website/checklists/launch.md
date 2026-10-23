# Launch manual-review checklist

Manual items that cannot be verified by the automated task list. Nothing here
is claimed done unless it was actually performed.

- [x] **Genuine screenshots added** — DONE: eight genuine captures were
  provided by the project owner on **2026-10-23**, live in
  `public/screenshots/` and wired into the showcase manifest
  `src/content/screenshots.ts` (platform, screen, intrinsic width/height,
  localized alt text and `capturedFrom: "2.0.1"` recorded per capture).
- [ ] **Arabic copy reviewed by the owner** — PENDING: the Arabic strings in
  `src/content/ar.ts` were written and are parity-checked by tests, but a
  fluent human review before launch has not yet happened.
- [x] **`SITE_URL` set to the production domain** (Vercel Production and Preview env; canonical https://taif-omarahmedpls-projects.vercel.app) — PENDING: all builds so far
  were rehearsals with `SITE_URL=https://example.invalid`; the real domain must
  be set by the owner at deploy time.
- [x] **Lighthouse run manually on both locales, results noted** (done 2026-10-24, see "Live checks") — PENDING:
  automated accessibility/axe checks ran and passed (see
  `tests/e2e/a11y.spec.ts`), but a recorded Lighthouse run for `/` and
  `/ar` (performance + audit scores) has not been done.
- [x] **Link audit against the live Releases page** (done 2026-10-24, see "Live checks") — PENDING: download links
  are validated against mocked GitHub fixtures in tests; a manual audit against
  the live `https://github.com/0omarahmed73/TaifVisual/releases` data (including
  asset names/sizes once a real release is published) has not been performed.
- [x] **Vercel project configured by the owner** (deployed 2026-10-24 to project `taif`; production alias https://taif-chi.vercel.app; not connected to Git) — PENDING (config and
  documented steps exist in `vercel.json` and `README.md`; no deploy
  has been performed by this task list and none will be).

**Visible-browser review note**: real-Chromium full-page renders of `/` and
`/ar` at 375/768/1280 (light + dark) were produced and inspected as rendered
HTML (see `checklists/visual/`), but a human design review of the PNGs is still
pending alongside this checklist.

## Verification record (2026-10-24, actually run)

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | clean |
| Types | `npm run typecheck` | clean |
| Unit | `npm test` | 10 files, 90 tests passed |
| Build | `SITE_URL=https://example.invalid npm run build` | succeeded; e2e fixture routes removed from `dist/` |
| Budget | `npm run verify:budget` | OK (HTML <= 100 KB, JS 215 KB, CSS 43 KB) |
| CSP | `npm run verify:csp` | PASS under the literal `vercel.json` headers |
| e2e | `npx playwright test` (4 viewports, mocked GitHub) | 243 passed, 65 skipped (project-specific), 0 failed |

Not verified: Lighthouse scores, live GitHub link audit (this machine's IP was
at GitHub's 60 requests/hour unauthenticated limit during testing), a deployed
build on the production domain, Arabic copy review by a fluent reader.

## Live checks (2026-10-24) against https://taif-chi.vercel.app

**Link audit.** Real release data was fetched with an authenticated `gh api` call
(this machine's IP had exhausted GitHub's unauthenticated limit) and served to the
live site through a mocked API response, for Windows, Linux and Android user agents
on `/` and `/ar`. Latest release rendered: v2.0.1. Every rendered download link
(hero button and download center, 6 page loads) equals one of the 4 real assets of
that release; 0 unexpected URLs. HEAD requests to all 4 asset URLs returned 200 with
a Content-Length equal to the release's asset size. Developer and Releases links all
returned 200. Note: the two APKs on release v2.0.1 are named `TAIF-2.0.0-*.apk`
(upstream naming; the site shows file names as published).

**Lighthouse** (lighthouse@latest, headless Chromium, default throttling):

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
|------|------|------|----------------|-----|-----|-----|-----|-----|
| `/` mobile | 87 | 100 | 96 | 100 | 2.5 s | 3.4 s | 0 ms | 0.028 |
| `/ar` mobile | 90 | 100 | 96 | 100 | 2.3 s | 3.1 s | 0 ms | 0.004 |
| `/` desktop | 100 | 100 | 96 | 100 | 0.3 s | 0.3 s | 0 ms | 0.013 |
| `/ar` desktop | 100 | 100 | 96 | 100 | 0.3 s | 0.3 s | 0 ms | 0.013 |

- Best practices 96: one console error, the GitHub API answering 403 (rate limit
  from the test machine); a normal visitor would not see it.
- Mobile LCP (3.1-3.4 s) misses the 2.5 s target in README; the spec goal of main
  content within 3 s is met for FCP (2.3-2.5 s) but not for LCP. LCP element is the
  hero heading with ~1.2 s render delay. Disabling the splash (reduced motion) gave
  perf 91 and LCP 3.1 s, so the splash costs about 0.3 s; the rest is
  render-blocking requests and image delivery (Lighthouse estimates 154 KiB savings).
