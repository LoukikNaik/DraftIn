import { spawn as nodeSpawn } from "node:child_process";

export function writeToSystemClipboard(text, options = {}) {
  const platform = options.platform ?? process.platform;
  const spawn = options.spawn ?? nodeSpawn;
  const { command, args } = resolveClipboardCommand(platform);

  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, { stdio: ["pipe", "ignore", "pipe"] });
    } catch (error) {
      resolve({ copied: false, error: error.message, command });
      return;
    }

    let stderr = "";
    let settled = false;

    const settle = (outcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    child.on?.("error", (error) => settle({ copied: false, error: error.message, command }));
    child.stderr?.on?.("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on?.("close", (code) => {
      if (code === 0) {
        settle({ copied: true, command });
      } else {
        settle({
          copied: false,
          error: stderr.trim() || `${command} exited with code ${code}`,
          command,
        });
      }
    });

    try {
      child.stdin?.end?.(text);
    } catch (error) {
      settle({ copied: false, error: error.message, command });
    }
  });
}

function resolveClipboardCommand(platform) {
  if (platform === "darwin") {
    return { command: "pbcopy", args: [] };
  }

  if (platform === "win32") {
    return { command: "clip", args: [] };
  }

  return { command: "xclip", args: ["-selection", "clipboard"] };
}
