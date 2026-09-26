import { useBudget } from './BudgetContext.jsx';
import BudgetDisplay from './BudgetDisplay.jsx';
import './Header.css';

export default function Header() {
  const { budget, max, status, floatBadges } = useBudget();
  return (
    <header className="header">
      <div className="header__logo">
        <span className="header__logo-icon">⚡</span>
        <span className="header__logo-text">AI FUEL</span>
      </div>
      <div className="header__budget">
        <BudgetDisplay budget={budget} max={max} status={status} floatBadges={floatBadges} />
      </div>
    </header>
  );
}
