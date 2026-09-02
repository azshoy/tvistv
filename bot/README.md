# tvistv bot

Discord slash commands that update what the office TV shows.

`/tv info <text>`, `/tv pertti [date]`, `/tv image <file>`, `/tv show`.

Each command commits `data/state.json` (and uploaded images) to this repo. GitHub Pages
rebuilds, and the TV picks it up on its next refresh — a couple of minutes end to end.

The bot answers Discord over HTTP instead of holding a gateway connection, so it can sleep
between commands. It is a plain Node server with no dependencies: run it on Cloud Run, a
droplet, or anything else that can expose an HTTPS URL.

## Setup

### 1. Discord application

At <https://discord.com/developers/applications> → **New Application**.

- **General Information** — copy the *Application ID* and *Public Key*.
- **Bot** → *Reset Token* — copy it. Only `register.js` needs this one.
- **Installation** → *Guild Install*, scope `applications.commands` — use the install link to
  add it to the server.

In Discord, enable *Settings → Advanced → Developer Mode*, then right-click the server for
*Copy Server ID*, and the channel for *Copy Channel ID* if you want to lock the bot to one.

### 2. GitHub token

A fine-grained token at <https://github.com/settings/personal-access-tokens> with access to
`azshoy/tvistv` only and **Contents: Read and write**. Nothing else.

### 3. Deploy

```sh
gcloud run deploy tvistv-bot \
  --source bot \
  --region europe-north1 \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --set-env-vars "DISCORD_APP_ID=...,DISCORD_PUBLIC_KEY=...,GITHUB_REPO=azshoy/tvistv,GITHUB_BRANCH=master" \
  --set-env-vars "GITHUB_TOKEN=..."
```

`--allow-unauthenticated` is required because Discord calls the URL; the Ed25519 signature
check in `discord.js` rejects anything that is not Discord. `--no-cpu-throttling` matters
because the bot keeps working after acknowledging the interaction. It still scales to zero.

Put `GITHUB_TOKEN` in Secret Manager and use `--set-secrets` instead if you would rather not
have it in the service config.

### 4. Point Discord at it

Paste the Cloud Run URL into **General Information → Interactions Endpoint URL** and save.
Discord sends a signed PING and refuses the URL if the reply is wrong, so a successful save
means the deployment works.

### 5. Register the commands

```sh
cp bot/.env.example bot/.env   # fill it in
cd bot && npm run register
```

Guild-scoped, so they appear immediately. Re-run after changing `panels.js`.

Restrict who can use them in *Server Settings → Integrations → tvistv bot*, per command or
per role. Cheaper than doing it in code, and easier to change.

## Adding a panel

1. Add a key to `data/state.json`.
2. Add `data-panel="<key>"` to the element in `view.html` — an `<img>` gets its `src` set,
   anything else gets its text. `data-format="days-since"` renders a date as a day count.
3. Add an entry to `bot/panels.js` and re-run `npm run register`.

Nothing else knows about the panels, so those three steps are the whole change.

## Running locally

```sh
cd bot && npm run dev
```

Expose it (`cloudflared tunnel --url http://localhost:8080` or similar) and point the
interactions endpoint at the tunnel while you work on it.
