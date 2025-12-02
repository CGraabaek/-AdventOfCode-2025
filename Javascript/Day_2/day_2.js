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

let invalidIdSumP1 = 0;

puzzleInput.forEach((level) => {
  let range = level.split("-").map(Number);
  let from = range[0];
  let to = range[1];

  for (let i = from; i <= to; i++) {
    if (i.toString().startsWith("0")) {
      invalidIdSumP1 += i;
    }

    if (checkForRepeatedDigits(i)) {
      invalidIdSumP1 += i;
    }
  }
});

console.log(`Part 1:  Invalid ID sum: ${invalidIdSum}`);
