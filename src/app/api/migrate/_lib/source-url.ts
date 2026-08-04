import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { RouteError } from "@/app/api/_lib/http";

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

export function isPrivateNetworkAddress(address: string): boolean {
  const normalized = address.replace(/^\[|\]$/g, "").toLowerCase();
  const version = isIP(normalized);

  if (version === 4) return isPrivateIpv4(normalized);
  if (version !== 6) return true;

  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice("::ffff:".length);
    return isIP(mappedIpv4) !== 4 || isPrivateIpv4(mappedIpv4);
  }

  const firstHextet = Number.parseInt(normalized.split(":")[0] || "0", 16);
  return (
    (firstHextet & 0xfe00) === 0xfc00 ||
    (firstHextet & 0xffc0) === 0xfe80 ||
    (firstHextet & 0xff00) === 0xff00 ||
    normalized.startsWith("2001:db8:")
  );
}

export function parseSafePublicUrl(rawUrl: string): URL {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new RouteError(400, "Enter a valid profile URL.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new RouteError(400, "Only HTTP and HTTPS profile links are supported.");
  }

  if (url.username || url.password) {
    throw new RouteError(400, "Profile links cannot include embedded credentials.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const blockedHostname =
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    (isIP(hostname) > 0 && isPrivateNetworkAddress(hostname));

  if (blockedHostname) {
    throw new RouteError(400, "That profile link cannot be accessed.");
  }

  url.hash = "";
  return url;
}

export async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  const url = parseSafePublicUrl(rawUrl);
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (isIP(hostname) === 0) {
    let addresses: Array<{ address: string }>;
    try {
      addresses = await lookup(hostname, { all: true, verbatim: true });
    } catch {
      throw new RouteError(400, "The profile link hostname could not be resolved.");
    }

    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateNetworkAddress(address))) {
      throw new RouteError(400, "That profile link cannot be accessed.");
    }
  }

  return url;
}
