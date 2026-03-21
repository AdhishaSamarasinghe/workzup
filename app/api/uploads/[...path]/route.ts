import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function isSafePath(parts: string[]) {
  return parts.length > 0 && parts.every((part) => part && part !== "." && part !== ".." && !part.includes("\\"));
}

async function tryReadFile(candidatePath: string) {
  try {
    return await readFile(candidatePath);
  } catch {
    return null;
  }
}

async function fileExists(candidatePath: string) {
  const fileBuffer = await tryReadFile(candidatePath);
  return !!fileBuffer;
}

async function findFileByBasename(
  roots: string[],
  targetFileName: string,
  maxDepth = 3
) {
  const lowerName = targetFileName.toLowerCase();

  const search = async (currentDir: string, depth: number): Promise<string | null> => {
    if (depth > maxDepth) return null;

    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isFile() && entry.name.toLowerCase() === lowerName) {
          return fullPath;
        }
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const found = await search(path.join(currentDir, entry.name), depth + 1);
        if (found) return found;
      }

      return null;
    } catch {
      return null;
    }
  };

  for (const root of roots) {
    const found = await search(root, 0);
    if (found) return found;
  }

  return null;
}

type LegacyCandidate = {
  fullPath: string;
  timestamp: number;
  modifiedAt: number;
};

function parseLegacyName(fileName: string) {
  const parsed = /^([A-Za-z]+)-(\d+)-.+\.[^.]+$/.exec(fileName);
  if (!parsed) return null;

  const prefix = parsed[1];
  if (!["cv", "idFront", "idBack", "idDocument", "application"].includes(prefix)) {
    return null;
  }

  return {
    prefix,
    timestamp: Number(parsed[2]) || 0,
    ext: path.extname(fileName).toLowerCase(),
  };
}

async function findBestLegacyFallback(
  roots: string[],
  targetFileName: string,
  maxDepth = 3
) {
  const legacy = parseLegacyName(targetFileName);
  if (!legacy) return null;

  const matches: LegacyCandidate[] = [];

  const search = async (currentDir: string, depth: number): Promise<void> => {
    if (depth > maxDepth) return;

    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isFile()) {
          const samePrefix = entry.name.startsWith(`${legacy.prefix}-`);
          const sameExt = path.extname(entry.name).toLowerCase() === legacy.ext;
          if (!samePrefix || !sameExt) continue;

          const parsed = parseLegacyName(entry.name);
          if (!parsed) continue;

          try {
            const details = await stat(fullPath);
            matches.push({
              fullPath,
              timestamp: parsed.timestamp,
              modifiedAt: details.mtimeMs,
            });
          } catch {
            // Skip unreadable candidate
          }
        }
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        await search(path.join(currentDir, entry.name), depth + 1);
      }
      return;
    } catch {
      return;
    }
  };

  for (const root of roots) {
    await search(root, 0);
  }

  if (!matches.length) return null;

  matches.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return b.modifiedAt - a.modifiedAt;
  });

  return matches[0].fullPath;
}

async function resolveStoredFilePath(relativePath: string, fileName: string) {
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const backendUploadsRoot = path.join(process.cwd(), "backend", "uploads");
  const candidates = [
    path.join(uploadsRoot, relativePath),
    path.join(backendUploadsRoot, relativePath),
  ];

  for (const candidate of candidates) {
    const fileBuffer = await tryReadFile(candidate);
    if (fileBuffer) {
      return candidate;
    }
  }

  const exact = await findFileByBasename([uploadsRoot, backendUploadsRoot], fileName);
  if (exact) return exact;

  // Recovery path for stale DB references: use latest matching legacy file by prefix/ext.
  return await findBestLegacyFallback([uploadsRoot, backendUploadsRoot], fileName);
}

function getNotFoundResponse() {
  return new NextResponse("File not found.", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;

    if (!Array.isArray(pathParts) || !isSafePath(pathParts)) {
      return NextResponse.json({ message: "Invalid file request." }, { status: 400 });
    }

    const fileName = pathParts[pathParts.length - 1];
    const relativePath = path.join(...pathParts);
    const resolvedPath = await resolveStoredFilePath(relativePath, fileName);
    const fileBuffer = resolvedPath ? await tryReadFile(resolvedPath) : null;

    if (!fileBuffer) {
      return getNotFoundResponse();
    }

    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(fileName)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("File fetch error:", error);
    return getNotFoundResponse();
  }
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;

    if (!Array.isArray(pathParts) || !isSafePath(pathParts)) {
      return NextResponse.json({ message: "Invalid file request." }, { status: 400 });
    }

    const fileName = pathParts[pathParts.length - 1];
    const relativePath = path.join(...pathParts);
    const resolvedPath = await resolveStoredFilePath(relativePath, fileName);

    if (!resolvedPath || !(await fileExists(resolvedPath))) {
      return getNotFoundResponse();
    }

    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(fileName)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("File head error:", error);
    return getNotFoundResponse();
  }
}
