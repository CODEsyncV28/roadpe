import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronRight,
  Truck,
  FileCheck
} from 'lucide-react';
import { ActiveLayer, RoadIssue, WorkflowStatus, VerificationStatus } from '../types';

interface LayerManagerPanelProps {
  activeLayer: ActiveLayer;
  issues: RoadIssue[];
  onSelectIssue: (issue: RoadIssue) => void;
  onUpdateIssue: (issue: RoadIssue) => void;
  onClose: () => void;
}

export const LayerManagerPanel: React.FC<LayerManagerPanelProps> = ({
  activeLayer,
  issues,
  onSelectIssue,
  onUpdateIssue,
  onClose,
}) => {
  return (
    <div className="bg-[#090e1a]/95 backdrop-blur-md border-t border-cyan-950/80 px-4 py-3 select-none text-xs font-mono shrink-0 shadow-2xl relative z-10">
      
      {/* Layer Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {activeLayer === 'AI_LAYER' && (
            <>
              <div className="p-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-100 uppercase">Layer 1: AI Edge Ingestion &amp; Sensor Fusion</span>
                <span className="text-[11px] text-slate-400 block">Automated YOLOv8 object detection + IMU accelerometer z-axis bump correlation</span>
              </div>
            </>
          )}

          {activeLayer === 'AUTHORITY_LAYER' && (
            <>
              <div className="p-1 rounded bg-amber-950 border border-amber-500/40 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-100 uppercase">Layer 2: Municipal Authority Actions &amp; Verification</span>
                <span className="text-[11px] text-slate-400 block">Verify detections, correct false positives, manage road closures &amp; construction zones</span>
              </div>
            </>
          )}

          {activeLayer === 'MAINTENANCE_LAYER' && (
            <>
              <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-100 uppercase">Layer 3: Maintenance &amp; Repair Dispatch Workflow</span>
                <span className="text-[11px] text-slate-400 block">Assign PWD repair crews, track work orders (Pending → Dispatched → In Progress → Resolved)</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 cursor-pointer"
        >
          Hide Panel
        </button>
      </div>

      {/* Layer-Specific Horizontal Scroller / Work Queue */}
      <div className="overflow-x-auto scrollbar-thin">
        {activeLayer === 'AI_LAYER' && (
          <div className="flex items-center gap-2.5 min-w-max py-1">
            {issues.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectIssue(item)}
                className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer w-64 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cyan-400 font-bold">{item.id}</span>
                  <span className="text-emerald-400">{item.confidence}% Conf</span>
                </div>
                <div className="text-slate-200 font-sans font-semibold text-[11px] truncate mb-1">
                  {item.title}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  <span>Bus: {item.busId}</span>
                  <span>Bump: <strong className="text-rose-400">{item.telemetry.zVibrationG}G</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeLayer === 'AUTHORITY_LAYER' && (
          <div className="flex items-center gap-2.5 min-w-max py-1">
            {issues.map((item) => {
              const isVerified = item.verification === 'VERIFIED';
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIssue(item)}
                  className={`p-2 rounded border transition-all cursor-pointer w-72 flex flex-col justify-between ${
                    isVerified
                      ? 'bg-slate-950 border-emerald-800/60'
                      : 'bg-[#121622] border-amber-600/50 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-400 font-bold">{item.id}</span>
                    <span className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold ${
                      isVerified ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {item.verification.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-200 font-sans font-semibold text-[11px] truncate mb-1">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span className="truncate max-w-[140px]">📍 {item.locationName}</span>
                    <span className="text-cyan-300 underline group-hover:text-cyan-200">
                      Verify / Edit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeLayer === 'MAINTENANCE_LAYER' && (
          <div className="flex items-center gap-2.5 min-w-max py-1">
            {issues.map((item) => {
              const isResolved = item.status === 'RESOLVED';
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIssue(item)}
                  className={`p-2 rounded border transition-all cursor-pointer w-72 flex flex-col justify-between ${
                    isResolved
                      ? 'bg-emerald-950/20 border-emerald-700/60'
                      : 'bg-slate-950 border-slate-800 hover:border-cyan-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-cyan-400 font-bold">{item.id}</span>
                    <span className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold ${
                      isResolved ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-slate-200 font-sans font-semibold text-[11px] truncate mb-1">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span className="truncate max-w-[150px]">{item.assignedCrew || 'Unassigned Crew'}</span>
                    <span className="text-emerald-400 font-bold">
                      {isResolved ? 'Audit Complete' : 'Dispatch'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
