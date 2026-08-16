# Knotty iMessage Rollout Runbook

## Scope

This runbook activates the MasseurMatch provider profile completion assistant over iMessage.

The production rollout must remain controlled. The first live message must target one explicit provider profile using `profileId`. Do not begin with a bulk queue action.

## Preconditions

1. PR containing the iMessage assistant is merged and deployed.
2. Both iMessage migrations are applied successfully.
3. `IMESSAGE_BRIDGE_SECRET` is configured on the web application.
4. A dedicated Mac is signed into the intended MasseurMatch iMessage account.
5. The bridge process can read `~/Library/Messages/chat.db` through macOS Full Disk Access.
6. macOS Automation permission allows the bridge process to control Messages.
7. `IMESSAGE_REPLAY_HISTORY=0` remains the default.
8. The MasseurMatch admin messaging global pause remains enabled until the smoke test is ready.
9. The smoke test provider has explicitly enabled the dedicated Knotty iMessage Profile Assistant preference. SMS notification consent is not sufficient.

## Generate the Shared Bridge Secret

Generate a URL safe secret once:

```bash
openssl rand -hex 32
```

Configure the same value as `IMESSAGE_BRIDGE_SECRET` in the deployed MasseurMatch web application and on the dedicated Mac. Never commit it to Git.

## Install the Mac Bridge as a Service

From the deployed repository checkout on the dedicated Mac:

```bash
export IMESSAGE_BRIDGE_SECRET="<same secret configured on the web app>"
bash scripts/install-imessage-bridge-launchd.sh install
```

Optional environment overrides before installation:

```bash
export MASSEURMATCH_APP_URL="https://masseurmatch.com"
export IMESSAGE_WORKER_ID="masseurmatch-mac-01"
export IMESSAGE_POLL_MS="5000"
export IMESSAGE_REPLAY_HISTORY="0"
export IMESSAGE_CHAT_DB="$HOME/Library/Messages/chat.db"
export IMESSAGE_STATE_DIR="$HOME/.masseurmatch-imessage-bridge"
```

The installer:

1. Refuses non macOS hosts.
2. Requires Node.js and the bridge script.
3. Refuses secrets shorter than 32 characters or containing unsafe shell characters.
4. Confirms the Messages database is readable before installation.
5. Confirms Apple Events can reach Messages without sending a message.
6. Stores runtime configuration outside the repository at `~/Library/Application Support/MasseurMatch/imessage-bridge.env` with mode `0600`.
7. Creates a per user `launchd` LaunchAgent.
8. Starts the bridge immediately and automatically after future logins.
9. Keeps stdout and stderr logs under `~/Library/Application Support/MasseurMatch/logs`.
10. Leaves history replay disabled.

Check status:

```bash
bash scripts/install-imessage-bridge-launchd.sh status
```

Remove the LaunchAgent without deleting protected configuration or bridge state:

```bash
bash scripts/install-imessage-bridge-launchd.sh uninstall
```

### macOS privacy permissions

The installer cannot bypass macOS privacy controls. The dedicated bridge runtime must be authorized to read Messages data and control Messages. If the service starts but logs a database access or Apple Events permission error, stop rollout and correct Full Disk Access or Automation permissions before any queue action.

## Dedicated Consent Requirement

The profile assistant uses its own consent fields in `user_notification_preferences`:

1. `imessage_profile_assistant_enabled = true`.
2. `imessage_profile_assistant_consent_at` is present.
3. `imessage_profile_assistant_consent_version` is present.
4. `imessage_profile_assistant_opted_out_at` is null.
5. A valid E.164 phone is stored.

The provider controls this preference from `/pro/settings` under **Knotty Profile Assistant via iMessage**.

Do not infer this permission from `sms_enabled`, marketing consent, an existing profile phone, or previous contact with support.

## Smoke Test Sequence

### 1. Keep global messaging paused

Confirm the production `messaging_settings` row has `global_pause = true` before preparing the target profile.

### 2. Choose one provider

Use one known provider account that:

1. Has an authenticated `user_id`.
2. Has a valid phone number.
3. Has explicitly enabled `imessage_profile_assistant_enabled` and has a recorded consent timestamp/version.
4. Has not opted out of the iMessage profile assistant or the messaging contact.
5. Is active and not suspended or banned.
6. Has at least one deterministically incomplete profile field.
7. Is approved for the smoke test.

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

Do not continue if the response targets more than one profile, consent is missing, or the phone belongs to another account.

### 4. Confirm the LaunchAgent is healthy

Run:

```bash
bash scripts/install-imessage-bridge-launchd.sh status
```

Do not unpause messaging unless the service is loaded and there are no unresolved Messages database, authentication, or Apple Events errors.

### 5. Unpause messaging immediately before the test

Set `global_pause = false` only when the bridge is healthy and the single profile preview is correct.

### 6. Queue only the smoke test profile

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

### 7. Confirm outbound delivery

Verify that the dedicated Mac sends the message through Apple Messages and the queue status moves from `pending` to `claimed` to `sent`.

If delivery fails, the bridge must report the failure through the status endpoint and the queue item must not be silently rerouted to SMS.

### 8. Confirm inbound routing

Reply `START` from the smoke test phone.

Expected behavior:

1. The bridge reads the new inbound iMessage only.
2. The inbound message is stored once using the Messages GUID as the external ID.
3. Knotty reads the linked provider profile.
4. Knotty asks for the next deterministically missing field.

### 9. Confirm secure write verification

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

### 10. Confirm opt out

Send `STOP` from the smoke test phone.

Expected behavior:

1. The contact is marked opted out.
2. Knotty stops automated replies.
3. No new outbound queue item is sent for that contact.

## Validation Queries

### Dedicated consent

```sql
select user_id,
       phone_e164,
       imessage_profile_assistant_enabled,
       imessage_profile_assistant_consent_at,
       imessage_profile_assistant_consent_version,
       imessage_profile_assistant_opted_out_at
from public.user_notification_preferences
where user_id = '<USER_ID>'::uuid;
```

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

1. LaunchAgent state and recent bridge errors.
2. Pending iMessage queue depth.
3. Claimed items that remain locked unexpectedly.
4. Failed send count and error codes.
5. Inbound duplicate rate.
6. Verification success and expiration rate.
7. Profile update audit entries.
8. STOP opt out rate.
9. Contacts marked `needs_human`.

## Emergency Stop

The fastest system wide stop is:

```sql
update public.messaging_settings
set global_pause = true,
    updated_at = now()
where id = 'default';
```

Then stop the Mac service:

```bash
bash scripts/install-imessage-bridge-launchd.sh uninstall
```

This prevents the claim RPC from returning new outbound iMessage queue items. The uninstall intentionally preserves protected configuration and bridge state.

## Rollback

Application rollback:

1. Set `global_pause = true`.
2. Stop the Mac LaunchAgent.
3. Roll back the web application to the previous deployment.
4. Do not delete audit records.

Database rollback should be conservative because the migrations are additive. Leave the new tables and columns in place unless a database rollback is specifically required. Unused additive structures are safer than destructive rollback during an incident.

If a database rollback is explicitly required, first export:

1. `messaging_profile_sessions`.
2. `messaging_profile_audit_log`.
3. Relevant `messaging_messages` rows.
4. Relevant `messaging_queue` rows.
5. Relevant iMessage consent fields from `user_notification_preferences`.

Then remove the claim RPC execution path before considering destructive schema changes.

## Production Success Criteria

The rollout is considered healthy only when all of these are true:

1. Initial outreach is sent only to providers with dedicated iMessage profile assistant consent.
2. Initial outreach is sent only through iMessage.
3. No historical Messages data is replayed unintentionally.
4. One inbound iMessage creates one stored inbound event.
5. Knotty uses real profile data and deterministic missing field logic.
6. Profile writes require successful provider authentication.
7. Writes are restricted to the authenticated provider profile.
8. Every profile change has an audit record.
9. STOP immediately prevents further automated messaging.
10. Global pause stops new outbound claims.
11. No silent SMS fallback occurs.
12. The Mac bridge survives logout/login cycles through its LaunchAgent and exposes useful local logs.
