# Not found

Not found is what a visitor sees when they open a path that has no page: the root layout stays, and the main area shows a 404 heading plus a short explanation. Nothing is created or stored.

## Sub-features

- `notfound-heading` shows the level-1 heading `404 - Not Found`.
- `notfound-body` shows `The page you requested could not be found.`
- `notfound-layout` keeps the home layout chrome (`main`, `lang=ja`) around the 404 content.
- `notfound-other-path` treats any unmatched path the same way, not only one sentinel URL.

## How to get to it (user POV)

- Type or open a URL under the site that has no matching route (there are no in-app links to 404).
- The map's required sentinel is `/__verify__/missing`. Also prove one other unmatched path, `/also-missing`.

## Driving it with agent-browser

Preconditions:

- Next.js Boilerplate is healthy at `$VERIFY_URL`.
- `scripts/doctor` printed `doctor: OK` on `/` before leaving home.
- No app route exists at `/__verify__/missing` or `/also-missing`.
- `AGENT_BROWSER_SESSION` is the `verify-nextjs-boilerplate` worktree session.

- **Open sentinel.** Go to the reserved missing path. Run `agent-browser --session "$AGENT_BROWSER_SESSION" open "$VERIFY_URL/__verify__/missing"` and `agent-browser --session "$AGENT_BROWSER_SESSION" wait --text "404 - Not Found"`. The URL path is `/__verify__/missing`.
- **Read heading and body.** Confirm the 404 copy. Run `agent-browser --session "$AGENT_BROWSER_SESSION" find role heading text --name "404 - Not Found"`. The paragraph `The page you requested could not be found.` is visible.
- **Read layout.** Confirm the 404 is still inside the app shell. Run `agent-browser --session "$AGENT_BROWSER_SESSION" eval "document.documentElement.lang"` (value `ja`) and confirm a `main` landmark wraps the heading.
- **Second unmatched path.** Open another missing route. Run `agent-browser --session "$AGENT_BROWSER_SESSION" open "$VERIFY_URL/also-missing"` and wait for `404 - Not Found`. The same heading and paragraph appear.
- **Proof.** Capture the sentinel 404. Run `agent-browser --session "$AGENT_BROWSER_SESSION" open "$VERIFY_URL/__verify__/missing"`, wait for the heading, then `.cursor/skills/verify-nextjs-boilerplate/scripts/capture not-found`. Artifacts show `404 - Not Found` and path `/__verify__/missing`.
- **Home still works.** Return to `/` after the 404. Run `agent-browser --session "$AGENT_BROWSER_SESSION" open "$VERIFY_URL/"` and wait for `Next.js Boilerplate`. A 404 must not replace the real home page.

## Gotchas

- Do not use `/_next/*`, `/favicon.ico`, or other framework asset paths as the missing route. Those are not the user 404 page.
- Next.js may set a framework tab title such as `404: This page could not be found.` Assert the visible heading and paragraph; treat the tab title as extra metadata in `not-found.meta.txt`, not as the heading.
- `/` compiling or rewriting an unknown path to home is a product bug — do not record that as a passed 404.
- If someone later adds `src/app/__verify__/missing/page.tsx` (or `also-missing`), this recipe is stale; pick a new unmatched path and update this file.
