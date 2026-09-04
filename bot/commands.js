import { panels } from "./panels.js"
import { readState, writeState, storeImage } from "./state.js"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const SUBCOMMAND = 1
const STRING = 3
const ATTACHMENT = 11

const types = {
  text: {
    option: { name: "value", description: "Text to show", type: STRING, required: true },
    resolve: ({ value }) => value,
  },
  date: {
    option: { name: "date", description: "YYYY-MM-DD, defaults to today", type: STRING, required: false },
    resolve: ({ date }) => {
      const value = date || new Date().toISOString().slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`"${value}" is not a YYYY-MM-DD date.`)
      return value
    },
  },
  image: {
    option: { name: "file", description: "Image to show", type: ATTACHMENT, required: true },
    resolve: ({ file }) => uploadImage(file),
  },
}

export const options = [
  ...panels.map((panel) => ({
    name: panel.id,
    description: panel.description,
    type: SUBCOMMAND,
    options: [types[panel.type].option],
  })),
  { name: "show", description: "Show what the TV is displaying right now", type: SUBCOMMAND },
]

export async function run(data) {
  const [command] = data.options

  if (command.name === "show") {
    const state = await readState()
    return panels.map((panel) => `**${panel.id}** — \`${state[panel.id]}\``).join("\n")
  }

  const panel = panels.find((candidate) => candidate.id === command.name)
  const value = await types[panel.type].resolve(argumentsOf(command, data.resolved))
  await writeState(panel.id, value)

  return `**${panel.id}** is now \`${value}\`.`
}

function argumentsOf(command, resolved) {
  const args = {}
  for (const option of command.options || []) {
    args[option.name] = option.type === ATTACHMENT ? resolved.attachments[option.value] : option.value
  }
  return args
}

async function uploadImage(attachment) {
  if (!attachment.content_type?.startsWith("image/")) throw new Error("That file is not an image.")
  if (attachment.size > MAX_IMAGE_BYTES) throw new Error("That image is over 8 MB.")

  const response = await fetch(attachment.url)
  if (!response.ok) throw new Error("Could not download that image from Discord.")

  const body = Buffer.from(await response.arrayBuffer())
  return storeImage(slug(attachment.filename), attachment.content_type, body)
}

function slug(filename) {
  return filename.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
}
