import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { WorkflowContext } from '../WorkflowContext.jsx';
import { postTask } from '../api.js';
import './Workspace.css';

export default function Workspace() {
  const navigate = useNavigate();
  const { completion, clearCompletion, setRequest, setAnalysis, request } = useContext(WorkflowContext);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    clearCompletion();
    try {
      const data = await postTask(input.trim());
      setRequest(input.trim());
      setAnalysis(data);
      navigate('/analysis');
    } catch (e) {
      setError('Failed to analyze request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    if (completion) clearCompletion();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze();
    }
  }

  return (
    <div className="workspace main-scroll">
      <div className="workspace__inner">
        {completion && (
          <div className="workspace__completion">
            <div className="workspace__completion-title">
              <span className="workspace__completion-check">✓</span>
              Work completed · {completion.tasksCompleted} of {completion.tasksTotal} tasks finished · {completion.budgetRemaining?.toLocaleString()} credits remaining
            </div>
            {completion.deferredTasks && completion.deferredTasks.length > 0 && (
              <div className="workspace__completion-deferred">
                Remaining: {completion.deferredTasks.map(t => t.name).join(', ')}
              </div>
            )}
          </div>
        )}

        <h1 className="workspace__heading">What are you building?</h1>

        <textarea
          className="workspace__textarea"
          placeholder="Describe what you want AI to build, fix, test, or explain..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={6}
        />

        {error && <p className="workspace__error">{error}</p>}

        <div className="workspace__actions">
          <button
            className="btn-primary workspace__btn"
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
          >
            {loading ? 'Analyzing…' : 'Analyze my task'}
          </button>
          <span className="workspace__hint">AI Fuel estimates the AI cost before work begins. · Ctrl+Enter</span>
        </div>
      </div>
    </div>
  );
}
