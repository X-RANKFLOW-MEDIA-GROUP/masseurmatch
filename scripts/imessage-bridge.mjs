#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE_URL = (process.env.MASSEURMATCH_APP_URL || "https://masseurmatch.com").replace(/\/$/, "");
const SECRET = process.env.IMESSAGE_BRIDGE_SECRET?.trim();
const WORKER_ID = process.env.IMESSAGE_WORKER_ID?.trim() || `mac-${os.hostname()}`;
const POLL_MS = Math.max(2000, Number(process.env.IMESSAGE_POLL_MS || 5000));
const CHAT_DB = process.env.IMESSAGE_CHAT_DB || path.join(os.homedir(), "Library/Messages/chat.db");
const STATE_DIR = process.env.IMESSAGE_STATE_DIR || path.join(os.homedir(), ".masseurmatch-imessage-bridge");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const REPLAY_HISTORY = process.env.IMESSAGE_REPLAY_HISTORY === "1";

if (process.platform !== "darwin") {
  console.error("This bridge must run on macOS with the Messages app signed into iMessage.");
  process.exit(1);
}
if (!SECRET) {
  console.error("IMESSAGE_BRIDGE_SECRET is required.");
  process.exit(1);
}
if (!fs.existsSync(CHAT_DB)) {
  console.error(`Messages database not found at ${CHAT_DB}. Grant Full Disk Access to the process running this bridge.`);
  process.exit(1);
}

fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });

function saveState(state) {
  const temp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(state, null, 2), { mode: 0o600 });
  fs.renameSync(temp, STATE_FILE);
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15 && digits[0] !== "0") return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function sqliteJson(sql) {
  const output = execFileSync("/usr/bin/sqlite3", ["-json", CHAT_DB, sql], {
    encoding: "utf8",
    maxBuffer: 5 * 1024 * 1024,
  }).trim();
  return output ? JSON.parse(output) : [];
}

function currentInboundRowId() {
  const rows = sqliteJson("select coalesce(max(ROWID), 0) as row_id from message where is_from_me = 0 and service = 'iMessage';");
  return Number(rows[0]?.row_id || 0);
}

function loadState() {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return { lastInboundRowId: Number(state.lastInboundRowId || 0) };
  } catch {
    const lastInboundRowId = REPLAY_HISTORY ? 0 : currentInboundRowId();
    const state = { lastInboundRowId };
    saveState(state);
    console.log(
      REPLAY_HISTORY
        ? "History replay enabled. Existing inbound iMessages will be processed."
        : `First start: initialized at inbound row ${lastInboundRowId}. Existing message history will not be replayed.`,
    );
    return state;
  }
}

async function api(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-imessage-bridge-secret": SECRET,
      "x-imessage-worker-id": WORKER_ID,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${pathname} returned ${response.status}: ${payload.error || payload.message || "unknown error"}`);
  }
  return payload;
}

function appleScriptString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

function sendImessage(phone, body) {
  const target = appleScriptString(phone);
  const text = appleScriptString(body);
  const script = `
    tell application "Messages"
      set targetService to first service whose service type = iMessage
      set targetBuddy to buddy "${target}" of targetService
      send "${text}" to targetBuddy
    end tell
  `;
  execFileSync("/usr/bin/osascript", ["-e", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function getInboundMessages(afterRowId) {
  const safeRow = Number.isInteger(Number(afterRowId)) ? Number(afterRowId) : 0;
  const sql = `
    select
      m.ROWID as row_id,
      m.guid as external_id,
      h.id as sender,
      m.text as body,
      m.date as apple_date
    from message m
    left join handle h on h.ROWID = m.handle_id
    where m.ROWID > ${safeRow}
      and m.is_from_me = 0
      and m.service = 'iMessage'
      and m.text is not null
      and length(trim(m.text)) > 0
    order by m.ROWID asc
    limit 100;
  `;
  return sqliteJson(sql);
}

function appleDateToIso(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return new Date().toISOString();
  const seconds = raw > 1e12 ? raw / 1e9 : raw;
  const unixSeconds = seconds + 978307200;
  return new Date(unixSeconds * 1000).toISOString();
}

async function forwardInbound(state) {
  const rows = getInboundMessages(state.lastInboundRowId);
  for (const row of rows) {
    const rowId = Number(row.row_id);
    const phone = normalizePhone(row.sender);

    try {
      if (phone) {
        await api("/api/messaging/imessage/inbound", {
          method: "POST",
          body: JSON.stringify({
            from: phone,
            body: String(row.body || ""),
            externalId: String(row.external_id || `chatdb:${rowId}`),
            receivedAt: appleDateToIso(row.apple_date),
          }),
        });
      }
      state.lastInboundRowId = Math.max(state.lastInboundRowId || 0, rowId);
      saveState(state);
    } catch (error) {
      console.error(`[inbound row ${rowId}]`, error instanceof Error ? error.message : error);
      break;
    }
  }
}

async function sendOneOutbound() {
  const claimed = await api("/api/messaging/imessage/claim", { method: "POST", body: "{}" });
  const item = claimed.item;
  if (!item) return false;

  const queueId = item.queue_id;
  try {
    const phone = normalizePhone(item.phone_e164);
    if (!phone) throw new Error("Queue item has an invalid phone number.");
    sendImessage(phone, String(item.body || ""));
    await api("/api/messaging/imessage/status", {
      method: "POST",
      body: JSON.stringify({
        queueId,
        status: "sent",
        externalId: `messages:${queueId}`,
        occurredAt: new Date().toISOString(),
      }),
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await api("/api/messaging/imessage/status", {
      method: "POST",
      body: JSON.stringify({
        queueId,
        status: "failed",
        errorCode: "IMESSAGE_BRIDGE_SEND_FAILED",
        errorMessage: message.slice(0, 500),
        retryable: true,
        occurredAt: new Date().toISOString(),
      }),
    }).catch((statusError) => console.error("Could not report send failure:", statusError));
    return false;
  }
}

async function cycle(state) {
  await forwardInbound(state);
  for (let count = 0; count < 10; count += 1) {
    const sent = await sendOneOutbound();
    if (!sent) break;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}

async function main() {
  const state = loadState();
  console.log(`MasseurMatch iMessage bridge started as ${WORKER_ID}.`);
  console.log(`API: ${BASE_URL}`);
  console.log(`Messages DB: ${CHAT_DB}`);

  while (true) {
    try {
      await cycle(state);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
