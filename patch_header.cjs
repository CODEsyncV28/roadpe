const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const target = `  const isSolved = (s: string) => s === 'Solved' || s === 'RESOLVED' || s === 'Closed' || s === 'CLOSED';
  const isPending = (s: string) => s === 'Pending' || s === 'PENDING';
  const isInProgress = (s: string) => s === 'In Progress' || s === 'IN_PROGRESS' || s === 'DISPATCHED';

  const criticalHighCount = issues.filter(
    (i) => (i.severity === 'HIGH' || i.priority === 'Critical') && !isSolved(i.status)
  ).length;
  const mediumCount = issues.filter(
    (i) => (i.severity === 'MEDIUM' || i.priority === 'Medium') && !isSolved(i.status)
  ).length;
  const pendingCount = issues.filter((i) => isPending(i.status)).length;
  const inProgressCount = issues.filter((i) => isInProgress(i.status)).length;
  const solvedCount = issues.filter((i) => isSolved(i.status)).length;
  const pendingVerificationCount = issues.filter(
    (i) => i.verification === 'Pending Verification' || i.verification === 'AI_DETECTED'
  ).length;`;

const replacement = `  const isSolved = (s: string) => s === 'Solved' || s === 'RESOLVED';
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
  ).length;`;

code = code.replace(target, replacement);

const targetStats = `          <div className="flex items-center gap-1.5" title="Solved and Repaired Problems">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Repaired / Solved:</span>
            <span className="text-emerald-400 font-semibold">{solvedCount}</span>
          </div>
        </div>`;

const statsReplacement = `          <div className="flex items-center gap-1.5" title="Solved and Repaired Problems">
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
        </div>`;

code = code.replace(targetStats, statsReplacement);
fs.writeFileSync('src/components/Header.tsx', code);
