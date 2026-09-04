import { options } from "./commands.js"

const { DISCORD_APP_ID, DISCORD_GUILD_ID, DISCORD_BOT_TOKEN } = process.env

const response = await fetch(
  `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/guilds/${DISCORD_GUILD_ID}/commands`,
  {
    method: "PUT",
    headers: {
      authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify([{ name: "tv", description: "Update the office TV", options }]),
  },
)

if (!response.ok) {
  console.error(`Registration failed: ${response.status} ${await response.text()}`)
  process.exit(1)
}

console.log(`Registered /tv with ${options.length} subcommands`)
