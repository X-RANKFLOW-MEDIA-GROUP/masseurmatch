#!/bin/bash
set -euo pipefail

LABEL="com.masseurmatch.imessage-bridge"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRIDGE_SCRIPT="$REPO_ROOT/scripts/imessage-bridge.mjs"
APP_DIR="$HOME/Library/Application Support/MasseurMatch"
LOG_DIR="$APP_DIR/logs"
CONFIG_FILE="$APP_DIR/imessage-bridge.env"
RUNNER_FILE="$APP_DIR/run-imessage-bridge.sh"
PLIST_FILE="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$UID"
ACTION="${1:-install}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_macos() {
  [ "$(uname -s)" = "Darwin" ] || fail "This installer must run on macOS."
}

find_node() {
  NODE_BIN="$(command -v node || true)"
  [ -n "$NODE_BIN" ] || fail "Node.js is required on the dedicated Mac."
  [ -x "$NODE_BIN" ] || fail "Node.js executable is not available."
}

validate_secret() {
  local value="${IMESSAGE_BRIDGE_SECRET:-}"
  [ -n "$value" ] || fail "Set IMESSAGE_BRIDGE_SECRET before running install."
  case "$value" in
    *[!A-Za-z0-9._~-]*)
      fail "IMESSAGE_BRIDGE_SECRET must use URL-safe characters only. Generate one with: openssl rand -hex 32"
      ;;
  esac
  [ "${#value}" -ge 32 ] || fail "IMESSAGE_BRIDGE_SECRET must be at least 32 characters."
}

preflight_messages() {
  local chat_db="${IMESSAGE_CHAT_DB:-$HOME/Library/Messages/chat.db}"
  [ -f "$chat_db" ] || fail "Messages database was not found at $chat_db. Sign in to Messages first."

  if ! /usr/bin/sqlite3 "$chat_db" "select 1;" >/dev/null 2>&1; then
    fail "Cannot read Messages database. Grant Full Disk Access to Terminal before installing."
  fi

  if ! /usr/bin/osascript -e 'tell application "Messages" to get name' >/dev/null 2>&1; then
    fail "Cannot control Messages. Allow Terminal to automate Messages in macOS Privacy & Security."
  fi
}

write_config() {
  local app_url="${MASSEURMATCH_APP_URL:-https://masseurmatch.com}"
  local worker_id="${IMESSAGE_WORKER_ID:-masseurmatch-imessage-01}"
  local poll_ms="${IMESSAGE_POLL_MS:-5000}"
  local heartbeat_ms="${IMESSAGE_HEARTBEAT_MS:-30000}"
  local replay="${IMESSAGE_REPLAY_HISTORY:-0}"
  local chat_db="${IMESSAGE_CHAT_DB:-$HOME/Library/Messages/chat.db}"
  local state_dir="${IMESSAGE_STATE_DIR:-$HOME/.masseurmatch-imessage-bridge}"

  case "$app_url" in
    https://*|http://localhost:*|http://127.0.0.1:*) ;;
    *) fail "MASSEURMATCH_APP_URL must use HTTPS, except localhost development." ;;
  esac

  case "$worker_id" in
    ''|*[!A-Za-z0-9._:-]*) fail "IMESSAGE_WORKER_ID contains unsupported characters." ;;
  esac

  case "$poll_ms" in
    ''|*[!0-9]*) fail "IMESSAGE_POLL_MS must be numeric." ;;
  esac
  case "$heartbeat_ms" in
    ''|*[!0-9]*) fail "IMESSAGE_HEARTBEAT_MS must be numeric." ;;
  esac

  [ "$poll_ms" -ge 2000 ] && [ "$poll_ms" -le 60000 ] || fail "IMESSAGE_POLL_MS must be between 2000 and 60000."
  [ "$heartbeat_ms" -ge 15000 ] && [ "$heartbeat_ms" -le 60000 ] || fail "IMESSAGE_HEARTBEAT_MS must be between 15000 and 60000."
  [ "$replay" = "0" ] || fail "Installer refuses history replay. Keep IMESSAGE_REPLAY_HISTORY=0."

  mkdir -p "$APP_DIR" "$LOG_DIR" "$HOME/Library/LaunchAgents"
  chmod 700 "$APP_DIR" "$LOG_DIR"

  umask 077
  cat > "$CONFIG_FILE" <<EOF
export MASSEURMATCH_APP_URL='$app_url'
export IMESSAGE_BRIDGE_SECRET='${IMESSAGE_BRIDGE_SECRET}'
export IMESSAGE_WORKER_ID='$worker_id'
export IMESSAGE_POLL_MS='$poll_ms'
export IMESSAGE_HEARTBEAT_MS='$heartbeat_ms'
export IMESSAGE_REPLAY_HISTORY='0'
export IMESSAGE_CHAT_DB='$chat_db'
export IMESSAGE_STATE_DIR='$state_dir'
EOF
  chmod 600 "$CONFIG_FILE"
}

write_runner() {
  cat > "$RUNNER_FILE" <<EOF
#!/bin/bash
set -euo pipefail
source "$CONFIG_FILE"
exec "$NODE_BIN" "$BRIDGE_SCRIPT"
EOF
  chmod 700 "$RUNNER_FILE"
}

write_plist() {
  cat > "$PLIST_FILE" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$RUNNER_FILE</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/imessage-bridge.out.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/imessage-bridge.err.log</string>
  <key>ProcessType</key>
  <string>Background</string>
</dict>
</plist>
EOF
  chmod 600 "$PLIST_FILE"
  /usr/bin/plutil -lint "$PLIST_FILE" >/dev/null
}

install_service() {
  require_macos
  find_node
  [ -f "$BRIDGE_SCRIPT" ] || fail "Bridge script not found at $BRIDGE_SCRIPT."
  validate_secret
  preflight_messages
  write_config
  write_runner
  write_plist

  /bin/launchctl bootout "$DOMAIN" "$PLIST_FILE" >/dev/null 2>&1 || true
  /bin/launchctl bootstrap "$DOMAIN" "$PLIST_FILE"
  /bin/launchctl enable "$DOMAIN/$LABEL"
  /bin/launchctl kickstart -k "$DOMAIN/$LABEL"

  echo "Installed and started $LABEL."
  echo "Config: $CONFIG_FILE"
  echo "Logs: $LOG_DIR"
  echo "Status: $0 status"
}

status_service() {
  require_macos
  if /bin/launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
    echo "$LABEL is loaded."
    /bin/launchctl print "$DOMAIN/$LABEL" | /usr/bin/grep -E 'state =|pid =|last exit code =' || true
  else
    echo "$LABEL is not loaded."
    exit 1
  fi

  if [ -f "$LOG_DIR/imessage-bridge.err.log" ]; then
    echo "--- recent errors ---"
    /usr/bin/tail -n 20 "$LOG_DIR/imessage-bridge.err.log" || true
  fi
}

uninstall_service() {
  require_macos
  /bin/launchctl bootout "$DOMAIN" "$PLIST_FILE" >/dev/null 2>&1 || true
  rm -f "$PLIST_FILE" "$RUNNER_FILE"
  echo "Removed $LABEL."
  echo "The protected config and bridge state were preserved for audit and safe reinstall."
}

case "$ACTION" in
  install) install_service ;;
  status) status_service ;;
  uninstall) uninstall_service ;;
  *) fail "Usage: $0 [install|status|uninstall]" ;;
esac
