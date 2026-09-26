import { NavLink } from 'react-router-dom';
import { useBudget } from './BudgetContext.jsx';
import BudgetDisplay from './BudgetDisplay.jsx';
import './Sidebar.css';

const SCENARIOS = ['Safe', 'Low', 'Critical', 'Exhausted'];

export default function Sidebar() {
  const { budget, max, status, floatBadges, switchScenario, activeScenario } = useBudget();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon">⚡</span>
        <span className="sidebar__logo-text">AI FUEL</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/"          end className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}>Workspace</NavLink>
        <NavLink to="/plan"          className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}>My Plan</NavLink>
        <NavLink to="/impact"        className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}>Impact</NavLink>
        <NavLink to="/trace"         className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}>TRACE</NavLink>
        <NavLink to="/rewards"       className={({ isActive }) => 'sidebar__link' + (isActive ? ' active' : '')}>Rewards</NavLink>
      </nav>

      <div className="sidebar__spacer" />

      <div className="sidebar__demo">
        <span className="sidebar__demo-label">Demo</span>
        <div className="sidebar__demo-btns">
          {SCENARIOS.map(s => (
            <button
              key={s}
              className={`sidebar__demo-btn${activeScenario === s.toLowerCase() ? ' active' : ''}`}
              onClick={() => switchScenario(s.toLowerCase())}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar__budget">
        <BudgetDisplay budget={budget} max={max} status={status} floatBadges={floatBadges} compact />
      </div>
    </aside>
  );
}
