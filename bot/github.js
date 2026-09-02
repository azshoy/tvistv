const API = "https://api.github.com"
const REPO = process.env.GITHUB_REPO
const BRANCH = process.env.GITHUB_BRANCH || "master"

const headers = {
  authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  accept: "application/vnd.github+json",
  "user-agent": "tvistv-bot",
}

export async function readJson(path) {
  const file = await getFile(path)
  if (!file) throw new Error(`${path} is missing from ${REPO}.`)
  return JSON.parse(Buffer.from(file.content, "base64").toString())
}

export async function putFile(path, content, message) {
  // A 409 means someone else committed between our read and write, so read the sha again
  for (let attempt = 0; attempt < 2; attempt++) {
    const existing = await getFile(path)
    const response = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        message,
        branch: BRANCH,
        content: Buffer.from(content).toString("base64"),
        sha: existing?.sha,
      }),
    })

    if (response.ok) return
    if (response.status !== 409) throw new Error(await describe(response))
  }
  throw new Error(`Could not update ${path}, something else keeps changing it.`)
}

async function getFile(path) {
  const response = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, { headers })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(await describe(response))
  return response.json()
}

async function describe(response) {
  return `GitHub said ${response.status}: ${await response.text()}`
}
