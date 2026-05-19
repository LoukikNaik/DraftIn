import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { insertIntoFocusedEditor } from "../src/linkedin-insertion.js";

describe("LinkedIn insertion", () => {
  it("inserts into a focused textarea and dispatches input", () => {
    const events = [];
    const textarea = {
      tagName: "TEXTAREA",
      value: "",
      dispatchEvent(event) {
        events.push(event.type);
      },
    };

    const result = insertIntoFocusedEditor(fakeDocument(textarea), "Hi Taylor");

    assert.equal(result.inserted, true);
    assert.equal(textarea.value, "Hi Taylor");
    assert.deepEqual(events, ["input"]);
  });

  it("inserts into a focused contenteditable editor", () => {
    const events = [];
    const editor = {
      tagName: "DIV",
      isContentEditable: true,
      textContent: "",
      dispatchEvent(event) {
        events.push(event.type);
      },
    };

    const result = insertIntoFocusedEditor(fakeDocument(editor), "Hi Taylor");

    assert.equal(result.inserted, true);
    assert.equal(editor.textContent, "Hi Taylor");
    assert.deepEqual(events, ["input"]);
  });

  it("does not click send buttons or insert without a focused editor", () => {
    const result = insertIntoFocusedEditor(fakeDocument({ tagName: "BUTTON" }), "Hi Taylor");

    assert.equal(result.inserted, false);
  });
});

function fakeDocument(activeElement) {
  return {
    activeElement,
    defaultView: {
      InputEvent: class InputEvent {
        constructor(type) {
          this.type = type;
        }
      },
      Event: class Event {
        constructor(type) {
          this.type = type;
        }
      },
    },
  };
}
