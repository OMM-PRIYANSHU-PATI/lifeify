import "server-only";
import { mkdir, writeFile, readFile, stat } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Private storage abstraction (Phase 8). Files live under /uploads which is
// NOT publicly served — access goes through an authed route handler that
// streams the file only to its owner.

const ROOT = path.join(process.cwd(), "uploads");

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

export type StoredFile = { key: string; sizeBytes: number; mimeType: string };

export async function saveUpload(userId: string, file: File): Promise<StoredFile> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("FILE_TOO_LARGE");
  if (file.type && !ALLOWED_MIME.has(file.type)) throw new Error("UNSUPPORTED_FILE_TYPE");

  const ext = path.extname(file.name || "").slice(0, 10) || guessExt(file.type);
  const key = path.join(userId, `${Date.now()}-${randomUUID()}${ext}`);
  const dest = path.join(ROOT, key);

  await mkdir(path.dirname(dest), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  return { key, sizeBytes: buffer.length, mimeType: file.type || "application/octet-stream" };
}

function guessExt(mime: string): string {
  switch (mime) {
    case "image/jpeg": return ".jpg";
    case "image/png": return ".png";
    case "image/webp": return ".webp";
    case "application/pdf": return ".pdf";
    default: return ".bin";
  }
}

export async function readUpload(key: string): Promise<Buffer | null> {
  const safe = path.normalize(key).replace(/^(\.\.[/\\])+/, "");
  const dest = path.join(ROOT, safe);
  if (!dest.startsWith(ROOT)) return null; // path traversal guard
  try {
    await stat(dest);
  } catch {
    return null;
  }
  return readFile(dest);
}
