import { NextResponse } from "next/server";

export function requireAdminToken(request: Request) {
  const token = request.headers.get("x-admin-token");
  if (!process.env.ADMIN_RESET_TOKEN || token !== process.env.ADMIN_RESET_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
