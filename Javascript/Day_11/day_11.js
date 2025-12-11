const fs = require("fs");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput =process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\n");

console.log(`Using ${useTestInput ? "TEST" : "REAL"} input`);

let wires = puzzleInput.map((line) => {
  let from = line.split(":")[0].trim();
  let connectsTo = line.split(":")[1].trim().split(" ");
  return { from, connectsTo };
});

let wiresMap = wires.reduce(
  (obj, item) => Object.assign(obj, { [item.from]: item.connectsTo }),
  {}
);

// console.log(wiresMap);

// Function to count all paths from start to end using DFS with memoization
// This works efficiently for DAGs (Directed Acyclic Graphs)
function countAllPathsDAG(wiresMap, start, end, memo = {}) {

// There is a path
  if (start === end) {
    return 1;
  }

  // Return cached result if already computed
  if (memo[start] !== undefined) {
    return memo[start];
  }

  // Get all possible next steps
  const nextSteps = wiresMap[start] || [];
  let totalPaths = 0;

  // Explore each possible next step
  for (const nextNode of nextSteps) {
    totalPaths += countAllPathsDAG(wiresMap, nextNode, end, memo);
  }

  memo[start] = totalPaths;
  return totalPaths;
}

const pathCount = countAllPathsDAG(wiresMap, "you", "out");
console.log(`\n P1: Found ${pathCount} path(s) from "you" to "out"`);

// Part 2
// Have to do this, since the test input is different for part 2
const inputFile2 = useTestInput ? "./test_input_p2.txt" : "./input.txt";

let part2Test = fs.readFileSync(inputFile2).toString().split("\n");
let wires2 = part2Test.map((line) => {
  let from = line.split(":")[0].trim();
  let connectsTo = line.split(":")[1].trim().split(" ");
  return { from, connectsTo };
});

let wiresMap2 = wires2.reduce(
  (obj, item) => Object.assign(obj, { [item.from]: item.connectsTo }),
  {}
);

let svrToDac = countAllPathsDAG(wiresMap2, "svr", "dac");
let dacToOut = countAllPathsDAG(wiresMap2, "dac", "out");
let fftToDac = countAllPathsDAG(wiresMap2, "fft", "dac");
let svrToFft = countAllPathsDAG(wiresMap2, "svr", "fft");
let fftToOut = countAllPathsDAG(wiresMap2, "fft", "out");
let dacToFft = countAllPathsDAG(wiresMap2, "dac", "fft");

console.log(`\nPart 2 Connections:`);

console.log(`svr to dac: ${svrToDac} path(s)`);
console.log(`dac to fft: ${dacToFft} path(s)`);
console.log(`fft to out: ${fftToOut} path(s)`);

console.log(`svr to fft: ${svrToFft} path(s)`);
console.log(`fft to dac: ${fftToDac} path(s)`);
console.log(`dac to out: ${dacToOut} path(s)`);
// The logic here is, that we find all where both fft and dac are used as intermediates, then we multiply the paths to get the total combinations, and sum the two main routes
console.log(`\nPart 2 Result: ${(svrToDac * dacToFft * fftToOut) + (svrToFft * fftToDac * dacToOut)}`);