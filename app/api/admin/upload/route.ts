import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

/**
 * Where an uploaded file goes depends on where the site is running.
 *
 * On a server with a writable disk — your machine, or Docker with the uploads
 * volume — the file is written into `public/uploads` and served from there.
 *
 * On Vercel the filesystem is read-only, so that write throws and the upload
 * appears to fail. There, files go to Vercel Blob instead, which hands back a
 * public URL. The database only ever stores a URL, so nothing downstream cares
 * which of the two produced it.
 *
 * Blob is used whenever its token is present, which Vercel injects
 * automatically once a Blob store is connected to the project.
 */

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

const UPLOAD_KINDS = {
  "model-image": { dir: "models", types: IMAGE_TYPES, maxSize: 5 * 1024 * 1024 },
  "site-image": { dir: "site", types: IMAGE_TYPES, maxSize: 5 * 1024 * 1024 },
  "site-video": { dir: "site", types: VIDEO_TYPES, maxSize: 30 * 1024 * 1024 },
} as const;

type UploadKind = keyof typeof UPLOAD_KINDS;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const kindRaw = formData.get("kind");
  const kind: UploadKind =
    typeof kindRaw === "string" && kindRaw in UPLOAD_KINDS ? (kindRaw as UploadKind) : "model-image";
  const config = UPLOAD_KINDS[kind];

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!config.types.includes(file.type as never)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > config.maxSize) {
    return NextResponse.json(
      { error: `File is too large (max ${Math.round(config.maxSize / (1024 * 1024))}MB)` },
      { status: 400 }
    );
  }

  const extension = file.type.split("/")[1];
  const filename = `${uuidv4()}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`${config.dir}/${filename}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch (error) {
      console.error("Blob upload failed:", error);
      return NextResponse.json(
        { error: "Could not store the file. Check the Blob store is connected." },
        { status: 500 }
      );
    }
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", config.dir);
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${config.dir}/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("Disk upload failed:", error);
    // The message names the cause, because this is exactly what happens on a
    // read-only host with no Blob store connected.
    return NextResponse.json(
      {
        error:
          "Uploads need a Blob store on this host. Connect one in Vercel → Storage → Blob, then redeploy.",
      },
      { status: 500 }
    );
  }
}
