import { createServer } from "node:http"
import { isFromDiscord, reply } from "./discord.js"
import { run } from "./commands.js"

const PING = 1
const COMMAND = 2
const PONG = 1
const DEFERRED = 5

const allowedChannel = process.env.ALLOWED_CHANNEL_ID

createServer(async (request, response) => {
  if (request.method === "GET") return send(response, 200, "tvistv bot")
  if (request.method !== "POST") return send(response, 405, "")

  const body = await readBody(request)
  const signature = request.headers["x-signature-ed25519"]
  const timestamp = request.headers["x-signature-timestamp"]
  if (!isFromDiscord(signature, timestamp, body)) return send(response, 401, "invalid request signature")

  const interaction = JSON.parse(body)
  if (interaction.type === PING) return sendJson(response, { type: PONG })
  if (interaction.type !== COMMAND) return send(response, 400, "")

  // Discord wants an answer within 3 seconds, so acknowledge first and edit the reply once done
  sendJson(response, { type: DEFERRED })
  await handle(interaction)
}).listen(process.env.PORT || 8080)

async function handle(interaction) {
  const user = interaction.member?.user?.username ?? "someone"
  try {
    if (allowedChannel && interaction.channel_id !== allowedChannel) {
      throw new Error("I only take orders in my own channel.")
    }
    await reply(interaction.token, await run(interaction.data, user))
  } catch (error) {
    await reply(interaction.token, `⚠️ ${error.message}`)
  }
}

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function send(response, status, body) {
  response.writeHead(status, { "content-type": "text/plain" })
  response.end(body)
}

function sendJson(response, body) {
  response.writeHead(200, { "content-type": "application/json" })
  response.end(JSON.stringify(body))
}
