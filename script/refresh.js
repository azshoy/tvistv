const fullRefreshIntervalHours = 24
const hiddenRefreshIntervalMinutes = 5

let current = 1

function fullReload() {
  window.location.reload();
}
function getNextId() {
  let next = current + 1
  if (next === 3) next = 1
  return "refresh" + next
}
function hiddenReload() {
  let next = getNextId()
  document.getElementById(next).classList.add('behind');
  document.getElementById(next).classList.add('invisible');
  document.getElementById(next).src = document.getElementById(next).src
  setTimeout(hiddenReloadShow, 1000 * 5)
}
function hiddenReloadShow() {
  let next = getNextId()
  document.getElementById("refresh" + current).classList.remove('front');
  document.getElementById(next).classList.remove('behind');
  document.getElementById(next).classList.remove('invisible');
  document.getElementById(next).classList.add('front');
  current += 1
  if (current === 3) current = 1
  setTimeout(hiddenReload, 1000 * 60 * hiddenRefreshIntervalMinutes)
}

setTimeout(fullReload, 1000 * 60 * 60 * fullRefreshIntervalHours)
setTimeout(hiddenReload, 1000 * 60 * hiddenRefreshIntervalMinutes)