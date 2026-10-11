let loaded;

module.exports = async function handler(req, res) {
  try {
    loaded = loaded || (await import("../uzmo/api/public-chat.js"));
    return await loaded.handlePublicChat(req, res);
  } catch (error) {
    console.error("uzmo-public load error", error);
    return res.status(500).json({ error: "load failed" });
  }
};
