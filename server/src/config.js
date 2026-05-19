import { existsSync } from "node:fs";

const localOracleCli = "/Users/loukiknaik/projects/oracle/dist/bin/oracle-cli.js";

export function getOracleCommand(env = process.env, fs = { existsSync }) {
  if (env.LREACHOUT_ORACLE_COMMAND?.trim()) {
    return env.LREACHOUT_ORACLE_COMMAND.trim();
  }

  if (fs.existsSync(localOracleCli)) {
    return process.execPath;
  }

  return "oracle";
}

export function getOracleCommandArgs(env = process.env, fs = { existsSync }) {
  if (env.LREACHOUT_ORACLE_COMMAND?.trim()) {
    return [];
  }

  if (fs.existsSync(localOracleCli)) {
    return [localOracleCli];
  }

  return [];
}

export function getOracleArgs(env = process.env) {
  if (env.LREACHOUT_ORACLE_ARGS?.trim()) {
    return splitArgs(env.LREACHOUT_ORACLE_ARGS);
  }

  return [
    "--engine",
    "browser",
    "--browser-hide-window",
    "--model",
    "gpt-5.5-instant",
    "--force",
    // Multi-screenshot prompts take longer; give Oracle headroom so it doesn't
    // give up before the model finishes generating.
    "--browser-timeout",
    "5m",
    "--browser-recheck-delay",
    "30s",
    "--browser-recheck-timeout",
    "2m",
  ];
}

function splitArgs(value) {
  return value.trim().split(/\s+/).filter(Boolean);
}
