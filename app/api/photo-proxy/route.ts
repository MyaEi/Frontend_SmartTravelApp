import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const photoUrl = req.nextUrl.searchParams.get("url");
  const placeId = req.nextUrl.searchParams.get("place_id");
  
  if(photoUrl){
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

  if (placeId) {
    try {
      const res = await fetch(`${API_BASE}/places/photos/${placeId}`);
      if (!res.ok) {
        const msg = await res.text();
        return NextResponse.json(
          { error: msg || "Failed to fetch place photos" },
          { status: res.status }
        );
      }

      const json = await res.json();

      // Expected: { place_id: "xxx", photo_urls: ["...", "..."] }
      return NextResponse.json(
        {
          place_id: json.place_id,
          photo_urls: json.photo_urls ?? [],
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("place_id photo fetch error:", err);
      return NextResponse.json(
        { error: "Server error fetching place photos" },
        { status: 500 }
      );
    }
  }
 
  if(!photoUrl){
    return new NextResponse("Missing URL", { status: 400 });
  }
  if(!placeId){
    return new NextResponse("Missing Place Id", { status: 400 });
  }
  
}