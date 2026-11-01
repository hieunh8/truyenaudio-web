import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getChapter, getStory } from "@/lib/catalog";
import { getWorkspaceRoot, getR2Config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; index: string }> };

function notFound() {
  return NextResponse.json({ error: "Không tìm thấy audio" }, { status: 404 });
}

/** Parse a single Range header; returns null for invalid/unsatisfiable. */
function parseRange(header: string, size: number): { start: number; end: number } | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let start: number;
  let end: number;
  if (m[1] === "") {
    const n = Number(m[2]);
    if (n === 0) return null;
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return null;
  return { start, end };
}

async function handle(req: Request, ctx: Ctx, head: boolean) {
  const { slug, index } = await ctx.params;
  if (!/^[0-9]+$/.test(index)) return notFound();
  const story = getStory(slug);
  const chapter = story ? getChapter(slug, Number(index)) : null;
  if (!story || !chapter) return notFound();

  const r2 = getR2Config();
  if (r2) {
    const client = new S3Client({
      region: "auto",
      endpoint: r2.endpoint,
      credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
    });
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: r2.bucket, Key: chapter.audio_key, ResponseContentType: "audio/mpeg" }),
      { expiresIn: 3600 },
    );
    const res = NextResponse.redirect(url, 302);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  // Local mode: stream from output/<story_id>/audio with Range support
  const audioRoot = process.env.AUDIO_ROOT || path.join(getWorkspaceRoot(), "output");
  if (!/^[0-9A-Za-z_]+$/.test(story.story_id)) return notFound();
  if (path.basename(chapter.audio_file) !== chapter.audio_file || !/^[\w.-]+\.mp3$/.test(chapter.audio_file)) {
    return notFound();
  }
  const audioDir = path.resolve(audioRoot, story.story_id, "audio");
  const filePath = path.resolve(audioDir, chapter.audio_file);
  if (!filePath.startsWith(audioDir + path.sep)) return notFound();

  let size: number;
  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) return notFound();
    size = st.size;
  } catch {
    return notFound();
  }

  const base = {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  const rangeHeader = req.headers.get("range");
  if (rangeHeader) {
    const range = parseRange(rangeHeader, size);
    if (!range) {
      return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${size}` } });
    }
    const headers = {
      ...base,
      "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      "Content-Length": String(range.end - range.start + 1),
    };
    if (head) return new Response(null, { status: 206, headers });
    const stream = Readable.toWeb(fs.createReadStream(filePath, { start: range.start, end: range.end })) as ReadableStream;
    return new Response(stream, { status: 206, headers });
  }

  const headers = { ...base, "Content-Length": String(size) };
  if (head) return new Response(null, { status: 200, headers });
  const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
  return new Response(stream, { status: 200, headers });
}

export async function GET(req: Request, ctx: Ctx) {
  return handle(req, ctx, false);
}

export async function HEAD(req: Request, ctx: Ctx) {
  return handle(req, ctx, true);
}
