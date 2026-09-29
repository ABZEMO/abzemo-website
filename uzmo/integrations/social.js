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

export async function executeGitLabIssue(input, context, fetchImpl = fetch) {
  const token = context.gitlabAccessToken;
  const baseUrl = String(context.gitlabBaseUrl || input.baseUrl || "https://gitlab.com").replace(/\/+$/, "");
  const project = String(context.gitlabProject || input.project || "").trim();
  if (!token || !project) {
    return { status: "authorization_required", tool: "gitlab_issues", message: "Connect GitLab and provide a target project before creating an issue." };
  }
  const title = String(input.title || "").trim();
  const description = input.description == null ? "" : String(input.description);
  if (!title) throw new Error("GitLab issue title is required.");
  if (title.length > 255) throw new Error("GitLab issue title exceeds 255 characters.");
  if (description.length > 1048576) throw new Error("GitLab issue description exceeds 1 MiB.");
  const url = new URL(baseUrl);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("GitLab base URL must use HTTP or HTTPS.");
  const payload = { title, description };
  if (input.labels != null) payload.labels = Array.isArray(input.labels) ? input.labels.map(String).join(",") : String(input.labels);
  if (input.assigneeId != null) payload.assignee_id = Number(input.assigneeId);
  const response = await fetchImpl(baseUrl + "/api/v4/projects/" + encodeURIComponent(project) + "/issues", {
    method: "POST",
    headers: {
      "PRIVATE-TOKEN": token,
      Accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await readJson(response);
  if (!response.ok || !data?.iid) throw new Error("GitLab issue creation failed: HTTP " + response.status);
  return { status: "completed", tool: "gitlab_issues", data: { id: data.id, iid: data.iid, title: data.title, url: data.web_url } };
}
