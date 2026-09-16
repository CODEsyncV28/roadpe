import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  PlusCircle, 
  MapPin, 
  AlertTriangle, 
  Navigation,
  FileText
} from 'lucide-react';
import { RoadIssue, IssueType, Severity } from '../types';
import { generateEvidenceDataUrl } from '../data/mockRoadData';

interface AuthorityActionModalProps {
  onClose: () => void;
  onAddManualIssue: (issue: RoadIssue) => void;
}

export const AuthorityActionModal: React.FC<AuthorityActionModalProps> = ({
  onClose,
  onAddManualIssue,
}) => {
  const [actionType, setActionType] = useState<'MANUAL_ISSUE' | 'ROAD_CLOSURE' | 'CONSTRUCTION_ZONE'>('MANUAL_ISSUE');
  const [issueType, setIssueType] = useState<IssueType>('road_damage');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('Dahej Bypass Road, Bharuch');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [detourName, setDetourName] = useState('Divert via Kasak Circle Ring Road');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toLocaleTimeString() + ' IST';
    const id = `AUTH-${Math.floor(7000 + Math.random() * 2000)}`;

    let calculatedType: IssueType = issueType;
    let isRoadClosed = false;

    if (actionType === 'ROAD_CLOSURE') {
      calculatedType = 'road_closed';
      isRoadClosed = true;
    } else if (actionType === 'CONSTRUCTION_ZONE') {
      calculatedType = 'construction';
    }

    const newRecord: RoadIssue = {
      id,
      type: calculatedType,
      title: title.trim() || (actionType === 'ROAD_CLOSURE' ? 'Emergency Road Closure Declared' : 'Manual Municipal Hazard Log'),
      locationName: locationName.trim(),
      lat: 21.7100 + (Math.random() - 0.5) * 0.02,
      lng: 72.9900 + (Math.random() - 0.5) * 0.02,
      severity: severity,
      confidence: 100.0, // Human verified authority action
      busId: 'MUNI-INSPECT-01',
      busRoute: 'Municipal Inspection Patrol Unit',
      timestamp: `${new Date().toISOString().split('T')[0]} ${timestamp}`,
      status: actionType === 'ROAD_CLOSURE' ? 'IN_PROGRESS' : 'PENDING',
      verification: 'AUTHORITY_OVERRIDE',
      roadClosureActive: isRoadClosed,
      detourRouteName: isRoadClosed ? detourName : undefined,
      authorityNotes: notes || 'Enacted by Municipal Road Operations Desk.',
      verifiedBy: 'Chief Municipal Engineer (Badge #108)',
      evidenceImage: generateEvidenceDataUrl(calculatedType, title, 'MUNI-01', timestamp),
      boundingBoxes: [
        {
          id: `box-auth-${Date.now()}`,
          label: 'authority_cordon',
          confidence: 100.0,
          x: 25,
          y: 25,
          width: 50,
          height: 50,
          color: '#f59e0b',
        }
      ],
      telemetry: {
        speedKmh: 0,
        zVibrationG: 0,
        roadRoughnessIRI: 4.8,
        cameraFov: 'Municipal Survey Unit',
        weatherCondition: 'Standard Ops',
      },
      roadCondition: severity === 'HIGH' ? 'Critical' : 'Hazardous',
      priorityScore: severity === 'HIGH' ? 95 : 70,
    };

    onAddManualIssue(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#090e1a] border border-amber-800/80 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.2)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0c1322] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                Authority & Verification: Municipal Action
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Declare road closure, add construction zone, or log inspector report
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Selector */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActionType('MANUAL_ISSUE')}
              className={`py-1.5 px-2 rounded text-center font-bold transition-colors cursor-pointer ${
                actionType === 'MANUAL_ISSUE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Hazard Log
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType('ROAD_CLOSURE');
                setSeverity('HIGH');
              }}
              className={`py-1.5 px-2 rounded text-center font-bold transition-colors cursor-pointer ${
                actionType === 'ROAD_CLOSURE'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Close Road / Detour
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType('CONSTRUCTION_ZONE');
                setSeverity('MEDIUM');
              }}
              className={`py-1.5 px-2 rounded text-center font-bold transition-colors cursor-pointer ${
                actionType === 'CONSTRUCTION_ZONE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Construction Zone
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block text-[11px]">Title / Headline:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                actionType === 'ROAD_CLOSURE'
                  ? 'Emergency Drainage Line Culvert Repair Road Closure'
                  : actionType === 'CONSTRUCTION_ZONE'
                  ? 'Flyover Span Girder Installation Work Zone'
                  : 'Manual Road Surface Cavity / Trench Log'
              }
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block text-[11px]">Location (Bharuch):</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block text-[11px]">Severity Priority:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="HIGH">HIGH (Urgent Dispatch)</option>
                <option value="MEDIUM">MEDIUM (Standard Maintenance)</option>
                <option value="LOW">LOW (Monitoring)</option>
              </select>
            </div>
          </div>

          {actionType === 'ROAD_CLOSURE' && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-600/50 space-y-1.5">
              <label className="text-rose-300 font-bold block text-[11px]">
                Prescribed Traffic Detour Route:
              </label>
              <input
                type="text"
                value={detourName}
                onChange={(e) => setDetourName(e.target.value)}
                placeholder="e.g., Heavy vehicles divert via NH-48 Bypass..."
                className="w-full bg-slate-900 border border-rose-700/60 rounded p-1.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block text-[11px]">Authority Directives &amp; Notes:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter municipal directives, emergency contact number, or barrier placement specs..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-authority-record"
              type="submit"
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Authorize &amp; Post to City Grid
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
