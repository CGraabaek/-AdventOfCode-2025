const fs = require("fs");
const readline = require("readline");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput =
  process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\n");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
};

// Clear screen and move cursor to top
function clearScreen() {
  console.clear();
  process.stdout.write("\x1b[H");
}

// Move cursor to position
function moveCursor(x, y) {
  process.stdout.write(`\x1b[${y};${x}H`);
}

// Hide/show cursor
function hideCursor() {
  process.stdout.write("\x1b[?25l");
}

function showCursor() {
  process.stdout.write("\x1b[?25h");
}

function getAllAdjacentPositions(x, y, grid) {
  const directions = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ];

  return directions.reduce((count, [dx, dy]) => {
    const newY = y + dy;
    const newX = x + dx;
    
    if (grid[newY] && grid[newY][newX] === "@") {
      count++;
    }
    return count;
  }, 0);
}

function handleGrid(grid) {
  let totalThatCanBeReached = 0;
  let newGrid = [];
  let removedPositions = [];
  
  for (let y = 0; y < grid.length; y++) {
    let newLine = "";
    for (let x = 0; x < grid[y].length; x++) {
      let char = grid[y][x];
      
      if (char === "x") {
        char = ".";
      } else if (char === "@") {
        let adjacentCount = getAllAdjacentPositions(x, y, grid);
        if (adjacentCount < 4) {
          char = "x";
          totalThatCanBeReached++;
          removedPositions.push({x, y});
        }
      }
      
      newLine += char;
    }
    newGrid.push(newLine);
  }
  return { newGrid, iterationTotal: totalThatCanBeReached, removedPositions };
}

function displayGrid(grid, highlightPositions = [], stats = {}, compact = false) {
  clearScreen();
  
  const terminalWidth = process.stdout.columns || 80;
  const terminalHeight = process.stdout.rows || 24;
  
  // Title
  console.log(colors.bright + colors.cyan + "═══ Paper Roll Removal Visualization ═══" + colors.reset);
  
  // Stats on same line to save space
  let statsLine = "";
  if (stats.iteration !== undefined) {
    statsLine += `Iteration: ${stats.iteration} `;
  }
  if (stats.removed !== undefined) {
    statsLine += `| Removed: ${stats.removed} `;
  }
  if (stats.totalRemoved !== undefined) {
    statsLine += `| Total: ${stats.totalRemoved}`;
  }
  console.log(colors.bright + statsLine + colors.reset);
  
  // Calculate if we need compact mode
  const gridWidth = grid[0]?.length || 0;
  const gridHeight = grid.length;
  const needsCompact = gridWidth > terminalWidth / 2 || gridHeight > terminalHeight - 10;
  
  if (needsCompact || compact) {
    // Ultra-compact mode for large grids
    console.log(colors.dim + `Grid size: ${gridWidth}x${gridHeight} (compact view)` + colors.reset);
    console.log();
    
    // Use single characters without spaces
    for (let y = 0; y < grid.length; y++) {
      let line = "";
      for (let x = 0; x < grid[y].length; x++) {
        const char = grid[y][x];
        
        if (char === "@") {
          let adjacentCount = getAllAdjacentPositions(x, y, grid);
          if (adjacentCount < 4) {
            line += colors.yellow + "●" + colors.reset;
          } else {
            line += colors.green + "●" + colors.reset;
          }
        } else if (char === "x") {
          line += colors.red + "×" + colors.reset;
        } else {
          line += colors.dim + "·" + colors.reset;
        }
      }
      console.log(line);
    }
  } else {
    // Regular mode with legend for smaller grids
    console.log();
    console.log(colors.dim + "Legend: " + 
                colors.green + "@ " + colors.reset + "= stable, " +
                colors.yellow + "@ " + colors.reset + "= will remove, " +
                colors.red + "x " + colors.reset + "= removing, " +
                colors.dim + ". " + colors.reset + "= empty");
    console.log();
    
    // Grid with spaces
    for (let y = 0; y < grid.length; y++) {
      let line = "";
      for (let x = 0; x < grid[y].length; x++) {
        const char = grid[y][x];
        
        if (char === "@") {
          let adjacentCount = getAllAdjacentPositions(x, y, grid);
          if (adjacentCount < 4) {
            line += colors.yellow + char + colors.reset + " ";
          } else {
            line += colors.green + char + colors.reset + " ";
          }
        } else if (char === "x") {
          line += colors.red + colors.bright + char + colors.reset + " ";
        } else {
          line += colors.dim + char + colors.reset + " ";
        }
      }
      console.log(line);
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVisualization() {
  hideCursor();
  
  // Increase max listeners to prevent warning
  process.stdin.setMaxListeners(20);
  
  let grid = [...puzzleInput];
  let totalRemoved = 0;
  let iteration = 0;
  let autoPlay = false;
  let delay = 1000; // milliseconds
  
  // Determine if we need compact mode
  const needsCompact = grid[0]?.length > 40 || grid.length > 20;
  
  try {
    // Initial display
    displayGrid(grid, [], { iteration, totalRemoved }, needsCompact);
    
    // Position controls at bottom
    const controlsY = Math.min(grid.length + 8, process.stdout.rows - 6);
    moveCursor(1, controlsY);
    
    console.log("\n" + colors.bright + "Controls:" + colors.reset);
    console.log("  SPACE = Next step | A = Auto-play | +/- = Speed | Q = Quit");
    console.log("\nPress SPACE to begin...");
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    while (true) {
      let key;
      
      if (autoPlay) {
        // Create a promise that resolves when a key is pressed
        let keyHandler;
        const keyPromise = new Promise(resolve => {
          keyHandler = (data) => {
            resolve(data.toString());
          };
          process.stdin.once('data', keyHandler);
        });
        
        // Race between keypress and timeout
        const winner = await Promise.race([
          keyPromise.then(k => ({ type: 'key', value: k })),
          sleep(delay).then(() => ({ type: 'timeout' }))
        ]);
        
        // Clean up the listener if timeout won
        if (winner.type === 'timeout') {
          process.stdin.removeListener('data', keyHandler);
          key = ' ';
        } else {
          key = winner.value;
        }
      } else {
        // Manual mode - wait for keypress
        key = await new Promise(resolve => {
          const handler = (data) => {
            resolve(data.toString());
          };
          process.stdin.once('data', handler);
        });
      }
      
      // Handle controls
      if (key.toLowerCase() === 'q') {
        break;
      } else if (key.toLowerCase() === 'a') {
        autoPlay = !autoPlay;
      } else if (key === '+' && delay > 100) {
        delay -= 100;
      } else if (key === '-' && delay < 5000) {
        delay += 100;
      }
      
      // Process next iteration
      if (key === ' ' || (autoPlay && key === ' ')) {
        let result = handleGrid(grid);
        
        if (result.iterationTotal === 0) {
          displayGrid(grid, [], { iteration, totalRemoved }, needsCompact);
          
          moveCursor(1, controlsY);
          console.log("\n" + colors.bright + colors.green + "Complete! No more paper rolls can be removed." + colors.reset);
          console.log("\nPress Q to quit...");
          autoPlay = false;
        } else {
          iteration++;
          totalRemoved += result.iterationTotal;
          
          // Show the x's being removed
          displayGrid(result.newGrid, result.removedPositions, {
            iteration,
            removed: result.iterationTotal,
            totalRemoved
          }, needsCompact);
          
          grid = result.newGrid;
        }
      }
      
      // Update control display
      moveCursor(1, controlsY + 4);
      console.log(colors.bright + "Status: " + colors.reset + 
                  (autoPlay ? colors.green + `AUTO-PLAY (${delay}ms)` : colors.yellow + "MANUAL") + 
                  colors.reset + "  ");
    }
  } finally {
    // Cleanup
    process.stdin.removeAllListeners('data');
    process.stdin.setRawMode(false);
    process.stdin.pause();
    showCursor();
    clearScreen();
    console.log("Visualization ended.");
  }
}

// Run the visualization
console.log(`Using ${useTestInput ? "TEST" : "REAL"} input`);
console.log(`Grid size: ${puzzleInput[0]?.length}x${puzzleInput.length}`);
runVisualization().catch(err => {
  process.stdin.removeAllListeners('data');
  process.stdin.setRawMode(false);
  process.stdin.pause();
  showCursor();
  console.error("Error:", err);
  process.exit(1);
});