# TDD Plan

This plan defines the test-first implementation path for `lreachout`: a Chrome extension that extracts LinkedIn context, captures a screenshot, sends both to a local HTTP server, invokes Oracle, and returns a draft reach-out message for clipboard use.

## Principles

- Build one vertical slice at a time: one failing test, minimal implementation, then refactor.
- Test public behavior through stable interfaces, not Chrome or LinkedIn internals.
- Keep browser-specific code thin and wrap Chrome APIs behind adapters that can be tested with fakes.
- Keep Oracle invocation behind a server-side interface so tests can use a fake runner.
- Prefer structured DOM extraction over screenshot-only assertions.
- Never auto-send LinkedIn messages. Tests should preserve this safety boundary.

## Proposed Test Shape

Use a JavaScript/TypeScript test runner for both extension logic and local server logic. Vitest is a good default because it works well for browser-adjacent modules and Node server code, but the first implementation should confirm the package/runtime choice before adding tooling.

Recommended split:

- `extension/src/`: browser-facing modules and Chrome API adapters.
- `extension/test/`: tests for context extraction, payload construction, command handling, clipboard flow, and overlay state.
- `server/src/`: local HTTP server, prompt builder, personal context loader, Oracle runner.
- `server/test/`: tests for request validation, prompt construction, file handling, Oracle failures, and response shaping.
- `profile/me.md`: local personal context fixture for manual use, with test fixtures stored separately.

## Slice 1: Server Health And Request Contract

Behavior: the local server exposes a health endpoint and rejects malformed generation requests with useful errors.

RED:

- Add a server test that starts the app in-process.
- Assert `GET /health` returns `{ "ok": true }`.
- Assert `POST /generate` without required fields returns HTTP 400 with a stable error code.

GREEN:

- Implement the smallest HTTP app with `/health` and request validation for `/generate`.

Verification:

```bash
npm test -- server/test/http-contract.test.*
```

## Slice 2: Personal Context Loading

Behavior: the server reads personal background from a Markdown file and includes it in generation inputs.

RED:

- Add a test with a temp `me.md` file.
- Assert the loader trims content and returns it.
- Assert a missing file produces a controlled error, not a crash.

GREEN:

- Implement a context loader with a configurable file path.

Verification:

```bash
npm test -- server/test/personal-context.test.*
```

## Slice 3: Prompt Builder

Behavior: the server builds a concise Oracle prompt from personal context, LinkedIn page context, URL, title, and intent.

RED:

- Add a test that passes recruiter/hiring-manager/company signals.
- Assert the prompt includes user background, concrete page facts, message constraints, and safety rules.
- Assert the prompt instructs Oracle not to invent facts and to output only the draft message.

GREEN:

- Implement a pure `buildPrompt()` function.

Verification:

```bash
npm test -- server/test/prompt-builder.test.*
```

## Slice 4: Oracle Runner Boundary

Behavior: the server invokes Oracle through a replaceable runner and maps its output to `{ message, source }`.

RED:

- Add a test using a fake Oracle runner that returns a draft.
- Assert `/generate` returns the draft and `source: "oracle"`.
- Add a failure test where the runner times out or exits non-zero.
- Assert the server returns a controlled 502-style error.

GREEN:

- Implement an `OracleRunner` interface and a fakeable generation service.
- Do not shell out directly from request handlers.

Verification:

```bash
npm test -- server/test/generation-service.test.*
```

## Slice 5: Screenshot File Handling

Behavior: screenshot data URLs are validated and written to temporary files only when needed for Oracle input.

RED:

- Add a test with a small PNG data URL fixture.
- Assert the server writes a temp image file and passes its path to the Oracle runner.
- Assert invalid data URLs are rejected.
- Assert temp files are cleaned up after success and failure.

GREEN:

- Implement screenshot validation, temp-file creation, and cleanup.

Verification:

```bash
npm test -- server/test/screenshot-files.test.*
```

## Slice 6: LinkedIn DOM Extraction

Behavior: the extension extracts useful visible LinkedIn context from the active page without scraping outside the current tab.

RED:

- Add DOM fixture tests for profile, job post, and company/recruiter-like pages.
- Assert extraction returns visible text, page title, likely name/headline/company fields when present, and role signals such as `recruiter`, `hiring`, or `engineering manager`.
- Assert hidden text and script/style content are excluded.

GREEN:

- Implement a pure extractor that accepts `document` and returns structured context.

Verification:

```bash
npm test -- extension/test/linkedin-extractor.test.*
```

## Slice 7: Extension Request Payload

Behavior: invocation builds the exact request shape expected by the server.

RED:

- Add a test with fake tab data, fake screenshot data URL, and extracted page context.
- Assert payload includes `url`, `title`, `pageContext`, `screenshotDataUrl`, and default intent.
- Assert missing active tab or screenshot failure produces a user-visible error state.

GREEN:

- Implement a command handler that depends on fakeable `tabs`, `scripting`, and `runtime` adapters.

Verification:

```bash
npm test -- extension/test/invocation-payload.test.*
```

## Slice 8: Local Server Client

Behavior: the extension posts to the local server and handles success, validation errors, and unavailable server errors.

RED:

- Add tests with a fake `fetch`.
- Assert successful responses return the generated message.
- Assert non-200 responses produce a useful error.
- Assert network failure points the user to start the local server.

GREEN:

- Implement a small `generateMessage()` client.

Verification:

```bash
npm test -- extension/test/server-client.test.*
```

## Slice 9: Clipboard-First Output

Behavior: generated messages are copied to the clipboard and shown to the user.

RED:

- Add a test with a fake clipboard API.
- Assert the generated message is written to clipboard.
- Assert failures display the draft with manual copy instructions.

GREEN:

- Implement clipboard copy and overlay status rendering.

Verification:

```bash
npm test -- extension/test/clipboard-output.test.*
```

## Slice 10: Best-Effort LinkedIn Insertion

Behavior: if a LinkedIn text box is focused, the extension can insert the draft without sending it.

RED:

- Add DOM tests for `textarea`, `contenteditable`, and no-focused-editor cases.
- Assert insertion updates the field and dispatches input events.
- Assert no submit/send button is clicked.

GREEN:

- Implement insertion as a content-script helper.
- Keep clipboard copy as the reliable fallback.

Verification:

```bash
npm test -- extension/test/linkedin-insertion.test.*
```

## Slice 11: Manifest And Permissions

Behavior: the extension declares only the permissions it needs for the first version.

RED:

- Add a manifest test that loads `manifest.json`.
- Assert Manifest V3.
- Assert action command exists.
- Assert LinkedIn host permissions are scoped to LinkedIn.
- Assert no broad remote host permissions except localhost server access.

GREEN:

- Add `manifest.json`, service worker entry, content script registration, and command binding.

Verification:

```bash
npm test -- extension/test/manifest.test.*
```

## Slice 12: End-To-End Local Flow

Behavior: a fake LinkedIn page plus fake Oracle runner produces a message copied by the extension path.

RED:

- Add an integration test that wires extractor, payload builder, fake server client, and clipboard.
- Assert one invocation produces a draft using page context and user context.

GREEN:

- Connect the previously tested modules.
- Keep Chrome API integration minimal.

Verification:

```bash
npm test -- extension/test/e2e-local-flow.test.*
npm test
```

## Manual Acceptance Checks

After automated tests are green:

- Load the unpacked extension in Chrome.
- Start the local server on `127.0.0.1`.
- Log into ChatGPT/Oracle as required by Oracle.
- Open a LinkedIn page.
- Invoke the extension from the toolbar.
- Invoke the extension from the keyboard shortcut.
- Confirm the generated message lands in clipboard.
- Confirm the extension never sends a LinkedIn message automatically.
- Confirm server errors are understandable when Oracle is not logged in or the server is stopped.

## First Implementation Order

1. Establish package tooling and test runner with one intentionally failing server contract test.
2. Build the server core through slices 1-5.
3. Build extension pure modules through slices 6-9.
4. Add manifest and Chrome adapter wiring through slice 11.
5. Add best-effort LinkedIn insertion only after clipboard flow is stable.
6. Add the fake-runner end-to-end test before wiring the real Oracle subprocess.
7. Add real Oracle invocation last, behind the already-tested runner boundary.

## Definition Of Done

- Every production behavior added in the first version has at least one test that failed before implementation.
- The extension can draft a message without storing custom LLM API tokens.
- Clipboard output works even if LinkedIn insertion fails.
- The local server listens only on localhost.
- Oracle failures return actionable errors.
- Manual testing confirms no automatic sending behavior.
