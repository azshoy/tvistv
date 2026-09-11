
var lastTimePerttiGotStuck = "2026-08-07";


var daysSinceStuck = Math.round((Date.now() - Date.parse(lastTimePerttiGotStuck))/(1000*60*60*24) + 0.5);
document.getElementById("perttiStuckValue").innerText = daysSinceStuck;
