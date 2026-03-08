import React, { useMemo, useState, useEffect } from 'react';
import './ActiveSessions.css';
import {
  MonitorSmartphone,
  ShieldCheck,
  RefreshCcw,
  X,
  Copy,
} from 'lucide-react';
import { getActiveSessions, revokeSession } from '../../../api/content';

const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getActiveSessions();
        setSessions(data);
      } catch (err) {
        setError(err.message || 'Failed to load active sessions. Check your Supabase connection.');
      } finally { setLoading(false); }
    })();
  }, []);

  const currentSession = useMemo(() => sessions.find((s) => s.current), [sessions]);

  const handleRevoke = async (id) => {
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to revoke session.');
    }
  };

  const handleRevokeOthers = async () => {
    const others = sessions.filter(s => !s.current);
    try {
      await Promise.all(others.map(s => revokeSession(s.id)));
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (err) {
      setError(err.message || 'Failed to revoke sessions.');
    }
  };

  const activeCount = sessions.length;
  const otherCount = activeCount - (currentSession ? 1 : 0);

  return (
    <div className="active-sessions-page">
      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <header className="as-page-header">
        <div>
          <p className="as-breadcrumb">
            Security <span>› Sessions</span>
          </p>
          <h1 className="as-title">Active Sessions</h1>
        </div>
        <div className="as-header-actions">
          {otherCount > 0 && (
            <button className="btn-secondary" onClick={handleRevokeOthers}>
              Revoke All Other Sessions
            </button>
          )}
        </div>
      </header>

      <section className="as-hero">
        <div className="as-hero-left">
          <div className="as-hero-icon">
            <MonitorSmartphone size={28} />
          </div>
          <div>
            <p className="as-hero-label">Sessions currently active</p>
            <h2 className="as-hero-value">{activeCount}</h2>
            <p className="as-hero-sub">
              {otherCount} session{otherCount === 1 ? '' : 's'} outside this device
            </p>
          </div>
        </div>
        <div className="as-hero-right">
          <button className="btn-ghost">
            <RefreshCcw size={14} /> Refresh list
          </button>
          <button
            className="btn-primary"
            onClick={handleRevokeOthers}
            disabled={otherCount === 0}
          >
            <ShieldCheck size={14} /> Revoke others
          </button>
        </div>
      </section>

      <section className="as-stats-grid">
        <article className="as-stat-card">
          <p className="stat-label">Current session</p>
          <p className="stat-value">{currentSession ? currentSession.device : '—'}</p>
          <p className="stat-meta">{currentSession ? currentSession.browser : '—'}</p>
        </article>
        <article className="as-stat-card">
          <p className="stat-label">Last login IP</p>
          <p className="stat-value">{currentSession ? currentSession.ip : '—'}</p>
          <p className="stat-meta">{currentSession ? currentSession.location : '—'}</p>
        </article>
        <article className="as-stat-card">
          <p className="stat-label">Login time</p>
          <p className="stat-value">{currentSession ? currentSession.loginTime : '—'}</p>
          <p className="stat-meta">{currentSession ? currentSession.duration : '—'}</p>
        </article>
      </section>

      <div className="as-table-wrapper">
        <table className="as-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Browser</th>
              <th>Operating System</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Login Time</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className={session.current ? 'current-row' : ''}>
                <td>
                  <div className="session-device">
                    <strong>{session.device}</strong>
                    {session.current ? <span className="session-badge">This device</span> : null}
                  </div>
                </td>
                <td>
                  <span className="session-meta">{session.browser}</span>
                </td>
                <td>
                  <span className="session-meta">{session.os}</span>
                </td>
                <td>
                  <div className="ip-cell">
                    <span className="session-meta mono">{session.ip}</span>
                    <button
                      className="small-icon"
                      onClick={() => navigator.clipboard?.writeText(session.ip)}
                      type="button"
                      aria-label="Copy IP"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td>
                  <span className="session-meta">{session.location}</span>
                </td>
                <td>
                  <span className="session-meta">{session.loginTime}</span>
                </td>
                <td>
                  <span className="session-meta">{session.lastActive}</span>
                </td>
                <td>
                  <span className={`session-status session-${
                    session.current ? 'active' : session.risk === 'Trusted device' ? 'trusted' : 'warn'
                  }`}
                  >
                    {session.current ? 'Current' : session.risk}
                  </span>
                </td>
                <td>
                  {session.current ? (
                    <span className="session-action-text">Live now</span>
                  ) : (
                    <button
                      className="btn-link"
                      onClick={() => handleRevoke(session.id)}
                      type="button"
                    >
                      <X size={16} /> Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveSessions;