import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { handleContentMessage, showOverlay } from "../src/content-script.js";

describe("content script message handling", () => {
  it("responds to ping so the background worker can detect active injection", () => {
    const response = handleContentMessage({ type: "LREACHOUT_PING" }, {});

    assert.deepEqual(response, { ok: true });
  });

  it("inserts generated messages without sending them", () => {
    const editor = {
      tagName: "TEXTAREA",
      value: "",
      dispatchEvent() {},
    };
    const response = handleContentMessage(
      { type: "LREACHOUT_INSERT_MESSAGE", message: "Hi Taylor" },
      {
        document: {
          activeElement: editor,
          defaultView: {
            InputEvent: class InputEvent {
              constructor(type) {
                this.type = type;
              }
            },
          },
        },
      },
    );

    assert.deepEqual(response, { ok: true, inserted: true });
    assert.equal(editor.value, "Hi Taylor");
  });

  it("copies generated messages via the async Clipboard API when available", async () => {
    const writes = [];
    const document = {
      body: { append() {}, removeChild() {} },
      activeElement: null,
      defaultView: {
        focus() {},
        navigator: {
          clipboard: {
            async writeText(value) {
              writes.push(value);
            },
          },
        },
      },
    };

    const response = await handleContentMessage(
      { type: "LREACHOUT_COPY_MESSAGE", message: "Hi Taylor" },
      { document },
    );

    assert.deepEqual(response, { ok: true, copied: true });
    assert.deepEqual(writes, ["Hi Taylor"]);
  });

  it("falls back to execCommand copy when the Clipboard API is unavailable", async () => {
    const selected = [];
    const body = {
      append(element) {
        this.element = element;
      },
      removeChild(element) {
        assert.equal(element, this.element);
      },
    };
    const document = {
      body,
      activeElement: null,
      defaultView: { focus() {} },
      createElement(tagName) {
        assert.equal(tagName, "textarea");
        return {
          value: "",
          style: {},
          focus() {},
          select() {
            selected.push(this.value);
          },
        };
      },
      execCommand(command) {
        assert.equal(command, "copy");
        return true;
      },
    };

    const response = await handleContentMessage(
      { type: "LREACHOUT_COPY_MESSAGE", message: "Hi Taylor" },
      { document },
    );

    assert.deepEqual(response, { ok: true, copied: true });
    assert.deepEqual(selected, ["Hi Taylor"]);
  });

  it("shows neutral status without treating it as an error", () => {
    let appended;
    const document = {
      body: {
        append(element) {
          appended = element;
        },
      },
      createElement() {
        return {
          style: {},
          remove() {},
        };
      },
      getElementById() {
        return null;
      },
    };

    showOverlay({ status: "Drafting LinkedIn message..." }, document);

    assert.equal(appended.textContent, "Drafting LinkedIn message...");
  });
});
