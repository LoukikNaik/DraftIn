import http from "node:http";

import { createGenerationService } from "./generation-service.js";
import { writeToSystemClipboard } from "./system-clipboard.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

export function createServer(options = {}) {
  return http.createServer(createHandler(options));
}

export function createHandler(options = {}) {
  const logger = options.logger ?? console;
  const generate =
    options.generate ??
    createGenerationService({
      profilePath: options.profilePath ?? "profile/me.md",
      oracleRunner: options.oracleRunner,
      attachScreenshot: options.attachScreenshot,
      logger,
    });
  const copyToClipboard = options.copyToClipboard ?? writeToSystemClipboard;

  return async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/health") {
        logger.info?.("[lreachout] GET /health");
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "POST" && request.url === "/generate") {
        const startedAt = Date.now();
        logger.info?.("[lreachout] POST /generate received");
        const payload = await readJson(request);
        const validationError = validateGenerateRequest(payload);

        if (validationError) {
          logger.warn?.(`[lreachout] POST /generate rejected: ${validationError}`);
          sendJson(response, 400, {
            error: {
              code: "INVALID_GENERATE_REQUEST",
              message: validationError,
            },
          });
          return;
        }

        const result = await generate(payload);
        const clipboard = await copyToClipboard(result.message);
        if (clipboard.copied) {
          logger.info?.(
            `[lreachout] copied ${result.message.length} chars to system clipboard via ${clipboard.command}`,
          );
        } else {
          logger.warn?.(`[lreachout] system clipboard copy failed: ${clipboard.error}`);
        }
        logger.info?.(
          `[lreachout] POST /generate completed in ${Date.now() - startedAt}ms (${result.message.length} chars)`,
        );
        sendJson(response, 200, { ...result, clipboard });
        return;
      }

      logger.warn?.(`[lreachout] ${request.method} ${request.url} not found`);
      sendJson(response, 404, {
        error: {
          code: "NOT_FOUND",
          message: "Route not found",
        },
      });
    } catch (error) {
      const statusCode = error.code === "ORACLE_GENERATION_FAILED" ? 502 : 500;
      logger.error?.(`[lreachout] ${request.method} ${request.url} failed: ${error.message}`);

      sendJson(response, statusCode, {
        error: {
          code: error.code ?? "INTERNAL_SERVER_ERROR",
          message: error.message,
        },
      });
    }
  };
}

export function validateGenerateRequest(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Request body must be a JSON object";
  }

  const requiredFields = ["url", "title", "screenshots", "intent"];

  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      return `Missing required field: ${field}`;
    }
  }

  if (!Array.isArray(payload.screenshots) || payload.screenshots.length === 0) {
    return "Field screenshots must be a non-empty array";
  }

  return null;
}

async function readJson(request) {
  const body = await readBody(request);

  if (body.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(payload));
}
