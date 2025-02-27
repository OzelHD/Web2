// Fac.js
// This demo implements a grid-based factory game with WASD movement, resource nodes,
// building placement via a hotbar, and a modular structure for buildings and recipes.

// ---------------------
// Global Variables & Settings
// ---------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 32;               // Each grid cell is 32x32 pixels
const viewWidth = canvas.width;
const viewHeight = canvas.height;

// Camera offset controls the visible part of the grid (simulate nearly infinite grid)
let cameraX = 0;
let cameraY = 0;

// Store resource nodes and buildings
let resourceNodes = [];
let buildings = [];

// Current building type selected from hotbar (null if none)
let currentBuildingType = null;

// Define ore types for resource nodes
const oreTypes = ['coal', 'iron', 'gold', 'copper', 'limestone'];

// ---------------------
// Recipes and Building Specs
// ---------------------

// Example recipes (each recipe: [input] [amount] [duration in ms] [output] [amount])
const recipes = {
  smelter: [
    { input: 'copper ore', inputAmount: 1, duration: 5000, output: 'copper', outputAmount: 1 },
    { input: 'iron ore', inputAmount: 1, duration: 5000, output: 'iron', outputAmount: 1 }
  ],
  constructor: [
    { input: 'limestone', inputAmount: 1, duration: 3000, output: 'concrete', outputAmount: 1 }
  ]
  // Additional recipes can be added here.
};

// Building size definitions (in grid cells)
const buildingSizes = {
  miner: { w: 3, h: 3 },
  constructor: { w: 3, h: 3 },
  smelter: { w: 1, h: 3 },
  storage: { w: 5, h: 5 }
};

// ---------------------
// Utility Functions
// ---------------------

// Convert grid coordinate to canvas pixel coordinate
function gridToCanvas(x, y) {
  return {
    x: (x * cellSize) - cameraX,
    y: (y * cellSize) - cameraY
  };
}

// Check if a given grid cell is within the visible area
function isCellVisible(x, y) {
  const pos = gridToCanvas(x, y);
  return pos.x + cellSize >= 0 && pos.x < viewWidth && pos.y + cellSize >= 0 && pos.y < viewHeight;
}

// ---------------------
// Resource Nodes Generation
// ---------------------

// Generate resource nodes scattered randomly over a large grid area
function generateResourceNodes() {
  // For demo purposes, generate 100 resource nodes within grid coordinates [-50, 50]
  for (let i = 0; i < 100; i++) {
    const node = {
      x: Math.floor(Math.random() * 101) - 50,
      y: Math.floor(Math.random() * 101) - 50,
      type: oreTypes[Math.floor(Math.random() * oreTypes.length)]
    };
    resourceNodes.push(node);
  }
}
generateResourceNodes();

// ---------------------
// Input Handling: WASD Movement
// ---------------------

document.addEventListener('keydown', e => {
  switch (e.key.toLowerCase()) {
    case 'w': cameraY -= cellSize; break;
    case 'a': cameraX -= cellSize; break;
    case 's': cameraY += cellSize; break;
    case 'd': cameraX += cellSize; break;
  }
});

// ---------------------
// Hotbar & Building Placement
// ---------------------

// Hotbar button click events
const hotbarButtons = document.querySelectorAll('#hotbar button');
hotbarButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active state from all buttons
    hotbarButtons.forEach(btn => btn.classList.remove('active'));
    // Set active button and current building type
    button.classList.add('active');
    currentBuildingType = button.getAttribute('data-building');
  });
});

// Handle canvas clicks for building placement
canvas.addEventListener('click', e => {
  if (!currentBuildingType) return; // No building selected

  // Get mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Convert to grid coordinates
  const gridX = Math.floor((mouseX + cameraX) / cellSize);
  const gridY = Math.floor((mouseY + cameraY) / cellSize);

  placeBuilding(gridX, gridY, currentBuildingType);
});

// ---------------------
// Building Placement Logic
// ---------------------

// Place a building of a given type at grid coordinates (gridX, gridY)
function placeBuilding(gridX, gridY, type) {
  const size = buildingSizes[type];
  if (!size) return;

  // Check for collisions with existing buildings
  for (let b of buildings) {
    if (rectsOverlap(gridX, gridY, size.w, size.h, b.x, b.y, b.w, b.h)) {
      console.log('Cannot place building here; space is occupied.');
      return;
    }
  }

  // For a Miner, ensure at least one resource node exists under its footprint.
  if (type === 'miner') {
    let foundOre = false;
    for (let x = gridX; x < gridX + size.w; x++) {
      for (let y = gridY; y < gridY + size.h; y++) {
        if (resourceNodes.some(node => node.x === x && node.y === y)) {
          foundOre = true;
          break;
        }
      }
      if (foundOre) break;
    }
    if (!foundOre) {
      console.log('Miner must be placed over at least one ore deposit.');
      return;
    }
  }

  // TODO: Check resource cost from the "core" storage and deduct costs.

  // Create building object
  let building = {
    type: type,
    x: gridX,
    y: gridY,
    w: size.w,
    h: size.h,
    tier: 1, // Starting tier
    // For smelter and constructor, attach a default recipe (if available)
    recipe: recipes[type] ? recipes[type][0] : null
  };
  buildings.push(building);
  console.log(`Placed ${type} at (${gridX}, ${gridY})`);
}

// Check if two rectangles in grid coordinates overlap
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 <= x2 || x1 >= x2 + w2 || y1 + h1 <= y2 || y1 >= y2 + h2);
}

// ---------------------
// Optional: Building Interaction (Right-Click to Open Menu)
// ---------------------

canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  // Get mouse position and convert to grid coordinates
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const gridX = Math.floor((mouseX + cameraX) / cellSize);
  const gridY = Math.floor((mouseY + cameraY) / cellSize);

  // Check if a building exists at this grid cell
  for (let b of buildings) {
    if (gridX >= b.x && gridX < b.x + b.w &&
        gridY >= b.y && gridY < b.y + b.h) {
      // Open a simple alert menu (for demo purposes) to show/change recipe
      if (b.recipe) {
        alert(`Building: ${b.type}\nTier: ${b.tier}\nRecipe:\n${b.recipe.input} (${b.recipe.inputAmount}) → ${b.recipe.output} (${b.recipe.outputAmount})\nProcessing Time: ${b.recipe.duration}ms\n\n(To modify, add UI controls here.)`);
      } else {
        alert(`Building: ${b.type}\n(No configurable recipe)`);
      }
      return;
    }
  }
});

// ---------------------
// Rendering the Grid and Game Objects
// ---------------------

function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  // Draw grid lines (only draw visible cells)
  const startX = Math.floor(cameraX / cellSize);
  const startY = Math.floor(cameraY / cellSize);
  const cols = Math.ceil(viewWidth / cellSize) + 1;
  const rows = Math.ceil(viewHeight / cellSize) + 1;

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  for (let i = 0; i < cols; i++) {
    let x = (startX + i) * cellSize - cameraX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewHeight);
    ctx.stroke();
  }
  for (let j = 0; j < rows; j++) {
    let y = (startY + j) * cellSize - cameraY;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewWidth, y);
    ctx.stroke();
  }

  // Draw resource nodes (as colored circles)
  resourceNodes.forEach(node => {
    if (isCellVisible(node.x, node.y)) {
      const pos = gridToCanvas(node.x, node.y);
      ctx.fillStyle = getOreColor(node.type);
      ctx.beginPath();
      ctx.arc(pos.x + cellSize/2, pos.y + cellSize/2, cellSize/3, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  // Draw buildings
  buildings.forEach(b => {
    // For each cell the building occupies, draw a colored block.
    for (let x = b.x; x < b.x + b.w; x++) {
      for (let y = b.y; y < b.y + b.h; y++) {
        if (isCellVisible(x, y)) {
          const pos = gridToCanvas(x, y);
          ctx.fillStyle = getBuildingColor(b.type);
          ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
          ctx.strokeStyle = "#000";
          ctx.strokeRect(pos.x, pos.y, cellSize, cellSize);
        }
      }
    }
    // Optionally, draw building type text at the center of the building (if visible)
    const center = gridToCanvas(b.x + b.w / 2, b.y + b.h / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.type, center.x, center.y);
  });

  // Draw player as a highlighted cell at the center of the canvas
  const playerSize = cellSize;
  ctx.fillStyle = "#0f0";
  ctx.fillRect(viewWidth/2 - playerSize/2, viewHeight/2 - playerSize/2, playerSize, playerSize);
}

// Utility to get a color for each ore type
function getOreColor(type) {
  switch(type) {
    case 'coal': return "#555";
    case 'iron': return "#b7410e";
    case 'gold': return "#ffd700";
    case 'copper': return "#b87333";
    case 'limestone': return "#ccc";
    default: return "#fff";
  }
}

// Utility to get building colors based on type
function getBuildingColor(type) {
  switch(type) {
    case 'miner': return "#0077be";
    case 'constructor': return "#8a2be2";
    case 'smelter': return "#d2691e";
    case 'storage': return "#4682b4";
    default: return "#999";
  }
}

// ---------------------
// Game Loop
// ---------------------

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

/*
  Future expansion ideas:
  - Implement actual resource extraction, processing timers using the recipe.duration modified by building tier.
  - Add cost deduction from a central core storage when placing buildings.
  - Expand transportation systems (belts and trains) with speed modifiers.
  - Create a UI for upgrading building tiers and modifying recipes.
  - Make the grid “infinite” by only tracking visible portions.
  
  The code is commented and structured modularly so that adding new building types, recipes, or
  features (like dynamic upgrades) is straightforward.
*/
