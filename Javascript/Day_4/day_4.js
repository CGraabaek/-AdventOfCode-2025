const fs = require("fs");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput =
  process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\n");

console.log(`Using ${useTestInput ? "TEST" : "REAL"} input`);

function getAllAdjacentPositions(x, y, grid) {
  const directions = [
    [-1, -1],
    [0, -1],
    [1, -1], // Top row
    [-1, 0],
    [1, 0], // Middle row (excluding center)
    [-1, 1],
    [0, 1],
    [1, 1], // Bottom row
  ];

  return directions.reduce((count, [dx, dy]) => {
    const newY = y + dy;
    const newX = x + dx;

    // Only count @ symbols, not x or .
    if (grid[newY] && grid[newY][newX] === "@") {
      count++;
    }
    return count;
  }, 0);
}

function handleGrid(grid) {
  let totalThatCanBeReached = 0;
  let newGrid = [];

  for (let y = 0; y < grid.length; y++) {
    let newLine = "";
    for (let x = 0; x < grid[y].length; x++) {
      let char = grid[y][x];

      // Convert previous iteration's x to .
      if (char === "x") {
        char = ".";
      }
      // Check if current @ should be removed
      else if (char === "@") {
        let adjacentCount = getAllAdjacentPositions(x, y, grid);
        if (adjacentCount < 4) {
          char = "x"; // Mark for removal
          totalThatCanBeReached++;
        }
      }

      newLine += char;
    }
    newGrid.push(newLine);
  }
  return { newGrid, iterationTotal: totalThatCanBeReached };
}

// Part 1
console.log("----- PART 1 -----");

let part1 = handleGrid(puzzleInput);
console.log("P1: Total rolls of paper that can be reached:",part1.iterationTotal);


// Part 2
console.log("\n----- PART 2 -----");
let totalReachableWithRemoval = 0;
let newGrid = [...puzzleInput];
let iterationCount = 0;

// Show initial state
console.log("\nInitial state:");
for (const line of newGrid) {
  console.log(line);
}

// Keep removing until no more can be removed
while (true) {
  let result = handleGrid(newGrid);

  if (result.iterationTotal === 0) {
    break;
  }

  newGrid = result.newGrid;
  totalReachableWithRemoval += result.iterationTotal;
  iterationCount++;

  console.log(`\nRemove ${result.iterationTotal} rolls of paper:`);
  for (const line of newGrid) {
    console.log(line);
  }
}

console.log(`\n P2: Total removed: ${totalReachableWithRemoval}`);
