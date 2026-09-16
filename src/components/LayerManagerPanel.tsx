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
  FileCheck,
  UserCheck,
  Building2,
  XCircle,
  Send,
  Eye,
  ArrowRight,
  Play
} from 'lucide-react';
import { ActiveLayer, RoadIssue, WorkflowStatus, VerificationStatus } from '../types';

interface LayerManagerPanelProps {
  activeLayer: ActiveLayer;
  issues: RoadIssue[];
  onSelectIssue: (issue: RoadIssue) => void;
  onUpdateIssue: (issue: RoadIssue) => void;
  onOpenAssignModal?: (issue: RoadIssue) => void;
  onVerifyProblem?: (issueId: string) => void;
  onRejectProblem?: (issueId: string) => void;
  onUpdateStatus?: (issueId: string, status: 'Pending' | 'In Progress' | 'Solved') => void;
  onClose: () => void;
}

export const LayerManagerPanel: React.FC<LayerManagerPanelProps> = ({
  activeLayer,
  issues,
  onSelectIssue,
  onUpdateIssue,
  onOpenAssignModal,
  onVerifyProblem,
  onRejectProblem,
  onUpdateStatus,
  onClose,
}) => {
  const isSolved = (s: string) => s === 'Solved' || s === 'RESOLVED';
  const isPending = (s: string) => s === 'Pending' || s === 'PENDING';
  const isInProgress = (s: string) => s === 'In Progress' || s === 'IN_PROGRESS' || s === 'DISPATCHED';

  const isAiTab = activeLayer === 'AI_LAYER' || activeLayer === 'AI_DETECTION';
  const isAuthorityTab = activeLayer === 'AUTHORITY_LAYER' || activeLayer === 'AUTHORITY_VERIFICATION';
  const isTrackingTab = activeLayer === 'MAINTENANCE_LAYER' || activeLayer === 'ASSIGN_TRACKING';

  return (
    <div className="bg-[#090e1a]/95 backdrop-blur-md border-t border-cyan-950/80 px-4 py-3 select-none text-xs font-mono shrink-0 shadow-2xl relative z-10">
      
      {/* Workflow Stage Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {isAiTab && (
            <>
              <div className="p-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-100 uppercase tracking-wider">AI Detection Workflow</span>
                <span className="text-[11px] text-slate-400 block">Automated YOLOv8 road defect detections &amp; sensor telemetry stream</span>
              </div>
            </>
          )}

          {isAuthorityTab && (
            <>
              <div className="p-1 rounded bg-amber-950 border border-amber-500/40 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-100 uppercase tracking-wider">Authority &amp; Verification Workflow</span>
                <span className="text-[11px] text-slate-400 block">Review detected problems, verify validity, reject false positives, and assign to responsible authority</span>
              </div>
            </>
          )}

          {isTrackingTab && (
            <>
              <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-100 uppercase tracking-wider">Problem Status Tracking Workflow</span>
                <span className="text-[11px] text-slate-400 block">Track maintenance progress through linear states: Pending → In Progress → Solved</span>
              </div>
            </>
          )}
        </div>

        <button
          id="btn-hide-workflow-panel"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 cursor-pointer transition-colors"
        >
          Hide Panel
        </button>
      </div>

      {/* Stage-Specific Horizontal Scroller / Work Queue */}
      <div className="overflow-x-auto scrollbar-thin pb-1">
        
        {/* STAGE 1: AI DETECTION */}
        {isAiTab && (
          <div className="flex items-center gap-2.5 min-w-max py-0.5">
            {issues.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectIssue(item)}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer w-72 flex flex-col justify-between group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 font-bold">{item.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">{item.confidence}% Conf</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {item.evidenceImage && (
                    <img
                      src={item.evidenceImage}
                      alt={item.title}
                      className="w-12 h-9 rounded object-cover border border-slate-800 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-200 font-sans font-semibold text-[11px] truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      📍 {item.locationName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-900">
                  <span>Bus: <strong className="text-amber-300">{item.busId}</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIssue(item);
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/60 text-[10px] transition-colors"
                    >
                      View Detection
                    </button>
                    {item.verification !== 'Verified' && item.verification !== 'VERIFIED' && onVerifyProblem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyProblem(item.id);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-[10px] transition-colors"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STAGE 2: AUTHORITY & VERIFICATION */}
        {isAuthorityTab && (
          <div className="flex items-center gap-2.5 min-w-max py-0.5">
            {issues.map((item) => {
              const isVerified = item.verification === 'Verified' || item.verification === 'VERIFIED';
              const isRejected = item.verification === 'Rejected' || item.verification === 'REJECTED';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIssue(item)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer w-84 flex flex-col justify-between shadow-sm ${
                    isVerified
                      ? 'bg-[#08121a] border-emerald-800/70 hover:border-emerald-500'
                      : isRejected
                      ? 'bg-[#180b0e] border-rose-900/60 opacity-75'
                      : 'bg-[#121622] border-amber-600/60 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold">{item.id}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono bg-slate-900 border border-slate-700 text-slate-300">
                        {item.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        isVerified
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : isRejected
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                      }`}
                    >
                      {item.verification.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {item.evidenceImage && (
                      <img
                        src={item.evidenceImage}
                        alt={item.title}
                        className="w-12 h-9 rounded object-cover border border-slate-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-200 font-sans font-semibold text-[11px] truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        📍 {item.locationName} &bull; <span className="text-cyan-300 font-mono">{item.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {item.assignedAuthority && (
                    <div className="text-[10px] text-indigo-300 mb-1.5 truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Assigned: <strong>{item.assignedAuthority}</strong></span>
                    </div>
                  )}

                  {/* Actions: View, Verify, Reject, Assign Problem */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 gap-1.5">
                    <div className="flex items-center gap-1">
                      {!isVerified && onVerifyProblem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerifyProblem(item.id);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-700/80 hover:bg-emerald-600 text-slate-950 font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
                          title="Verify detection"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      )}
                      {!isRejected && onRejectProblem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectProblem(item.id);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] transition-colors cursor-pointer"
                          title="Reject as false positive"
                        >
                          Reject
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
                          className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                          title="Open assignment modal"
                        >
                          <Send className="w-3 h-3" />
                          <span>Assign Problem</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(item);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STAGE 3: PROBLEM STATUS TRACKING (Pending -> In Progress -> Solved) */}
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
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer w-88 flex flex-col justify-between shadow-sm ${
                    solved
                      ? 'bg-emerald-950/30 border-emerald-700/70 hover:border-emerald-500'
                      : inProgress
                      ? 'bg-cyan-950/30 border-cyan-600/70 hover:border-cyan-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">{item.id}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                          item.priority === 'Critical' || item.severity === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}
                      >
                        {item.priority || item.severity} Priority
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono ${
                        solved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : inProgress
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                          : 'bg-amber-950 text-amber-300 border-amber-600'
                      }`}
                    >
                      {solved ? '✓ Solved' : inProgress ? '⚡ In Progress' : '⏳ Pending'}
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

                  {/* Status Progression Controls: Pending -> In Progress -> Solved */}
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
        )}

      </div>

    </div>
  );
};
