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
console.log("Puzzle Input:", puzzleInput);
console.log("Puzzle Input Handled:", puzzleInputHandled);

const arrayColumn = (arr, n) => arr.map((x) => x[n]);

// Extract columns based on operator positions in the last line
function getColumnsFromOperatorPositions(lines) {
  const opLine = lines[lines.length - 1];
  
  // Find positions of operators
  const opPositions = [];
  for (let i = 0; i < opLine.length; i++) {
    if (opLine[i] === '*' || opLine[i] === '+') {
      opPositions.push(i);
    }
  }
  
  // Extract columns based on operator positions
  const columns = [];
  for (let i = 0; i < opPositions.length; i++) {
    const start = opPositions[i];
    const end = (i < opPositions.length - 1) ? opPositions[i + 1] : opLine.length;
    const width = end - start;
    
    const colData = lines.map(line => line.substring(start, end).trimEnd());
    columns.push(colData);
  }
  
  return columns;
}

// Read column vertically and apply operation
// e.g. ['123', '045', '006', '*00'] → read positions vertically → [1, 24, 356] → 1 * 24 * 356
function processColumnVertically(column) {
  const values = column.slice(0, -1); // All except last (operator)
  const operation = column[column.length - 1].replace(/0/g, ""); // Remove 0s from operator

  const numLength = values[0].length;
  const verticalNumbers = [];

  for (let pos = 0; pos < numLength; pos++) {
    // Get digit at this position from each value, remove 0s, combine
    const digits = values
      .map((v) => v[pos])
      .join("")
      .replace(/0/g, "");
    verticalNumbers.push(Number(digits) || 0);
  }

  return { values: verticalNumbers, operation };
}

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


// Part 2
let cols = getColumnsFromOperatorPositions(puzzleInput);

// Pad each column value to the longest number IN THAT COLUMN!!!!, replacing spaces with 0s
let p2Arr = cols.map((col) => {
  // Find max length in this column (excluding operator)
  const values = col.slice(0, -1);
  const colMaxLen = Math.max(...values.map(v => v.trim().length));
  
  return col.map((entry) => {
    const trimmed = entry.trim();
    if (trimmed.match(/^[*+]$/)) {
      // It's an operator, pad with 0s
      return trimmed.padEnd(colMaxLen, '0');
    }
    // For numbers: if original starts with space, pad left; otherwise pad right
    if (entry.startsWith(' ')) {
      return trimmed.padStart(colMaxLen, '0');
    } else {
      return trimmed.padEnd(colMaxLen, '0');
    }
  });
});

// console.log(p2Arr);
let totalSumP2 = 0;
let lineLenth2 = p2Arr.length;

for (var i = 0; i < lineLenth2; i++) {
  let column = p2Arr[i];

  const { values, operation } = processColumnVertically(column);

  const sum = handleOperation(operation, values);
  console.log(
    `P2 - Column ${i}:`, column.slice(0, -1).map(Number), 'Values',values,    "Operation:",
    operation,
    "Sum:",
    sum
  );


    totalSumP2 += sum;
}

console.log("P1 - Total Sum:", totalSum);
console.log("P2 - Total Sum:", totalSumP2);
