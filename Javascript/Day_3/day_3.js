const fs = require("fs");
const puzzleInput = fs.readFileSync("./input.txt").toString().split("\n");

// Function for part 1
function getHighestNumbers(line) {
  const numbers = line.split("").map(Number);

  let highest = numbers[0];
  let higestIndex = 0;
  let secondHighest = 0;

  let maxIndex = numbers.length - 1;

  for (let [idx, num] of numbers.entries()) {
    if (num > highest && idx != maxIndex) {
      higestIndex = idx;
      highest = num;
    }
  }

  for (let [idx, num] of numbers.entries()) {
    if (num > secondHighest && idx > higestIndex) {
      secondHighest = num;
    }
  }

  return highest.toString() + secondHighest.toString();
}
// Function for part 2, could replace part 1 but kept both for clarity
function getHighestNumbersExtented(line, iterations) {
  const numbers = line.split("").map(Number);

  let highestIndexArray = new Array(iterations).fill(0);
  let highestValueForIteration = new Array(iterations).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    let maxIndex = numbers.length - iterations + iter;
    let lowestIndex = iter === 0 ? 0 : highestIndexArray[iter - 1] + 1;

    for (let [idx, num] of numbers.entries()) {
      if (
        num > highestValueForIteration[iter] &&
        idx <= maxIndex &&
        idx >= lowestIndex
      ) {
        highestIndexArray[iter] = idx;
        highestValueForIteration[iter] = num;
      }
    }
  }

  return highestValueForIteration.join("");
}

let totalJoltageOutput = 0;
let totalJoltageOutputExtented = 0;

puzzleInput.forEach((line) => {
  totalJoltageOutput += parseInt(getHighestNumbers(line));
  totalJoltageOutputExtented += parseInt(getHighestNumbersExtented(line, 12));
});

console.log(`P1 Total Joltage Output: ${totalJoltageOutput}`);
console.log(`P2 Total Joltage Output: ${totalJoltageOutputExtented} `);
