import { loadPersonalContext } from "./personal-context.js";
import { loadPlaybook } from "./playbook.js";
import { buildPrompt } from "./prompt-builder.js";
import { cleanupAttachments, createScreenshotAttachment } from "./screenshot-files.js";

export function createGenerationService({
  profilePath,
  playbookPath,
  oracleRunner,
  tempDir,
  attachScreenshot = true,
  logger = console,
}) {
  if (!profilePath) {
    throw new Error("createGenerationService requires profilePath");
  }

  if (!playbookPath) {
    throw new Error("createGenerationService requires playbookPath");
  }

  const runner = oracleRunner ?? defaultOracleRunner;

  return async function generate(request) {
    logger.info?.("[lreachout] loading personal context and playbook");
    const [personalContext, playbook] = await Promise.all([
      loadPersonalContext(profilePath),
      loadPlaybook(playbookPath),
    ]);
    const screenshots = Array.isArray(request.screenshots) ? request.screenshots : [];
    const attachments = attachScreenshot
      ? await Promise.all(
          screenshots.map((dataUrl) => createScreenshotAttachment(dataUrl, { tempDir })),
        )
      : [];
    logger.info?.("[lreachout] building Oracle prompt");
    const prompt = buildPrompt({
      personalContext,
      playbook,
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
      const normalized = normalizeBulletMarkers(message.trim());
      logger.info?.(`[lreachout] Oracle returned ${normalized.length} chars`);

      return {
        message: normalized,
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

export function normalizeBulletMarkers(message) {
  return message.replace(/^(\s*)\*(\s+)/gm, "$1-$2");
}

const defaultOracleRunner = {
  async run() {
    const error = new Error("Oracle runner is not configured");
    error.code = "ORACLE_RUNNER_NOT_CONFIGURED";
    throw error;
  },
};
