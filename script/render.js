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

fetch("data/state.json?t=" + Date.now())
  .then((response) => response.json())
  .then((state) => {
    for (const [panel, value] of Object.entries(state)) {
      const element = document.querySelector(`[data-panel="${panel}"]`)
      if (element) apply(element, value)
    }
  })
  .catch(console.error)
