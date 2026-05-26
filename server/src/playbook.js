import { readFile } from "node:fs/promises";

export async function loadPlaybook(playbookPath) {
  try {
    const content = await readFile(playbookPath, "utf8");
    return content.trim();
  } catch (error) {
    if (error.code === "ENOENT") {
      const controlledError = new Error(`Playbook file not found: ${playbookPath}`);
      controlledError.code = "PLAYBOOK_NOT_FOUND";
      throw controlledError;
    }

    throw error;
  }
}
