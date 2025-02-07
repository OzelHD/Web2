// Get the initial grid size from the size slider.
let gridSize = parseInt(document.getElementById("sizeRange").value, 10) || 50;
let rows = gridSize;
let cols = gridSize;
let cellSize = 500 / gridSize; // cell size in pixels: 500 divided by grid size

const canvas = document.getElementById("gameView");
const ctx = canvas.getContext("2d");

// Set the canvas internal dimensions based on rows, cols, and cellSize.
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// Define the colors for alive cells and grid lines (using hexadecimal values)
const aliveColor = "#ff9100"; // for example, a bright orange
const gridColor  = "#1b2631"; // the blue you always use

// Initialize the grid with random states (~20% live)
let grid = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => (Math.random() > 0.8 ? 1 : 0))
);

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === 1) {
        ctx.fillStyle = aliveColor;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      } else {
        ctx.strokeStyle = gridColor;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

function countLiveNeighbors(grid, x, y) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      let nx = x + dx,
          ny = y + dy;
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        count += grid[nx][ny];
      }
    }
  }
  return count;
}

function nextGeneration() {
  const newGrid = grid.map(arr => [...arr]);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const neighbors = countLiveNeighbors(grid, row, col);
      if (grid[row][col] === 1) {
        if (neighbors < 2 || neighbors > 3) {
          newGrid[row][col] = 0;
        }
      } else {
        if (neighbors === 3) {
          newGrid[row][col] = 1;
        }
      }
    }
  }
  grid = newGrid;
}

/* ------------------ Speed Control ------------------ */
let timerId = null;

// Returns the delay (in ms) based on the speed slider value.
// Speed 0: pause; 1: 100ms; 2: 50ms; 3: 30ms.
function getDelayFromSpeed(speedVal) {
  if (speedVal === 1) return 100;
  if (speedVal === 2) return 50;
  if (speedVal === 3) return 33;
  if (speedVal === 4) return 25;
  if (speedVal === 5) return 20;
  return null; // pause when speedVal is 0
}

function scheduleNextUpdate() {
  const speedVal = parseInt(document.getElementById("speedRange").value, 10);
  const delay = getDelayFromSpeed(speedVal);
  if (delay === null) {
    timerId = null; // simulation paused
    return;
  }
  timerId = setTimeout(() => {
    nextGeneration();
    drawGrid();
    scheduleNextUpdate();
  }, delay);
}

scheduleNextUpdate();

document.getElementById("speedRange").addEventListener("input", function (e) {
  const speedVal = parseInt(e.target.value, 10);
  document.getElementById("speedValue").textContent = speedVal + "x";
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  scheduleNextUpdate();
});

/* ------------------ Size Slider Control ------------------ */
document.getElementById("sizeRange").addEventListener("input", function (e) {
  // Get the new grid size from the slider.
  let newSize = parseInt(e.target.value, 10);
  document.getElementById("sizeValue").textContent = newSize;
  
  // Update grid dimensions.
  rows = newSize;
  cols = newSize;
  cellSize = 500 / newSize;  // recalc cell size
  
  // Update the canvas size.
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  
  // Reinitialize the grid (here we clear it; you could also randomize if desired).
  grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
  drawGrid();
});

/* ------------------ Click to Toggle Cells ------------------ */
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  // Compute scale factors in case CSS scales the canvas.
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    grid[row][col] = grid[row][col] ? 0 : 1;
    drawGrid();
  }
});

/* ------------------ Preset Functions ------------------ */
function applyPreset(preset) {
  // Clear the grid (all cells dead)
  grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
  // Choose a central position as an origin (for some presets)
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  
  switch (preset) {
    case "glider":
      grid[centerRow - 1][centerCol] = 1;
      grid[centerRow][centerCol + 1] = 1;
      grid[centerRow + 1][centerCol - 1] = 1;
      grid[centerRow + 1][centerCol] = 1;
      grid[centerRow + 1][centerCol + 1] = 1;
      break;
    case "blinker":
      grid[centerRow][centerCol - 1] = 1;
      grid[centerRow][centerCol] = 1;
      grid[centerRow][centerCol + 1] = 1;
      break;
    case "block":
      grid[centerRow][centerCol] = 1;
      grid[centerRow][centerCol + 1] = 1;
      grid[centerRow + 1][centerCol] = 1;
      grid[centerRow + 1][centerCol + 1] = 1;
      break;
    case "toad":
      grid[centerRow][centerCol - 1] = 1;
      grid[centerRow][centerCol] = 1;
      grid[centerRow][centerCol + 1] = 1;
      grid[centerRow + 1][centerCol - 2] = 1;
      grid[centerRow + 1][centerCol - 1] = 1;
      grid[centerRow + 1][centerCol] = 1;
      break;
    case "random":
      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() > 0.8 ? 1 : 0))
      );
      break;
    case "gliderGun":
      // Gosper Glider Gun preset.
      const offsetRow = 0;
      const offsetCol = 5;
      const gliderGunCoords = [
        [1, 5], [2, 5], [1, 6], [2, 6],
        [11, 5], [11, 6], [11, 7],
        [12, 4], [12, 8],
        [13, 3], [13, 9],
        [14, 3], [14, 9],
        [15, 6],
        [16, 4], [16, 8],
        [17, 5], [17, 6], [17, 7],
        [18, 6],
        [21, 3], [21, 4], [21, 5],
        [22, 3], [22, 4], [22, 5],
        [23, 2], [23, 6],
        [25, 1], [25, 2], [25, 6], [25, 7],
        [35, 3], [35, 4], [36, 3], [36, 4]
      ];
      gliderGunCoords.forEach(([r, c]) => {
        const row = offsetRow + r;
        const col = offsetCol + c;
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          grid[row][col] = 1;
        }
      });
      break;
    case "clear":
      // Leave grid cleared.
      break;
    default:
      console.warn("Unknown preset:", preset);
  }
  drawGrid();
}

document.querySelector("#menuContent").addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "button") {
    const preset = e.target.getAttribute("data-preset");
    applyPreset(preset);
  }
});

/* ------------------ Hamburger Menu Toggle ------------------ */
document.getElementById("syntaxMenuButton").addEventListener("click", () => {
  const menu = document.getElementById("menuContent");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
});

/* ------------------ Draggable Menu ------------------ */
(function () {
  const menu = document.getElementById("menuContent");
  let isDragging = false;
  let offsetX, offsetY;
  menu.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - menu.offsetLeft;
    offsetY = e.clientY - menu.offsetTop;
    menu.style.zIndex = 10000;
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      menu.style.left = (e.clientX - offsetX) + "px";
      menu.style.top = (e.clientY - offsetY) + "px";
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
})();
