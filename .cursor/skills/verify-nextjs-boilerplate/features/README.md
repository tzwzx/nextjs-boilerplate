# Next.js Boilerplate verification map

This directory is the maintained source for verifying the user-facing behavior of Next.js Boilerplate. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch via `.cursor/skills/verify-nextjs-boilerplate/scripts/launch` (default `http://127.0.0.1:3100`). Keep that command running in the background; a one-shot `launch && doctor` shell will reap the server.
- Run `.cursor/skills/verify-nextjs-boilerplate/scripts/doctor` and require `doctor: OK`.
- Export a named agent-browser session: `export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix verify-nextjs-boilerplate)"`.
- Source `test-results/verify/.run/instance` and open `$VERIFY_URL`, never an assumed `:3000`.
- Never drive an instance that was not started by this verification run.
- No seed data, auth, or database. Pages are static App Router routes.

## Driving conventions

- Start every recipe from `$VERIFY_URL/` unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or DOM position.
- Treat every command as literal. Keep quoted names and the 404 path unchanged.
- Run browser actions through `agent-browser --session "$AGENT_BROWSER_SESSION"`.
- After a mutation-less navigation, prove the result with `scripts/capture <stem>`.
- Cleanup may remove `test-results/verify/.run/`. Do not remove proof artifacts.

## Proof and skip reporting

- Capture the navigation and the resulting page, not only a screenshot of the final screen.
- UI proof includes an ARIA snapshot, a screenshot with the heading visible, and `get title`.
- Reload (or `open` the same URL again) as the second view — there is nothing stored server-side.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Out of map until a user path exists

These files render only when the framework triggers them. There is no route, link, or control that opens them today:

- `src/app/error.tsx` — heading `Something went wrong`, button `Try again`
- `src/app/global-error.tsx` — same heading and button, replaces the root layout
- `src/app/loading.tsx` — text `Loading…`

Do not add a throw or delay route to reach them. If a later page can trigger them, add a feature file.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with agent-browser` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home](./home.md) covers the root heading, document title `Home`, and Japanese `lang` on `/`.
- [Not found](./not-found.md) covers unmatched paths rendering the 404 page inside the root layout.
