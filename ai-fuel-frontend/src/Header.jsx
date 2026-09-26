import { useContext } from 'react';
import { useBudget } from './BudgetContext.jsx';
import { WorkflowContext } from './WorkflowContext.jsx';
import BudgetDisplay from './BudgetDisplay.jsx';
import './Header.css';

export default function Header() {
  const { budget, max, status, floatBadges } = useBudget();
  const { project } = useContext(WorkflowContext);

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__logo">
          <span className="header__logo-icon">⚡</span>
          <span className="header__logo-text">AI FUEL</span>
        </div>
        {project && (
          <div className="header__project">
            <span className="header__project-sep">/</span>
            <span className="header__project-icon">{project.type === 'github' ? '⎇' : '📁'}</span>
            {project.url
              ? <a className="header__project-name" href={project.url} target="_blank" rel="noreferrer">{project.name}</a>
              : <span className="header__project-name">{project.name}</span>
            }
          </div>
        )}
      </div>
      <div className="header__budget">
        <BudgetDisplay budget={budget} max={max} status={status} floatBadges={floatBadges} />
      </div>
    </header>
  );
}
