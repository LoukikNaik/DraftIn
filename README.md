# lreachout

Chrome extension concept for drafting personalized LinkedIn reach-out messages without storing custom LLM API keys in the browser.

## Goal

`lreachout` should help draft short, relevant LinkedIn messages when viewing a LinkedIn profile, job post, recruiter page, hiring manager page, or company page. The user invokes the extension from the Chrome toolbar or a keyboard shortcut, and the extension gathers page context, sends it to a local service, asks Oracle to generate a draft through ChatGPT, then makes the result easy to paste into LinkedIn.

## Initial Scope

- Chrome extension only.
- Trigger from the extension toolbar button.
- Trigger from a keyboard shortcut such as `Option+L` / `Alt+L`.
- Capture the current visible tab as a screenshot.
- Extract useful LinkedIn page context from the DOM.
- Send screenshot, extracted page context, and personal background context to a local HTTP server.
- Use a local Markdown file for personal context at first.
- Invoke Peter Steinberger's Oracle from the local server instead of calling an LLM API directly.
- Return the generated message to the extension.
- Copy the generated message to the clipboard.

## Non-Goals For The First Version

- No hosted backend.
- No browser-stored OpenAI, Anthropic, or other LLM API tokens.
- No Safari extension.
- No automatic LinkedIn sending.
- No scraping outside the active tab the user explicitly invokes the extension on.
- No persistence of generated messages unless added later.

## Architecture

### Chrome Extension

The extension is responsible for browser-side interaction:

- `manifest.json` defines a Manifest V3 extension.
- A background service worker handles toolbar and keyboard shortcut invocations.
- The service worker captures the visible tab screenshot with `chrome.tabs.captureVisibleTab`.
- A content script extracts LinkedIn context from the page.
- The extension sends a request to the local HTTP server.
- The extension receives the generated message and copies it to the clipboard.
- A small overlay can show status, errors, and the final draft.

The extension should prefer structured page extraction over screenshot-only prompting. Screenshots are useful supporting context, but DOM text is more stable and easier for the model to use.

### Local HTTP Server

The local server is responsible for everything that should not live in the browser:

- Runs on `localhost`, for example `http://127.0.0.1:17391`.
- Accepts a POST request from the extension.
- Reads the user's personal background from a Markdown file.
- Writes temporary screenshot and context files if Oracle needs file inputs.
- Builds a prompt for the outreach use case.
- Invokes Oracle locally.
- Returns the generated message as JSON.

This keeps secrets and local automation out of the extension. It also lets the server evolve independently from the Chrome extension.

### Oracle

Oracle is used as the model access layer:

- Upstream repository: <https://github.com/steipete/oracle>
- Site: <https://askoracle.sh/>
- **Fork required for lreachout**: <https://github.com/LoukikNaik/oracle>. The default `getOracleArgs()` in `server/src/config.js` passes `--browser-min-stable-ms` and other flags that only exist on this fork (see branches `fix/browser-attachment-composer-scope` for the chip-scope + min-stable-ms fixes used by the multi-screenshot flow).
- Clone the fork at `/Users/loukiknaik/projects/oracle` (the path `localOracleCli` in `server/src/config.js` resolves to). Build it with `pnpm install && pnpm run build` so `dist/bin/oracle-cli.js` exists.
- It can drive ChatGPT through a browser session instead of using direct LLM API calls.
- The user must be logged into ChatGPT in the Oracle/browser environment.
- The generated response depends on the user's available ChatGPT plan and Oracle configuration.

## Personal Context

For the first version, personal context should live in a Markdown file, for example:

```text
profile/me.md
```

It should include:

- Current role and company.
- What roles the user is targeting.
- Past companies and projects.
- Technical strengths.
- Hiring preferences or constraints.
- Tone preferences for messages.
- Examples of good and bad outreach messages.

The extension should not edit this file in the first version. Later, this can move into an options page or syncable profile store.

## Request Shape

The extension can send a request like:

```json
{
  "url": "https://www.linkedin.com/in/example/",
  "title": "Example Person | LinkedIn",
  "pageContext": {
    "visibleText": "...",
    "profileName": "...",
    "headline": "...",
    "company": "...",
    "roleSignals": ["recruiter", "hiring", "engineering manager"]
  },
  "screenshotDataUrl": "data:image/png;base64,...",
  "intent": "Draft a concise LinkedIn reach-out message about hiring opportunities."
}
```

The local server can return:

```json
{
  "message": "Hi ...",
  "source": "oracle",
  "copied": false
}
```

## Prompt Requirements

The generated message should:

- Be concise.
- Sound human and specific.
- Avoid generic flattery.
- Mention concrete context from the LinkedIn page when useful.
- Adapt tone based on whether the person appears to be a recruiter, hiring manager, founder, or engineer.
- Avoid claiming facts not present in the provided context.
- Avoid overloading the recipient with the user's full background.
- End with a lightweight call to action.

## Privacy And Safety

- The extension should only run when explicitly invoked.
- The local server should listen on localhost only.
- The extension should not send data to a hosted service in the initial version.
- The server should avoid logging full screenshots or personal background by default.
- The extension should not automatically send LinkedIn messages.
- The user remains responsible for reviewing and editing the generated message.

## Development Plan

1. Create a minimal Manifest V3 extension.
2. Add toolbar and keyboard command triggers.
3. Add LinkedIn context extraction.
4. Add screenshot capture.
5. Add local HTTP POST to the companion server.
6. Add clipboard copy and a small status overlay.
7. Add a local server that reads `profile/me.md`.
8. Add Oracle invocation and prompt construction.
9. Add error handling for Oracle login/session failures.
10. Add documentation for loading the unpacked extension and running the server.

## Current MVP

The repository now contains a working local-first MVP skeleton:

- `extension/` contains the Chrome Manifest V3 extension.
- `server/` contains the localhost HTTP server and Oracle CLI runner.
- `profile/me.md` contains the personal outreach context ("about me") generated from Loukik's resume.
- `prompts/` contains the playbooks that define the message itself; `prompts/hiring.md` is the default. See `prompts/README.md` to write your own (sales, fundraising, podcast invites, etc.).
- `docs/tdd-plan.md` describes the test-first implementation plan.

The extension flow is:

1. Invoke the extension from the Chrome toolbar or `Alt+L`.
2. Extract visible LinkedIn context from the active tab.
3. Capture a screenshot of the visible tab.
4. POST the context and screenshot to `http://127.0.0.1:17391/generate`.
5. The server reads `profile/me.md` (who you are) and the active playbook from `prompts/` (what kind of message), builds a text prompt, and invokes `oracle`.
6. The extension copies the generated message to the clipboard.

## Setup

### Make it yours (with AI)

lreachout reads two files: `profile/me.md` (who you are) and a playbook in `prompts/` (what kind of message). You don't have to write either by hand — two paste-in prompts generate them from what you already have:

- **Profile** — paste [`prompts/extract-your-profile.md`](prompts/extract-your-profile.md) into ChatGPT or Claude with your resume/LinkedIn; save the result as `profile/me.md`.
- **Playbook** — paste [`prompts/extract-your-playbook.md`](prompts/extract-your-playbook.md) into the assistant you've drafted outreach with; it reverse-engineers your voice from past messages and emits a playbook. Save it under `prompts/` and point `LREACHOUT_PLAYBOOK_PATH` at it (defaults to `prompts/hiring.md`).

Both outputs are meant to be refined by hand afterward.

### Install and run

Install Oracle separately and make sure the `oracle` command is available on your `PATH`:

```bash
which oracle
```

Make sure Oracle is configured/logged in for ChatGPT browser usage before relying on the extension.

Run the local server:

```bash
npm run start:server
```

By default, the server invokes the patched local Oracle CLI with hidden browser mode and GPT-5.5 Instant:

```text
--engine browser --browser-hide-window --model gpt-5.5-instant --force
```

Optional environment variables:

```bash
LREACHOUT_PORT=17391
LREACHOUT_HOST=127.0.0.1
LREACHOUT_PROFILE_PATH=profile/me.md
LREACHOUT_PLAYBOOK_PATH=prompts/hiring.md
LREACHOUT_ORACLE_ARGS="--engine browser --browser-model-strategy current"
LREACHOUT_ATTACH_SCREENSHOT=true
```

Load the Chrome extension:

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click "Load unpacked".
4. Select the `extension/` directory in this repo.
5. Open LinkedIn and invoke the extension.

## Development

Run all tests:

```bash
npm test
```

Run only server tests:

```bash
npm run test:server
```

Run only extension tests:

```bash
npm run test:extension
```

This project intentionally uses Node's built-in test runner for the first MVP so it has no package dependencies yet.

Note: the extension always captures a screenshot, but the server does not attach screenshots to Oracle by default. Browser-mode file uploads can timeout, and the LinkedIn page text is enough for the normal MVP flow.

To attach screenshots anyway, start the server with:

```bash
LREACHOUT_ATTACH_SCREENSHOT=true npm run start:server
```

When enabled, server logs should show `1 attachments`, and the Oracle command should include an extra screenshot file.

## Open Decisions

- Whether the local server should be Node.js, Python, or another runtime.
- Whether screenshots should be sent to Oracle every time or only when DOM extraction is insufficient.
- Whether to use Chrome Native Messaging later for tighter browser-to-local communication.

(Resolved: the message definition lives in swappable playbooks under `prompts/`, separate from `profile/me.md`. `LREACHOUT_PLAYBOOK_PATH` selects one.)
