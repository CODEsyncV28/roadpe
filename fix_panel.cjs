const fs = require('fs');
let code = fs.readFileSync('src/components/LayerManagerPanel.tsx', 'utf8');

const marker = `                  {/* Status Progression Controls: Pending -> In Progress -> Solved */}`;
const parts = code.split(marker);

// The first part is up to the Active Problems assignment info.
// The second part was the controls for Active Problems.
// BUT since I duplicated the whole block for Solved Problems, the marker appears TWICE now!

const newEnd = `                  {/* Status Progression Controls: Pending -> In Progress -> Solved */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 gap-1">
                    <div className="flex items-center gap-1">
                      {solved && onUpdateStatus && (
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
};`;

// replace the second occurrence's tail with newEnd!
// Or wait, let's just use regex to replace everything from the SECOND occurrence of the marker to the end of the file.

let firstIndex = code.indexOf(marker);
let secondIndex = code.indexOf(marker, firstIndex + 1);

if (secondIndex !== -1) {
    code = code.substring(0, secondIndex) + newEnd;
    fs.writeFileSync('src/components/LayerManagerPanel.tsx', code);
    console.log("Fixed!");
} else {
    console.log("Marker not found twice!");
}
