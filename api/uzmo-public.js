import { handlePublicChat } from "../uzmo/api/public-chat.js";

export default async function handler(req, res) {
  return handlePublicChat(req, res);
}
