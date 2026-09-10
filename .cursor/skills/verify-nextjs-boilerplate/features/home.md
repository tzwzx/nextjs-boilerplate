# Home

Home is the only intended landing page: a visitor opening the site root sees a single level-1 heading that identifies the app, with a document title of `Home` and the root layout's Japanese language tag.

## Sub-features

- `home-heading` shows the level-1 heading `Next.js Boilerplate`.
- `home-title` sets the document title to `Home`.
- `home-lang` keeps `document.documentElement.lang` as `ja`.
- `home-reload` still shows that heading after a refresh.

## How to get to it (user POV)

- Open `/` in the browser (the site root).
- Follow no in-app link — the page has none. A full reload of `/` is the second view.

## Driving it with agent-browser

Preconditions:

- Next.js Boilerplate is healthy at `$VERIFY_URL` (default `http://127.0.0.1:3100`).
- `scripts/doctor` printed `doctor: OK`.
- `AGENT_BROWSER_SESSION` is the `verify-nextjs-boilerplate` worktree session.

- **Open root.** Go to `/`. Run `agent-browser --session "$AGENT_BROWSER_SESSION" open "$VERIFY_URL/"` and `agent-browser --session "$AGENT_BROWSER_SESSION" wait --load networkidle`. Then `agent-browser --session "$AGENT_BROWSER_SESSION" wait --text "Next.js Boilerplate"`. The URL is `$VERIFY_URL/` (trailing slash optional).
- **Read heading.** Confirm the hero. Run `agent-browser --session "$AGENT_BROWSER_SESSION" find role heading text --name "Next.js Boilerplate"`. The heading is visible and is the only level-1 heading.
- **Read title.** Confirm the tab title. Run `agent-browser --session "$AGENT_BROWSER_SESSION" get title`. The value is `Home`.
- **Read language.** Confirm the document language. Run `agent-browser --session "$AGENT_BROWSER_SESSION" eval "document.documentElement.lang"`. The value is `ja`.
- **Confirm no page errors.** Run `agent-browser --session "$AGENT_BROWSER_SESSION" errors`. There are no React/page errors.
- **Reload.** Refresh the same URL. Run `agent-browser --session "$AGENT_BROWSER_SESSION" reload` and wait for `Next.js Boilerplate` again. The heading and title are unchanged.
- **Proof.** Capture the loaded home page. Run `.cursor/skills/verify-nextjs-boilerplate/scripts/capture home`. `home.aria.txt` and `home.png` show the heading `Next.js Boilerplate`; `home.meta.txt` records title `Home` and the `$VERIFY_URL/` URL.

## Gotchas

- The visible copy is English even though `lang` is `ja`. Assert both; do not treat English UI as a `lang` failure.
- The served document title is `Home`, not `Home | Next.js Boilerplate`. `layout.tsx` defines a title template, but the HTML and the browser tab currently show `Home` only. Assert the visible title.
- A `200` on `GET /` without the heading (compile overlay, error overlay, wrong app on the port) is not proof. Doctor already checks the HTML; the browser must still show the heading.
- `wait --load networkidle` can succeed on `chrome-error://` after `ERR_CONNECTION_REFUSED` (usually because the held `scripts/launch` process exited). Wait for the heading text, then run doctor.
- The page itself has no buttons, links, or forms. `bun dev` injects a Next.js Dev Tools control (and sometimes an empty `alert`) into the accessibility tree — that is this app, not a wrong origin. Extra chrome beyond that means the wrong origin.
- Do not count `tests/unit/example.test.tsx` (`render(<Home />)`) as this feature.
