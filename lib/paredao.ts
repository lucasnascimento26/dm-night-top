import { createHash } from "crypto";

export function hashVotante(voterId: string) {
  return createHash("sha256")
    .update(voterId + (process.env.VOTE_SECRET ?? ""))
    .digest("hex");
}

export function hashAparelho(deviceId: string) {
  return createHash("sha256")
    .update("device:" + deviceId + (process.env.VOTE_SECRET ?? ""))
    .digest("hex");
}

export function ipDoRequest(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}