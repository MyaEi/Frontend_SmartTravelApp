import { NextResponse } from "next/server";
// process.env.EXTERNAL_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE = process.env.EXTERNAL_API_BASE_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const required = ["destination", "days", "budget", "kid_friendly", "travel_type", "activity_theme"] as const;
      for (const k of required) {
        if (!(k in payload)) {
          return NextResponse.json(
            { error: `Missing field: ${k}` },
            { status: 400 }
          );
        }
      }

    // forward to your separate server
    const r = await fetch(`${API_BASE}/itinerary/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // include credentials if your backend needs cookies:
      // credentials: "include",
      body: JSON.stringify(payload),
      // don't cache itinerary results
      cache: "no-store",
    });

    if (!r.ok) {
      const text = await r.text();
      return new NextResponse(text || "Upstream error", { status: r.status });
    }

    const data = await r.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proxy failed" },
      { status: 500 }
    );
  }
}
