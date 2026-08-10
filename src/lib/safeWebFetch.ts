import dns from "node:dns/promises";
import net from "node:net";

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;

function ipv4ToNumber(ip: string) {
  return ip.split(".").reduce((value, part) => value * 256 + Number(part), 0);
}

function isPrivateIpv4(ip: string) {
  const value = ipv4ToNumber(ip);
  const ranges = [
    [ipv4ToNumber("0.0.0.0"), ipv4ToNumber("0.255.255.255")],
    [ipv4ToNumber("10.0.0.0"), ipv4ToNumber("10.255.255.255")],
    [ipv4ToNumber("100.64.0.0"), ipv4ToNumber("100.127.255.255")],
    [ipv4ToNumber("127.0.0.0"), ipv4ToNumber("127.255.255.255")],
    [ipv4ToNumber("169.254.0.0"), ipv4ToNumber("169.254.255.255")],
    [ipv4ToNumber("172.16.0.0"), ipv4ToNumber("172.31.255.255")],
    [ipv4ToNumber("192.0.0.0"), ipv4ToNumber("192.0.0.255")],
    [ipv4ToNumber("192.168.0.0"), ipv4ToNumber("192.168.255.255")],
    [ipv4ToNumber("198.18.0.0"), ipv4ToNumber("198.19.255.255")],
    [ipv4ToNumber("224.0.0.0"), ipv4ToNumber("255.255.255.255")],
  ];

  return ranges.some(([start, end]) => value >= start && value <= end);
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    normalized.startsWith("::ffff:169.254.")
  );
}

function isBlockedIp(ip: string) {
  if (net.isIPv4(ip)) return isPrivateIpv4(ip);
  if (net.isIPv6(ip)) return isPrivateIpv6(ip);
  return true;
}

async function assertSafeUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP(S) URLs are allowed.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal" ||
    hostname === "metadata.google"
  ) {
    throw new Error("Private or metadata hosts are not allowed.");
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new Error("Private or reserved IP addresses are not allowed.");
    }
    return url;
  }

  const addresses = await dns.lookup(hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isBlockedIp(address))
  ) {
    throw new Error("The URL resolves to a private or reserved address.");
  }

  return url;
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function readBody(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Web response is too large (maximum 1 MB).");
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(merged);
}

export async function safeWebFetch(input: string) {
  let current = input;

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    const url = await assertSafeUrl(current);

    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "user-agent": "Zachmation-Agent/1.0",
        accept: "text/html,text/plain,application/json;q=0.9,*/*;q=0.1",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Web page returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS) {
        throw new Error("Too many redirects.");
      }
      current = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`Web request failed with status ${response.status}.`);
    }

    const body = await readBody(response);
    const contentType = response.headers.get("content-type") ?? "";
    const content = contentType.includes("text/html") ? htmlToText(body) : body;

    return {
      url: url.toString(),
      content: content.slice(0, MAX_RESPONSE_BYTES),
    };
  }

  throw new Error("Unable to fetch the requested URL.");
}
