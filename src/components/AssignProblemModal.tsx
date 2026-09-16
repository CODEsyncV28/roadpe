import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Calendar, FileText, Send, Building2 } from 'lucide-react';
import { RoadIssue, PriorityLevel } from '../types';

interface AssignProblemModalProps {
  isOpen: boolean;
  issue: RoadIssue | null;
  onClose: () => void;
  onAssign: (
    issueId: string,
    assignmentData: {
      assignedAuthority: string;
      assignedDept: string;
      assignedPerson: string;
      priority: PriorityLevel;
      dueDate: string;
      notes: string;
    }
  ) => Promise<void> | void;
}

const AUTHORITIES_PRESETS = [
  'Road Maintenance Team',
  'PWD Municipal Road Division',
  'Municipal Drainage Division',
  'Traffic Police & Highway Rescue Squad',
  'NHAI Corridor Maintenance Unit',
  'Gujarat State Highway Rapid Response',
];

const DEPARTMENTS_PRESETS = [
  'PWD Municipal Road Division',
  'Drainage & Stormwater Dept',
  'Traffic Police & Public Safety',
  'Highway Operations & Toll Maintenance',
  'Emergency Infrastructure Squad',
];

export const AssignProblemModal: React.FC<AssignProblemModalProps> = ({
  isOpen,
  issue,
  onClose,
  onAssign,
}) => {
  if (!isOpen || !issue) return null;

  const [assignedAuthority, setAssignedAuthority] = useState(
    issue.assignedAuthority || (issue.type === 'waterlogging' ? 'Municipal Drainage Division' : issue.type === 'accident' ? 'Traffic Police & Highway Rescue Squad' : 'Road Maintenance Team')
  );
  const [assignedDept, setAssignedDept] = useState(
    issue.assignedDept || (issue.type === 'waterlogging' ? 'Drainage & Stormwater Dept' : issue.type === 'accident' ? 'Traffic Police & Public Safety' : 'PWD Municipal Road Division')
  );
  const [assignedPerson, setAssignedPerson] = useState(
    issue.assignedPerson || 'Field Crew Alpha (Lead Engineer)'
  );
  const [priority, setPriority] = useState<PriorityLevel>(
    issue.priority || (issue.severity === 'HIGH' ? 'Critical' : 'Medium')
  );
  const [dueDate, setDueDate] = useState(
    issue.dueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(
    issue.notes || (issue.type === 'pothole' ? 'Mobilize cold-mix asphalt patch team, vibratory compactor, and safety signage.' : issue.type === 'waterlogging' ? 'Deploy suction bowser truck and clear stormwater drain chamber.' : 'Inspect site hazard immediately and establish traffic control.')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAssign(issue.id, {
        assignedAuthority,
        assignedDept,
        assignedPerson,
        priority,
        dueDate,
        notes,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to assign problem:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="assign-problem-modal-container"
        className="w-full max-w-xl bg-[#0b1322] border border-cyan-800/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070e1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Assign Problem</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-semibold">
                  {issue.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Type: <span className="text-slate-200 capitalize font-medium">{issue.type.replace('_', ' ')}</span> &bull; Location: <span className="text-slate-200 font-medium">{issue.locationName}</span>
              </p>
            </div>
          </div>
          <button
            id="close-assign-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Quick Problem Overview Card */}
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-3">
            {issue.evidenceImage && (
              <img 
                src={issue.evidenceImage} 
                alt={issue.title} 
                className="w-16 h-12 rounded object-cover border border-slate-700 shrink-0" 
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-slate-200 font-medium text-xs truncate">{issue.title}</div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                <span>Confidence: <strong className="text-cyan-300 font-mono">{issue.confidence}%</strong></span>
                <span>Current Status: <strong className="text-amber-400 font-mono">{issue.status}</strong></span>
              </div>
            </div>
          </div>

          {/* Responsible Authority / Team */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assign To (Authority / Team)</span>
            </label>
            <div className="space-y-1.5">
              <select
                id="select-authority"
                value={assignedAuthority}
                onChange={(e) => setAssignedAuthority(e.target.value)}
                className="w-full bg-[#050b14] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none transition-colors"
              >
                {AUTHORITIES_PRESETS.map((auth) => (
                  <option key={auth} value={auth}>
                    {auth}
                  </option>
                ))}
              </select>
              <input
                id="custom-authority-input"
                type="text"
                value={assignedAuthority}
                onChange={(e) => setAssignedAuthority(e.target.value)}
                placeholder="Or type custom authority/team..."
                className="w-full bg-[#050b14] border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-slate-300 text-xs outline-none"
              />
            </div>
          </div>

          {/* Maintenance Department & Assigned Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Department</span>
              </label>
              <select
                id="select-department"
                value={assignedDept}
                onChange={(e) => setAssignedDept(e.target.value)}
                className="w-full bg-[#050b14] border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none"
              >
                {DEPARTMENTS_PRESETS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Assigned Person / Crew Lead</span>
              </label>
              <input
                id="assigned-person-input"
                type="text"
                value={assignedPerson}
                onChange={(e) => setAssignedPerson(e.target.value)}
                placeholder="e.g. Inspector R. Sharma / Patch Crew Alpha"
                className="w-full bg-[#050b14] border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Low', 'Medium', 'High', 'Critical'] as PriorityLevel[]).map((level) => {
                  const isSelected = priority === level;
                  const colorClasses = 
                    level === 'Critical' ? (isSelected ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-900 text-slate-400 border-slate-800') :
                    level === 'High' ? (isSelected ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-slate-900 text-slate-400 border-slate-800') :
                    level === 'Medium' ? (isSelected ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-slate-900 text-slate-400 border-slate-800') :
                    (isSelected ? 'bg-slate-800 text-slate-200 border-slate-600' : 'bg-slate-900 text-slate-400 border-slate-800');

                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setPriority(level)}
                      className={`py-2 px-1.5 text-center font-bold text-xs rounded border transition-all ${colorClasses}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Due Date</span>
              </label>
              <input
                id="assignment-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#050b14] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none font-mono"
              />
            </div>
          </div>

          {/* Instructions & Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Instructions / Notes</span>
            </label>
            <textarea
              id="assignment-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter specific repair directives, required materials, road closure orders..."
              className="w-full bg-[#050b14] border border-slate-700 focus:border-sky-500 rounded-lg p-3 text-slate-100 text-xs outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-assign-problem-btn"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Problem Assigned!</span>
                </>
              ) : isSubmitting ? (
                <span>Saving Assignment...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign Problem</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
