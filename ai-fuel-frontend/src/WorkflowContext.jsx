import { createContext, useState, useEffect } from 'react';

export const WorkflowContext = createContext(null);

const SESSION_KEY = 'ai-fuel-workflow';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function WorkflowProvider({ children }) {
  const saved = loadSession();
  const [request,    setRequestState]    = useState(saved.request    ?? '');
  const [analysis,   setAnalysisState]   = useState(saved.analysis   ?? null);
  const [plan,       setPlanState]       = useState(saved.plan       ?? null);
  const [completion, setCompletionState] = useState(saved.completion ?? null);
  const [project,    setProjectState]    = useState(saved.project    ?? null);
  // project: { name, url, type: 'github'|'manual' } | null

  function setRequest(v)    { setRequestState(v);    saveSession({ ...loadSession(), request:    v }); }
  function setAnalysis(v)   { setAnalysisState(v);   saveSession({ ...loadSession(), analysis:   v }); }
  function setPlan(v)       { setPlanState(v);       saveSession({ ...loadSession(), plan:       v }); }
  function setCompletion(v) { setCompletionState(v); saveSession({ ...loadSession(), completion: v }); }
  function setProject(v)    { setProjectState(v);    saveSession({ ...loadSession(), project:    v }); }

  function clearCompletion() {
    setCompletionState(null);
    saveSession({ ...loadSession(), completion: null });
  }

  return (
    <WorkflowContext.Provider value={{
      request, setRequest,
      analysis, setAnalysis,
      plan, setPlan,
      completion, setCompletion, clearCompletion,
      project, setProject,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}
