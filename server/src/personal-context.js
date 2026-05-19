import { readFile } from "node:fs/promises";

export async function loadPersonalContext(profilePath) {
  try {
    const content = await readFile(profilePath, "utf8");
    return content.trim();
  } catch (error) {
    if (error.code === "ENOENT") {
      const controlledError = new Error(`Personal context file not found: ${profilePath}`);
      controlledError.code = "PERSONAL_CONTEXT_NOT_FOUND";
      throw controlledError;
    }

    throw error;
  }
}
