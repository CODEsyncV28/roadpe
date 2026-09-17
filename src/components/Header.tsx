import React from 'react';
import { 
  Bus, 
  ShieldAlert, 
  Cpu, 
  Wrench, 
  Video, 
  Radio, 
  Sparkles, 
  PlusCircle,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload
} from 'lucide-react';
import { ActiveLayer, RoadIssue, BusFleet } from '../types';

interface HeaderProps {
  activeLayer: ActiveLayer;
  setActiveLayer: (layer: ActiveLayer) => void;
  issues: RoadIssue[];
  busFleet: BusFleet[];
  onOpenUploadModal: () => void;
  onOpenSimulateModal: () => void;
  onOpenBusCameraModal: (busId?: string) => void;
  onOpenManualAddModal: () => void;
  currentTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeLayer,
  setActiveLayer,
  issues,
  busFleet,
  onOpenUploadModal,
  onOpenSimulateModal,
  onOpenBusCameraModal,
  onOpenManualAddModal,
  currentTime,
}) => {
  const isSolved = (s: string) => s === 'Solved' || s === 'RESOLVED';
  const isFalsePositive = (i: RoadIssue) => i.verification === 'FALSE_POSITIVE' || i.verification === 'False Positive' || i.status === 'Closed' || i.status === 'CLOSED';
  const isPending = (s: string) => s === 'Pending' || s === 'PENDING';
  const isInProgress = (s: string) => s === 'In Progress' || s === 'IN_PROGRESS' || s === 'DISPATCHED';

  const criticalHighCount = issues.filter(
    (i) => (i.severity === 'HIGH' || i.priority === 'Critical') && !isSolved(i.status) && !isFalsePositive(i)
  ).length;
  const mediumCount = issues.filter(
    (i) => (i.severity === 'MEDIUM' || i.priority === 'Medium') && !isSolved(i.status) && !isFalsePositive(i)
  ).length;
  const pendingCount = issues.filter((i) => isPending(i.status) && !isFalsePositive(i)).length;
  const inProgressCount = issues.filter((i) => isInProgress(i.status) && !isFalsePositive(i)).length;
  const solvedCount = issues.filter((i) => isSolved(i.status) && !isFalsePositive(i)).length;
  const falsePositiveCount = issues.filter((i) => isFalsePositive(i)).length;
  const pendingVerificationCount = issues.filter(
    (i) => i.verification === 'Pending Verification' || i.verification === 'AI_DETECTED'
  ).length;
  const activeBuses = busFleet.filter((b) => b.cameraStatus === 'ACTIVE').length;

  return (
    <header className="bg-[#090d16] border-b border-cyan-950/60 px-4 py-2.5 select-none shrink-0 shadow-lg relative z-30">
      {/* Top Bar: Identity & Realtime System Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        
        {/* Left: Branding & Hackathon Context */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wider text-slate-50 uppercase flex items-center gap-2 font-mono">
                <span>RoadVision</span>
                <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-normal">
                  AI
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
                BEL | SIH26124
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 tracking-tight">
              <span>Processes uploaded road footage from buses</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-mono">Gujarat Transit Network (Bharuch • Vadodara)</span>
            </p>
          </div>
        </div>

        {/* Center: System Status & Telemetry Indicators */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* System Online Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">SYSTEM ACTIVE</span>
          </div>

          {/* AI Media Pipeline */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">AI Input:</span>
            <span className="text-cyan-300 font-semibold">Uploaded Video / Images (YOLOv8)</span>
          </div>

          {/* Active Fleet */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-300">
            <Bus className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Fleet Media:</span>
            <span className="text-amber-300 font-semibold">{busFleet.length} Corridors Synced</span>
          </div>

          {/* Time Readout */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">{currentTime}</span>
          </div>
        </div>

        {/* Right: Quick Command Actions */}
        <div className="flex items-center gap-2">
          {/* PRIMARY: Upload Road Video/Image Button */}
          <button
            id="btn-open-upload-interface"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95 border border-cyan-400/50"
            title="Upload road footage video/image to run AI detection"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-200" />
            <span>Upload Road Video/Image</span>
          </button>

          {/* Recorded Footage HUD Playback */}
          <button
            id="btn-bus-camera-stream"
            onClick={() => onOpenBusCameraModal()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 hover:border-cyan-500/80 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Inspect pre-recorded dashcam playback & telemetry from fleet buses"
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dashcam Playback</span>
          </button>

          {/* Simulate New Detection Event */}
          <button
            id="btn-simulate-ai-detection"
            onClick={onOpenSimulateModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer active:scale-95"
            title="Quick-simulate pre-recorded packet injection"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Packet</span>
          </button>

          {/* Add Manual Issue (Authority Layer) */}
          <button
            id="btn-manual-authority-entry"
            onClick={onOpenManualAddModal}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
            title="Log manual municipal inspection or road closure"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: The 3 Core Functional Layers Bar & Live Anomaly Tally */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        
        {/* Workflow Stages Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            id="workflow-tab-ai"
            onClick={() => setActiveLayer('AI_LAYER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              activeLayer === 'AI_LAYER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Detection</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
              {issues.length}
            </span>
          </button>

          <button
            id="workflow-tab-authority"
            onClick={() => setActiveLayer('AUTHORITY_LAYER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              activeLayer === 'AUTHORITY_LAYER'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Authority & Verification</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 border border-amber-800 text-amber-300">
              {pendingVerificationCount} Pending
            </span>
          </button>

          <button
            id="workflow-tab-tracking"
            onClick={() => setActiveLayer('MAINTENANCE_LAYER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              activeLayer === 'MAINTENANCE_LAYER'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Problem Status Tracking</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-300">
              {inProgressCount} Active
            </span>
          </button>
        </div>

        {/* Dynamic Workflow Anomaly & Status Tally */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1.5" title="Critical/High Severity Unresolved Problems">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-slate-400">Critical / High:</span>
            <span className="text-rose-400 font-bold">{criticalHighCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5" title="Medium Severity Unresolved Problems">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Medium:</span>
            <span className="text-amber-300 font-bold">{mediumCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5" title="Problems with Pending status">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-400">Pending:</span>
            <span className="text-amber-400 font-semibold">{pendingCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5" title="Problems currently In Progress">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">In Progress:</span>
            <span className="text-cyan-400 font-semibold">{inProgressCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5" title="Solved and Repaired Problems">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Repaired / Solved:</span>
            <span className="text-emerald-400 font-semibold">{solvedCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5" title="False Positives / Closed">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">False Positives:</span>
            <span className="text-slate-300 font-semibold">{falsePositiveCount}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
