const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getTarget = `app.get('/api/problems', (_req: Request, res: Response) => {
  const problems = loadProblems();
  res.json({ success: true, problems, count: problems.length });
});`;

const getReplacement = `app.get('/api/problems', (_req: Request, res: Response) => {
  const problems = loadProblems();
  let changed = false;
  const now = Date.now();
  const WORK_DURATION_MS = 120000;

  problems.forEach(p => {
    if (p.status === 'In Progress' && p.startedAt && now >= p.startedAt + WORK_DURATION_MS) {
      p.status = 'Solved';
      p.solvedAt = now;
      p.roadCondition = 'Repaired';
      if (!p.workflowHistory) p.workflowHistory = [];
      p.workflowHistory.push({
        stage: 'Solved',
        timestamp: new Date().toLocaleTimeString('en-IN') + ' IST',
        note: 'Auto-completed after 2 minutes'
      });
      changed = true;
    }
  });

  if (changed) {
    saveProblems(problems);
  }

  res.json({ success: true, problems, count: problems.length });
});`;

code = code.replace(getTarget, getReplacement);

const patchTarget = `  const updated: StoredProblem = {
    ...existing,
    status,
    notes: notes || existing.notes,
    workflowHistory: history,
    roadCondition: status === 'Solved' ? 'Repaired' : existing.roadCondition,
  };`;

const patchReplacement = `  const updated: StoredProblem = {
    ...existing,
    status,
    notes: notes || existing.notes,
    workflowHistory: history,
    roadCondition: status === 'Solved' ? 'Repaired' : existing.roadCondition,
  };

  if (status === 'In Progress' && existing.status !== 'In Progress') {
    updated.startedAt = Date.now();
  }
  
  if (status === 'Solved' && existing.status !== 'Solved') {
    updated.solvedAt = Date.now();
  }`;

code = code.replace(patchTarget, patchReplacement);

fs.writeFileSync('server.ts', code);
