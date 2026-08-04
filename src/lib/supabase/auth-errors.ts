type AuthErrorLike = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

const EXPECTED_SESSION_ERROR_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_not_found",
]);

/**
 * Supabase returns these errors when a browser keeps an expired or already
 * rotated refresh-token cookie. They mean "signed out", not a server failure.
 */
export function isExpectedInvalidSessionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as AuthErrorLike;
  const code = typeof candidate.code === "string" ? candidate.code.toLowerCase() : "";
  if (EXPECTED_SESSION_ERROR_CODES.has(code)) return true;

  const message =
    typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";

  return (
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found") ||
    message.includes("refresh token already used") ||
    message.includes("auth session missing")
  );
}
