// app/api/budget/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Correct endpoint with hyphen
    const backendEndpoint = `${BACKEND_URL}/budget/optimize-trip`;
    
    console.log("Proxying budget request to backend:", {
      url: backendEndpoint,
      payload: body,
    });

    const response = await fetch(backendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log("Backend response status:", response.status);
    console.log("Backend response body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }

    if (!response.ok) {
      console.error("Backend error:", data);
      return NextResponse.json(
        { error: data.detail || data.error || "Failed to optimize trip" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
