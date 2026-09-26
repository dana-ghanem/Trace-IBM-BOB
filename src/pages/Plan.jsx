import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowContext } from '../WorkflowContext.jsx';
import './Analysis.css';

export default function Plan() {
  const { plan, analysis } = useContext(WorkflowContext);
  const navigate = useNavigate();

  if (!plan && !analysis) {
    return (
      <div className="analysis main-scroll">
        <div className="analysis__inner">
          <p className="analysis__empty">No active plan. <a onClick={() => navigate('/')} style={{color:'var(--accent)', cursor:'pointer'}}>Start from the Workspace.</a></p>
        </div>
      </div>
    );
  }

  const activePlan = plan || analysis?.plan || [];
  const fitItems = activePlan.filter(t => t.fits);
  const deferredItems = activePlan.filter(t => !t.fits);

  return (
    <div className="analysis main-scroll">
      <div className="analysis__inner">
        <h2 className="analysis__found">My Plan</h2>
        {fitItems.length > 0 && (
          <>
            <div className="analysis__total" style={{marginBottom: 10}}>In plan ({fitItems.length} tasks)</div>
            <div className="analysis__tasks" style={{marginBottom: 20}}>
              {fitItems.map(t => (
                <div key={t.id} className="analysis__task">
                  <span className="analysis__task-num">✓</span>
                  <span className="analysis__task-name">{t.name}</span>
                  <span className="analysis__task-cost">{t.cost} credits</span>
                  <span className={`pill ${t.mode === 'Advanced AI' ? 'pill-advanced' : t.mode === 'Balanced AI' ? 'pill-balanced' : 'pill-light'}`}>{t.mode}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {deferredItems.length > 0 && (
          <>
            <div className="analysis__total" style={{marginBottom: 10, borderLeftColor: '#ffc107'}}>Deferred ({deferredItems.length} tasks)</div>
            <div className="analysis__tasks">
              {deferredItems.map(t => (
                <div key={t.id} className="analysis__task" style={{opacity: 0.55}}>
                  <span className="analysis__task-num">○</span>
                  <span className="analysis__task-name">{t.name}</span>
                  <span className="analysis__task-cost">{t.cost} credits</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{marginTop: 20, display:'flex', gap: 10}}>
          <button className="btn-primary" onClick={() => navigate('/execution')}>Go to Execution</button>
          <button className="btn-secondary" onClick={() => navigate('/analysis')}>Back to Analysis</button>
        </div>
      </div>
    </div>
  );
}
