import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

// 🔒 KEEP YOUR PRIVATE KEY ON SERVER ONLY
const imagekit = new ImageKit({
  publicKey: "public_jFbumknz0tblFrRQfqlnU8zWP4c=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: "https://ik.imagekit.io/u4mqkfnrq",
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;

  if (!file || !file.name) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `avatar-${Date.now()}-${file.name}`;

  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder: "/avatars",
  });

  return NextResponse.json({ url: result.url });
}

//https://ik.imagekit.io/u4mqkfnrq