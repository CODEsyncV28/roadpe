import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  Wrench, 
  Clock, 
  Camera, 
  Bus, 
  ChevronRight,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { RoadIssue, IssueType, Severity } from '../types';

interface LiveAlertPanelProps {
  issues: RoadIssue[];
  selectedIssue: RoadIssue | null;
  onSelectIssue: (issue: RoadIssue) => void;
  onOpenEvidence: (issue: RoadIssue) => void;
  filterType: IssueType | 'ALL';
  setFilterType: (type: IssueType | 'ALL') => void;
  filterSeverity: Severity | 'ALL';
  setFilterSeverity: (sev: Severity | 'ALL') => void;
  onOpenUploadModal: () => void;
  onOpenSimulateModal: () => void;
}

export const LiveAlertPanel: React.FC<LiveAlertPanelProps> = ({
  issues,
  selectedIssue,
  onSelectIssue,
  onOpenEvidence,
  filterType,
  setFilterType,
  filterSeverity,
  setFilterSeverity,
  onOpenUploadModal,
  onOpenSimulateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  // Filter issues based on criteria
  const filteredIssues = issues.filter((issue) => {
    if (filterType !== 'ALL' && issue.type !== filterType) return false;
    if (filterSeverity !== 'ALL' && issue.severity !== filterSeverity) return false;
    const isIssueResolved = issue.status === 'RESOLVED' || issue.status === 'Solved';
    if (statusFilter === 'ACTIVE' && isIssueResolved) return false;
    if (statusFilter === 'RESOLVED' && !isIssueResolved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        issue.id.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.locationName.toLowerCase().includes(q) ||
        issue.busId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getIssueIcon = (type: IssueType) => {
    switch (type) {
      case 'pothole':
        return '🕳️';
      case 'waterlogging':
        return '🌊';
      case 'road_damage':
        return '⚡';
      case 'accident':
        return '🚨';
      case 'construction':
        return '🚧';
      case 'road_closed':
        return '⛔';
      default:
        return '⚠️';
    }
  };

  const getSeverityBadgeClass = (severity: Severity, isResolved: boolean) => {
    if (isResolved) {
      return 'bg-emerald-950/90 text-emerald-300 border-emerald-600/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    }
    switch (severity) {
      case 'HIGH':
        return 'bg-rose-950/90 text-rose-300 border-rose-600/50 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse';
      case 'MEDIUM':
        return 'bg-amber-950/90 text-amber-300 border-amber-600/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      case 'LOW':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-600/50';
    }
  };

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] bg-[#090d16]/85 backdrop-blur-md border-l border-slate-800 flex flex-col h-full overflow-hidden select-none shrink-0 z-20">
      
      {/* Top Header of Alert Panel */}
      <div className="p-3 border-b border-slate-800 bg-[#0c121e]/85">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <h2 className="font-mono font-bold text-sm text-slate-100 tracking-wider uppercase flex items-center gap-2">
              <span>Detection Feed</span>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                {filteredIssues.length}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-upload-footage-alert-panel"
              onClick={onOpenUploadModal}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Upload road footage (.mp4, .jpg) to run detection"
            >
              <span>📤 Upload Media</span>
            </button>
            <button
              id="btn-quick-simulate-feed"
              onClick={onOpenSimulateModal}
              className="flex items-center gap-1 px-1.5 py-1 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              title="Simulate media event injection"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Framing notice */}
        <p className="text-[10px] font-mono text-slate-400 mb-2">
          AI detects defects from pre-recorded footage • Predefined GPS synced
        </p>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="input-alert-search"
            type="text"
            placeholder="Search location, Bus ID, or Hazard ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Issue Type Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType('pothole')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              filterType === 'pothole'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🕳️</span>
            <span>Potholes</span>
          </button>
          <button
            onClick={() => setFilterType('waterlogging')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              filterType === 'waterlogging'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🌊</span>
            <span>Waterlogging</span>
          </button>
          <button
            onClick={() => setFilterType('road_damage')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              filterType === 'road_damage'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>⚡</span>
            <span>Cracks</span>
          </button>
          <button
            onClick={() => setFilterType('accident')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              filterType === 'accident'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🚨</span>
            <span>Accidents</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80">
          <span className="text-slate-500">Status filter:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`cursor-pointer ${statusFilter === 'ALL' ? 'text-cyan-300 font-bold' : 'hover:text-slate-300'}`}
            >
              All
            </button>
            <span>•</span>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`cursor-pointer ${statusFilter === 'ACTIVE' ? 'text-amber-400 font-bold' : 'hover:text-slate-300'}`}
            >
              Active Only
            </button>
            <span>•</span>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`cursor-pointer ${statusFilter === 'RESOLVED' ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'}`}
            >
              Resolved
            </button>
          </div>
        </div>

      </div>

      {/* Feed List Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No detection alerts matching filter criteria.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected = selectedIssue?.id === issue.id;
            const isResolved = issue.status === 'RESOLVED' || issue.status === 'Solved';
            const isVerified = issue.verification === 'VERIFIED' || issue.verification === 'Verified';
            const isRejected = issue.verification === 'Rejected' || issue.status === 'Rejected';

            return (
              <div
                key={issue.id}
                id={`alert-card-${issue.id}`}
                onClick={() => onSelectIssue(issue)}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-[#101827] border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50'
                    : 'bg-[#0c121e]/90 hover:bg-[#111928] border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Icon + ID + Severity + Confidence */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getIssueIcon(issue.type)}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {issue.id}
                        </span>
                        {isVerified && (
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-0.5">
                            <span>REJECTED</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        {issue.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadgeClass(
                        issue.severity,
                        isResolved
                      )}`}
                    >
                      {isResolved ? 'RESOLVED' : isRejected ? 'REJECTED' : `${issue.severity}`}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                      🤖 {issue.confidence}%
                    </span>
                  </div>
                </div>

                {/* Title & Location */}
                <h3 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                  {issue.title}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-1.5 line-clamp-1">
                  <span>📍</span>
                  <span>{issue.locationName}</span>
                </p>

                {/* Video Timestamp / Source Media Tag */}
                <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/60 text-cyan-300">
                    ⏱️ {issue.videoTimestamp || (issue.sourceMedia ? `at ${issue.sourceMedia.videoTimestamp}` : '00:14 in clip')}
                  </span>
                  {issue.sourceMedia && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 truncate max-w-[170px]" title={issue.sourceMedia.fileName}>
                      📁 {issue.sourceMedia.fileName}
                    </span>
                  )}
                </div>

                {/* Bus Detection Telemetry & Time Row */}
                <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded bg-[#070b14] border border-slate-800/80 text-[10px] font-mono mb-2">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Bus className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Bus:</span>
                    <span className="text-amber-300 font-bold truncate">{issue.busId}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 justify-end">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-slate-400 truncate">{issue.timestamp.split(' ')[1] || issue.timestamp}</span>
                  </div>
                  <div className="text-slate-400 truncate">
                    Z-Bump: <span className="text-rose-400 font-bold">{issue.telemetry.zVibrationG}G</span>
                  </div>
                  <div className="text-slate-400 truncate text-right">
                    Speed: <span className="text-slate-200">{issue.telemetry.speedKmh} km/h</span>
                  </div>
                </div>

                {/* Actions Row: [ View Evidence ] + Dispatch Status */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        isResolved
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                          : isRejected
                          ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                          : issue.status === 'In Progress' || issue.status === 'IN_PROGRESS'
                          ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40'
                          : issue.assignedAuthority || issue.status === 'DISPATCHED'
                          ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                          : 'text-slate-300 bg-slate-900 border border-slate-700/50'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>

                  <button
                    id={`btn-view-evidence-${issue.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEvidence(issue);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Camera className="w-3 h-3" />
                    <span>View Evidence</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Alert Feed Footer Summary */}
      <div className="p-2.5 bg-[#070b14] border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Feed: Pre-Recorded Footage • Timeline GPS Synced</span>
        </span>
        <span className="text-slate-500">BEL SIH26124</span>
      </div>

    </aside>
  );
};
