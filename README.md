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
- Optionally attempt best-effort insertion into the currently focused LinkedIn message box.

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

- Repository: <https://github.com/steipete/oracle>
- Site: <https://askoracle.sh/>
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

## Open Decisions

- Whether best-effort LinkedIn text-box insertion is worth keeping after clipboard support works.
- Whether the local server should be Node.js, Python, or another runtime.
- Whether screenshots should be sent to Oracle every time or only when DOM extraction is insufficient.
- How much prompt history or examples should live in `profile/me.md` versus separate prompt templates.
- Whether to use Chrome Native Messaging later for tighter browser-to-local communication.
