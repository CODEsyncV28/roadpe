const fs = require('fs');
let code = fs.readFileSync('src/components/LayerManagerPanel.tsx', 'utf8');
const startMarker = `{/* STAGE 3: PROBLEM STATUS TRACKING (Pending -> In Progress -> Solved) */}`;
const startIndex = code.indexOf(startMarker);
console.log(code.substring(startIndex - 50, startIndex));
