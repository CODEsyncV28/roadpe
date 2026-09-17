import React, { useState } from 'react';
import { 
  Filter, 
  Activity, 
  Radio, 
  Crosshair, 
  AlertTriangle, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { RoadIssue, BusFleet, IssueType, Severity } from '../types';

interface CityMapProps {
  issues: RoadIssue[];
  busFleet: BusFleet[];
  selectedIssue: RoadIssue | null;
  onSelectIssue: (issue: RoadIssue) => void;
  onSelectBus: (bus: BusFleet) => void;
  filterType: IssueType | 'ALL';
  setFilterType: (type: IssueType | 'ALL') => void;
  filterSeverity: Severity | 'ALL';
  setFilterSeverity: (sev: Severity | 'ALL') => void;
}

export const CityMap: React.FC<CityMapProps> = ({
  issues,
  busFleet,
  selectedIssue,
  onSelectIssue,
  filterSeverity,
  setFilterSeverity,
}) => {
  const [showLegend, setShowLegend] = useState(true);

  const activeIssues = issues.filter((i) => i.status !== 'Solved' && i.status !== 'Rejected');
  const highHazards = activeIssues.filter((i) => i.severity === 'HIGH');
  const mediumHazards = activeIssues.filter((i) => i.severity === 'MEDIUM');

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent overflow-hidden select-none">
      
      {/* Floating Top Control Bar (Left) - Non-map Telemetry HUD */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-[#090e1a]/85 backdrop-blur-md p-1.5 px-2.5 rounded-lg border border-cyan-900/50 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold tracking-wider">AI SYSTEM VISUALIZATION</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" />
            <span>10 Abstract Corridors</span>
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Telemetry Active</span>
          </span>
        </div>
      </div>

      {/* Floating Filter Badges (Top-Right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-auto">
        <div className="bg-[#090e1a]/85 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-800 shadow-xl flex items-center gap-1.5 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 text-[11px]">Severity:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                filterSeverity === sev
                  ? sev === 'HIGH'
                    ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : sev === 'MEDIUM'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : sev === 'LOW'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Anomaly Inspector Callout (if an issue is selected in feed or workflow) */}
      {selectedIssue && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 max-w-md w-[92%] sm:w-auto bg-[#090e1a]/95 backdrop-blur-md border border-cyan-500/60 rounded-lg p-3 shadow-[0_0_25px_rgba(6,182,212,0.25)] pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedIssue.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                selectedIssue.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {selectedIssue.severity} HAZARD
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{selectedIssue.id}</span>
            </div>
            <button
              onClick={() => onSelectIssue(selectedIssue)}
              className="text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              [Inspect Evidence]
            </button>
          </div>
          <p className="text-xs text-slate-100 font-medium line-clamp-1 mb-1">{selectedIssue.title}</p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="truncate">{selectedIssue.locationName}</span>
            <span className="text-cyan-400 shrink-0">{(selectedIssue.confidence * 100).toFixed(0)}% Conf</span>
          </div>
        </div>
      )}

      {/* Subtle Corner Telemetry Grids (Control Room Ambient Details) */}
      <div className="absolute top-14 left-4 z-0 pointer-events-none hidden sm:block opacity-30">
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/80">
          <Crosshair className="w-3 h-3 text-cyan-500" />
          <span>SYS.SEC // 04-TRANSIT</span>
        </div>
      </div>

      <div className="absolute bottom-16 right-4 z-0 pointer-events-none hidden sm:block opacity-25">
        <div className="text-right text-[9px] font-mono text-slate-500 leading-tight">
          <div>LOC.STREAM // DECORATIVE_BG</div>
          <div>RES // 60FPS_VECTOR_CANVAS</div>
        </div>
      </div>

      {/* Floating Bottom Legend & Telemetry Status */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-10 bg-[#090e1a]/85 backdrop-blur-md p-2.5 rounded-lg border border-cyan-950/80 shadow-2xl max-w-xs hidden md:block pointer-events-auto">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-mono text-[11px] font-bold text-slate-200">TRANSIT NETWORK TELEMETRY</span>
            </div>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
            >
              [Hide]
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Critical Hazards:</span>
              </span>
              <span className="text-rose-400 font-bold">{highHazards.length} Detected</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Medium Hazards:</span>
              </span>
              <span className="text-amber-400 font-bold">{mediumHazards.length} Detected</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Transit Fleet Units:</span>
              </span>
              <span className="text-cyan-400 font-bold">{busFleet.length} Active Units</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>AI Visualization Layer</span>
            <span className="text-cyan-400/80 font-semibold">{issues.length} Total Telemetry Records</span>
          </div>
        </div>
      )}

      {/* Re-open legend button if hidden */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-3 left-3 z-10 bg-[#090e1a]/90 px-2 py-1 rounded text-xs font-mono text-cyan-300 border border-cyan-900 pointer-events-auto"
        >
          [Show Telemetry]
        </button>
      )}

    </div>
  );
};
