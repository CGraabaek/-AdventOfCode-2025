const fs = require("fs");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput =
  process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\n");

console.log(`Using ${useTestInput ? "TEST" : "REAL"} input`);

function getAllAdjacentPositions(x, y) {
  let adjectCount = 0;

  let row0 = puzzleInput[y - 1];
  let row1 = puzzleInput[y];
  let row2 = puzzleInput[y + 1];

  if (row0) {
    if (row0[x - 1] == "@") {
      adjectCount++;
    }
    if (row0[x] == "@") {
      adjectCount++;
    }
    if (row0[x + 1] == "@") {
      adjectCount++;
    }
  }
  if (row1) {
    if (row1[x - 1] == "@") {
      adjectCount++;
    }
    if (row1[x + 1] == "@") {
      adjectCount++;
    }
  }
  if (row2) {
    if (row2[x - 1] == "@") {
      adjectCount++;
    }
    if (row2[x] == "@") {
      adjectCount++;
    }
    if (row2[x + 1] == "@") {
      adjectCount++;
    }
  }
  return adjectCount;
}

let startY = 0;

let newArray = [];
let totalThatCanBeREached = 0;

for (const line of puzzleInput) {
  console.log(line);
  let newLine = [];
  let startX = 0;
  for (const char of line) {
    let newChar = char;
    if (char == "@") {
      let adjacentCount = getAllAdjacentPositions(startX, startY);
      if (adjacentCount < 4) {
        totalThatCanBeREached++;
        newChar = "x";
      }
    }
    newLine.push(newChar);

    startX++;
  }
  newArray.push(newLine.join(""));
  startY++;
}

console.log("Total that can be reached: ", totalThatCanBeREached);

for (const line of newArray) {
  console.log(line);
}
