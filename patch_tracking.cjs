const fs = require('fs');
let code = fs.readFileSync('src/components/LayerManagerPanel.tsx', 'utf8');

const target = `{issues.map((item) => {
              const solved = isSolved(item.status);
              const inProgress = isInProgress(item.status);
              const pending = isPending(item.status);

              return (`;

const renderItem = `const renderTrackingItem = (item) => {
              const solved = isSolved(item.status);
              const inProgress = isInProgress(item.status);
              const pending = isPending(item.status);

              return (`;

code = code.replace(target, renderItem);

const mapTarget = `          <div className="flex items-center gap-2.5 min-w-max py-0.5">
            {const renderTrackingItem`; // wait, I didn't replace that part correctly.
