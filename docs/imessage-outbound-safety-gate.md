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

## Admin readiness controls

The admin messaging bridge panel exposes the dedicated outbound gate and must be used for controlled rollout.

The Arm action is disabled unless all of these are true:

1. Global messaging is not paused.
2. The selected bridge worker is online.
3. The selected worker reports `replay_history = false`.
4. There are zero pending or claimed iMessage queue rows.
5. At least one provider has current dedicated Knotty iMessage consent and a stored iMessage phone number.

Arming requires an explicit confirmation. Disarm remains immediately available and does not require a healthy bridge.

Profile-completion `action = queue` is intentionally stricter than preview:

1. `queue` requires exactly one explicit `profileId`.
2. `queue` is rejected while `imessage_outbound_enabled = false`.
3. `queue` is rejected while `global_pause = true`.
4. Bulk preview remains available for eligibility review.

This prevents a bulk or stale queue from being prepared while the dedicated gate is off and then flushing when the gate is armed later.

## Rollout behavior

Applying the migration does not activate outbound iMessage. The new gate starts disabled.

Before the first smoke test:

1. Keep `imessage_outbound_enabled = false` while the Mac bridge is being installed.
2. Confirm the intended worker is reporting healthy heartbeats and `replay_history = false`.
3. Confirm the approved provider has dedicated Knotty iMessage consent.
4. Preview exactly one provider using `profileId`.
5. Confirm the iMessage queue is empty.
6. Set `global_pause = false` only when the controlled smoke test is ready.
7. Arm outbound iMessage from the admin bridge panel.
8. Queue exactly the approved provider using `profileId`.
9. Disarm the dedicated gate immediately if bridge health degrades, replay is enabled, unexpected queue rows appear, or the smoke test behaves unexpectedly.

After a successful one-provider smoke test, disarm the dedicated gate again unless the next controlled cohort is ready to start immediately.

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

The worker ID supplied by the bridge must match a recent heartbeat row, preventing an unregistered or stale worker ID from claiming outbound iMessages.

The admin arm endpoint adds a stricter operational layer before the database claim gate: it requires an online worker, replay disabled, no open iMessage queue, valid dedicated consent, and an unpaused global messaging state. The database claim gate remains the final enforcement boundary.
