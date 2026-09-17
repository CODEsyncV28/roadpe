const fs = require('fs');
let code = fs.readFileSync('src/components/LayerManagerPanel.tsx', 'utf8');

const startMarker = `{/* STAGE 3: PROBLEM STATUS TRACKING (Pending -> In Progress -> Solved) */}`;
const startIndex = code.indexOf(startMarker);
const beforeTracking = code.substring(0, startIndex);

const trackingCode = `        {/* STAGE 3: PROBLEM STATUS TRACKING (Pending -> In Progress -> Solved) */}
        {isTrackingTab && (
          <div className="flex gap-6 min-w-max py-0.5">
            {/* ACTIVE PROBLEMS */}
            <div className="flex flex-col gap-2 relative">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider sticky left-0 px-1 pt-1 bg-[#090e1a]/95 backdrop-blur-md">Active Problem Status</div>
              <div className="flex items-center gap-2.5">
                {issues.filter(i => (i.verification === 'VERIFIED' || i.verification === 'Verified' || i.verification === 'Verified by Staff' || i.verification === 'AUTHORITY_OVERRIDE' || i.verification === 'Authority Override') && !isSolved(i.status) && !(i.verification === 'FALSE_POSITIVE' || i.verification === 'False Positive')).map((item) => {
                  const solved = isSolved(item.status);
                  const inProgress = isInProgress(item.status);
                  const pending = isPending(item.status);

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
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">{item.id}</span>
                          <span
                            className={\`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border \${
                              item.priority === 'Critical' || item.severity === 'HIGH'
                                ? 'bg-rose-950 text-rose-300 border-rose-700'
                                : 'bg-amber-950 text-amber-300 border-amber-700'
                            }\`}
                          >
                            {item.priority || item.severity} Priority
                          </span>
                        </div>
                        {/* Status Badge */}
                        <span
                          className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono \${
                            inProgress
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                              : 'bg-amber-950 text-amber-300 border-amber-600'
                          }\`}
                        >
                          {inProgress ? '⚡ In Progress' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="text-slate-200 font-sans font-semibold text-[11px] truncate mb-1">
                        {item.title}
                      </div>

                      {/* Assignment Information */}
                      <div className="p-1.5 rounded bg-[#070b14] border border-slate-800/80 mb-2 space-y-0.5 text-[10px]">
                        <div className="text-slate-300 flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-cyan-400" />
                            <span>Team:</span>
                          </span>
                          <span className="text-slate-200 font-medium truncate max-w-[170px]">
                            {item.assignedAuthority || 'Road Maintenance Team'}
                          </span>
                        </div>
                        {item.assignedPerson && (
                          <div className="text-slate-300 flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              <span>Lead:</span>
                            </span>
                            <span className="text-slate-200 font-medium truncate max-w-[170px]">
                              {item.assignedPerson}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Progression Controls */}
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 gap-1">
                        <div className="flex items-center gap-1">
                          {pending && onUpdateStatus && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(item.id, 'In Progress');
                              }}
                              className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-slate-950" />
                              <span>Start Work</span>
                            </button>
                          )}
                          {inProgress && onUpdateStatus && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(item.id, 'Solved');
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Solved</span>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {onOpenAssignModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAssignModal(item);
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                              title="Assign or reassign"
                            >
                              Reassign
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIssue(item);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SOLVED PROBLEMS */}
            <div className="flex flex-col gap-2 pl-4 border-l border-slate-800 relative">
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider sticky left-0 px-1 pt-1 bg-[#090e1a]/95 backdrop-blur-md">Solved Problems / Resolved History</div>
              <div className="flex items-center gap-2.5">
                {issues.filter(i => isSolved(i.status) && !(i.verification === 'FALSE_POSITIVE' || i.verification === 'False Positive')).map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectIssue(item)}
                      className="p-2.5 rounded-lg border transition-all cursor-pointer w-88 flex flex-col justify-between shadow-sm bg-emerald-950/30 border-emerald-700/70 hover:border-emerald-500"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">{item.id}</span>
                          <span
                            className={\`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border \${
                              item.priority === 'Critical' || item.severity === 'HIGH'
                                ? 'bg-rose-950 text-rose-300 border-rose-700'
                                : 'bg-amber-950 text-amber-300 border-amber-700'
                            }\`}
                          >
                            {item.priority || item.severity} Priority
                          </span>
                        </div>
                        {/* Status Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono bg-emerald-950 text-emerald-300 border-emerald-600">
                          ✓ Solved
                        </span>
                      </div>

                      <div className="text-slate-200 font-sans font-semibold text-[11px] truncate mb-1">
                        {item.title}
                      </div>

                      {/* Assignment Information */}
                      <div className="p-1.5 rounded bg-[#070b14] border border-slate-800/80 mb-2 space-y-0.5 text-[10px]">
                        <div className="text-slate-300 flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-cyan-400" />
                            <span>Team:</span>
                          </span>
                          <span className="text-slate-200 font-medium truncate max-w-[170px]">
                            {item.assignedAuthority || 'Road Maintenance Team'}
                          </span>
                        </div>
                        {item.assignedPerson && (
                          <div className="text-slate-300 flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              <span>Lead:</span>
                            </span>
                            <span className="text-slate-200 font-medium truncate max-w-[170px]">
                              {item.assignedPerson}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Progression Controls */}
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 gap-1">
                        <div className="flex items-center gap-1">
                          {onUpdateStatus && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(item.id, 'In Progress');
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIssue(item);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            View Record
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
`;

const newCode = beforeTracking + trackingCode;
fs.writeFileSync('src/components/LayerManagerPanel.tsx', newCode);
