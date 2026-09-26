import { createContext, useState } from 'react';

export const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  const [request, setRequest] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [plan, setPlan] = useState(null);
  const [completion, setCompletion] = useState(null);

  function clearCompletion() {
    setCompletion(null);
  }

  return (
    <WorkflowContext.Provider value={{
      request, setRequest,
      analysis, setAnalysis,
      plan, setPlan,
      completion, setCompletion, clearCompletion,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}
