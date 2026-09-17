import React, { useState } from 'react';
import { X, CheckCircle2, Wrench } from 'lucide-react';
import { RoadIssue } from '../types';

interface SolveProblemModalProps {
  isOpen: boolean;
  issue: RoadIssue | null;
  onClose: () => void;
  onSolve: (issueId: string, notes: string) => Promise<void> | void;
}

export const SolveProblemModal: React.FC<SolveProblemModalProps> = ({
  isOpen,
  issue,
  onClose,
  onSolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !issue) return null;

  const handleConfirm = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSolve(issue.id, resolutionNotes);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#090d16] border border-emerald-900/60 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-slate-100 font-bold text-lg">Mark Problem as Solved</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-slate-300 font-sans">
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-xs">Problem ID:</span>
              <span className="font-bold text-cyan-400">{issue.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Status:</span>
              <span className="text-slate-300">In Progress → <span className="text-emerald-400 font-bold">Solved</span></span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-xs">Problem Type:</span>
              <span className="text-slate-200 capitalize">{issue.type.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-bold block text-xs">Resolution Notes (Required):</label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter work completed, materials used, or repair details..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 font-bold block text-xs">Completion Image (Optional):</label>
            <div className="w-full border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-not-allowed opacity-60">
              <span className="text-slate-500 text-xs">Image upload disabled in this demo</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !resolutionNotes.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wrench className="w-4 h-4" />
            <span>Confirm Resolution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
