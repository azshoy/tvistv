// Set this to your Realtime Database URL. Public read, so it is fine in the page.
const STATE = "https://tvistv-default-rtdb.europe-west1.firebasedatabase.app/state"

const DAY = 1000 * 60 * 60 * 24

// +0.5 so the counter rolls over at noon instead of midnight
function daysSince(date) {
  return Math.round((Date.now() - Date.parse(date)) / DAY + 0.5)
}

const formats = {
  "days-since": daysSince,
}

function apply(element, value) {
  if (element.tagName === "IMG") {
    element.src = value
    return
  }
  const format = formats[element.dataset.format]
  element.textContent = format ? format(value) : value
}

function paint(state) {
  for (const [panel, value] of Object.entries(state || {})) {
    const element = document.querySelector(`[data-panel="${panel}"]`)
    if (element) apply(element, value)
  }
}

fetch(`${STATE}.json`)
  .then((response) => response.json())
  .then(paint)
  .catch(console.error)

// The database streams changes, so edits show up without waiting for the next refresh.
// A whole-state event arrives on "/", a single panel on "/info" and the like.
if (window.EventSource) {
  new EventSource(`${STATE}.json`).addEventListener("put", (event) => {
    const { path, data } = JSON.parse(event.data)
    paint(path === "/" ? data : { [path.slice(1)]: data })
  })
}
