const PRIVATE_IPV4_RANGES = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^192\.0\.0\./, /^192\.168\./,
  /^198\.18\./, /^198\.19\./, /^224\./, /^225\./, /^226\./, /^227\./, /^228\./,
  /^229\./, /^230\./, /^231\./, /^232\./, /^233\./, /^234\./, /^235\./, /^236\./,
  /^237\./, /^238\./, /^239\./, /^240\./, /^241\./, /^242\./, /^243\./,
  /^244\./, /^245\./, /^246\./, /^247\./, /^248\./, /^249\./, /^250\./, /^251\./,
  /^252\./, /^253\./, /^254\./, /^255\./
];

export function validateOutboundUrl(raw, { allowedHosts } = {}) {
  let url;
  try { url = new URL(String(raw || "")); } catch { throw new Error("A valid URL is required."); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP(S) URLs are allowed.");
  if (url.username || url.password) throw new Error("Credential-bearing URLs are not allowed.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "::1" || host === "[::1]") {
    throw new Error("Local destinations are not allowed.");
  }
  if (PRIVATE_IPV4_RANGES.some(re => re.test(host))) throw new Error("Private or reserved IP destinations are not allowed.");
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    throw new Error("Private IPv6 destinations are not allowed.");
  }
  if (Array.isArray(allowedHosts) && allowedHosts.length) {
    const ok = allowedHosts.some(entry => host === String(entry).trim().toLowerCase());
    if (!ok) throw new Error("Destination host is not allowlisted.");
  }
  return url;
}
