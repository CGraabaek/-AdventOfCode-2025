const fs = require("fs");
const path = require("path");

// Get day number from command line argument
const dayNumber = process.argv[2];

if (!dayNumber) {
  console.log("❌ Please provide a day number");
  console.log("Usage: node new-day.js <day_number>");
  console.log("Example: node new-day.js 4");
  process.exit(1);
}

const dayFolder = path.join(__dirname, "Javascript", `Day_${dayNumber}`);

// Check if folder already exists
if (fs.existsSync(dayFolder)) {
  console.log(`❌ Day ${dayNumber} already exists at ${dayFolder}`);
  process.exit(1);
}

// Create the folder
fs.mkdirSync(dayFolder, { recursive: true });

// Template for the solution file
const solutionTemplate = `const fs = require("fs");

// Use --test or -t flag for test input, otherwise use real input
const useTestInput = process.argv.includes("--test") || process.argv.includes("-t");
const inputFile = useTestInput ? "./test_input.txt" : "./input.txt";
const puzzleInput = fs.readFileSync(inputFile).toString().split("\\n");

console.log(\`Using \${useTestInput ? "TEST" : "REAL"} input\`);

`;

// Create files
fs.writeFileSync(path.join(dayFolder, `day_${dayNumber}.js`), solutionTemplate);
fs.writeFileSync(path.join(dayFolder, "input.txt"), "");
fs.writeFileSync(path.join(dayFolder, "test_input.txt"), "");

console.log(`✅ Created Day ${dayNumber} scaffold:`);
console.log(`   📁 Javascript/Day_${dayNumber}/`);
console.log(`   📄 day_${dayNumber}.js`);
console.log(`   📄 input.txt`);
console.log(`   📄 test_input.txt`);
console.log("");
console.log(`🚀 Get started: cd Javascript/Day_${dayNumber} && node day_${dayNumber}.js`);
