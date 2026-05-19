import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";

import { writeToSystemClipboard } from "../src/system-clipboard.js";

describe("system clipboard", () => {
  it("pipes text into pbcopy on macOS", async () => {
    const calls = [];
    const fakeSpawn = (command, args) => {
      calls.push({ command, args });
      return makeFakeChild({ exitCode: 0, captureStdin: (chunk) => calls.push({ stdin: chunk }) });
    };

    const result = await writeToSystemClipboard("Hi Taylor", { platform: "darwin", spawn: fakeSpawn });

    assert.deepEqual(result, { copied: true, command: "pbcopy" });
    assert.equal(calls[0].command, "pbcopy");
    assert.deepEqual(calls[0].args, []);
    assert.equal(calls[1].stdin, "Hi Taylor");
  });

  it("uses xclip on linux", async () => {
    let captured;
    const fakeSpawn = (command, args) => {
      captured = { command, args };
      return makeFakeChild({ exitCode: 0 });
    };

    const result = await writeToSystemClipboard("hello", { platform: "linux", spawn: fakeSpawn });

    assert.equal(result.copied, true);
    assert.equal(captured.command, "xclip");
    assert.deepEqual(captured.args, ["-selection", "clipboard"]);
  });

  it("uses clip on windows", async () => {
    let captured;
    const fakeSpawn = (command) => {
      captured = command;
      return makeFakeChild({ exitCode: 0 });
    };

    const result = await writeToSystemClipboard("hello", { platform: "win32", spawn: fakeSpawn });

    assert.equal(result.copied, true);
    assert.equal(captured, "clip");
  });

  it("reports a non-zero exit code as a failure", async () => {
    const fakeSpawn = () => makeFakeChild({ exitCode: 2, stderr: "boom" });

    const result = await writeToSystemClipboard("hello", { platform: "darwin", spawn: fakeSpawn });

    assert.equal(result.copied, false);
    assert.match(result.error, /boom/);
  });

  it("reports a spawn ENOENT error as a failure", async () => {
    const fakeSpawn = () => {
      const child = makeFakeChild({});
      queueMicrotask(() => child.emit("error", new Error("spawn pbcopy ENOENT")));
      return child;
    };

    const result = await writeToSystemClipboard("hello", { platform: "darwin", spawn: fakeSpawn });

    assert.equal(result.copied, false);
    assert.match(result.error, /ENOENT/);
  });
});

function makeFakeChild({ exitCode, stderr, captureStdin }) {
  const child = new EventEmitter();
  child.stdin = {
    end(chunk) {
      captureStdin?.(chunk);
      if (typeof exitCode === "number") {
        queueMicrotask(() => {
          if (stderr) {
            child.stderr.emit("data", stderr);
          }
          child.emit("close", exitCode);
        });
      }
    },
  };
  child.stderr = new EventEmitter();
  return child;
}
