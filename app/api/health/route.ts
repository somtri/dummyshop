import { canReachDatabase, getStorageMode } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const mode = getStorageMode();
  let status: "ok" | "degraded" = "ok";
  let storage: "postgres" | "memory" | "unavailable" = mode;
  if (mode === "postgres") {
    const reachable = await canReachDatabase();
    if (!reachable) {
      status = "degraded";
      storage = "unavailable";
    }
  }
  if (mode === "unavailable") {
    status = "degraded";
  }
  return NextResponse.json({
    status,
    service: "dummyshop",
    storage,
    time: new Date().toISOString(),
    version: "0.1.0"
  });
}
