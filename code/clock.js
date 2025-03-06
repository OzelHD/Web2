// Clock.js

const deg = 6;
const hour = document.querySelector(".hour");
const min = document.querySelector(".min");
const sec = document.querySelector(".sec");

// Track continuous rotation values
let totalHH = 0, totalMM = 0, totalSS = 0; 

const setClock = () => {
  let day = new Date();
  let hh = day.getHours() * 30;
  let mm = day.getMinutes() * deg;
  let ss = day.getSeconds() * deg;

  // Adjust only when the hand resets to avoid a jump
  if (ss === 0) totalSS += 360; 
  if (mm === 0 && ss === 0) totalMM += 360;
  if (hh === 0 && mm === 0 && ss === 0) totalHH += 360;

  hour.style.transform = `rotateZ(${hh + mm / 12 + totalHH}deg)`;
  min.style.transform = `rotateZ(${mm + totalMM}deg)`;
  sec.style.transform = `rotateZ(${ss + totalSS}deg)`;
  if (ss === 0) {
    sec.classList.add("flash-green");
    setTimeout(() => sec.classList.remove("flash-green"), 1000);
  }

  if (min === 90) {   //lecture starts
    min.classList.add("flash-green");
    setTimeout(() => min.classList.remove("flash-green"), 60000);
  }

  if (mm === 0) {     //lecture ends
    min.classList.add("flash-green");
    setTimeout(() => min.classList.remove("flash-green"), 60000);
  }

                      //Lunch (or midnight)
  if (day.getHours() % 12 === 0 && mm === 0 && ss === 0) {
    hour.classList.add("flash-green");
    setTimeout(() => hour.classList.remove("flash-green"), 3600000);
  }
};

// First time
setClock();

// Update every second
setInterval(setClock, 1000);
