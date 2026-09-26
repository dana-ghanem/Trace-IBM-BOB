import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './BudgetContext.jsx';
import { WorkflowProvider } from './WorkflowContext.jsx';
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
                  <Route path="/analysis"  element={<Analysis />} />
                  <Route path="/plan"      element={<Plan />} />
                  <Route path="/execution" element={<Execution />} />
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
