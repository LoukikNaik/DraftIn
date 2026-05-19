import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getOracleArgs,
  getOracleCommand,
  getOracleCommandArgs,
} from "../src/config.js";

describe("server config", () => {
  it("defaults Oracle to hidden browser mode with GPT-5.5 Instant", () => {
    assert.deepEqual(getOracleArgs({}), [
      "--engine",
      "browser",
      "--browser-hide-window",
      "--model",
      "gpt-5.5-instant",
      "--force",
    ]);
  });

  it("allows explicit Oracle args to override the default", () => {
    assert.deepEqual(getOracleArgs({ LREACHOUT_ORACLE_ARGS: "--engine browser --browser-model-strategy current" }), [
      "--engine",
      "browser",
      "--browser-model-strategy",
      "current",
    ]);
  });

  it("uses Node to run the patched local Oracle CLI by default when present", () => {
    const env = {};
    const fs = {
      existsSync(path) {
        return path === "/Users/loukiknaik/projects/oracle/dist/bin/oracle-cli.js";
      },
    };

    assert.equal(getOracleCommand(env, fs), process.execPath);
    assert.deepEqual(
      getOracleCommandArgs(
        {},
        fs,
      ),
      ["/Users/loukiknaik/projects/oracle/dist/bin/oracle-cli.js"],
    );
  });

  it("allows explicit Oracle command override", () => {
    assert.equal(getOracleCommand({ LREACHOUT_ORACLE_COMMAND: "oracle" }), "oracle");
    assert.deepEqual(getOracleCommandArgs({ LREACHOUT_ORACLE_COMMAND: "oracle" }), []);
  });

});
