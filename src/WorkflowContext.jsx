import { createContext, useState } from 'react';

export const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  const [request, setRequest] = useState('');
  const [analysis, setAnalysis] = useState(null);   // result of postTask
  const [plan, setPlan] = useState(null);            // the chosen plan array
  const [completion, setCompletion] = useState(null); // set when execution finishes

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
