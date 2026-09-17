const fs = require('fs');
let code = fs.readFileSync('src/components/LayerManagerPanel.tsx', 'utf8');

const target = `                          {inProgress && onUpdateStatus && (
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
                          )}`;

const replacement = `                          {inProgress && (
                            <div className="px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-400 font-bold border border-cyan-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                              <span>
                                {item.startedAt 
                                  ? \`\${Math.max(0, 120 - Math.floor((Date.now() - item.startedAt) / 1000))}s left\`
                                  : 'Working...'}
                              </span>
                            </div>
                          )}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/LayerManagerPanel.tsx', code);
