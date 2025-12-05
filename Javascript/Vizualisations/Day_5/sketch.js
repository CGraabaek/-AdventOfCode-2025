// Advent of Code 2025 - Day 5 Visualization
// Fresh Ingredients Range Checking

// Test input data
const testRanges = [
  [3, 5],
  [10, 14],
  [16, 20],
  [12, 18]
];
const testStock = [1, 5, 8, 11, 17, 32];

// Real input data (sampled - showing representative ranges across the full spectrum)
// Full input has 165 ranges and 600+ stock values
const realRanges = [
  [3438495999024, 8748904577026],
  [13786664510155, 16801037686313],
  [32214673183952, 38856090557943],
  [64627107934678, 66292153896231],
  [81573181850686, 86374068906214],
  [104225193775074, 109567209393267],
  [144994441815640, 148934553216601],
  [184776104898372, 190491475415602],
  [253237286885663, 256528558947738],
  [274689463122259, 278436146129529],
  [299961153239895, 301408838745423],
  [369499575421587, 370254043797697],
  [432708543257746, 437546653414271],
  [493906974314704, 494688955465215],
  [500789379744360, 501460137450447],
  [532908640035709, 535413899901858]
];
const realStock = [
  67677576309617,
  33794763812662,
  168551711140598,
  68850974772815,
  377411025097359,
  144282091469283,
  294396730764118,
  68685958258361,
  33170431440270,
  486546457483088,
  96464766687714,
  247276631707656,
  516827452675226,
  359682488407235,
  69257323206815,
  74990155690985,
  108555861118323,
  297114538723139,
  35350672427422,
  429858319128856
];

// Current dataset
let useTestInput = true;
let originalRanges = testRanges;
let ingredientStock = testStock;

// State
let ranges = [];
let mergedRanges = [];
let phase = "show-ranges"; // "show-ranges", "sorting", "merging", "checking", "complete"
let currentStep = 0;
let mergeIndex = 0;
let checkIndex = 0;
let freshCount = 0;
let checkedIngredients = []; // { value, isFresh }

let isPaused = false;
let animationSpeed = 150;
let lastUpdate = 0;

// Number line settings (calculated dynamically)
let NUMBER_LINE_MIN = 0;
let NUMBER_LINE_MAX = 35;

// Colors (Advent of Code theme)
const COLORS = {
  background: [15, 15, 35],
  text: [204, 204, 204],
  highlight: [0, 204, 0],
  selected: [255, 255, 102],
  range1: [102, 178, 255],
  range2: [255, 128, 128],
  range3: [128, 255, 128],
  range4: [255, 178, 102],
  merged: [0, 204, 0],
  fresh: [0, 255, 0],
  notFresh: [255, 80, 80],
  checking: [255, 255, 102],
  numberLine: [100, 100, 100],
  star: [255, 255, 102]
};

const RANGE_COLORS = [
  [102, 178, 255],
  [255, 128, 128],
  [128, 255, 128],
  [255, 178, 102],
  [178, 102, 255],
  [255, 255, 128]
];

let canvas;

function setup() {
  canvas = createCanvas(900, 550);
  canvas.parent('canvas-container');
  textFont('Consolas, monospace');
  
  // Initialize button state
  const btn = document.getElementById('input-toggle');
  btn.className = 'active-test';
  
  resetVisualization();
}

function updateCanvasSize() {
  if (useTestInput) {
    resizeCanvas(900, 550);
  } else {
    resizeCanvas(1200, 750);
  }
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
  
  if (phase === "show-ranges") {
    currentStep++;
    if (currentStep > ranges.length) {
      phase = "sorting";
      currentStep = 0;
    }
  } else if (phase === "sorting") {
    // Sort ranges by start value
    ranges.sort((a, b) => a.range[0] - b.range[0]);
    phase = "merging";
    mergeIndex = 0;
    mergedRanges = [];
  } else if (phase === "merging") {
    if (mergeIndex < ranges.length) {
      const range = ranges[mergeIndex].range;
      
      if (mergedRanges.length === 0) {
        mergedRanges.push({ range: [...range], sourceIndices: [mergeIndex] });
      } else {
        const lastMerged = mergedRanges[mergedRanges.length - 1];
        if (range[0] <= lastMerged.range[1]) {
          // Overlapping - merge
          lastMerged.range[1] = Math.max(lastMerged.range[1], range[1]);
          lastMerged.sourceIndices.push(mergeIndex);
        } else {
          // Not overlapping - add new
          mergedRanges.push({ range: [...range], sourceIndices: [mergeIndex] });
        }
      }
      mergeIndex++;
    } else {
      phase = "checking";
      checkIndex = 0;
    }
  } else if (phase === "checking") {
    if (checkIndex < ingredientStock.length) {
      const stock = ingredientStock[checkIndex];
      let isFresh = false;
      
      for (let merged of mergedRanges) {
        if (stock >= merged.range[0] && stock <= merged.range[1]) {
          isFresh = true;
          break;
        }
      }
      
      if (isFresh) freshCount++;
      checkedIngredients.push({ value: stock, isFresh });
      checkIndex++;
    } else {
      phase = "complete";
      updateResultDisplay();
    }
  }
}

function drawVisualization() {
  // Title
  textSize(20);
  textAlign(CENTER, TOP);
  fill(...COLORS.highlight);
  text(getPhaseTitle(), width / 2, 15);
  
  // Calculate dynamic positions based on canvas size
  const rangesY = useTestInput ? 160 : 180;
  const mergedY = useTestInput ? 280 : 380;
  const checksY = useTestInput ? 400 : 550;
  
  // Draw number line
  drawNumberLine(50, 120, width - 100, NUMBER_LINE_MIN, NUMBER_LINE_MAX);
  
  // Draw original ranges
  if (phase === "show-ranges" || phase === "sorting") {
    drawOriginalRanges(50, rangesY, width - 100);
  }
  
  // Draw sorted ranges during merging
  if (phase === "merging" || phase === "checking" || phase === "complete") {
    drawSortedRanges(50, rangesY, width - 100);
    drawMergedRanges(50, mergedY, width - 100);
  }
  
  // Draw ingredient checks
  if (phase === "checking" || phase === "complete") {
    drawIngredientChecks(50, checksY, width - 100);
  }
  
  // Draw legend
  drawLegend();
  
  // Draw stats
  drawStats();
}

function getPhaseTitle() {
  switch (phase) {
    case "show-ranges": return "Phase 1: Showing Freshness Ranges";
    case "sorting": return "Phase 2: Sorting Ranges by Start Value";
    case "merging": return "Phase 3: Merging Overlapping Ranges";
    case "checking": return "Phase 4: Checking Ingredient Stock";
    case "complete": return "✨ Complete! ✨";
    default: return "";
  }
}

function drawNumberLine(x, y, lineWidth, minVal, maxVal) {
  const unitWidth = lineWidth / (maxVal - minVal);
  
  // Draw line
  stroke(...COLORS.numberLine);
  strokeWeight(2);
  line(x, y, x + lineWidth, y);
  
  // Draw ticks and labels
  textSize(9);
  textAlign(CENTER, TOP);
  fill(...COLORS.text);
  noStroke();
  
  // Calculate appropriate tick interval
  const range = maxVal - minVal;
  let tickInterval;
  
  if (range > 1e14) {
    tickInterval = 1e14;
  } else if (range > 1e13) {
    tickInterval = 1e13;
  } else if (range > 1e12) {
    tickInterval = 5e12;
  } else if (range > 100) {
    tickInterval = Math.pow(10, Math.floor(Math.log10(range / 5)));
  } else {
    tickInterval = 5;
  }
  
  const startTick = Math.ceil(minVal / tickInterval) * tickInterval;
  
  for (let i = startTick; i <= maxVal; i += tickInterval) {
    const tickX = x + (i - minVal) * unitWidth;
    stroke(...COLORS.numberLine);
    strokeWeight(1);
    line(tickX, y - 5, tickX, y + 5);
    noStroke();
    
    // Format large numbers
    let label;
    if (i >= 1e12) {
      label = (i / 1e12).toFixed(0) + 'T';
    } else if (i >= 1e9) {
      label = (i / 1e9).toFixed(0) + 'B';
    } else if (i >= 1e6) {
      label = (i / 1e6).toFixed(0) + 'M';
    } else {
      label = i.toString();
    }
    text(label, tickX, y + 8);
  }
}

function drawOriginalRanges(x, y, lineWidth) {
  const unitWidth = lineWidth / (NUMBER_LINE_MAX - NUMBER_LINE_MIN);
  const rowHeight = useTestInput ? 25 : 12;
  const barHeight = useTestInput ? 20 : 10;
  
  textSize(14);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  text("Original Ranges:", x, y - 25);
  
  for (let i = 0; i < ranges.length; i++) {
    if (i >= currentStep && phase === "show-ranges") continue;
    
    const range = ranges[i].range;
    const colorIdx = ranges[i].originalIndex;
    const rangeColor = RANGE_COLORS[colorIdx % RANGE_COLORS.length];
    
    const startX = x + (range[0] - NUMBER_LINE_MIN) * unitWidth;
    const endX = x + (range[1] - NUMBER_LINE_MIN) * unitWidth;
    const rangeY = y + i * rowHeight;
    
    // Draw range bar
    fill(...rangeColor, 180);
    stroke(...rangeColor);
    strokeWeight(useTestInput ? 2 : 1);
    rectMode(CORNER);
    rect(startX, rangeY, Math.max(endX - startX, 2), barHeight, 3);
    
    // Draw label (only if bar is wide enough or test input)
    if (useTestInput || endX - startX > 50) {
      fill(...COLORS.background);
      noStroke();
      textSize(useTestInput ? 10 : 8);
      textAlign(CENTER, CENTER);
      text(formatRange(range[0], range[1]), (startX + endX) / 2, rangeY + barHeight / 2);
    }
  }
}

function drawSortedRanges(x, y, lineWidth) {
  const unitWidth = lineWidth / (NUMBER_LINE_MAX - NUMBER_LINE_MIN);
  const rowHeight = useTestInput ? 25 : 12;
  const barHeight = useTestInput ? 20 : 10;
  
  textSize(14);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  text("Sorted Ranges:", x, y - 25);
  
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i].range;
    const colorIdx = ranges[i].originalIndex;
    const rangeColor = RANGE_COLORS[colorIdx % RANGE_COLORS.length];
    
    const startX = x + (range[0] - NUMBER_LINE_MIN) * unitWidth;
    const endX = x + (range[1] - NUMBER_LINE_MIN) * unitWidth;
    const rangeY = y + i * rowHeight;
    
    // Highlight current merge candidate
    const isBeingMerged = phase === "merging" && i === mergeIndex;
    const isAlreadyProcessed = i < mergeIndex;
    
    if (isBeingMerged) {
      // Pulsing highlight
      const pulse = sin(millis() / 100) * 30 + 225;
      fill(255, 255, 102, pulse);
      stroke(255, 255, 102);
    } else if (isAlreadyProcessed) {
      fill(...rangeColor, 100);
      stroke(...rangeColor, 150);
    } else {
      fill(...rangeColor, 180);
      stroke(...rangeColor);
    }
    
    strokeWeight(useTestInput ? 2 : 1);
    rectMode(CORNER);
    rect(startX, rangeY, Math.max(endX - startX, 2), barHeight, 3);
    
    // Draw label (only if bar is wide enough or test input)
    if (useTestInput || endX - startX > 50) {
      fill(...COLORS.background);
      noStroke();
      textSize(useTestInput ? 10 : 8);
      textAlign(CENTER, CENTER);
      text(formatRange(range[0], range[1]), (startX + endX) / 2, rangeY + barHeight / 2);
    }
  }
}

function drawMergedRanges(x, y, lineWidth) {
  const unitWidth = lineWidth / (NUMBER_LINE_MAX - NUMBER_LINE_MIN);
  const rowHeight = useTestInput ? 30 : 16;
  const barHeight = useTestInput ? 24 : 12;
  
  textSize(14);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  text("Merged Ranges:", x, y - 25);
  
  for (let i = 0; i < mergedRanges.length; i++) {
    const merged = mergedRanges[i];
    const range = merged.range;
    
    const startX = x + (range[0] - NUMBER_LINE_MIN) * unitWidth;
    const endX = x + (range[1] - NUMBER_LINE_MIN) * unitWidth;
    const rangeY = y + i * rowHeight;
    
    // Draw merged range bar
    fill(...COLORS.merged, 200);
    stroke(...COLORS.merged);
    strokeWeight(useTestInput ? 3 : 2);
    rectMode(CORNER);
    rect(startX, rangeY, Math.max(endX - startX, 2), barHeight, 5);
    
    // Draw label (only if bar is wide enough or test input)
    if (useTestInput || endX - startX > 50) {
      fill(...COLORS.background);
      noStroke();
      textSize(useTestInput ? 12 : 8);
      textAlign(CENTER, CENTER);
      text(formatRange(range[0], range[1]), (startX + endX) / 2, rangeY + barHeight / 2);
    }
    
    // Show source count if merged from multiple
    if (merged.sourceIndices.length > 1) {
      fill(...COLORS.selected);
      textSize(useTestInput ? 10 : 8);
      textAlign(LEFT, CENTER);
      text(`(merged ${merged.sourceIndices.length})`, endX + 10, rangeY + barHeight / 2);
    }
  }
}

function drawIngredientChecks(x, y, lineWidth) {
  const unitWidth = lineWidth / (NUMBER_LINE_MAX - NUMBER_LINE_MIN);
  
  textSize(14);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  text("Checking Ingredients:", x, y - 25);
  
  // Draw number line for checking
  drawNumberLine(x, y + 10, lineWidth, NUMBER_LINE_MIN, NUMBER_LINE_MAX);
  
  // Draw merged ranges on this line (faded)
  for (let merged of mergedRanges) {
    const range = merged.range;
    const startX = x + (range[0] - NUMBER_LINE_MIN) * unitWidth;
    const endX = x + (range[1] - NUMBER_LINE_MIN) * unitWidth;
    
    fill(...COLORS.merged, 80);
    noStroke();
    rectMode(CORNER);
    rect(startX, y - 5, endX - startX, 30, 3);
  }
  
  // Draw checked ingredients
  for (let i = 0; i < checkedIngredients.length; i++) {
    const item = checkedIngredients[i];
    const itemX = x + (item.value - NUMBER_LINE_MIN) * unitWidth;
    
    // Draw marker
    if (item.isFresh) {
      fill(...COLORS.fresh);
      stroke(...COLORS.fresh);
    } else {
      fill(...COLORS.notFresh);
      stroke(...COLORS.notFresh);
    }
    
    strokeWeight(2);
    
    // Draw diamond marker
    push();
    translate(itemX, y + 10);
    rotate(PI / 4);
    rectMode(CENTER);
    rect(0, 0, 12, 12);
    pop();
    
    // Draw value label
    fill(...COLORS.text);
    noStroke();
    textSize(10);
    textAlign(CENTER, TOP);
    text(formatValue(item.value), itemX, y + 30);
    
    // Draw fresh/not fresh icon
    textSize(14);
    text(item.isFresh ? "✓" : "✗", itemX, y + 45);
  }
  
  // Draw current checking item
  if (phase === "checking" && checkIndex < ingredientStock.length) {
    const stock = ingredientStock[checkIndex];
    const itemX = x + (stock - NUMBER_LINE_MIN) * unitWidth;
    
    // Pulsing highlight
    const pulse = sin(millis() / 80) * 50 + 200;
    fill(255, 255, 102, pulse);
    stroke(255, 255, 102);
    strokeWeight(3);
    
    push();
    translate(itemX, y + 10);
    rotate(PI / 4);
    rectMode(CENTER);
    rect(0, 0, 16, 16);
    pop();
    
    fill(...COLORS.selected);
    noStroke();
    textSize(10);
    textAlign(CENTER, TOP);
    text(formatValue(stock), itemX, y + 30);
    text("?", itemX, y + 45);
  }
}

function drawLegend() {
  const legendX = width - 180;
  const legendY = 160;
  const boxSize = 15;
  const lineHeight = 22;
  
  textSize(14);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  text("Legend:", legendX, legendY - 25);
  
  const legendItems = [
    { color: COLORS.merged, label: "Merged Range" },
    { color: COLORS.fresh, label: "Fresh ✓" },
    { color: COLORS.notFresh, label: "Not Fresh ✗" },
    { color: COLORS.checking, label: "Checking..." }
  ];
  
  legendItems.forEach((item, i) => {
    const y = legendY + i * lineHeight;
    
    fill(...item.color);
    noStroke();
    rect(legendX, y, boxSize, boxSize, 2);
    
    fill(...COLORS.text);
    textSize(12);
    text(item.label, legendX + boxSize + 8, y + 2);
  });
}

function drawStats() {
  const statsX = width - 180;
  const statsY = 280;
  
  textSize(14);
  textAlign(LEFT, TOP);
  fill(...COLORS.text);
  text("Statistics:", statsX, statsY);
  
  textSize(12);
  text(`Ranges: ${originalRanges.length}`, statsX, statsY + 25);
  text(`Merged: ${mergedRanges.length}`, statsX, statsY + 45);
  text(`Checked: ${checkedIngredients.length}/${ingredientStock.length}`, statsX, statsY + 65);
  
  fill(...COLORS.fresh);
  text(`Fresh: ${freshCount}`, statsX, statsY + 90);
  
  fill(...COLORS.notFresh);
  const notFresh = checkedIngredients.filter(i => !i.isFresh).length;
  text(`Not Fresh: ${notFresh}`, statsX, statsY + 110);
}

function toggleInput() {
  useTestInput = !useTestInput;
  
  if (useTestInput) {
    originalRanges = testRanges;
    ingredientStock = testStock;
  } else {
    originalRanges = realRanges;
    ingredientStock = realStock;
  }
  
  // Update button
  const btn = document.getElementById('input-toggle');
  btn.textContent = `Using: ${useTestInput ? 'TEST' : 'REAL'}`;
  btn.className = useTestInput ? 'active-test' : 'active-real';
  
  // Resize canvas for the input type
  updateCanvasSize();
  
  resetVisualization();
}

function calculateBounds() {
  // Find min and max values from ranges and stock
  let allValues = [];
  
  for (let range of originalRanges) {
    allValues.push(range[0], range[1]);
  }
  for (let stock of ingredientStock) {
    allValues.push(stock);
  }
  
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  
  // Add some padding (10%)
  const padding = (maxVal - minVal) * 0.1;
  NUMBER_LINE_MIN = Math.max(0, minVal - padding);
  NUMBER_LINE_MAX = maxVal + padding;
}

function resetVisualization() {
  // Calculate bounds for number line
  calculateBounds();
  
  // Reset state
  ranges = originalRanges.map((range, i) => ({
    range: [...range],
    originalIndex: i
  }));
  mergedRanges = [];
  phase = "show-ranges";
  currentStep = 0;
  mergeIndex = 0;
  checkIndex = 0;
  freshCount = 0;
  checkedIngredients = [];
  updateResultDisplay();
  updateSpeedIndicator();
}

function togglePause() {
  isPaused = !isPaused;
}

function nextStep() {
  isPaused = true;
  updateAnimation();
}

function skipToMerge() {
  // Complete showing and sorting
  currentStep = ranges.length + 1;
  ranges.sort((a, b) => a.range[0] - b.range[0]);
  phase = "merging";
  mergeIndex = 0;
  mergedRanges = [];
}

function skipToCheck() {
  // Complete all merging
  skipToMerge();
  
  // Complete merging
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i].range;
    
    if (mergedRanges.length === 0) {
      mergedRanges.push({ range: [...range], sourceIndices: [i] });
    } else {
      const lastMerged = mergedRanges[mergedRanges.length - 1];
      if (range[0] <= lastMerged.range[1]) {
        lastMerged.range[1] = Math.max(lastMerged.range[1], range[1]);
        lastMerged.sourceIndices.push(i);
      } else {
        mergedRanges.push({ range: [...range], sourceIndices: [i] });
      }
    }
  }
  
  mergeIndex = ranges.length;
  phase = "checking";
  checkIndex = 0;
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
  
  const r = Math.round(255 - speedPercent * 155);
  const g = Math.round(100 + speedPercent * 155);
  speedFill.style.backgroundColor = `rgb(${r}, ${g}, 100)`;
  
  speedValue.textContent = animationSpeed + 'ms';
}

function updateResultDisplay() {
  const resultDiv = document.getElementById('result');
  if (phase === "complete") {
    resultDiv.innerHTML = `<strong>Part 1: ${freshCount} fresh ingredients found!</strong> ⭐`;
  } else {
    resultDiv.innerHTML = `Checking ingredients...`;
  }
}

function formatRange(min, max) {
  if (min >= 1e12 || max >= 1e12) {
    return `${(min/1e12).toFixed(0)}T-${(max/1e12).toFixed(0)}T`;
  } else if (min >= 1e9 || max >= 1e9) {
    return `${(min/1e9).toFixed(0)}B-${(max/1e9).toFixed(0)}B`;
  } else if (min >= 1e6 || max >= 1e6) {
    return `${(min/1e6).toFixed(0)}M-${(max/1e6).toFixed(0)}M`;
  }
  return `${min}-${max}`;
}

function formatValue(val) {
  if (val >= 1e12) {
    return `${(val/1e12).toFixed(0)}T`;
  } else if (val >= 1e9) {
    return `${(val/1e9).toFixed(0)}B`;
  } else if (val >= 1e6) {
    return `${(val/1e6).toFixed(0)}M`;
  }
  return val.toString();
}
