import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Wrench, 
  AlertTriangle, 
  AlertCircle,
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
  trackingTab?: 'PENDING' | 'IN_PROGRESS' | 'SOLVED';
  setTrackingTab?: (tab: 'PENDING' | 'IN_PROGRESS' | 'SOLVED') => void;
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
  trackingTab,
  setTrackingTab,
}) => {
  const [internalTrackingTab, setInternalTrackingTab] = useState<'PENDING' | 'IN_PROGRESS' | 'SOLVED'>('PENDING');
  const currentTrackingTab = trackingTab || internalTrackingTab;
  const handleSelectTrackingTab = (tab: 'PENDING' | 'IN_PROGRESS' | 'SOLVED') => {
    if (setTrackingTab) setTrackingTab(tab);
    setInternalTrackingTab(tab);
  };

  const isSolved = (s: string) => s === 'Solved' || s === 'SOLVED' || s === 'RESOLVED';
  const isPending = (s: string) => s === 'Pending' || s === 'PENDING';
  const isInProgress = (s: string) => s === 'In Progress' || s === 'IN_PROGRESS' || s === 'DISPATCHED';
  const isFalsePositive = (i: RoadIssue) => i.verification === 'FALSE_POSITIVE' || i.verification === 'False Positive' || i.status === 'Closed' || i.status === 'CLOSED';

  const pendingIssues = issues.filter(i => isPending(i.status) && !isFalsePositive(i));
  const inProgressIssues = issues.filter(i => isInProgress(i.status) && !isFalsePositive(i));
  const solvedIssues = issues.filter(i => isSolved(i.status) && !isFalsePositive(i));

  const isAiTab = activeLayer === 'AI_LAYER' || activeLayer === 'AI_DETECTION';
  const isAuthorityTab = activeLayer === 'AUTHORITY_LAYER' || activeLayer === 'AUTHORITY_VERIFICATION';
  const isTrackingTab = activeLayer === 'MAINTENANCE_LAYER' || activeLayer === 'ASSIGN_TRACKING';

  return (
    <div className="bg-[#090e1a]/85 backdrop-blur-md border-t border-cyan-950/80 px-4 py-3 select-none text-xs font-mono shrink-0 shadow-2xl relative z-10">
      
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
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-100 uppercase tracking-wider">Problem Status Tracking</span>
                  <span className="text-[11px] text-slate-400 block">Pending → In Progress → Solved</span>
                </div>
              </div>

              {/* Three Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 ml-1">
                <button
                  id="tab-tracking-pending"
                  type="button"
                  onClick={() => handleSelectTrackingTab('PENDING')}
                  className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentTrackingTab === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/70 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span>PENDING</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    currentTrackingTab === 'PENDING' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {pendingIssues.length}
                  </span>
                </button>

                <button
                  id="tab-tracking-inprogress"
                  type="button"
                  onClick={() => handleSelectTrackingTab('IN_PROGRESS')}
                  className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentTrackingTab === 'IN_PROGRESS'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/70 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span>IN PROGRESS</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    currentTrackingTab === 'IN_PROGRESS' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {inProgressIssues.length}
                  </span>
                </button>

                <button
                  id="tab-tracking-solved"
                  type="button"
                  onClick={() => handleSelectTrackingTab('SOLVED')}
                  className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentTrackingTab === 'SOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/70 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span>SOLVED</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    currentTrackingTab === 'SOLVED' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {solvedIssues.length}
                  </span>
                </button>
              </div>
            </div>
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
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer w-88 flex flex-col justify-between shadow-sm ${
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

                  {/* Primary Visual: Stored Problem Evidence Image with Exact Coordinates */}
                  <div className="relative h-32 rounded overflow-hidden bg-slate-950 border border-slate-800 mb-2 group">
                    <img
                      src={item.evidenceImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-cyan-300 border border-slate-800">
                      📍 {item.lat.toFixed(4)}°, {item.lng.toFixed(4)}°
                    </div>
                    {item.googleMapsUrl && (
                      <a
                        href={item.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md hover:bg-black text-[9px] font-mono text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                        title="Open stored coordinates in Google Maps"
                      >
                        Map ↗
                      </a>
                    )}
                  </div>

                  <div className="space-y-1 mb-2">
                    <div className="text-slate-200 font-sans font-semibold text-[11px] truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span>📍 {item.locationName}</span>
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono flex items-center justify-between pt-0.5">
                      <span>AI Confidence: <strong className="text-cyan-200">{item.confidence}%</strong></span>
                      {item.lat !== undefined && item.lng !== undefined && (
                        <span className="text-slate-500 text-[9px]">
                          {item.lat.toFixed(4)}°, {item.lng.toFixed(4)}°
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Only display assigned if an assignment genuinely exists in the database */}
                  {item.assignedAuthority && (
                    <div className="text-[10px] text-indigo-300 mb-2 truncate flex items-center gap-1 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                      <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Assigned: <strong>{item.assignedAuthority}</strong></span>
                    </div>
                  )}

                  {/* Actions: Review, Verify, Reject, View - STRICTLY NO ASSIGN BUTTON HERE */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 gap-1.5">
                    <div className="flex items-center gap-1">
                      {!isVerified && onVerifyProblem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerifyProblem(item.id);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                          title="Verify detection"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
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
                          className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] transition-colors cursor-pointer"
                          title="Reject detection as false positive"
                        >
                          Reject
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
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition-colors border border-slate-700 cursor-pointer"
                        title="View problem details and AI detection evidence"
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
          <div className="flex flex-col gap-2 min-w-max py-0.5">
            <div className="flex items-center gap-2.5">
              {(currentTrackingTab === 'PENDING' ? pendingIssues : currentTrackingTab === 'IN_PROGRESS' ? inProgressIssues : solvedIssues).length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">
                      No problems currently with status: {currentTrackingTab === 'PENDING' ? 'Pending' : currentTrackingTab === 'IN_PROGRESS' ? 'In Progress' : 'Solved'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentTrackingTab === 'PENDING' && 'All problems have work orders initiated or have been resolved.'}
                      {currentTrackingTab === 'IN_PROGRESS' && 'No work orders currently active on site. Open a pending problem to dispatch or update work order.'}
                      {currentTrackingTab === 'SOLVED' && 'No problems have been marked as resolved yet.'}
                    </div>
                  </div>
                </div>
              ) : (
                (currentTrackingTab === 'PENDING' ? pendingIssues : currentTrackingTab === 'IN_PROGRESS' ? inProgressIssues : solvedIssues).map((item) => {
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

                      <div className="text-slate-200 font-sans font-semibold text-[11px] truncate mb-0.5">
                        {item.title}
                      </div>

                      <div className="text-[10px] text-slate-400 truncate mb-1.5 flex items-center gap-1">
                        <span>📍 {item.locationName || item.location?.address || `${item.location?.lat.toFixed(4)}, ${item.location?.lng.toFixed(4)}`}</span>
                      </div>

                      {/* Workflow Details: Verification, Assignment, Status */}
                      <div className="p-2 rounded bg-[#070b14] border border-slate-800/80 mb-2 space-y-1 text-[10px] font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Verification:</span>
                          <span className={item.verification?.includes('VERIFIED') || item.verification?.includes('Verified') ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {item.verification || 'PENDING VERIFICATION'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Assignment:</span>
                          <span className={item.assignedAuthority ? 'text-indigo-300 font-bold truncate max-w-[160px]' : 'text-slate-500'}>
                            {item.assignedAuthority || 'UNASSIGNED'}
                          </span>
                        </div>
                        {item.assignedPerson && (
                          <div className="flex items-center justify-between pt-0.5 border-t border-slate-800/60">
                            <span className="text-slate-500">Crew Lead:</span>
                            <span className="text-slate-300 truncate max-w-[160px]">{item.assignedPerson}</span>
                          </div>
                        )}
                        {solved && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Road Condition:</span>
                            <span className="text-emerald-300 font-bold">Repaired</span>
                          </div>
                        )}
                      </div>

                      {/* Status Progression Controls & Action Buttons */}
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
                              title="Start Work (moves to In Progress)"
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
                              title="Mark problem as Solved"
                            >
                              <CheckCircle2 className="w-3 h-3 text-slate-950" />
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
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                              title="Reopen problem to In Progress"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {onOpenAssignModal && !solved && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAssignModal(item);
                              }}
                              className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                                item.assignedAuthority
                                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-sm'
                              }`}
                              title={item.assignedAuthority ? 'Reassign problem' : 'Assign problem to department'}
                            >
                              <Send className="w-3 h-3" />
                              <span>{item.assignedAuthority ? 'Reassign' : 'Assign'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIssue(item);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          >
                            {solved ? 'View Record' : 'View'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
