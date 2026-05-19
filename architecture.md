# lreachout Architecture

This project helps draft a LinkedIn reach-out message.

The simple idea:

1. You open a LinkedIn page.
2. You click the extension or press `Alt+L`.
3. The extension reads the visible page text.
4. The extension takes a screenshot.
5. The extension sends the page text and screenshot data to a local server running on your Mac.
6. The local server reads your background from `profile/me.md`.
7. The local server asks Oracle to generate a message using hidden browser mode and GPT-5.5 by default.
8. Oracle talks to ChatGPT through your logged-in browser setup.
9. The server sends the draft back to the extension.
10. The extension copies the message to your clipboard.
11. If your cursor is already inside a LinkedIn message box, the extension also tries to paste the draft there.

It does not send the LinkedIn message for you.

## Why There Is A Local Server

Chrome extensions cannot safely run Mac commands like `oracle`.

So the browser extension only does browser work:

- Read the LinkedIn page.
- Take the screenshot.
- Call `http://127.0.0.1:17391/generate`.
- Copy the answer.

The local server does Mac-side work:

- Read `profile/me.md`.
- Build the prompt.
- Build a prompt from the page text and your profile.
- Run the `oracle` command with hidden browser mode and GPT-5.5 by default.
- Return the answer.

This keeps the extension simple and avoids putting AI API keys inside the browser.

## Main Files

- `extension/manifest.json`: tells Chrome what the extension is allowed to do.
- `extension/src/background.js`: runs when you click the extension or press `Alt+L`.
- `extension/src/content-runtime.js`: runs inside LinkedIn pages and reads page text.
- `extension/src/server-client.js`: sends the request to the local server.
- `extension/src/clipboard-output.js`: copies the generated message.
- `server/src/index.js`: starts the local server.
- `server/src/app.js`: handles `/health` and `/generate`.
- `server/src/prompt-builder.js`: creates the prompt for Oracle.
- `server/src/oracle-runner.js`: runs the `oracle` command.
- `profile/me.md`: your personal background used for message generation.
- `docs/tdd-plan.md`: the test-first build plan.

## What Happens When You Press `Alt+L`

1. Chrome calls `extension/src/background.js`.
2. The background script asks the LinkedIn tab for page context.
3. `content-runtime.js` extracts useful text like name, headline, company, and hiring signals.
4. The background script captures a screenshot of the visible tab.
5. It builds a request with page text, screenshot, URL, title, and the default intent.
6. It sends the request to the local server.
7. The server loads your profile from `profile/me.md`.
8. The server builds a prompt with your background and the LinkedIn page context.
9. The server runs Oracle using hidden browser mode and GPT-5.5 Instant by default.
10. The server does not attach screenshots to Oracle by default because browser uploads can timeout.
11. If `LREACHOUT_ATTACH_SCREENSHOT=true` is set, the server also writes the screenshot to a temporary file and attaches it to Oracle.
12. Oracle returns a draft.
13. The server sends the draft back.
14. The extension copies the draft to the clipboard.
15. The extension shows a small status box on the page.

## Manual Testing From The Codex Terminal

These steps test as much as possible from this terminal.

### 1. Run The Automated Tests

```bash
npm test
```

Expected result:

- All tests pass.
- You should see `28` passing tests or more.

### 2. Check The Server Starts

Run:

```bash
npm run start:server
```

Expected result:

```text
lreachout server listening on http://127.0.0.1:17391
```

Leave this command running while testing the extension.

If you need the terminal back, stop it with `Ctrl+C`.

### 3. Test The Health Endpoint

Open a second terminal in this project and run:

```bash
curl http://127.0.0.1:17391/health
```

Expected result:

```json
{"ok":true}
```

### 4. Check Oracle Is Installed

Run:

```bash
which oracle
```

Expected result:

- It prints a path to the `oracle` command.

If it prints nothing, Oracle is not installed or not on your `PATH`.

### 5. Test Oracle Directly

Run:

```bash
oracle --help
```

Expected result:

- Oracle prints help text.

If Oracle says you are not logged in, complete Oracle setup first.

### 6. Test The `/generate` Endpoint With A Fake Screenshot

Keep the server running, then run this from another terminal:

```bash
curl -s http://127.0.0.1:17391/generate \
  -H 'content-type: application/json' \
  -d '{
    "url": "https://www.linkedin.com/in/example/",
    "title": "Example Recruiter | LinkedIn",
    "intent": "Draft a concise LinkedIn reach-out message about hiring opportunities.",
    "screenshotDataUrl": "data:image/png;base64,iVBORw0KGgo=",
    "pageContext": {
      "profileName": "Example Recruiter",
      "headline": "Technical Recruiter at Acme AI",
      "company": "Acme AI",
      "visibleText": "We are hiring backend engineers for AI platform teams.",
      "roleSignals": ["recruiter", "hiring"]
    }
  }'
```

Expected result:

- If Oracle is working, you should get JSON with a `message`.
- If Oracle is not logged in or not configured, you should get a clear error.

Example success shape:

```json
{"message":"Hi ...","source":"oracle"}
```

Example failure shape:

```json
{"error":{"code":"ORACLE_GENERATION_FAILED","message":"..."}}
```

### 7. Load The Chrome Extension

This part cannot be fully done from the terminal because Chrome requires manual extension loading.

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on Developer Mode.
4. Click "Load unpacked".
5. Select this folder:

```text
/Users/loukiknaik/projects/lreachout/extension
```

Expected result:

- Chrome shows the `lreachout` extension.

### 8. Test On LinkedIn

1. Keep the local server running.
2. Open a LinkedIn profile, recruiter page, job page, or hiring post.
3. Click inside a LinkedIn message box if you want the draft inserted there.
4. Click the extension icon or press `Alt+L`.

Expected result:

- A small status box appears.
- A draft is copied to your clipboard.
- If a message box was focused, the draft may also appear there.
- The message is not sent automatically.

### 9. Test Clipboard Output

After using the extension, run this in the terminal:

```bash
pbpaste
```

Expected result:

- It prints the generated LinkedIn message.

### 10. Stop The Server

Go back to the terminal running the server and press:

```text
Ctrl+C
```

## Current Limits

- The extension is Chrome-only.
- The server must be running before the extension can generate messages.
- Oracle must be installed and logged in.
- LinkedIn text-box insertion is best-effort. Clipboard copy is the reliable path.
- The extension does not send messages automatically.
