import { useNavigate } from 'react-router-dom';
import './Execution.css';

export default function Impact() {
  const navigate = useNavigate();
  return (
    <div className="execution__main main-scroll">
      <div className="execution__inner" style={{padding: '36px 28px'}}>
        <h2 className="execution__heading">Impact Analysis</h2>
        <p style={{color: 'var(--text-muted)', fontSize: 13}}>
          Impact analysis runs inline during task execution when an error is detected.
        </p>
        <button className="btn-secondary" style={{marginTop: 16}} onClick={() => navigate('/execution')}>
          Go to Execution
        </button>
      </div>
    </div>
  );
}
