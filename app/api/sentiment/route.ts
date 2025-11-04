// app/api/sentiment/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("place_id");

  if (!placeId) {
    return NextResponse.json(
      { error: "Missing place_id" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${API_BASE}/sentiment/${encodeURIComponent(placeId)}`
    );

    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json(
        { error: msg || "Failed to fetch sentiment" },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err: any) {
    console.error("Sentiment route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
