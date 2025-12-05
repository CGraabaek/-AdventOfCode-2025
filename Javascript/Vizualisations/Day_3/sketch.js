// Advent of Code 2025 - Day 3 Visualization
// Finding the maximum joltage by selecting 12 digits

// Sample input (can be modified)
const puzzleInput = [
  "987654321111111",
  "811111111111119",
  "234234234234278",
  "818181911112111"
];

const ITERATIONS = 12;
let currentLineIndex = 0;
let currentIteration = 0;
let currentSearchIndex = 0;
let phase = "searching"; // "searching", "found", "next", "complete"

let selectedIndices = [];
let selectedValues = [];
let highestInRange = { index: -1, value: -1 };

let isPaused = false;
let animationSpeed = 150; // ms per frame
let lastUpdate = 0;

let totalJoltage = 0;

// Store completed lines for display
let completedLines = []; // { line, selectedIndices, selectedValues, joltage }

// Colors (Advent of Code theme)
const COLORS = {
  background: [15, 15, 35],
  text: [204, 204, 204],
  highlight: [0, 204, 0],
  selected: [255, 255, 102],
  searching: [102, 178, 255],
  outOfRange: [80, 80, 80],
  validRange: [0, 153, 0],
  star: [255, 255, 102]
};

function setup() {
  let canvas = createCanvas(900, 600);
  canvas.parent('canvas-container');
  textFont('Consolas, monospace');
  resetVisualization();
}

function draw() {
  background(...COLORS.background);
  
  let currentTime = millis();
  
  if (!isPaused && currentTime - lastUpdate > animationSpeed) {
    updateAnimation();
    lastUpdate = currentTime;
  }
  
  drawVisualization();
}

function updateAnimation() {
  if (phase === "complete") return;
  
  const line = puzzleInput[currentLineIndex];
  const numbers = line.split("").map(Number);
  
  if (phase === "searching") {
    const maxIndex = numbers.length - ITERATIONS + currentIteration;
    const lowestIndex = currentIteration === 0 ? 0 : selectedIndices[currentIteration - 1] + 1;
    
    if (currentSearchIndex <= maxIndex) {
      if (currentSearchIndex >= lowestIndex) {
        const num = numbers[currentSearchIndex];
        if (num > highestInRange.value) {
          highestInRange = { index: currentSearchIndex, value: num };
        }
      }
      currentSearchIndex++;
    } else {
      phase = "found";
    }
  } else if (phase === "found") {
    // Record the found digit
    selectedIndices.push(highestInRange.index);
    selectedValues.push(highestInRange.value);
    
    currentIteration++;
    
    if (currentIteration >= ITERATIONS) {
      phase = "next";
    } else {
      // Reset for next iteration
      const lowestIndex = selectedIndices[currentIteration - 1] + 1;
      currentSearchIndex = lowestIndex;
      highestInRange = { index: -1, value: -1 };
      phase = "searching";
    }
  } else if (phase === "next") {
    // Add to total and store completed line
    const joltage = parseInt(selectedValues.join(""));
    totalJoltage += joltage;
    
    completedLines.push({
      line: puzzleInput[currentLineIndex],
      selectedIndices: [...selectedIndices],
      selectedValues: [...selectedValues],
      joltage: joltage
    });
    
    updateResultDisplay();
    
    currentLineIndex++;
    if (currentLineIndex >= puzzleInput.length) {
      phase = "complete";
    } else {
      resetLineState();
    }
  }
}

function drawVisualization() {
  // Title
  textSize(24);
  textAlign(CENTER, TOP);
  fill(...COLORS.highlight);
  const displayLineIndex = phase === "complete" ? puzzleInput.length : currentLineIndex + 1;
  text(`Processing Line ${displayLineIndex} of ${puzzleInput.length}`, width / 2, 20);
  
  // Draw current line
  const line = puzzleInput[currentLineIndex] || puzzleInput[puzzleInput.length - 1];
  const numbers = line.split("").map(Number);
  
  const digitSize = 40;
  const spacing = 50;
  const startX = (width - numbers.length * spacing) / 2 + spacing / 2;
  const digitY = 120;
  
  // Calculate valid range
  const maxIndex = numbers.length - ITERATIONS + currentIteration;
  const lowestIndex = currentIteration === 0 ? 0 : (selectedIndices[currentIteration - 1] + 1 || 0);
  
  // Draw range indicator
  if (phase === "searching" || phase === "found") {
    drawRangeIndicator(startX, digitY, spacing, lowestIndex, maxIndex, numbers.length);
  }
  
  // Draw digits
  for (let i = 0; i < numbers.length; i++) {
    const x = startX + i * spacing;
    const y = digitY;
    
    // Determine digit state and color
    let boxColor, textColor;
    const isSelected = selectedIndices.includes(i);
    const isCurrentSearch = (i === currentSearchIndex - 1) && phase === "searching";
    const isHighest = i === highestInRange.index && phase !== "complete";
    const inRange = i >= lowestIndex && i <= maxIndex;
    
    if (isSelected) {
      boxColor = COLORS.selected;
      textColor = COLORS.background;
    } else if (isHighest && (phase === "searching" || phase === "found")) {
      boxColor = COLORS.highlight;
      textColor = COLORS.background;
    } else if (isCurrentSearch) {
      boxColor = COLORS.searching;
      textColor = COLORS.background;
    } else if (inRange && (phase === "searching" || phase === "found")) {
      boxColor = [...COLORS.validRange, 100];
      textColor = COLORS.text;
    } else {
      boxColor = COLORS.outOfRange;
      textColor = [120, 120, 120];
    }
    
    // Draw box
    if (isSelected) {
      fill(...boxColor);
      stroke(...COLORS.selected);
      strokeWeight(3);
    } else if (isHighest && (phase === "searching" || phase === "found")) {
      fill(...COLORS.background);
      stroke(...COLORS.highlight);
      strokeWeight(3);
    } else {
      fill(...COLORS.background);
      stroke(...(Array.isArray(boxColor) ? boxColor.slice(0, 3) : [boxColor]));
      strokeWeight(2);
    }
    
    rectMode(CENTER);
    rect(x, y, digitSize, digitSize, 5);
    
    // Draw digit
    noStroke();
    fill(...(Array.isArray(textColor) ? textColor : [textColor]));
    textSize(24);
    textAlign(CENTER, CENTER);
    text(numbers[i], x, y);
    
    // Draw index below
    fill(100);
    textSize(10);
    text(i, x, y + 30);
  }
  
  // Draw iteration info
  drawIterationInfo(lowestIndex, maxIndex);
  
  // Draw selected digits
  drawSelectedDigits(startX, spacing);
  
  // Draw completed lines history
  drawCompletedLines();
  
  // Draw progress
  drawProgress();
  
  // Draw legend
  drawLegend();
}

function drawRangeIndicator(startX, digitY, spacing, lowestIndex, maxIndex, length) {
  const rangeStartX = startX + lowestIndex * spacing - spacing / 2 + 5;
  const rangeEndX = startX + maxIndex * spacing + spacing / 2 - 5;
  const rangeY = digitY - 35;
  
  stroke(...COLORS.validRange);
  strokeWeight(2);
  noFill();
  
  // Draw bracket
  line(rangeStartX, rangeY, rangeStartX, rangeY + 10);
  line(rangeStartX, rangeY, rangeEndX, rangeY);
  line(rangeEndX, rangeY, rangeEndX, rangeY + 10);
  
  // Label
  fill(...COLORS.validRange);
  noStroke();
  textSize(12);
  textAlign(CENTER, BOTTOM);
  text("Valid Range", (rangeStartX + rangeEndX) / 2, rangeY - 5);
}

function drawIterationInfo(lowestIndex, maxIndex) {
  textSize(16);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  
  const infoY = 200;
  const displayIteration = Math.min(currentIteration + 1, ITERATIONS);
  text(`Iteration: ${displayIteration} / ${ITERATIONS}`, 30, infoY);
  text(`Search Range: [${lowestIndex} - ${maxIndex}]`, 30, infoY + 25);
  text(`Current Search Index: ${Math.max(0, currentSearchIndex - 1)}`, 30, infoY + 50);
  
  if (highestInRange.index >= 0) {
    fill(...COLORS.highlight);
    text(`Best Found: ${highestInRange.value} at index ${highestInRange.index}`, 30, infoY + 75);
  }
  
  fill(...COLORS.searching);
  text(`Phase: ${phase}`, 30, infoY + 100);
}

function drawSelectedDigits(startX, spacing) {
  const selectedY = 350;
  
  textSize(16);
  textAlign(LEFT, TOP);
  fill(...COLORS.selected);
  text("Selected Digits (Joltage Output):", 30, selectedY);
  
  // Draw selected digits as boxes
  const boxSize = 35;
  const boxSpacing = 45;
  const boxStartX = 30;
  
  for (let i = 0; i < ITERATIONS; i++) {
    const x = boxStartX + i * boxSpacing;
    const y = selectedY + 30;
    
    if (i < selectedValues.length) {
      fill(...COLORS.selected);
      stroke(...COLORS.selected);
      strokeWeight(2);
      rectMode(CORNER);
      rect(x, y, boxSize, boxSize, 3);
      
      fill(...COLORS.background);
      noStroke();
      textSize(20);
      textAlign(CENTER, CENTER);
      text(selectedValues[i], x + boxSize / 2, y + boxSize / 2);
    } else {
      noFill();
      stroke(100);
      strokeWeight(1);
      rectMode(CORNER);
      rect(x, y, boxSize, boxSize, 3);
      
      fill(60);
      noStroke();
      textSize(16);
      textAlign(CENTER, CENTER);
      text("?", x + boxSize / 2, y + boxSize / 2);
    }
  }
  
  // Show current joltage value
  if (selectedValues.length > 0) {
    const joltageStr = selectedValues.join("");
    fill(...COLORS.highlight);
    textSize(18);
    textAlign(LEFT, TOP);
    text(`= ${joltageStr}`, boxStartX + ITERATIONS * boxSpacing + 10, selectedY + 37);
  }
}

function drawProgress() {
  if (phase === "complete") {
    // Position below completed lines
    const baseY = 420;
    const lineHeight = 28;
    const progressY = baseY + 25 + completedLines.length * lineHeight + 20;
    
    fill(...COLORS.highlight);
    textSize(20);
    textAlign(CENTER, TOP);
    text("✨ Visualization Complete! ✨", width / 2, progressY);
  }
}

function drawCompletedLines() {
  if (completedLines.length === 0) return;
  
  const startY = 420;
  const lineHeight = 28;
  
  textSize(14);
  textAlign(CENTER, TOP);
  fill(...COLORS.text);
  text("Completed Lines:", width / 2, startY);
  
  completedLines.forEach((completed, idx) => {
    const y = startY + 25 + idx * lineHeight;
    const numbers = completed.line.split("");
    
    // Calculate total width for centering
    const digitWidth = 12;
    const lineNumWidth = 25;
    const arrowWidth = 30;
    const resultWidth = completed.selectedValues.length * digitWidth;
    const totalWidth = lineNumWidth + (numbers.length * digitWidth) + arrowWidth + resultWidth;
    
    let xPos = (width - totalWidth) / 2;
    textSize(14);
    
    // Line number
    fill(100);
    textAlign(LEFT, TOP);
    text(`${idx + 1}.`, xPos, y);
    xPos += lineNumWidth;
    
    // Draw each digit
    for (let i = 0; i < numbers.length; i++) {
      const isSelected = completed.selectedIndices.includes(i);
      
      if (isSelected) {
        // Draw highlighted background for selected digits
        fill(...COLORS.selected);
        noStroke();
        rectMode(CORNER);
        rect(xPos - 1, y - 2, 13, 18, 2);
        
        fill(...COLORS.background);
        textSize(14);
        text(numbers[i], xPos, y);
      } else {
        fill(80);
        textSize(14);
        text(numbers[i], xPos, y);
      }
      xPos += digitWidth;
    }
    
    // Draw arrow and result
    xPos += 10;
    fill(...COLORS.text);
    text("→", xPos, y);
    xPos += 20;
    
    // Draw the joltage result
    fill(...COLORS.highlight);
    textSize(14);
    text(completed.selectedValues.join(""), xPos, y);
  });
}

function drawLegend() {
  const legendX = width - 200;
  const legendY = 200;
  const boxSize = 15;
  const lineHeight = 25;
  
  textSize(12);
  textAlign(LEFT, CENTER);
  
  const legendItems = [
    { color: COLORS.selected, label: "Selected" },
    { color: COLORS.highlight, label: "Best in Range" },
    { color: COLORS.searching, label: "Currently Checking" },
    { color: COLORS.validRange, label: "Valid Range" },
    { color: COLORS.outOfRange, label: "Out of Range" }
  ];
  
  fill(...COLORS.text);
  textSize(14);
  text("Legend:", legendX, legendY - 20);
  
  legendItems.forEach((item, i) => {
    const y = legendY + i * lineHeight;
    
    fill(...item.color);
    noStroke();
    rect(legendX, y - boxSize / 2, boxSize, boxSize, 2);
    
    fill(...COLORS.text);
    textSize(12);
    text(item.label, legendX + boxSize + 10, y);
  });
}

function resetLineState() {
  currentIteration = 0;
  currentSearchIndex = 0;
  phase = "searching";
  selectedIndices = [];
  selectedValues = [];
  highestInRange = { index: -1, value: -1 };
}

function resetVisualization() {
  currentLineIndex = 0;
  totalJoltage = 0;
  completedLines = [];
  resetLineState();
  updateResultDisplay();
}

function togglePause() {
  isPaused = !isPaused;
}

function nextStep() {
  isPaused = true;
  updateAnimation();
}

function nextLine() {
  if (phase !== "complete") {
    // Complete current line
    const line = puzzleInput[currentLineIndex];
    completeCurrentLine(line);
    
    const joltage = parseInt(selectedValues.join(""));
    totalJoltage += joltage;
    
    completedLines.push({
      line: line,
      selectedIndices: [...selectedIndices],
      selectedValues: [...selectedValues],
      joltage: joltage
    });
    
    updateResultDisplay();
    
    currentLineIndex++;
    if (currentLineIndex >= puzzleInput.length) {
      phase = "complete";
    } else {
      resetLineState();
    }
  }
}

function completeCurrentLine(line) {
  const numbers = line.split("").map(Number);
  selectedIndices = [];
  selectedValues = [];
  
  for (let iter = 0; iter < ITERATIONS; iter++) {
    const maxIndex = numbers.length - ITERATIONS + iter;
    const lowestIndex = iter === 0 ? 0 : selectedIndices[iter - 1] + 1;
    
    let bestIndex = lowestIndex;
    let bestValue = numbers[lowestIndex];
    
    for (let idx = lowestIndex; idx <= maxIndex; idx++) {
      if (numbers[idx] > bestValue) {
        bestIndex = idx;
        bestValue = numbers[idx];
      }
    }
    
    selectedIndices.push(bestIndex);
    selectedValues.push(bestValue);
  }
  
  currentIteration = ITERATIONS;
}

function changeSpeed(delta) {
  animationSpeed = Math.max(20, Math.min(500, animationSpeed + delta));
  updateSpeedIndicator();
}

function updateSpeedIndicator() {
  const speedFill = document.getElementById('speed-fill');
  const speedValue = document.getElementById('speed-value');
  const speedPercent = 1 - (animationSpeed - 20) / (500 - 20);
  
  speedFill.style.width = (speedPercent * 100) + '%';
  
  // Interpolate color from red (slow) to green (fast)
  const r = Math.round(255 - speedPercent * 155);
  const g = Math.round(100 + speedPercent * 155);
  speedFill.style.backgroundColor = `rgb(${r}, ${g}, 100)`;
  
  speedValue.textContent = animationSpeed + 'ms';
}

function updateResultDisplay() {
  const resultDiv = document.getElementById('result');
  if (phase === "complete") {
    resultDiv.innerHTML = `<strong>Final Total Joltage: ${totalJoltage}</strong> ⭐`;
  } else {
    resultDiv.innerHTML = `Running Total: ${totalJoltage}`;
  }
}
