import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { BudgetProvider } from './BudgetContext.jsx';
import { WorkflowProvider, WorkflowContext } from './WorkflowContext.jsx';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import Workspace from './pages/Workspace.jsx';
import Analysis from './pages/Analysis.jsx';
import Plan from './pages/Plan.jsx';
import Execution from './pages/Execution.jsx';
import Impact from './pages/Impact.jsx';
import Trace from './pages/Trace.jsx';
import Rewards from './pages/Rewards.jsx';
import './App.css';

/** Redirect to / if required workflow state is missing */
function RequireAnalysis({ children }) {
  const { analysis } = useContext(WorkflowContext);
  return analysis ? children : <Navigate to="/" replace />;
}
function RequirePlan({ children }) {
  const { plan } = useContext(WorkflowContext);
  return plan ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BudgetProvider>
      <WorkflowProvider>
        <BrowserRouter>
          <div className="app-shell">
            <Sidebar />
            <div className="app-content">
              <Header />
              <div className="app-body">
                <Routes>
                  <Route path="/"          element={<Workspace />} />
                  <Route path="/analysis"  element={<RequireAnalysis><Analysis /></RequireAnalysis>} />
                  <Route path="/plan"      element={<RequireAnalysis><Plan /></RequireAnalysis>} />
                  <Route path="/execution" element={<RequirePlan><Execution /></RequirePlan>} />
                  <Route path="/impact"    element={<Impact />} />
                  <Route path="/trace"     element={<Trace />} />
                  <Route path="/rewards"   element={<Rewards />} />
                </Routes>
              </div>
            </div>
          </div>
        </BrowserRouter>
      </WorkflowProvider>
    </BudgetProvider>
  );
}
