import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { WorkflowContext } from '../WorkflowContext.jsx';
import { postTask } from '../api.js';
import './Workspace.css';

const GITHUB_PATTERN = /^https?:\/\/github\.com\/([\w.-]+\/[\w.-]+)/;

export default function Workspace() {
  const navigate = useNavigate();
  const { completion, clearCompletion, setRequest, setAnalysis, project, setProject } = useContext(WorkflowContext);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Project picker state
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [projectInput, setProjectInput] = useState('');
  const [projectError, setProjectError] = useState('');

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
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAnalyze();
  }

  function handleConnectProject() {
    setProjectError('');
    const val = projectInput.trim();
    if (!val) { setProjectError('Enter a GitHub URL or project name.'); return; }
    const ghMatch = val.match(GITHUB_PATTERN);
    if (ghMatch) {
      setProject({ name: ghMatch[1], url: val, type: 'github' });
    } else {
      setProject({ name: val, url: null, type: 'manual' });
    }
    setShowProjectPicker(false);
    setProjectInput('');
  }

  function handleDisconnect() {
    setProject(null);
  }

  return (
    <div className="workspace main-scroll">
      <div className="workspace__inner">

        {/* Project badge */}
        <div className="workspace__project-row">
          {project ? (
            <div className="workspace__project-badge">
              <span className="workspace__project-icon">{project.type === 'github' ? '⎇' : '📁'}</span>
              <span className="workspace__project-name">
                {project.url
                  ? <a href={project.url} target="_blank" rel="noreferrer">{project.name}</a>
                  : project.name}
              </span>
              <button className="workspace__project-change" onClick={() => setShowProjectPicker(true)} title="Change project">⚙</button>
              <button className="workspace__project-disconnect" onClick={handleDisconnect} title="Disconnect">✕</button>
            </div>
          ) : (
            <button className="workspace__project-connect" onClick={() => setShowProjectPicker(true)}>
              + Connect project
            </button>
          )}
        </div>

        {/* Project picker modal */}
        {showProjectPicker && (
          <div className="workspace__picker-overlay" onClick={() => setShowProjectPicker(false)}>
            <div className="workspace__picker" onClick={e => e.stopPropagation()}>
              <p className="workspace__picker-title">Connect a project</p>
              <p className="workspace__picker-sub">Paste a GitHub URL or type a project name</p>
              <input
                className="workspace__picker-input"
                placeholder="https://github.com/user/repo  or  My Project"
                value={projectInput}
                onChange={e => setProjectInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConnectProject()}
                autoFocus
              />
              {projectError && <p className="workspace__picker-error">{projectError}</p>}
              <div className="workspace__picker-actions">
                <button className="btn-primary" onClick={handleConnectProject}>Connect</button>
                <button className="btn-secondary" onClick={() => setShowProjectPicker(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

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
