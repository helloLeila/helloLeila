import fs from "node:fs/promises";
import { normalizeSourceName } from "../src/events/sourceConfig.js";

export const SOURCE_CONFIG_MAX_BODY_BYTES = 1024 * 1024;
const LOCAL_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export async function readSourceConfig(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || !Array.isArray(value.sources)) {
    throw new Error("source config requires a sources array");
  }
  return value;
}

function normalizeId(value) {
  const id = String(value ?? "").trim();
  if (!id) throw new Error("source id is required");
  return id;
}

function ensureIncomingSources(incoming) {
  if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.sources)) {
    throw new Error("source config requires a sources array");
  }
  return incoming.sources;
}

export function mergeSourceNames(current, incoming) {
  if (!current || typeof current !== "object" || !Array.isArray(current.sources)) {
    throw new Error("current source config requires a sources array");
  }
  const requested = ensureIncomingSources(incoming);
  const currentSources = current.sources.map((source, index) => {
    if (!source || typeof source !== "object") throw new Error(`source ${index + 1} is invalid`);
    return { ...source, id: normalizeId(source.id), name: normalizeSourceName(source.name) };
  });
  const currentIds = new Set(currentSources.map((source) => source.id));
  if (currentIds.size !== currentSources.length) throw new Error("duplicate source id");

  const requestedById = new Map();
  for (const [index, raw] of requested.entries()) {
    if (!raw || typeof raw !== "object") throw new Error(`source ${index + 1} is invalid`);
    const id = normalizeId(raw.id);
    if (requestedById.has(id)) throw new Error("duplicate source id");
    requestedById.set(id, { id, name: normalizeSourceName(raw.name), custom: raw.custom === true });
  }

  for (const source of currentSources) {
    if (!requestedById.has(source.id)) throw new Error("original source cannot be deleted");
  }

  for (const request of requestedById.values()) {
    if (!currentIds.has(request.id) && !request.custom) {
      throw new Error("new source must be marked custom");
    }
  }

  const names = new Set();
  for (const request of requestedById.values()) {
    const key = request.name.toLocaleLowerCase();
    if (names.has(key)) throw new Error("duplicate source name");
    names.add(key);
  }

  const sources = [];
  for (const source of currentSources) {
    const request = requestedById.get(source.id);
    sources.push({ ...source, name: request.name });
  }
  for (const request of requestedById.values()) {
    if (currentIds.has(request.id)) continue;
    sources.push({
      id: request.id,
      name: request.name,
      custom: true,
      category: "other",
      feedUrl: "",
      enabled: false,
    });
  }

  return { ...current, sources };
}

export async function writeSourceConfig(filePath, payload) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, { encoding: "utf8", mode: 0o644 });
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

export function isLocalRequest(request) {
  return LOCAL_ADDRESSES.has(request?.socket?.remoteAddress || request?.connection?.remoteAddress || "");
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const declaredLength = Number(request.headers?.["content-length"] || 0);
    if (declaredLength > SOURCE_CONFIG_MAX_BODY_BYTES) {
      reject(new Error("request body too large"));
      return;
    }
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    request.on("data", (chunk) => {
      if (settled) return;
      size += Buffer.byteLength(chunk);
      if (size > SOURCE_CONFIG_MAX_BODY_BYTES) fail(new Error("request body too large"));
      else chunks.push(Buffer.from(chunk));
    });
    request.on("error", fail);
    request.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
  });
}

export function createSourceConfigMiddleware({ filePath }) {
  if (!filePath) throw new Error("filePath is required");
  return async function sourceConfigMiddleware(request, response, next) {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    if (requestUrl.pathname !== "/__events/source-config") {
      next();
      return;
    }
    if (!isLocalRequest(request)) {
      sendJson(response, 403, { error: "local requests only" });
      return;
    }
    if (request.method === "GET") {
      try {
        sendJson(response, 200, await readSourceConfig(filePath));
      } catch (error) {
        sendJson(response, 500, { error: "source config unavailable" });
      }
      return;
    }
    if (request.method !== "PUT") {
      response.setHeader("Allow", "GET, PUT");
      sendJson(response, 405, { error: "method not allowed" });
      return;
    }
    try {
      const body = await readRequestBody(request);
      const incoming = JSON.parse(body || "{}");
      const current = await readSourceConfig(filePath);
      const merged = mergeSourceNames(current, incoming);
      await writeSourceConfig(filePath, merged);
      sendJson(response, 200, merged);
    } catch (error) {
      const statusCode = error instanceof SyntaxError || /required|invalid|duplicate|original source|custom|too large/.test(error.message) ? 400 : 500;
      sendJson(response, statusCode, { error: statusCode === 400 ? error.message : "source config could not be saved" });
    }
  };
}
