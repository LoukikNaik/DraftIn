# DraftIn

A keyboard-driven LinkedIn reach-out drafter. The user pulls up a LinkedIn page, scrolls to whatever they want the model to see, hits `Alt+L`, and the generated message is on the system clipboard ready for `⌘V`. For richer context (LinkedIn profile *plus* a JD on a separate site) they hit `Alt+K` on each page to add it to a buffer, then `Alt+L` to send the buffer as one request.

## Workflow

- **`Alt+L`** — Draft a message. If the screenshot buffer is non-empty, send it as-is. Otherwise auto-capture the current viewport and send that single screenshot. On success: clear the buffer + toolbar badge. On failure: leave both intact so retrying doesn't lose captured context.
- **`Alt+K`** — Capture the visible viewport of the active tab and append it to a buffer kept in `chrome.storage.session`. Works on any page (LinkedIn or not — JD pages, company careers pages, anywhere) because `activeTab` grants `captureVisibleTab` on user gesture. The toolbar badge shows the running count.
- **`Alt+C`** — Clear the buffer and the badge.

The buffer survives navigations within a browser session but does not persist to disk. Closing the browser also clears it.

## Architecture

Three pieces, all running locally:

1. **`extension/`** — Chrome MV3 extension. POSTs `{ url, title, intent, screenshots: string[] }` to the local server. It does no DOM parsing — the screenshot(s) are the only context about the recipient. `extension/src/draft.js` is a pure orchestrator with the Alt+K / Alt+L / Alt+C logic; `background.js` is thin chrome.* wiring around it.
2. **`server/`** — Local Node HTTP server on `127.0.0.1:17391`. On `POST /generate` it loads `profile/me.md`, builds a prompt, shells out to the local Oracle CLI (`/Users/loukiknaik/projects/oracle/dist/bin/oracle-cli.js`) with one `--file` per screenshot, pipes the result into `pbcopy`, and returns the message.
3. **Oracle CLI** — External vision-capable LLM runner (not in this repo). Invoked as a subprocess with `--prompt`, the prompt file, and the screenshot as `--file` attachments.

The clipboard write happens server-side via `pbcopy` (`xclip` on Linux, `clip` on Windows), not in the extension. Chrome MV3 clipboard from a service worker requires document focus that the toolbar click steals away — so the server, which always has shell access, is the reliable path.

## Layout

```
profile/me.md            Personal background the prompt is built around.
                         Edit this to change positioning, tone, "Example Angles".
extension/manifest.json  MV3 manifest. Single content script + service worker + offscreen helper. Commands: Alt+L draft, Alt+K add-screenshot, Alt+C clear-screenshots.
extension/src/           Background worker, draft orchestrator, screenshot buffer, content runtime, payload builder, HTTP client, offscreen clipboard fallback.
extension/src/draft.js   Pure orchestrator: handleAddScreenshot, handleClearBuffer, handleDraft. All chrome.* deps injected for testability.
extension/src/screenshot-buffer.js  Thin wrapper over chrome.storage.session with appendScreenshot / getScreenshots / clearScreenshots.
extension/test/          Node --test unit tests, one per src module.
server/src/app.js        HTTP router + request validation.
server/src/prompt-builder.js  The system prompt. This is where tone/structure/antipatterns live.
server/src/generation-service.js  Loads profile, builds prompt, calls Oracle, cleans up the temp screenshot file.
server/src/oracle-runner.js  Spawns the Oracle CLI. `extractOracleAnswer` strips Oracle's footer line.
server/src/system-clipboard.js  Spawns pbcopy/xclip/clip.
server/test/             Node --test unit tests, one per src module.
test-fixtures/generate-request.json  Sample request body for poking the server with curl.
docs/tdd-plan.md         Original TDD checklist used to build this out.
architecture.md          Original architecture notes.
```

## Running

```bash
# Start the server (foreground)
DRAFTIN_PROFILE_PATH=profile/me.md node server/src/index.js

# Load the extension once: chrome://extensions → Developer mode → Load unpacked → extension/
# Reload it (and the LinkedIn tab) whenever extension/src/ changes.

# Trigger:
#   Alt+K  → capture viewport into the buffer (works on any tab)
#   Alt+L  → send buffer (or auto-capture if empty); paste with ⌘V anywhere
#   Alt+C  → clear the buffer
```

## Tests

```bash
node --test server/test/*.test.js extension/test/*.test.js
```

There is no build step. Everything runs as ESM in Node `>=20` and in Chrome MV3. Tests use the built-in `node:test` runner with no extra deps — keep it that way.

## Conventions

- **TDD-first when adding behavior.** Tests live next to the code they cover (`server/test/foo.test.js` covers `server/src/foo.js`). One file per module.
- **No build step, no bundler, no transpiler.** Plain ESM both sides.
- **No new runtime dependencies** without a strong reason. `package.json` is intentionally near-empty.
- **The screenshot is the source of truth** about the recipient. Do not re-introduce DOM parsing in the extension. The user is expected to scroll the page to the section they want the model to read before triggering.
- **Prompt edits happen in `server/src/prompt-builder.js` and `profile/me.md`.** Don't put per-recipient logic in the extension.
- **Oracle's stdout has a trailing telemetry line** (e.g. `1m18s · gpt-5.5-instant[browser] · ↑2k ↓90 ...`). `extractOracleAnswer` strips it. If you change Oracle's output format, update the footer regex in `oracle-runner.js` and add a regression test.

## Configuration

Env vars (all optional):

- `DRAFTIN_PORT` — server port (default `17391`, matches manifest `host_permissions`).
- `DRAFTIN_HOST` — bind address (default `127.0.0.1`).
- `DRAFTIN_PROFILE_PATH` — path to the personal-context markdown file.
- `DRAFTIN_ORACLE_COMMAND` / `DRAFTIN_ORACLE_ARGS` — override how Oracle is invoked.

The screenshot is always attached. There is no opt-out flag, by design — the prompt assumes it.

### Oracle invocation flags

`server/src/config.js` builds the default Oracle args. The defaults run a hidden browser session against `gpt-5.5-instant` with generous timeouts, because each draft analyzes one or more screenshots and may **web-search the recipient's company** (the prompt asks the model to look the company up if it doesn't recognize it):

```
--engine browser --browser-hide-window --model gpt-5.5-instant --force
--browser-timeout 10m --browser-recheck-delay 30s --browser-recheck-timeout 4m
--browser-min-stable-ms 15s
```

- `--browser-timeout 10m` — overall ceiling for a single draft.
- `--browser-recheck-timeout 4m` — how long to keep polling after the answer first appears.
- `--browser-min-stable-ms 15s` — floors the "answer is stable" threshold so ChatGPT's mid-stream pauses (image analysis, search) don't trip premature capture.

Setting `DRAFTIN_ORACLE_ARGS` **replaces this entire list** (it is not merged), so pass the full set when overriding — e.g. to raise the timeout further:

```bash
DRAFTIN_PROFILE_PATH=profile/me.md \
DRAFTIN_ORACLE_ARGS="--engine browser --browser-hide-window --model gpt-5.5-instant --force --browser-timeout 15m --browser-recheck-delay 30s --browser-recheck-timeout 5m --browser-min-stable-ms 15s" \
node server/src/index.js
```

If you change the defaults in `config.js`, update the assertion in `server/test/config.test.js` to match (it deep-equals the full arg array).

## Known footguns

- Reloading the extension at `chrome://extensions` is not enough on its own; reload the LinkedIn tab too so a fresh content runtime is injected.
- If you change `DRAFTIN_PORT`, also update `host_permissions` in `extension/manifest.json` and the URL in `extension/src/server-client.js`.
- If Oracle is not installed at the hardcoded local path, set `DRAFTIN_ORACLE_COMMAND=oracle` and ensure it's on `$PATH`.
- `Alt+K` on a `chrome://` page or the Chrome Web Store will silently fail — those pages don't allow scripting from extensions. Use it on real http(s) pages.
- The screenshot buffer lives in `chrome.storage.session`. Reloading the extension or quitting Chrome clears it; navigation within a session does not.
