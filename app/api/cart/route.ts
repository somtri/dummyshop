import { getCartWithItems } from "@/lib/backend";
import { getSessionId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sessionId = getSessionId(request);
  const { items, totalCents } = await getCartWithItems(sessionId);
  return NextResponse.json({ items, totalCents });
}
