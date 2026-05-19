import { loadPersonalContext } from "./personal-context.js";
import { buildPrompt } from "./prompt-builder.js";
import { cleanupAttachments, createScreenshotAttachment } from "./screenshot-files.js";

export function createGenerationService({
  profilePath,
  oracleRunner,
  tempDir,
  attachScreenshot = true,
  logger = console,
}) {
  if (!profilePath) {
    throw new Error("createGenerationService requires profilePath");
  }

  const runner = oracleRunner ?? defaultOracleRunner;

  return async function generate(request) {
    logger.info?.("[lreachout] loading personal context");
    const personalContext = await loadPersonalContext(profilePath);
    const attachments = attachScreenshot
      ? [await createScreenshotAttachment(request.screenshotDataUrl, { tempDir })]
      : [];
    logger.info?.("[lreachout] building Oracle prompt");
    const prompt = buildPrompt({
      personalContext,
      request,
      hasScreenshot: attachments.length > 0,
    });
    logger.info?.(
      `[lreachout] invoking Oracle (${prompt.length} prompt chars, ${attachments.length} attachments)`,
    );

    try {
      const message = await runner.run({
        prompt,
        attachments,
      });
      logger.info?.(`[lreachout] Oracle returned ${message.trim().length} chars`);

      return {
        message: message.trim(),
        source: "oracle",
      };
    } catch (error) {
      logger.error?.(`[lreachout] Oracle failed: ${error.message}`);
      const controlledError = new Error(`Oracle generation failed: ${error.message}`);
      controlledError.code = "ORACLE_GENERATION_FAILED";
      controlledError.cause = error;
      throw controlledError;
    } finally {
      await cleanupAttachments(attachments);
    }
  };
}

const defaultOracleRunner = {
  async run() {
    const error = new Error("Oracle runner is not configured");
    error.code = "ORACLE_RUNNER_NOT_CONFIGURED";
    throw error;
  },
};
