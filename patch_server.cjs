const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  estimatedDimensions?: any;
  workflowHistory?: Array<{`;
const replacement = `  estimatedDimensions?: any;
  startedAt?: number;
  solvedAt?: number;
  workflowHistory?: Array<{`;
code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
