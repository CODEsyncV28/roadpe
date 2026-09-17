const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  // Save to localStorage on change`;
const replacement = `  // Polling for auto-completed problems
  useEffect(() => {
    const WORK_DURATION_MS = 120000;
    const interval = setInterval(() => {
      let needsFetch = false;
      const now = Date.now();
      setIssues(prev => {
        for (const p of prev) {
          if ((p.status === 'In Progress' || p.status === 'IN_PROGRESS') && p.startedAt && now - p.startedAt >= WORK_DURATION_MS) {
            needsFetch = true;
            break;
          }
        }
        return prev;
      });
      if (needsFetch) {
        fetch('/api/problems')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.problems) {
              setIssues(data.problems);
            }
          })
          .catch(err => console.warn('Failed to auto-fetch problems', err));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage on change`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
