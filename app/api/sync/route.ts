import { NextResponse } from "next/server";
import { runIngest } from "@/lib/ingest.mjs";

// Long-running scrape: allow up to 60s (Hobby cap; Pro can go to 300).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || serviceKey.startsWith("PASTE_")) {
    return NextResponse.json(
      { ok: false, error: "Missing/placeholder SUPABASE_URL or SERVICE_ROLE_KEY env" },
      { status: 500 },
    );
  }

  try {
    const result = await runIngest({ supabaseUrl, serviceKey });
    return NextResponse.json({ ok: true, at: new Date().toISOString(), ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

// Vercel Cron invokes the path with GET.
export const GET = handle;
// Allow manual POST triggering too.
export const POST = handle;
