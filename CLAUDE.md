# lreachout

A keyboard-driven LinkedIn reach-out drafter. The user pulls up a LinkedIn page, scrolls to whatever they want the model to see, hits `Alt+L`, and the generated message is on the system clipboard ready for `⌘V`.

## Architecture

Three pieces, all running locally:

1. **`extension/`** — Chrome MV3 extension. On `Alt+L` (or toolbar click) it captures the visible viewport of the active LinkedIn tab and POSTs `{ url, title, intent, screenshotDataUrl }` to the local server. It does no DOM parsing — the screenshot is the only context about the recipient.
2. **`server/`** — Local Node HTTP server on `127.0.0.1:17391`. On `POST /generate` it loads `profile/me.md`, builds a prompt, shells out to the local Oracle CLI (`/Users/loukiknaik/projects/oracle/dist/bin/oracle-cli.js`), pipes the result into `pbcopy`, and returns the message.
3. **Oracle CLI** — External vision-capable LLM runner (not in this repo). Invoked as a subprocess with `--prompt`, the prompt file, and the screenshot as `--file` attachments.

The clipboard write happens server-side via `pbcopy` (`xclip` on Linux, `clip` on Windows), not in the extension. Chrome MV3 clipboard from a service worker requires document focus that the toolbar click steals away — so the server, which always has shell access, is the reliable path.

## Layout

```
profile/me.md            Personal background the prompt is built around.
                         Edit this to change positioning, tone, "Example Angles".
extension/manifest.json  MV3 manifest. Single content script + service worker + offscreen helper.
extension/src/           Background worker, content runtime, payload builder, HTTP client, offscreen clipboard fallback.
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
LREACHOUT_PROFILE_PATH=profile/me.md node server/src/index.js

# Load the extension once: chrome://extensions → Developer mode → Load unpacked → extension/
# Reload it (and the LinkedIn tab) whenever extension/src/ changes.

# Trigger from any linkedin.com page:
#   Alt+L  (or click the toolbar icon)
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

- `LREACHOUT_PORT` — server port (default `17391`, matches manifest `host_permissions`).
- `LREACHOUT_HOST` — bind address (default `127.0.0.1`).
- `LREACHOUT_PROFILE_PATH` — path to the personal-context markdown file.
- `LREACHOUT_ORACLE_COMMAND` / `LREACHOUT_ORACLE_ARGS` — override how Oracle is invoked.

The screenshot is always attached. There is no opt-out flag, by design — the prompt assumes it.

## Known footguns

- Reloading the extension at `chrome://extensions` is not enough on its own; reload the LinkedIn tab too so a fresh content runtime is injected.
- If you change `LREACHOUT_PORT`, also update `host_permissions` in `extension/manifest.json` and the URL in `extension/src/server-client.js`.
- If Oracle is not installed at the hardcoded local path, set `LREACHOUT_ORACLE_COMMAND=oracle` and ensure it's on `$PATH`.
