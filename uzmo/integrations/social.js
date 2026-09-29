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


export async function executeLinkedInVideo(input, context, fetchImpl = fetch) {
  const token = context.linkedinAccessToken;
  const owner = String(context.linkedinAuthorUrn || input.authorUrn || "").trim();
  const version = String(context.linkedinApiVersion || input.apiVersion || "202606").trim();
  if (!token || !owner) {
    return { status: "authorization_required", tool: "linkedin_video", message: "Connect LinkedIn and configure an authorized member or organization author URN." };
  }
  if (!/^\\d{6}$/.test(version)) throw new Error("LinkedIn API version must use YYYYMM format.");

  const sourceUrl = validatePublicUrl(input.sourceUrl, "LinkedIn video source");
  const source = await fetchImpl(sourceUrl);
  if (!source.ok) throw new Error("LinkedIn video source returned HTTP " + source.status);
  const contentLength = Number(source.headers.get("content-length") || 0);
  if (!Number.isSafeInteger(contentLength) || contentLength < 1) throw new Error("LinkedIn video source must provide a valid Content-Length.");
  if (contentLength > 200 * 1024 * 1024) throw new Error("LinkedIn video exceeds the 200 MB safety limit.");

  const init = await fetchImpl("https://api.linkedin.com/rest/videos?action=initializeUpload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "Linkedin-Version": version,
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner,
        fileSizeBytes: contentLength,
        uploadCaptions: false,
        uploadThumbnail: false
      }
    })
  });
  const initialized = await readJson(init);
  const value = initialized?.value;
  const instructions = Array.isArray(value?.uploadInstructions) ? value.uploadInstructions : [];
  const videoUrn = value?.video;
  if (!init.ok || !videoUrn || !instructions.length) throw new Error("LinkedIn video upload initialization failed: HTTP " + init.status);

  const bytes = new Uint8Array(await source.arrayBuffer());
  const uploadedPartIds = [];
  for (const instruction of instructions) {
    const first = Number(instruction.firstByte);
    const last = Number(instruction.lastByte);
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 0 || last < first || last >= bytes.byteLength) {
      throw new Error("LinkedIn returned invalid video upload byte ranges.");
    }
    const part = bytes.slice(first, last + 1);
    const upload = await fetchImpl(instruction.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: part
    });
    if (!upload.ok) throw new Error("LinkedIn video part upload failed: HTTP " + upload.status);
    const etag = upload.headers.get("etag");
    if (!etag) throw new Error("LinkedIn video upload did not return an ETag.");
    uploadedPartIds.push(etag);
  }

  const finalize = await fetchImpl("https://api.linkedin.com/rest/videos?action=finalizeUpload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "Linkedin-Version": version,
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      finalizeUploadRequest: { video: videoUrn, uploadToken: value.uploadToken || "", uploadedPartIds }
    })
  });
  if (!finalize.ok) throw new Error("LinkedIn video finalization failed: HTTP " + finalize.status);

  const commentary = String(input.commentary || "").slice(0, 3000);
  if (!commentary.trim()) throw new Error("LinkedIn video commentary is required.");
  const post = await fetchImpl("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      "Linkedin-Version": version,
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      author: owner,
      commentary,
      visibility: input.visibility || "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { title: String(input.title || "UZMO video").slice(0, 200), id: videoUrn } },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    })
  });
  if (!post.ok) throw new Error("LinkedIn video post creation failed: HTTP " + post.status);
  return { status: "completed", tool: "linkedin_video", data: { video: videoUrn, postId: post.headers.get("x-restli-id") } };
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
