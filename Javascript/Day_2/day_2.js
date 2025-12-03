const fs = require("fs");
const puzzleInput = fs.readFileSync("./input.txt").toString().split(",");

function checkForRepeatedDigits(num) {
  const numStr = num.toString();
  const length = numStr.length;

  // Must have even length to be repeated
  if (length % 2 !== 0) {
    return false;
  }

  const halfLength = length / 2;
  const firstHalf = numStr.slice(0, halfLength);
  const secondHalf = numStr.slice(halfLength);

  return firstHalf === secondHalf;
}

function checkForRepeatedDigitsExtended(num) {
  const numStr = num.toString();
  const length = numStr.length;

  //Only need to try patterns up to half the length, since a repeated pattern must fit at least twice
  for (let patternLength = 1; patternLength <= length / 2; patternLength++) {
    // The total length must be divisible by the pattern length
    if (length % patternLength !== 0) {
      continue;
    }

    const pattern = numStr.slice(0, patternLength);
    const repetitions = length / patternLength;

    // Check if repeating the pattern gives us the original number
    if (pattern.repeat(repetitions) === numStr) {
      return true;
    }
  }

  return false;
}

let invalidIdSumP1 = 0;
let invalidIdSumP2 = 0;

puzzleInput.forEach((level) => {
  let range = level.split("-").map(Number);
  let from = range[0];
  let to = range[1];

  for (let i = from; i <= to; i++) {
    if (i.toString().startsWith("0")) {
      invalidIdSumP1 += i;
      invalidIdSumP2 += i;
    }

    if (checkForRepeatedDigits(i)) {
      invalidIdSumP1 += i;
    }
    
    if (checkForRepeatedDigitsExtended(i)) {
      invalidIdSumP2 += i;
    }
  }
});

console.log(`Part 1:  Invalid ID sum: ${invalidIdSumP1}`);
console.log(`Part 2:  Invalid ID sum: ${invalidIdSumP2}`);
