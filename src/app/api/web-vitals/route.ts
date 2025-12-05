import { NextResponse } from "next/server";

// Note: Edge runtime removed for cacheComponents compatibility
// Route handlers run on Node.js runtime by default
export async function POST(request: Request) {
  try {
    const metric = await request.json();

    if (!metric || typeof metric.name !== "string") {
      return NextResponse.json({ error: "Invalid metric payload" }, { status: 400 });
    }

    // Forward to logging/observability; replace with real sink when available
    console.info("[web-vitals]", metric);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
