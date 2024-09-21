// Clock
const timeRef = document.getElementById("timeElement");
const dateRef = document.getElementById("dateElement");
const clockArrowRef = document.getElementById("clockArrowElement");
const goldDisplayRef = document.getElementById("goldDisplayCount");

const dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thu.", "Fri.", "Sat."];

function dateUpdate() {
  let dt = new Date();
  // dt = new Date("December 17, 1995 1:00:00");
  var h = dt.getHours();
  var m = dt.getMinutes();
  var s = dt.getSeconds();
  timeRef.innerHTML = dt
    .toLocaleTimeString()
    .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")
    .toLowerCase();

  dateRef.innerHTML = dayNames[dt.getDay()] + " " + dt.getDate();

  var secondsUntilEndOfDate = 24 * 60 * 60 - h * 60 * 60 - m * 60 - s;
  var percentOfDayLeft = secondsUntilEndOfDate / 86400;
  // console.log(percentOfDayLeft);

  clockArrowRef.style.transform = "rotate(" + percentOfDayLeft * -180 + "deg)";
}

dateUpdate();

var appTick = window.setInterval(function () {
  dateUpdate();
}, 1000);

function stopTick() {
  clearInterval(appTick);
}
