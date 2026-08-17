# Knotty iMessage Outbound Safety Gate

## Purpose

Outbound iMessage is fail closed independently from the shared messaging global pause.

The migration `20260816043000_imessage_outbound_safety_gate.sql` adds `messaging_settings.imessage_outbound_enabled`, defaulting to `false`.

The iMessage claim RPC returns no work unless every condition below is true:

1. `messaging_settings.global_pause = false`.
2. `messaging_settings.imessage_outbound_enabled = true`.
3. The requesting worker has a row in `messaging_imessage_bridge_workers`.
4. That exact worker reported a heartbeat within the previous two minutes.
5. That worker reports `replay_history = false`.
6. The queue row explicitly requires `transport_preference = 'imessage'`.
7. Existing contact opt out, campaign state, sending window, attempts, and scheduling gates also pass.

## Rollout behavior

Applying the migration does not activate outbound iMessage. The new gate starts disabled.

Before the first smoke test:

1. Keep `imessage_outbound_enabled = false` while the Mac bridge is being installed.
2. Confirm the intended worker is reporting healthy heartbeats and `replay_history = false`.
3. Confirm the approved provider has dedicated Knotty iMessage consent.
4. Preview exactly one provider using `profileId`.
5. Arm outbound iMessage only immediately before the controlled smoke test.
6. Disarm it again if bridge health degrades, replay is enabled, or the smoke test behaves unexpectedly.

## Emergency stop

The iMessage specific stop is:

```sql
update public.messaging_settings
set imessage_outbound_enabled = false,
    updated_at = now()
where id = 'default';
```

The broader emergency stop remains `global_pause = true` plus stopping the dedicated Mac bridge.

## Security properties

The gate is enforced in PostgreSQL inside `messaging_claim_next_imessage_queue()`. A client UI bug, admin route mistake, or pending queue item cannot bypass the disabled gate because the worker receives no claimable row.

The generic `messaging_claim_next_queue()` function explicitly excludes `transport_preference = 'imessage'`, so shared messaging workers cannot bypass the dedicated iMessage gate.

The worker ID supplied by the bridge must match a recent heartbeat row, preventing an unregistered or stale worker ID from claiming outbound iMessages.
