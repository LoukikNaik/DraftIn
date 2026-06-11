import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export function createOracleRunner(options = {}) {
  const command = options.command ?? "oracle";
  const spawnFn = options.spawnFn ?? spawn;
  const tempDir = options.tempDir ?? tmpdir();
  const baseArgs = options.baseArgs ?? [];
  const logger = options.logger ?? console;

  return {
    async run({ prompt, attachments }) {
      const promptPath = path.join(tempDir, `draftin-prompt-${randomUUID()}.md`);
      await writeFile(promptPath, prompt, "utf8");

      try {
        const args = [
          ...baseArgs,
          "--prompt",
          "Use the attached files to draft the LinkedIn message. Return only the final message.",
          "--file",
          promptPath,
        ];

        for (const attachment of attachments ?? []) {
          args.push("--file", attachment);
        }

        logger.info?.(`[draftin] running Oracle command: ${command} ${redactArgs(args).join(" ")}`);
        return await runCommand(spawnFn, command, args);
      } finally {
        await rm(promptPath, { force: true });
      }
    },
  };
}

function redactArgs(args) {
  return args.map((arg, index) => {
    if (args[index - 1] === "--prompt") {
      return '"<prompt>"';
    }

    return arg.includes("draftin-prompt-") ? "<prompt-file>" : arg;
  });
}

function runCommand(spawnFn, command, args) {
  return new Promise((resolve, reject) => {
    const child = spawnFn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.setEncoding?.("utf8");
    child.stderr?.setEncoding?.("utf8");
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      const controlledError = new Error(`Oracle CLI failed to start: ${error.message}`);
      controlledError.code = "ORACLE_CLI_FAILED";
      reject(controlledError);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(extractOracleAnswer(stdout));
        return;
      }

      const controlledError = new Error(
        `Oracle CLI failed with exit code ${code}: ${stderr.trim() || stdout.trim()}`,
      );
      controlledError.code = "ORACLE_CLI_FAILED";
      reject(controlledError);
    });
  });
}

export function extractOracleAnswer(output) {
  const trimmed = output.trim();
  const answerIndex = trimmed.lastIndexOf("Answer:");
  const body = answerIndex === -1
    ? trimmed
    : trimmed.slice(answerIndex + "Answer:".length).trim();

  const lines = body.split("\n");
  const footerIndex = lines.findIndex((line) => isOracleFooterLine(line.trim()));
  const messageLines = footerIndex === -1 ? lines : lines.slice(0, footerIndex);

  return messageLines.join("\n").trim();
}

function isOracleFooterLine(line) {
  // Oracle's footer line looks like:
  //   "14.2s · gpt-5.5[browser] · ↑1.7k ↓91 ↻0 Δ1.79k"
  //   "1m18s · gpt-5.5-instant[browser] · ↑2.25k ↓90 ↻0 Δ2.33k files=2"
  //   "1h2m45s · ..."
  // Match a duration like 14.2s, 1m18s, 1h2m, 250ms followed by " · " and a model tag.
  return /^(?:\d+h)?(?:\d+m)?\d+(?:\.\d+)?(?:ms|s)\s+·\s+\S+\[[^\]]+\]/.test(line);
}
