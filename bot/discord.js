import { createPublicKey, verify } from "node:crypto"

const API = "https://discord.com/api/v10"

// Discord hands out the Ed25519 key as raw hex; node wants it wrapped in an SPKI DER header
const publicKey = createPublicKey({
  key: Buffer.concat([
    Buffer.from("302a300506032b6570032100", "hex"),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex"),
  ]),
  format: "der",
  type: "spki",
})

export function isFromDiscord(signature, timestamp, body) {
  if (!signature || !timestamp) return false
  try {
    const signed = Buffer.concat([Buffer.from(timestamp), body])
    return verify(null, signed, publicKey, Buffer.from(signature, "hex"))
  } catch {
    return false
  }
}

export async function reply(token, content) {
  await fetch(`${API}/webhooks/${process.env.DISCORD_APP_ID}/${token}/messages/@original`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content }),
  })
}
