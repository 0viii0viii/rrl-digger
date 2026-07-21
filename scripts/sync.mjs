// CLI ingestion — thin wrapper around the shared runIngest().
// Run: npm run sync   (loads .env.local; needs SUPABASE_SERVICE_ROLE_KEY)
import { runIngest } from "../lib/ingest.mjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey || serviceKey.startsWith("PASTE_")) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).",
  );
  process.exit(1);
}

runIngest({ supabaseUrl, serviceKey, log: (m) => console.log(m) })
  .then(() => {
    console.log("done.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
