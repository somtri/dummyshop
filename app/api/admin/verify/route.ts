import { requireAdminToken } from "@/lib/auth";
import { verifyByTaskId } from "@/lib/tasks";
import { verifySchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const payload = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const sessionId: string = typeof payload?.sessionId === "string" ? payload.sessionId : "default";

  try {
    const verified = await verifyByTaskId(parsed.data.taskId, parsed.data.expect, sessionId);
    if ("error" in verified) {
      return NextResponse.json({ error: "unknown_task" }, { status: 400 });
    }
    return NextResponse.json(verified.result);
  } catch (error) {
    if (error instanceof Error && error.message === "storage_unavailable") {
      return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
