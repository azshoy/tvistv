const refreshIntervalHours = 1


function reload() {
  window.location.reload();
}

setTimeout(reload, 1000 * 60 * 60 * refreshIntervalHours)