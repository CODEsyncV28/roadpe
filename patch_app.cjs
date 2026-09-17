const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import { AssignProblemModal } from './components/AssignProblemModal';`;
const importReplace = `import { AssignProblemModal } from './components/AssignProblemModal';
import { SolveProblemModal } from './components/SolveProblemModal';`;
code = code.replace(importTarget, importReplace);

const stateTarget = `  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);`;
const stateReplace = `  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [problemToSolve, setProblemToSolve] = useState<RoadIssue | null>(null);`;
code = code.replace(stateTarget, stateReplace);

const handlerTarget = `  const handleUpdateStatus = async (issueId: string, status: 'Pending' | 'In Progress' | 'Solved') => {
    try {
      const res = await fetch(\`/api/problems/\${issueId}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });`;
const handlerReplace = `  const handleUpdateStatus = async (issueId: string, status: 'Pending' | 'In Progress' | 'Solved', notes?: string) => {
    try {
      const res = await fetch(\`/api/problems/\${issueId}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });`;
code = code.replace(handlerTarget, handlerReplace);

const renderTarget = `        <AssignProblemModal
          isOpen={!!problemToAssign}
          issue={problemToAssign}
          onClose={() => setProblemToAssign(null)}
          onAssign={handleAssignProblem}
        />
      )}`;
const renderReplace = `        <AssignProblemModal
          isOpen={!!problemToAssign}
          issue={problemToAssign}
          onClose={() => setProblemToAssign(null)}
          onAssign={handleAssignProblem}
        />
      )}

      {/* Modal 7: Solve Problem Completion */}
      {problemToSolve && (
        <SolveProblemModal
          isOpen={!!problemToSolve}
          issue={problemToSolve}
          onClose={() => setProblemToSolve(null)}
          onSolve={async (id, notes) => {
            await handleUpdateStatus(id, 'Solved', notes);
          }}
        />
      )}`;
code = code.replace(renderTarget, renderReplace);
fs.writeFileSync('src/App.tsx', code);
