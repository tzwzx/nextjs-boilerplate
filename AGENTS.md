# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js (App Router) boilerplate app. Bun is the package manager and runtime; Node 24 is required (`engines.node: 24.x`). Both Bun and Node 24 are already provisioned in the cloud environment, and `bun install --ignore-scripts` runs automatically on startup.

### Node version gotcha

`oxfmt` (used by `bun lint`) loads a TypeScript config (`oxfmt.config.ts`) and requires Node `>=22.18.0`. Node 24 is set as the nvm default, so a normal login shell resolves the right version. If you ever see `Unknown file extension ".ts"` from `oxfmt`, you are on an older Node — run `nvm use 24` (or reopen a login shell).

### Why the install skips scripts

The repo's `postinstall` runs `lefthook install && bun rulesync`. In the cloud environment `git config core.hooksPath` is owned by the Cursor agent, so `lefthook install` aborts and would fail a plain `bun install`. The startup script uses `bun install --ignore-scripts` to avoid this. `lefthook` (git hooks) and `rulesync` (AI rule generation) are not needed to build, run, or test the app. If you specifically need them, run `bun rulesync` manually; do not run `lefthook install` (it conflicts with the agent hooks path).

### Running / testing

Standard scripts are documented in `README.md` and defined in `package.json`. Common ones:

- Dev server: `bun dev` (serves `http://localhost:3000`; override with `PORT`).
- Build / start: `bun run build` then `bun start`.
- Lint / types: `bun lint`, `bun typecheck`, `bun stylelint`.
- Unit tests: `bun test:unit` (Bun test runner + happy-dom).
- E2E tests: `bun test:e2e` (Playwright, Chromium). Chromium is preinstalled in the snapshot. Playwright auto-starts the dev server via its `webServer` config and reuses an already-running dev server when not in CI. If Playwright reports a missing browser after a version bump, run `bunx playwright install chromium`.
- Aggregate quality gate: `bun codesweep:check`.

No database, env vars, or external services are required to run or test this app.
