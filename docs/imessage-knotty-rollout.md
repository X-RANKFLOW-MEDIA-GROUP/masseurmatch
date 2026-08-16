# Knotty iMessage Rollout Runbook

## Scope

This runbook activates the MasseurMatch provider profile completion assistant over iMessage.

The production rollout must remain controlled. The first live message must target one explicit provider profile using `profileId`. Do not begin with a bulk queue action.

## Preconditions

1. PR containing the iMessage assistant is merged and deployed.
2. Both iMessage migrations are applied successfully.
3. `IMESSAGE_BRIDGE_SECRET` is configured on the web application.
4. A dedicated Mac is signed into the intended MasseurMatch iMessage account.
5. The bridge process has Full Disk Access to `~/Library/Messages/chat.db`.
6. macOS Automation permission allows the bridge process to control Messages.
7. `IMESSAGE_REPLAY_HISTORY=0` remains the default.
8. The MasseurMatch admin messaging global pause remains enabled until the smoke test is ready.

## Required Mac Environment

```bash
export MASSEURMATCH_APP_URL="https://masseurmatch.com"
export IMESSAGE_BRIDGE_SECRET="<same secret configured on the web app>"
export IMESSAGE_WORKER_ID="masseurmatch-mac-01"
export IMESSAGE_POLL_MS="5000"
export IMESSAGE_REPLAY_HISTORY="0"
```

Optional overrides:

```bash
export IMESSAGE_CHAT_DB="$HOME/Library/Messages/chat.db"
export IMESSAGE_STATE_DIR="$HOME/.masseurmatch-imessage-bridge"
```

## Start the Bridge

From the deployed repository checkout on the dedicated Mac:

```bash
node scripts/imessage-bridge.mjs
```

Expected startup output must confirm:

1. Worker ID.
2. MasseurMatch API base URL.
3. Messages database path.
4. On first start, the current inbound row is saved and existing message history is not replayed.

If the bridge reports that the Messages database cannot be read, stop and fix Full Disk Access before continuing.

## Smoke Test Sequence

### 1. Keep global messaging paused

Confirm the production `messaging_settings` row has `global_pause = true` before preparing the target profile.

### 2. Choose one provider

Use one known provider account that:

1. Has an authenticated `user_id`.
2. Has a valid phone number.
3. Has `sms_enabled = true` in `user_notification_preferences`.
4. Is active and not suspended or banned.
5. Has at least one deterministically incomplete profile field.
6. Is approved for the smoke test.

Record the provider UUID as `PROFILE_ID`.

### 3. Preview only that profile

Call the admin endpoint while authenticated as an administrator:

```json
{
  "action": "preview",
  "profileId": "<PROFILE_ID>"
}
```

Expected result:

1. `scanned = 1`.
2. `targetProfileId` matches the requested UUID.
3. `eligible = 1` for an eligible provider.
4. `queued = 0`.
5. The response lists the real missing profile fields.

Do not continue if the response targets more than one profile or if the phone belongs to another account.

### 4. Unpause messaging immediately before the test

Set `global_pause = false` only when the bridge is running and the single profile preview is correct.

### 5. Queue only the smoke test profile

Call:

```json
{
  "action": "queue",
  "profileId": "<PROFILE_ID>"
}
```

Expected result:

1. `scanned = 1`.
2. `eligible = 1`.
3. `queued = 1` on the first valid attempt.
4. The created message has `channel = 'imessage'`.
5. The queue row has `transport_preference = 'imessage'`.

A repeat request must not create a duplicate initial outreach message because the idempotency key is provider specific.

### 6. Confirm outbound delivery

Verify that the dedicated Mac sends the message through Apple Messages and the queue status moves from `pending` to `claimed` to `sent`.

If delivery fails, the bridge must report the failure through the status endpoint and the queue item must not be silently rerouted to SMS.

### 7. Confirm inbound routing

Reply `START` from the smoke test phone.

Expected behavior:

1. The bridge reads the new inbound iMessage only.
2. The inbound message is stored once using the Messages GUID as the external ID.
3. Knotty reads the linked provider profile.
4. Knotty asks for the next deterministically missing field.

### 8. Confirm secure write verification

Reply with a valid answer to the requested editable field.

Expected behavior before verification:

1. The proposed value is staged.
2. The profile is not yet changed.
3. Knotty sends a secure verification link.
4. Knotty never asks for a password, authentication code, payment credential, or identity document by iMessage.

Open the verification link and sign in as the same provider account.

Expected behavior after verification:

1. The staged field is written only to that provider profile.
2. An audit log entry records the update.
3. The conversation receives a six hour authorization window.
4. Knotty continues with the next missing field.

### 9. Confirm opt out

Send `STOP` from the smoke test phone.

Expected behavior:

1. The contact is marked opted out.
2. Knotty stops automated replies.
3. No new outbound queue item is sent for that contact.

## Validation Queries

Use Supabase to confirm the smoke test state.

### Contact ownership

```sql
select id, phone_e164, profile_id, user_id, opted_out, knotty_enabled
from public.messaging_contacts
where profile_id = '<PROFILE_ID>'::uuid;
```

### Conversation and messages

```sql
select c.id as conversation_id,
       c.status,
       c.current_channel,
       m.direction,
       m.sender_type,
       m.channel,
       m.delivery_status,
       m.created_at
from public.messaging_conversations c
join public.messaging_messages m on m.conversation_id = c.id
where c.contact_id in (
  select id from public.messaging_contacts where profile_id = '<PROFILE_ID>'::uuid
)
order by m.created_at;
```

### Profile authorization session

```sql
select profile_id, user_id, status, pending_field, verified_at, expires_at, last_prompted_field
from public.messaging_profile_sessions
where profile_id = '<PROFILE_ID>'::uuid;
```

### Audit trail

```sql
select action, field_name, created_at
from public.messaging_profile_audit_log
where profile_id = '<PROFILE_ID>'::uuid
order by created_at;
```

## Rollout After Smoke Test

Do not immediately queue every eligible provider.

Recommended sequence:

1. First smoke test: 1 provider.
2. Second controlled cohort: at most 5 providers.
3. Third controlled cohort: at most 20 providers.
4. Broader rollout only after delivery, reply, opt out, profile write, audit, and error rates are reviewed.

Before every cohort, use `action = preview` and inspect the result before using `action = queue`.

## Operational Monitoring

Monitor at minimum:

1. Pending iMessage queue depth.
2. Claimed items that remain locked unexpectedly.
3. Failed send count and error codes.
4. Inbound duplicate rate.
5. Verification success and expiration rate.
6. Profile update audit entries.
7. STOP opt out rate.
8. Contacts marked `needs_human`.

## Emergency Stop

The fastest system wide stop is:

```sql
update public.messaging_settings
set global_pause = true,
    updated_at = now()
where id = 'default';
```

Then stop the Mac bridge process.

This prevents the claim RPC from returning new outbound iMessage queue items.

## Rollback

Application rollback:

1. Set `global_pause = true`.
2. Stop the Mac bridge process.
3. Roll back the web application to the previous deployment.
4. Do not delete audit records.

Database rollback should be conservative because the migrations are additive. Leave the new tables and columns in place unless a database rollback is specifically required. Unused additive structures are safer than destructive rollback during an incident.

If a database rollback is explicitly required, first export the following tables for audit retention:

1. `messaging_profile_sessions`.
2. `messaging_profile_audit_log`.
3. Relevant `messaging_messages` rows.
4. Relevant `messaging_queue` rows.

Then remove the claim RPC execution path before considering destructive schema changes.

## Production Success Criteria

The rollout is considered healthy only when all of these are true:

1. Initial outreach is sent only through iMessage.
2. No historical Messages data is replayed unintentionally.
3. One inbound iMessage creates one stored inbound event.
4. Knotty uses real profile data and deterministic missing field logic.
5. Profile writes require successful provider authentication.
6. Writes are restricted to the authenticated provider profile.
7. Every profile change has an audit record.
8. STOP immediately prevents further automated messaging.
9. Global pause stops new outbound claims.
10. No silent SMS fallback occurs.
