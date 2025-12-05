const fs = require("fs");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput =
process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\n\n");
console.log(`Using ${useTestInput ? "TEST" : "REAL"} input \n`);

let freshIngredientsRange = puzzleInput[0]
  .split("\n")
  .map((line) => line.split("-").map(Number));
let ingredientStock = puzzleInput[1].split("\n").map((line) => Number(line));
let freshCount = 0;

function inRange(x, min, max) {
  return x >= min && x <= max;
}

ingredientStock.forEach((stock, index) => {
  for (let i = 0; i < freshIngredientsRange.length; i++) {
    const [min, max] = freshIngredientsRange[i];
    if (inRange(stock, min, max)) {
      freshCount++;
      return;
    }
  }
});

console.log(`P1 - Total fresh ingredients: ${freshCount}`);

// Need to handle overlapping ranges for P2, first we sort them and then merge
freshIngredientsRange.sort((a, b) => a[0] - b[0]);

let mergedRanges = [];
for (let range of freshIngredientsRange) {
  if (mergedRanges.length === 0) {
    mergedRanges.push(range);
  } else {
    let lastRange = mergedRanges[mergedRanges.length - 1];
    if (range[0] <= lastRange[1]) {
      // Overlapping ranges, merge them
      lastRange[1] = Math.max(lastRange[1], range[1]);
    } else {
      mergedRanges.push(range);
    }
  }
}

freshIngredientsRange = mergedRanges;
let freshIdsCount = freshIngredientsRange.reduce(
  (count, [min, max]) => count + (max - min + 1),
  0
);

console.log(`P2 - Total fresh ingredient IDs: ${freshIdsCount}`);
