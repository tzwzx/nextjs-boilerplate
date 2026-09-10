---
name: verify-nextjs-boilerplate
description: Verify the Next.js Boilerplate web UI (home heading and 404) by launching an isolated local `bun dev` server and driving it with agent-browser. Use when proving a user-visible change, checking the live app, or confirming home / not-found behavior.
---

# Verify Next.js Boilerplate

Read this cold. Drive the real app in a browser. Do not treat `bun test:unit` or `bun test:e2e` as a substitute for this skill — those are CI suites. This skill is for a live user-path proof.

Primary surface: the Next.js App Router web UI (`src/app/page.tsx`, `src/app/not-found.tsx`, `src/app/layout.tsx`). There is no CLI, no API, no auth, no database. `error.tsx`, `global-error.tsx`, and `loading.tsx` exist but have no user entry point; do not invent a throw/slow route to reach them.

Harness: `agent-browser` (named session). Playwright (`bun test:e2e`) is only for this repo's E2E suite or Firefox/WebKit, not for interactive verification.

Scripts live in `.cursor/skills/verify-nextjs-boilerplate/scripts/` and must be invoked by that path (or an absolute path). They are executable.

Default isolated URL: `http://127.0.0.1:3100` (`VERIFY_PORT=3100`, `VERIFY_HOST=127.0.0.1`). Never drive `http://localhost:3000` unless this run's instance file says that URL — port 3000 is the common user/dev default and is often a different app.

## Launch

From the repo root, start launch as a **long-lived background command** (do not let that shell exit until cleanup):

```bash
.cursor/skills/verify-nextjs-boilerplate/scripts/launch
```

What it does:

- Starts `bun run dev -- --port 3100 --hostname 127.0.0.1` (override with `VERIFY_PORT` / `VERIFY_HOST`).
- Writes `test-results/verify/.run/instance` (pid, url, cwd) and logs to `test-results/verify/.run/server.log`.
- Waits for a `Ready in` / `Local:` line in the server log, then until `GET /` includes `<h1>Next.js Boilerplate</h1>` (first compile can take tens of seconds; do not use a 2s curl timeout).
- Prints `VERIFY_URL=...` and then **waits on the server pid**. A one-shot `launch && doctor` shell reaps the instance when it exits (Cursor sandbox / SIGHUP), which shows up later as `ERR_CONNECTION_REFUSED`.
- Refuses if this checkout already has a listening server (shared `.next/`), if an instance file points at a live pid, or if the chosen port is taken.

Ready when the background output contains `VERIFY_URL=` (or `scripts/doctor` prints `doctor: OK`). Run doctor in a **second** shell before any drive.

Teardown is `scripts/cleanup` (see Cleanup). After a failed launch or failed drive, run cleanup before retrying so ports and pids are not stranded.

This checkout cannot run two `next dev` processes side by side. If the user already has `bun dev` for this repo, stop and say so — do not attach to their server, and do not start a second one. A separate git worktree with its own `.next/` is the way to run in parallel.

## Doctor

Read-only. Run this first whenever anything looks off, before the first drive, and after any failed drive:

```bash
.cursor/skills/verify-nextjs-boilerplate/scripts/doctor
```

It must print `doctor: OK` and confirm all of:

- `test-results/verify/.run/instance` exists and its `VERIFY_CWD` is this repo.
- Recorded `VERIFY_PID` is alive.
- That pid (or a descendant) owns `VERIFY_PORT`.
- `GET $VERIFY_URL/` includes `<h1>Next.js Boilerplate</h1>`, `html lang="ja"`, and `<title>Home</title>`.

If doctor fails, do not drive. Cleanup, fix the cause, launch again, doctor again.

Before driving, also require `agent-browser --version` (this repo's agents use Homebrew `agent-browser`; if it is broken, `agent-browser doctor --fix`, then `agent-browser install` if the browser is missing).

## Drive

Read `features/README.md`, then the feature file for the behavior you are proving. A proof that hits one convenient URL is incomplete when the map lists another entry point.

Session (required — the unnamed session is shared with every other agent and the human):

```bash
# shellcheck disable=SC1091
source test-results/verify/.run/instance
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix verify-nextjs-boilerplate)"
export AGENT_BROWSER_SCREENSHOT_DIR="$PWD/test-results/verify/evidence"
```

Do not embed credentials in the URL. This app has no local auth. If a future change returns 401, stop: `agent-browser set credentials <user> <pass>` then `open` again, reading secrets from `.env.development.local` — never from `.env.local`.

Recipe:

1. `agent-browser --session "$AGENT_BROWSER_SESSION" open "$VERIFY_URL/"` (or the feature's path).
2. Wait for the expected heading with `wait --text "..."`, not a fixed sleep. `wait --load networkidle` can succeed on `chrome-error://` after `ERR_CONNECTION_REFUSED` — that is not ready.
3. Identify controls with `snapshot -i` or `find role ...`. Prefer roles and accessible names from this repo:
   - Home heading: `find role heading text --name "Next.js Boilerplate"` (level 1).
   - 404 heading: `find role heading text --name "404 - Not Found"` (level 1).
   - 404 body: text `The page you requested could not be found.`
   - Layout wraps pages in `<main>`.
4. Re-snapshot after any navigation. Refs (`@eN`) are stale after the page changes.
5. Headless by default. Do not pass `--headed` unless you must look; then close that browser when done.

Do not click coordinates. Do not call internal setters or hit `/_next/` asset URLs as a stand-in for a page. Do not use Playwright here unless the task is this repo's `tests/e2e` suite.

## Evidence

Proof directory (survives cleanup): `test-results/verify/evidence/`

Capture after the user-visible action, for both the action and the resulting state:

```bash
.cursor/skills/verify-nextjs-boilerplate/scripts/capture <stem>
```

`<stem>` is the feature id plus the state (`home`, `not-found`). The helper writes:

- `test-results/verify/evidence/<stem>.aria.txt` — full accessibility snapshot
- `test-results/verify/evidence/<stem>.png` — screenshot with the heading visible
- `test-results/verify/evidence/<stem>.meta.txt` — URL, title, session, page errors

Standards:

- Exercise the real user path (`GET` the route in the browser), not `render(<Home />)` and not a test-only endpoint.
- Home proof: heading `Next.js Boilerplate` is visible and `get title` is `Home` (the layout title template is not applied to the served document).
- 404 proof: an unmatched path shows `404 - Not Found` and the not-found paragraph. Record the exact path you opened.
- Also run `agent-browser --session "$AGENT_BROWSER_SESSION" errors` — a correct-looking page with a React error is a fail.
- There is no mutation side effect (no files, rows, or messages). The second view is a reload or a fresh `open` of the same URL that still shows the same heading.
- Record the feature id and entry point in the capture stem / notes.
- If an entry point cannot be reached, report `verified-unreachable` with the command and the unmet precondition. Do not mark it verified via a different path.

`test-results/` is gitignored. Leave proof there; do not commit it; do not delete it during cleanup.

## Cleanup

```bash
.cursor/skills/verify-nextjs-boilerplate/scripts/cleanup
```

Kills only the pid tree recorded in `test-results/verify/.run/instance`, closes only the `verify-nextjs-boilerplate` agent-browser session, and deletes `test-results/verify/.run/`. It does not delete `test-results/verify/evidence/`.

Never `pkill next`, `killall node`, or `agent-browser close --all`. Never stop a server you did not start.

## Helpers

All under `.cursor/skills/verify-nextjs-boilerplate/scripts/`:

| Script    | Invocation                                         | Role                                                     |
| --------- | -------------------------------------------------- | -------------------------------------------------------- |
| `launch`  | `scripts/launch` (background; holds until cleanup) | Start isolated `bun dev`, write instance file            |
| `doctor`  | `scripts/doctor`                                   | Read-only "is this instance ours and healthy?"           |
| `capture` | `scripts/capture <stem>`                           | Snapshot + screenshot + meta for the current page        |
| `cleanup` | `scripts/cleanup`                                  | Stop our pid tree and our browser session; keep evidence |

`scripts/common.sh` is sourced by the others — do not run it directly.

## Feature map

Maintained source: [features/README.md](features/README.md).
