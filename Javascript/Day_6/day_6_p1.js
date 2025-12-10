const fs = require("fs");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput =
  process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\n");

const puzzleInputHandled = puzzleInput.map((line) => {
  return line.trim().split(/\s+/); // Example processing: split by whitespace
});

console.log(`Using ${useTestInput ? "TEST" : "REAL"} input`);

const arrayColumn = (arr, n) => arr.map((x) => x[n]);

function handleOperation(operation, values) {
  switch (operation) {
    case "+":
      return values.reduce((a, b) => a + b, 0);
    case "*":
      return values.reduce((a, b) => a * b, 1);
    default:
      return null;
  }
}

// Part 1
let totalSum = 0;
let lineLenth = puzzleInputHandled[0].length;

for (var i = 0; i < lineLenth; i++) {
  let col = arrayColumn(puzzleInputHandled, i);

  let operations = col[col.length - 1]; // Example: last element as operation
  let sum = handleOperation(operations, col.slice(0, -1).map(Number));
  totalSum += sum;
}
console.log("P1 - Total Sum:", totalSum);