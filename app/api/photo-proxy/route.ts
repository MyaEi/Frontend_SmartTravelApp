import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const photoUrl = req.nextUrl.searchParams.get("url");
  if (!photoUrl) return new NextResponse("Missing URL", { status: 400 });

  try {
    const res = await fetch(photoUrl);
    const blob = await res.arrayBuffer();

    return new NextResponse(blob, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // cache 1 day
      },
    });
  } catch (err) {
    return new NextResponse("Failed to fetch photo", { status: 500 });
  }
}