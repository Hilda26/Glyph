export const MAX_SOURCE_URL_LENGTH = 512;
export const MAX_FIELD_LABELS = 12;

const blockedHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const privatePatterns = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^169\.254\./];

export function canonicalizeSourceUrl(raw: string): string {
  if (raw.length > MAX_SOURCE_URL_LENGTH) {
    throw new Error("Source URL is too long.");
  }
  const url = new URL(raw);
  if (url.protocol !== "https:") {
    throw new Error("Source URL must use HTTPS.");
  }
  if (url.username || url.password) {
    throw new Error("Source URL must not embed credentials.");
  }
  const host = url.hostname.toLowerCase();
  if (blockedHosts.has(host) || privatePatterns.some((pattern) => pattern.test(host))) {
    throw new Error("Source URL must be publicly reachable.");
  }
  url.hash = "";
  url.hostname = host;
  return url.toString();
}

export function normalizeFieldLabels(labels: string[]) {
  const seen = new Set<string>();
  return labels
    .map((field) => field.trim().toLowerCase())
    .filter(Boolean)
    .filter((field) => {
      if (seen.has(field)) return false;
      seen.add(field);
      return true;
    })
    .slice(0, MAX_FIELD_LABELS);
}

