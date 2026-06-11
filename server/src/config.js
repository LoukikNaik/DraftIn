import { existsSync } from "node:fs";

const localOracleCli = "/Users/loukiknaik/projects/oracle/dist/bin/oracle-cli.js";

export function getOracleCommand(env = process.env, fs = { existsSync }) {
  if (env.DRAFTIN_ORACLE_COMMAND?.trim()) {
    return env.DRAFTIN_ORACLE_COMMAND.trim();
  }

  if (fs.existsSync(localOracleCli)) {
    return process.execPath;
  }

  return "oracle";
}

export function getOracleCommandArgs(env = process.env, fs = { existsSync }) {
  if (env.DRAFTIN_ORACLE_COMMAND?.trim()) {
    return [];
  }

  if (fs.existsSync(localOracleCli)) {
    return [localOracleCli];
  }

  return [];
}

export function getOracleArgs(env = process.env) {
  if (env.DRAFTIN_ORACLE_ARGS?.trim()) {
    return splitArgs(env.DRAFTIN_ORACLE_ARGS);
  }

  return [
    "--engine",
    "browser",
    "--browser-hide-window",
    "--model",
    "gpt-5.5-instant",
    "--force",
    // Multi-screenshot prompts plus web search for unknown companies take a
    // while; give Oracle generous headroom so it doesn't give up before the
    // model finishes generating.
    "--browser-timeout",
    "10m",
    "--browser-recheck-delay",
    "30s",
    "--browser-recheck-timeout",
    "4m",
    // Floor the "answer is stable" threshold so ChatGPT's mid-stream pauses
    // (e.g., during image analysis) don't trip premature capture.
    "--browser-min-stable-ms",
    "15s",
  ];
}

function splitArgs(value) {
  return value.trim().split(/\s+/).filter(Boolean);
}
