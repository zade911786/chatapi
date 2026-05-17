import { handleRequest } from "./_handler.js";

export default function handler(req, res) {
  return handleRequest(req, res, "yng");
}
