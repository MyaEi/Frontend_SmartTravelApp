import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/chat/languages`, {
      method: "GET"
    });

    if (!res.ok) {
      return new NextResponse("Failed to load supported languages", { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    return new NextResponse("Server error loading languages", { status: 500 });
  }
}
