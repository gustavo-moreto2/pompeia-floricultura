import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const result = await createLead({
    name: String(body?.name ?? ""),
    contact: String(body?.contact ?? ""),
    message: String(body?.message ?? ""),
    source: String(body?.source ?? "api"),
    metadata:
      body?.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
