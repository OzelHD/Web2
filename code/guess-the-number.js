// Get elements by their IDs.
const canvas    = document.getElementById("gameView");
const inputText = document.getElementById("inputText");
const outputBox = document.getElementById("outputBox");
const counterBox = document.getElementById("counterBox"); // Make sure this element exists in your HTML.
const flashToggle = document.getElementById("flashToggle");

let winAudio = null;
let flashInterval = null; // For flashing the background & other elements.
let flashingEnabled = true; // Flag to track if flashing is enabled.


let flashToggleInterval = null;

const winSounds = [
  "./sounds/RainingTacos.mp3"
];

// Generate a random number between 0 and 1000.
let randomNumber = Math.floor(Math.random() * 1001);
let counter = 0;

function updateCounterBox() {
  counterBox.textContent = `Tries: ${counter}`;
  
  let factor = Math.min(counter / 20, 1);
  const startColor = { red: 144, green: 238, blue: 144 };
  const endColor   = { red: 255, green: 0,   blue: 0 };
  
  let red   = Math.round(startColor.red   + factor * (endColor.red   - startColor.red));
  let green = Math.round(startColor.green + factor * (endColor.green - startColor.green));
  let blue  = Math.round(startColor.blue  + factor * (endColor.blue  - startColor.blue));
  
  counterBox.style.borderColor = `rgb(${red}, ${green}, ${blue})`;
}
updateCounterBox();



// Stop win sound
function stopWinAudio() {
  if (winAudio) {
    winAudio.pause();
    winAudio.currentTime = 0;
    winAudio = null;
  }
  stopFlashingAnimation();
}

// flashing
function startFlashingAnimation() {
  if (!flashingEnabled) return; 
  
  if (flashInterval) {
    clearInterval(flashInterval);
  }
  flashInterval = setInterval(() => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    
    
    document.body.style.backgroundColor = randomColor;
    document.body.style.transition = "background-color 0.3s ease-in-out";    
    /*
    inputText.style.backgroundColor = randomColor;
    outputBox.style.backgroundColor = randomColor;
    */
  }, 180);
}


function stopFlashingAnimation() {
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = null;
  }
  document.body.style.backgroundColor = "";
  inputText.style.backgroundColor = "";
  outputBox.style.backgroundColor = "";
}


function startFlashToggleBorderAnimation() {
  if (flashToggleInterval) {
    clearInterval(flashToggleInterval);
  }
  flashToggleInterval = setInterval(() => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    flashToggle.style.borderColor = randomColor;
    flashToggle.style.transition = "border-color 0.6s ease-in-out";
  }, 250);
}

function stopFlashToggleBorderAnimation() {
  if (flashToggleInterval) {
    clearInterval(flashToggleInterval);
    flashToggleInterval = null;
  }
  
  flashToggle.style.borderColor = "red";
}


function lowOrhigh(input) {

  stopWinAudio();

  if (input < randomNumber) {
    outputBox.style.borderColor = "rgb(255, 255, 255)";
    outputBox.style.transition = "border-color 0.6s ease-in-out";
    outputBox.textContent = "Higher!";
    counter++;
  } else if (input > randomNumber) {
    outputBox.style.borderColor = "rgb(255, 255, 255)";
    outputBox.style.transition = "border-color 0.6s ease-in-out";
    outputBox.textContent = "Lower!";
    counter++;
  } else {
    outputBox.textContent = `You got it! The number was ${randomNumber}. You had ${counter} tries.`;
    outputBox.style.borderColor = "rgb(144, 238, 144)";
    outputBox.style.transition = "border-color 0.6s ease-in-out";
    
    // Play win sound.
    const randomIndex = Math.floor(Math.random() * winSounds.length);
    winAudio = new Audio(winSounds[randomIndex]);
    winAudio.play();
    

    startFlashingAnimation();
    
    winAudio.addEventListener('ended', stopFlashingAnimation);

    counter = 0;
    randomNumber = Math.floor(Math.random() * 1001);
  }
  updateCounterBox();
}

inputText.addEventListener("keydown", function (evt) {
  const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Tab"];

  if (evt.key === "Enter" || evt.key === "NumpadEnter") {
    stopWinAudio();
    const guess = parseInt(inputText.value, 10);
    if (!isNaN(guess)) {
      lowOrhigh(guess);
    }
    inputText.value = "";
    evt.preventDefault();
    return;
  }

  if (/^[0-9]$/.test(evt.key)) return;
  if (evt.code && /^Numpad[0-9]$/.test(evt.code)) return;
  if (!allowedKeys.includes(evt.key)) {
    evt.preventDefault();
  }
});


flashToggle.addEventListener("click", function() {
  flashingEnabled = !flashingEnabled;
  if (flashingEnabled) {
    flashToggle.textContent = "Disable Colors";
    startFlashToggleBorderAnimation();
  } else {
    flashToggle.textContent = "Enable Colors";
    stopFlashToggleBorderAnimation();
  }
});

if (flashingEnabled) {
  startFlashToggleBorderAnimation();
}