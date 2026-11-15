import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addActivity, getContact } from "@/lib/crm";
import { clean } from "@/lib/validation";

/** POST — add a note to the contact's timeline. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as { text?: unknown };
  const text = clean(body.text, 4000);
  if (!text) return NextResponse.json({ ok: false, error: "empty" }, { status: 422 });
  if (!(await getContact(id))) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  await addActivity(id, "note", { text });
  return NextResponse.json({ ok: true });
}
