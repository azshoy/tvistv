import { GoogleAuth } from "google-auth-library"

const DATABASE = process.env.RTDB_URL
const BUCKET = process.env.IMAGE_BUCKET

const auth = new GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/firebase.database",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/devstorage.read_write",
  ],
})

export async function readState() {
  const response = await call(`${DATABASE}/state.json`)
  return (await response.json()) ?? {}
}

export async function writeState(panel, value) {
  await call(`${DATABASE}/state/${panel}.json`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  })
}

export async function storeImage(name, contentType, body) {
  const object = `wall/${Date.now()}-${name}`
  const upload = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${BUCKET}/o`)
  upload.searchParams.set("uploadType", "media")
  upload.searchParams.set("name", object)

  await call(upload, { method: "POST", headers: { "content-type": contentType }, body })
  return `https://storage.googleapis.com/${BUCKET}/${object}`
}

async function call(url, init = {}) {
  const token = await auth.getAccessToken()
  const response = await fetch(url, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`${new URL(url).host} said ${response.status}: ${await response.text()}`)
  }
  return response
}
