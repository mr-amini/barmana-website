import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress, createGzip, constants } from "node:zlib";
import { parseArgs } from "node:util";
import { mounts, output } from "./project.mjs";

const { values: options } = parseArgs({
  options: {
    port: { type: "string", default: "4173" },
    host: { type: "string", default: "127.0.0.1" },
    dist: { type: "boolean", default: false },
  },
});

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};
const compressible = new Set([".html", ".css", ".js", ".json", ".svg", ".txt"]);

async function statIfPresent(file) {
  try {
    return await stat(file);
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
  }
}

async function findFile(route) {
  const sources = options.dist ? [{ directory: output, prefix: "" }] : mounts;
  for (const { directory, prefix } of sources) {
    if (prefix && !route.startsWith(`${prefix}/`)) continue;
    const relative = prefix ? route.slice(prefix.length + 1) : route;
    let file = path.resolve(directory, relative);
    if (file !== directory && !file.startsWith(directory + path.sep)) continue;

    let metadata = await statIfPresent(file);
    if (metadata?.isDirectory()) {
      file = path.join(file, "index.html");
      metadata = await statIfPresent(file);
    }
    if (metadata?.isFile()) return { file, metadata };
  }
}

function preferredEncoding(header = "") {
  const qualities = new Map();
  for (const item of header.split(",")) {
    const [encoding, ...parameters] = item.trim().toLowerCase().split(";");
    const quality = parameters.map((value) => value.trim()).find((value) => value.startsWith("q="));
    const score = quality === undefined ? 1 : Number(quality.slice(2));
    if (Number.isFinite(score) && score >= 0 && score <= 1) qualities.set(encoding, score);
  }
  const br = qualities.get("br") ?? qualities.get("*") ?? 0;
  const gzip = qualities.get("gzip") ?? qualities.get("*") ?? 0;
  if (br > 0 && br >= gzip) return "br";
  if (gzip > 0) return "gzip";
}

async function serve(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let route;
  try {
    route = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "");
    if (route.includes("\0") || route.split("/").includes("..")) throw new Error("Invalid path");
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const match = await findFile(route);
  if (!match) {
    response.writeHead(404).end("Not found");
    return;
  }

  const { file, metadata } = match;
  const extension = path.extname(file);
  const canCompress = metadata.size >= 1024 && compressible.has(extension);
  const encoding = canCompress ? preferredEncoding(request.headers["accept-encoding"]) : undefined;
  const etag = `W/"${metadata.size.toString(16)}-${Math.trunc(metadata.mtimeMs).toString(16)}"`;
  const headers = {
    "Content-Type": mime[extension] ?? "application/octet-stream",
    "Cache-Control": options.dist && extension !== ".html" ? "public, max-age=3600" : "no-cache",
    ETag: etag,
  };
  if (canCompress) headers.Vary = "Accept-Encoding";
  if (encoding) headers["Content-Encoding"] = encoding;

  if (request.headers["if-none-match"] === etag) {
    response.writeHead(304, headers).end();
    return;
  }

  if (!encoding) headers["Content-Length"] = metadata.size;
  response.writeHead(200, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = createReadStream(file);
  if (encoding === "br") {
    await pipeline(stream, createBrotliCompress({
      params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
    }), response);
  } else if (encoding === "gzip") {
    await pipeline(stream, createGzip(), response);
  } else {
    await pipeline(stream, response);
  }
}

http.createServer((request, response) => {
  serve(request, response).catch((error) => {
    if (error.code === "ERR_STREAM_PREMATURE_CLOSE") return;
    if (!response.headersSent) response.writeHead(500).end("Server error");
    else response.destroy();
    console.error(error);
  });
}).listen(Number(options.port), options.host, () => {
  console.log(`Local website: http://${options.host}:${options.port}/`);
});
