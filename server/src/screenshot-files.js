import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const supportedImageTypes = new Set(["image/png", "image/jpeg"]);

export async function createScreenshotAttachment(dataUrl, options = {}) {
  const parsed = parseImageDataUrl(dataUrl);
  const extension = parsed.mediaType === "image/jpeg" ? "jpg" : "png";
  const filePath = path.join(options.tempDir ?? tmpdir(), `draftin-${randomUUID()}.${extension}`);

  await writeFile(filePath, parsed.buffer);

  return filePath;
}

export async function cleanupAttachments(paths) {
  await Promise.all(paths.map((filePath) => rm(filePath, { force: true })));
}

function parseImageDataUrl(dataUrl) {
  const match = /^data:([^;,]+);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);

  if (!match) {
    throw invalidScreenshotError();
  }

  const [, mediaType, base64] = match;

  if (!supportedImageTypes.has(mediaType)) {
    throw invalidScreenshotError();
  }

  return {
    mediaType,
    buffer: Buffer.from(base64, "base64"),
  };
}

function invalidScreenshotError() {
  const error = new Error("Screenshot must be a PNG or JPEG data URL");
  error.code = "INVALID_SCREENSHOT_DATA_URL";
  return error;
}
