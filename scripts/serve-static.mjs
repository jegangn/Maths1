#!/usr/bin/env node
// Minimal static file server for the `out/` directory.
// Handles Next.js trailingSlash=true: /foo/ → out/foo/index.html
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../out");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function resolve(urlPath) {
  // Decode URI, strip query string
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  let candidate = path.join(ROOT, decoded);

  // Security: must stay within ROOT
  if (!candidate.startsWith(ROOT)) return null;

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }
  // /foo/ → /foo/index.html
  const withIndex = path.join(candidate, "index.html");
  if (fs.existsSync(withIndex)) return withIndex;
  // /foo → /foo/index.html (no trailing slash)
  const withIndexAlt = candidate + "/index.html";
  if (fs.existsSync(withIndexAlt)) return withIndexAlt;

  // Next.js 16 static export RSC prefetch fallback.
  //
  // The browser requests dot-separated paths like:
  //   /lesson/add-10-review-01/__next.lesson.$d$id.txt
  //   /lesson/add-10-review-01/__next.lesson.$d$id.__PAGE__.txt
  //
  // The static export generates slash-separated paths like:
  //   /lesson/add-10-review-01/__next.lesson/$d$id.txt        (→ file)
  //   /lesson/add-10-review-01/__next.lesson/$d$id/__PAGE__.txt (→ file)
  //   /lesson/add-10-review-01/__next.lesson.txt              (no segment)
  //
  // Strategy: convert dot-notation RSC filename into slash-notation by
  // treating each `.$d$segname` as a subdirectory entry and `.__PAGE__` as
  // a nested __PAGE__.txt.
  const basename = path.basename(candidate);
  const dir = path.dirname(candidate);

  if (basename.includes("__next.") && basename.endsWith(".txt")) {
    // Strip the .txt extension, split on dots, reconstruct as path
    const withoutExt = basename.slice(0, -4); // remove .txt
    const parts = withoutExt.split(".");
    // parts[0] is like "__next", parts[1] is route segment (e.g. "lesson"),
    // subsequent parts are dynamic segment values or __PAGE__
    // Try slash-based path: dir/__next.lesson/$d$id/__PAGE__.txt etc.
    const prefix = parts.slice(0, 2).join("."); // e.g. "__next.lesson"
    const rest = parts.slice(2); // e.g. ["$d$id", "__PAGE__"]

    if (rest.length === 0) {
      // Simple __next.lesson.txt — already tried above, skip
    } else {
      // Build slash path:
      // e.g. rest = ["$d$id"]        → dir/__next.lesson/$d$id.txt
      // e.g. rest = ["$d$id","__PAGE__"] → dir/__next.lesson/$d$id/__PAGE__.txt
      const last = rest[rest.length - 1];
      let slashPath;
      if (last === "__PAGE__") {
        slashPath = path.join(dir, prefix, ...rest.slice(0, -1), "__PAGE__.txt");
      } else {
        slashPath = path.join(dir, prefix, ...rest.slice(0, -1), last + ".txt");
      }
      if (fs.existsSync(slashPath) && fs.statSync(slashPath).isFile()) {
        return slashPath;
      }
    }
  }

  // 404 → out/404.html
  const notFound = path.join(ROOT, "404.html");
  if (fs.existsSync(notFound)) return { file: notFound, status: 404 };
  return null;
}

http
  .createServer((req, res) => {
    const result = resolve(req.url || "/");
    if (!result) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const { file, status } =
      typeof result === "string" ? { file: result, status: 200 } : result;
    const ext = path.extname(file).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    const content = fs.readFileSync(file);
    res.writeHead(status, { "Content-Type": mime });
    res.end(content);
  })
  .listen(PORT, () => {
    console.log(`Static server ready at http://localhost:${PORT}`);
  });
