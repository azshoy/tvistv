# tvistv bot

Discord slash commands that update what the office TV shows.

`/tv info <text>`, `/tv pertti [date]`, `/tv image <file>`, `/tv show`.

State lives in a Firebase Realtime Database. The bot writes a single key per command; the TV
reads the database directly and streams changes, so an edit is on screen in about a second.
Uploaded images go to a public Cloud Storage bucket.

The bot answers Discord over HTTP instead of holding a gateway connection, so it sleeps
between commands. Nothing polls it — the TV talks to the database, not to this service — so it
genuinely scales to zero.

## Setup

### 1. Discord application

At <https://discord.com/developers/applications> → **New Application**.

- **General Information** — copy the *Application ID* and *Public Key*.
- **Bot** → *Reset Token* — copy it. Only `register.js` needs this one.
- **Installation** → *Guild Install*, scope `applications.commands` — use the install link to
  add it to the server.

In Discord, enable *Settings → Advanced → Developer Mode*, then right-click the server for
*Copy Server ID*, and the channel for *Copy Channel ID* if you want to lock the bot to one.

### 2. Database

Add Firebase to your GCP project at <https://console.firebase.google.com>, then *Build →
Realtime Database → Create Database*. Pick **europe-west1** — the Realtime Database only runs
in `us-central1`, `europe-west1` and `asia-southeast1`, so this is not the same list of regions
Cloud Run offers.

Rules — the TV reads without credentials, and only the bot's service account writes (a service
account bypasses these):

```json
{
  "rules": {
    ".read": true,
    ".write": false
  }
}
```

Seed it once with *⋮ → Import JSON* at the root, using [`data/seed.json`](../data/seed.json).

Put the database URL in `script/render.js` as well — it is public by design.

### 3. Image bucket

```sh
gcloud storage buckets create gs://tvistv-wall \
  --location=europe-north1 --uniform-bucket-level-access
gcloud storage buckets add-iam-policy-binding gs://tvistv-wall \
  --member=allUsers --role=roles/storage.objectViewer
```

Public read, because the TV loads the images straight from it.

### 4. Service account

```sh
PROJECT=$(gcloud config get-value project)
gcloud iam service-accounts create tvistv-bot

gcloud projects add-iam-policy-binding $PROJECT \
  --member=serviceAccount:tvistv-bot@$PROJECT.iam.gserviceaccount.com \
  --role=roles/firebasedatabase.admin
gcloud storage buckets add-iam-policy-binding gs://tvistv-wall \
  --member=serviceAccount:tvistv-bot@$PROJECT.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin
```

No key file anywhere: on Cloud Run the bot picks the credentials up from the metadata server.

### 5. Deploy

```sh
gcloud run deploy tvistv-bot \
  --source bot \
  --region europe-north1 \
  --service-account tvistv-bot@$PROJECT.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --set-env-vars "DISCORD_APP_ID=...,DISCORD_PUBLIC_KEY=...,RTDB_URL=https://tvistv-default-rtdb.europe-west1.firebasedatabase.app,IMAGE_BUCKET=tvistv-wall"
```

`--allow-unauthenticated` is required because Discord calls the URL; the Ed25519 signature
check in `discord.js` rejects anything that is not Discord. `--no-cpu-throttling` matters
because the bot keeps working after acknowledging the interaction, and Cloud Run would
otherwise freeze it mid-write.

### 6. Point Discord at it

Paste the Cloud Run URL into **General Information → Interactions Endpoint URL** and save.
Discord sends a signed PING and refuses the URL if the reply is wrong, so a successful save
means the deployment works.

### 7. Register the commands

```sh
cp bot/.env.example bot/.env   # fill it in
cd bot && npm install && npm run register
```

Guild-scoped, so they appear immediately. Re-run after changing `panels.js`.

Restrict who can use them in *Server Settings → Integrations → tvistv bot*, per command or
per role. Cheaper than doing it in code, and easier to change.

## Adding a panel

1. Add `data-panel="<key>"` to the element in `view.html` — an `<img>` gets its `src` set,
   anything else gets its text. `data-format="days-since"` renders a date as a day count.
2. Add an entry to `bot/panels.js` and re-run `npm run register`.

The database picks up the new key on first write, so there is no schema to migrate.

## Running locally

```sh
gcloud auth application-default login   # once
cd bot && npm run dev
```

Expose it (`cloudflared tunnel --url http://localhost:8080` or similar) and point the
interactions endpoint at the tunnel while you work on it.
