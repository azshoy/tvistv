
var lastTimePerttiGotStuck = "2026-08-05"


var daysSinceStuck = Math.round((Date.now() - Date.parse(lastTimePerttiGotStuck))/(1000*60*60*24))
document.getElementById("perttiStuckValue").innerText = daysSinceStuck