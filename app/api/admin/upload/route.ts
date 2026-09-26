import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

  const uploadDir = path.join(process.cwd(), "public", "uploads", config.dir);
  await mkdir(uploadDir, { recursive: true });

  const extension = file.type.split("/")[1];
  const filename = `${uuidv4()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${config.dir}/${filename}` }, { status: 201 });
}
