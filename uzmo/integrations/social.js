const YOUTUBE_ROOT = "https://www.googleapis.com";
const META_ROOT = "https://graph.facebook.com";

export async function executeYouTube(input, context, fetchImpl = fetch) {
  const token = context.youtubeAccessToken;
  if (!token) return { status: "authorization_required", tool: "youtube", message: "Connect YouTube before uploading." };

  const sourceUrl = validatePublicUrl(input.sourceUrl, "YouTube source");
  const source = await fetchImpl(sourceUrl);
  if (!source.ok) return { status: "failed", tool: "youtube", message: "Video source returned HTTP " + source.status + "." };

  const contentLength = Number(source.headers.get("content-length") || 0);
  if (contentLength > 100 * 1024 * 1024) throw new Error("YouTube upload exceeds the 100 MB safety limit.");

  const metadata = {
    snippet: {
      title: String(input.title || "").trim().slice(0, 100),
      description: String(input.description || "").slice(0, 5000),
      tags: Array.isArray(input.tags) ? input.tags.map(String).slice(0, 30) : []
    },
    status: { privacyStatus: input.privacyStatus || "private" }
  };
  if (!metadata.snippet.title) throw new Error("YouTube title is required.");
  if (!["private", "unlisted", "public"].includes(metadata.status.privacyStatus)) {
    throw new Error("Invalid YouTube privacyStatus.");
  }

  const init = await fetchImpl(
    YOUTUBE_ROOT + "/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": source.headers.get("content-type") || "video/mp4",
        ...(contentLength ? { "X-Upload-Content-Length": String(contentLength) } : {})
      },
      body: JSON.stringify(metadata)
    }
  );
  if (!init.ok) throw new Error("YouTube upload session creation failed: HTTP " + init.status);
  const uploadUrl = init.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube did not return an upload location.");

  const uploaded = await fetchImpl(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": source.headers.get("content-type") || "video/mp4",
      ...(contentLength ? { "Content-Length": String(contentLength) } : {})
    },
    body: source.body
  });
  const data = await readJson(uploaded);
  if (!uploaded.ok) throw new Error("YouTube upload failed: HTTP " + uploaded.status);
  return { status: "completed", tool: "youtube", data };
}

export async function executeInstagram(input, context, fetchImpl = fetch) {
  const token = context.instagramAccessToken;
  const igUserId = context.instagramUserId || input.igUserId;
  if (!token || !igUserId) {
    return { status: "authorization_required", tool: "instagram", message: "Connect an Instagram Business/Creator account before publishing." };
  }

  const mediaUrl = validatePublicUrl(input.mediaUrl, "Instagram media");
  const version = String(context.instagramGraphVersion || "v23.0");
  const base = META_ROOT + "/" + version + "/" + encodeURIComponent(igUserId);
  const create = await fetchImpl(base + "/media", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      image_url: mediaUrl,
      ...(input.caption ? { caption: String(input.caption).slice(0, 2200) } : {}),
      access_token: token
    })
  });
  const created = await readJson(create);
  if (!create.ok || !created?.id) {
    throw new Error("Instagram media container creation failed: HTTP " + create.status);
  }

  const publish = await fetchImpl(base + "/media_publish", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: created.id, access_token: token })
  });
  const published = await readJson(publish);
  if (!publish.ok || !published?.id) {
    throw new Error("Instagram publish failed: HTTP " + publish.status);
  }
  return { status: "completed", tool: "instagram", data: published };
}


export async function executeFlickr(input, context, fetchImpl = fetch) {
  const token = context.flickrAccessToken;
  const tokenSecret = context.flickrAccessTokenSecret;
  const consumerKey = context.flickrConsumerKey;
  const consumerSecret = context.flickrConsumerSecret;
  if (!token || !tokenSecret || !consumerKey || !consumerSecret) {
    return { status: "authorization_required", tool: "flickr", message: "Connect Flickr with OAuth credentials before uploading." };
  }

  const sourceUrl = validatePublicUrl(input.sourceUrl, "Flickr source");
  const source = await fetchImpl(sourceUrl);
  if (!source.ok) return { status: "failed", tool: "flickr", message: "Flickr source returned HTTP " + source.status + "." };
  const contentType = source.headers.get("content-type") || "application/octet-stream";
  const contentLength = Number(source.headers.get("content-length") || 0);
  if (contentLength > 100 * 1024 * 1024) throw new Error("Flickr upload exceeds the 100 MB safety limit.");

  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: token,
    oauth_version: "1.0"
  };
  const fields = {
    ...oauth,
    ...(input.title ? { title: String(input.title).slice(0, 255) } : {}),
    ...(input.description ? { description: String(input.description).slice(0, 5000) } : {}),
    ...(input.tags ? { tags: String(input.tags).slice(0, 500) } : {}),
    ...(input.isPublic !== undefined ? { is_public: input.isPublic ? "1" : "0" } : {}),
    ...(input.isFriend !== undefined ? { is_friend: input.isFriend ? "1" : "0" } : {}),
    ...(input.isFamily !== undefined ? { is_family: input.isFamily ? "1" : "0" } : {}),
    ...(input.safetyLevel ? { safety_level: String(input.safetyLevel) } : {}),
    ...(input.contentType ? { content_type: String(input.contentType) } : {}),
    ...(input.hidden ? { hidden: String(input.hidden) } : {})
  };
  const signature = await createOAuth1Signature("POST", "https://up.flickr.com/services/upload/", fields, consumerSecret, tokenSecret);
  fields.oauth_signature = signature;

  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  const blob = await source.blob();
  form.append("photo", blob, String(input.filename || "uzmo-upload"));
  const response = await fetchImpl("https://up.flickr.com/services/upload/", { method: "POST", body: form });
  const body = await response.text();
  if (!response.ok) throw new Error("Flickr upload failed: HTTP " + response.status);
  const photoId = body.match(/<photoid>([^<]+)<\\/photoid>/i)?.[1] || body.match(/<photoid>([^<]+)<\\/photoid>/i)?.[1];
  return { status: "completed", tool: "flickr", data: { photoId: photoId || null, raw: body.slice(0, 2000) } };
}

async function createOAuth1Signature(method, url, params, consumerSecret, tokenSecret) {
  const encoded = Object.entries(params)
    .map(([key, value]) => [oauthEncode(key), oauthEncode(String(value))])
    .sort(([aKey, aValue], [bKey, bValue]) => aKey < bKey ? -1 : aKey > bKey ? 1 : aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
    .map(([key, value]) => key + "=" + value)
    .join("&");
  const baseString = method.toUpperCase() + "&" + oauthEncode(url) + "&" + oauthEncode(encoded);
  const key = oauthEncode(consumerSecret) + "&" + oauthEncode(tokenSecret);
  const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(baseString));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function oauthEncode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase());
}

function validatePublicUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(label + " URL is required.");
  const url = new URL(value.trim());
  if (!["https:", "http:"].includes(url.protocol)) throw new Error(label + " URL must use HTTP or HTTPS.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || isPrivateIp(host)) {
    throw new Error(label + " URL targets a blocked private or loopback address.");
  }
  return url.toString();
}

function isPrivateIp(host) {
  const v4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a,b,c,d] = v4.slice(1).map(Number);
    if ([a,b,c,d].some(n => n > 255)) return true;
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127);
  }
  return host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
}

async function readJson(response) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { raw: text.slice(0, 2000) }; }
}
