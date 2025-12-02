const fs = require("fs");
const puzzleInput = fs
  .readFileSync("./input.txt")
  .toString()
  .replaceAll("   ", "\n")
  .split("\n");

// Part 1

let initialDialPosition = 50;
let zeroCounter = 0;

puzzleInput.forEach((instruction) => {
  let currentDialPosition = initialDialPosition;
  const direction = instruction.charAt(0);
  const distance = parseInt(instruction.slice(1));
  if (direction === "L") {
    initialDialPosition -= distance;
  } else if (direction === "R") {
    initialDialPosition += distance;
  }

  // Handle multilpe rotations and negative positions
  // Some examples to illustrate the logic:
  // - If initialDialPosition = 102, then (102 % 100) = 2, and (2 + 100) % 100 = 2
  // - If initialDialPosition = -3, then (-3 % 100) = -3, and (-3 + 100) % 100 = 97
  initialDialPosition = ((initialDialPosition % 100) + 100) % 100;

  if (initialDialPosition === 0) {
    zeroCounter += 1;
  }
  console.log(
    `instruction: ${instruction}, from ${currentDialPosition} to ${initialDialPosition}`
  );
});

// Part 2 - Includes new security measure to count how many times the dial hits zero, it now also includes any time it passes zero.
let initialDialPositionP2 = 50;
let zeroCounterP2 = 0;

puzzleInput.forEach((instruction) => {
  const currentDialPosition = initialDialPositionP2;
  const direction = instruction.charAt(0);
  const distance = parseInt(instruction.slice(1));
  
  if (direction === "R") {
    initialDialPositionP2 += distance;
    // Going right: count how many times we hit 0
    // We hit 0 at positions 100, 200, 300, etc. relative to start
    const crossings = Math.floor((currentDialPosition + distance) / 100);
    zeroCounterP2 += crossings;
  } else if (direction === "L") {
    initialDialPositionP2 -= distance;
    // Going left: we hit 0 when we reach position 0, -100, -200, etc.
    // But if we START at 0, we don't count that as hitting 0
    if (currentDialPosition > 0 && distance >= currentDialPosition) {
      // We will hit or pass 0
      // How many times? We hit 0 at: currentPos, currentPos+100, currentPos+200, etc.
      const crossings = Math.floor((distance - currentDialPosition) / 100) + 1;
      zeroCounterP2 += crossings;
    } else if (currentDialPosition === 0 && distance > 0) {
      // Starting at 0, going left - only count if we come back to 0
      const crossings = Math.floor(distance / 100);
      zeroCounterP2 += crossings;
    }
  }

  // Normalize position for display
  const normalizedPosition = ((initialDialPositionP2 % 100) + 100) % 100;

  console.log(
    `instruction: ${instruction}, from ${currentDialPosition} to ${normalizedPosition}, total zeros: ${zeroCounterP2}`
  );
  
  initialDialPositionP2 = normalizedPosition;
});

console.log("P2 Zero has been reached ", zeroCounterP2, " times.");