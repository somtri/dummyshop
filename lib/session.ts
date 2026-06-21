import { type NextRequest } from "next/server";

/** Read benchmark session id from HTTP-only cookie. Never exposed in URLs. */
export function getSessionId(request: NextRequest | Request): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)bsid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "default";
}
