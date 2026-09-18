
function manual() {
  var lastTimePerttiGotStuck = "2026-08-28";
  var daysSinceStuck = Math.round((Date.now() - Date.parse(lastTimePerttiGotStuck))/(1000*60*60*24) + 0.5);
  document.getElementById("perttiStuckValue").innerText = daysSinceStuck;
}

async function get_last_stuck_from_server() {
  const result = await APIget("/keyvalue/perttiStuck");
  if (result && result.value) {
    var daysSinceStuck = Math.round((Date.now() - Date.parse(result.value))/(1000*60*60*24) + 0.5);
    document.getElementById("perttiStuckValue").innerText = daysSinceStuck;
  }
}

get_last_stuck_from_server()
