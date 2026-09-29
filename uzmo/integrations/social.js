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


const LINKEDIN_ROOT = "https://api.linkedin.com/rest";

export async function executeLinkedIn(input, context, fetchImpl = fetch) {
  const token = context.linkedinAccessToken;
  const author = context.linkedinAuthorUrn || input.authorUrn;
  if (!token || !author) {
    return { status: "authorization_required", tool: "linkedin", message: "Connect LinkedIn before publishing." };
  }
  if (!/^urn:li:(member|organization):[A-Za-z0-9_-]+$/.test(author)) {
    throw new Error("A valid LinkedIn member or organization author URN is required.");
  }

  const version = String(context.linkedinVersion || context.env?.LINKEDIN_VERSION || "202603");
  if (!/^\d{6}$/.test(version)) throw new Error("LinkedIn API version must use YYYYMM format.");
  const headers = {
    Authorization: "Bearer " + token,
    "Linkedin-Version": version,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
  const commentary = String(input.commentary || input.text || "").trim();
  if (!commentary && !input.mediaUrl) throw new Error("LinkedIn commentary or mediaUrl is required.");
  if (commentary.length > 3000) throw new Error("LinkedIn commentary exceeds the supported safety limit.");

  const content = {};
  if (input.mediaUrl) {
    const mediaUrl = validatePublicUrl(input.mediaUrl, "LinkedIn media");
    const source = await fetchImpl(mediaUrl);
    if (!source.ok) throw new Error("LinkedIn media source returned HTTP " + source.status + ".");
    const contentLength = Number(source.headers.get("content-length") || 0);
    if (contentLength > 100 * 1024 * 1024) throw new Error("LinkedIn media exceeds the 100 MB safety limit.");

    const init = await fetchImpl(LINKEDIN_ROOT + "/images?action=initializeUpload", {
      method: "POST",
      headers,
      body: JSON.stringify({ initializeUploadRequest: { owner: author } })
    });
    const initialized = await readJson(init);
    if (!init.ok || !initialized?.value?.uploadUrl || !initialized?.value?.image) {
      throw new Error("LinkedIn image upload initialization failed: HTTP " + init.status);
    }

    const uploaded = await fetchImpl(initialized.value.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": source.headers.get("content-type") || "image/jpeg" },
      body: await source.arrayBuffer()
    });
    if (!uploaded.ok) throw new Error("LinkedIn image upload failed: HTTP " + uploaded.status + ".");

    content.media = {
      id: initialized.value.image,
      ...(input.altText ? { altText: String(input.altText).slice(0, 4086) } : {})
    };
  }

  const post = {
    author,
    commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
    ...(Object.keys(content).length ? { content } : {})
  };

  const response = await fetchImpl(LINKEDIN_ROOT + "/posts", {
    method: "POST",
    headers,
    body: JSON.stringify(post)
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error("LinkedIn publish failed: HTTP " + response.status);
  return {
    status: "completed",
    tool: "linkedin",
    data: { ...data, postId: response.headers.get("x-restli-id") || data?.id || null }
  };
}
