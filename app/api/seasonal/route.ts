import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const to = url.searchParams.get("to");
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    if (!to || !start || !end) {
      return NextResponse.json({ error: "Missing parameters." }, { status: 400 });
    }

    // Forward request to FastAPI
    const backendResponse = await fetch(
    `${BACKEND_URL}/seasonal/suggestions?to=${to}&start=${start}&end=${end}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(120000) // ⬅ wait up to 120 sec
    }
  );

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error("Frontend → Backend proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
