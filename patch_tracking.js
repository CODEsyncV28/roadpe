const fs = require('fs');
let code = fs.readFileSync('src/components/LayerManagerPanel.tsx', 'utf8');

const target = `        {/* STAGE 3: PROBLEM STATUS TRACKING (Pending -> In Progress -> Solved) */}
        {isTrackingTab && (
          <div className="flex items-center gap-2.5 min-w-max py-0.5">
            {issues.map((item) => {
              const solved = isSolved(item.status);
              const inProgress = isInProgress(item.status);
              const pending = isPending(item.status);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIssue(item)}
                  className={\`p-2.5 rounded-lg border transition-all cursor-pointer w-88 flex flex-col justify-between shadow-sm \${
                    solved
                      ? 'bg-emerald-950/30 border-emerald-700/70 hover:border-emerald-500'
                      : inProgress
                      ? 'bg-cyan-950/30 border-cyan-600/70 hover:border-cyan-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }\`}
                >`;

const replacement = `        {/* STAGE 3: PROBLEM STATUS TRACKING (Pending -> In Progress -> Solved) */}
        {isTrackingTab && (
          <div className="flex gap-6 min-w-max py-0.5">
            {/* ACTIVE PROBLEMS */}
            <div className="flex flex-col gap-2 relative">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider sticky left-0 px-1 pt-1 bg-[#090e1a]/95 backdrop-blur-md">Active Problem Status</div>
              <div className="flex items-center gap-2.5">
                {issues.filter(i => (i.verification === 'VERIFIED' || i.verification === 'Verified' || i.verification === 'Verified by Staff' || i.verification === 'AUTHORITY_OVERRIDE' || i.verification === 'Authority Override') && !isSolved(i.status) && !(i.verification === 'FALSE_POSITIVE' || i.verification === 'False Positive')).map((item) => {
                  const inProgress = isInProgress(item.status);
                  const pending = isPending(item.status);
                  const solved = false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectIssue(item)}
                      className={\`p-2.5 rounded-lg border transition-all cursor-pointer w-88 flex flex-col justify-between shadow-sm \${
                        inProgress
                          ? 'bg-cyan-950/30 border-cyan-600/70 hover:border-cyan-400'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }\`}
                    >
`;

// Wait, I need to copy the inner part and close it, then do the same for solved!
