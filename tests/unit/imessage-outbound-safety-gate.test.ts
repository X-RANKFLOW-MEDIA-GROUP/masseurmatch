import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260816043000_imessage_outbound_safety_gate.sql",
);
const migration = fs.readFileSync(migrationPath, "utf8").toLowerCase();

describe("iMessage outbound database safety gate", () => {
  it("is fail closed by default", () => {
    expect(migration).toContain(
      "add column if not exists imessage_outbound_enabled boolean not null default false",
    );
    expect(migration).toContain("and s.imessage_outbound_enabled");
  });

  it("keeps the shared global pause and iMessage-only transport checks", () => {
    expect(migration).toContain("q.transport_preference = 'imessage'");
    expect(migration).toContain("and not s.global_pause");
  });

  it("only allows the requesting worker with a recent safe heartbeat", () => {
    expect(migration).toContain(
      "join public.messaging_imessage_bridge_workers w on w.worker_id = v_worker_id",
    );
    expect(migration).toContain("w.last_seen_at >= now() - interval '2 minutes'");
    expect(migration).toContain("and not w.replay_history");
  });

  it("keeps the claim RPC restricted to service role", () => {
    expect(migration).toContain(
      "revoke all on function public.messaging_claim_next_imessage_queue(text) from public",
    );
    expect(migration).toContain(
      "revoke all on function public.messaging_claim_next_imessage_queue(text) from anon",
    );
    expect(migration).toContain(
      "revoke all on function public.messaging_claim_next_imessage_queue(text) from authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.messaging_claim_next_imessage_queue(text) to service_role",
    );
  });
});
