const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          onUpdateStatus={handleUpdateStatus}`;
const replace = `          onUpdateStatus={(issueId, status) => {
            if (status === 'Solved') {
              const prob = issues.find((i) => i.id === issueId);
              if (prob) setProblemToSolve(prob);
            } else {
              handleUpdateStatus(issueId, status);
            }
          }}`;
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
