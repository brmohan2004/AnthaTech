import React, { useState, useEffect } from 'react';
import '../Traffic/Traffic.css';
import './Community.css';
import {
  Users, ChevronRight, TrendingUp, GraduationCap,
  Briefcase, CheckCircle2, XCircle, BarChart3, Clock,
} from 'lucide-react';
import { getCommunityApplications } from '../../../api/content';

function DonutChart({ segments, size = 110 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const slice = { ...s, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
      {slices.map(s => (
        <circle key={s.label} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth="16"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circ * 0.25}
        />
      ))}
    </svg>
  );
}

export default function CommunityAnalytics() {
  const [monthlyApps, setMonthlyApps] = useState([]);
  const [trackSplit, setTrackSplit] = useState([]);
  const [statusSplit, setStatusSplit] = useState([]);
  const [recent, setRecent] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [approvalRate, setApprovalRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const apps = await getCommunityApplications();

        // Total approved = members
        const approved = apps.filter(a => (a.status || '').toLowerCase() === 'approved');
        const pending = apps.filter(a => (a.status || '').toLowerCase() === 'pending');
        const rejected = apps.filter(a => (a.status || '').toLowerCase() === 'rejected');
        setTotalMembers(approved.length);

        // This month
        const now = new Date();
        const thisMonth = apps.filter(a => {
          const d = new Date(a.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        setThisMonthCount(thisMonth.length);

        // Approval rate
        const total = apps.length || 1;
        setApprovalRate(Math.round((approved.length / total) * 100));

        // Monthly buckets (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
          const count = apps.filter(a => {
            const ad = new Date(a.created_at);
            return ad >= d && ad < end;
          }).length;
          months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), count });
        }
        setMonthlyApps(months);

        // Track split
        const students = apps.filter(a => (a.track || '').toLowerCase() === 'student').length;
        const pros = apps.filter(a => (a.track || '').toLowerCase() === 'professional').length;
        const trackTotal = students + pros || 1;
        setTrackSplit([
          { label: 'Student', pct: Math.round((students / trackTotal) * 100), color: '#3B82F6' },
          { label: 'Professional', pct: Math.round((pros / trackTotal) * 100), color: '#A78BFA' },
        ]);

        // Status split
        setStatusSplit([
          { label: 'Approved', pct: Math.round((approved.length / total) * 100), color: '#4ADE80' },
          { label: 'Pending', pct: Math.round((pending.length / total) * 100), color: '#FBBF24' },
          { label: 'Rejected', pct: Math.round((rejected.length / total) * 100), color: '#F05A63' },
        ]);

        // Recent 5
        const sorted = [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        setRecent(sorted.map(a => ({
          name: a.full_name || a.name || '—',
          track: a.track || '—',
          status: (a.status || 'pending').charAt(0).toUpperCase() + (a.status || 'pending').slice(1),
          date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })));
      } catch (err) {
        setError(err.message || 'Failed to load community analytics. Check your database connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxBar = Math.max(...monthlyApps.map(m => m.count), 1);

  return (
    <div className="an-container">

      {/* Header */}
      <header className="an-header">
        <div className="an-breadcrumb">
          <span className="bc-dim">Analytics</span>
          <ChevronRight size={14} className="bc-sep" />
          <span className="bc-active">Community Analytics</span>
        </div>
        <div className="an-title-row">
          <div className="an-title-block">
            <Users size={22} className="an-title-icon" />
            <h1 className="an-title">Community Analytics</h1>
          </div>
        </div>
        <p className="an-readonly-note">Community applications and membership overview</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* KPI mini cards */}
      <div className="an-mini-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
        <div className="an-mini-stat">
          <div className="an-mini-num">{totalMembers}</div>
          <div className="an-mini-label">Total members</div>
        </div>
        <div className="an-mini-stat">
          <div className="an-mini-num">{thisMonthCount}</div>
          <div className="an-mini-label">Applications this month</div>
        </div>
        <div className="an-mini-stat">
          <div className="an-mini-num">{approvalRate}%</div>
          <div className="an-mini-label">Approval rate</div>
        </div>
        <div className="an-mini-stat">
          <div className="an-mini-num combo-stat">
            <span className="combo-blue">{trackSplit[0]?.pct || 0}<span className="combo-pct">%</span></span>
            <span className="combo-sep"> / </span>
            <span className="combo-purple">{trackSplit[1]?.pct || 0}<span className="combo-pct">%</span></span>
          </div>
          <div className="an-mini-label">Student / Professional split</div>
        </div>
      </div>

      {/* Applications line chart + Track split donut */}
      <div className="an-mid-grid">

        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title"><BarChart3 size={15} className="ph-icon" /> Applications over Time</h2>
            <span className="an-panel-sub">Last 6 months</span>
          </div>
          <div className="an-bars-wrap" style={{ height: 120 }}>
            {monthlyApps.map(m => {
              const h = Math.max((m.count / maxBar) * 108, 4);
              return (
                <div className="an-bar-col" key={m.label}>
                  <span className="an-bar-val">{m.count}</span>
                  <div className="an-bar-fill" style={{ height: `${h}px`, background: 'var(--status-violet-text)' }} />
                  <span className="an-bar-x">{m.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title">Track &amp; Status Split</h2>
          </div>
          <div className="comm-donuts-row">
            <div className="comm-donut-block">
              <p className="comm-donut-label">By Track</p>
              <DonutChart segments={trackSplit} size={110} />
              <ul className="an-legend" style={{ gap: 6 }}>
                {trackSplit.map(s => (
                  <li key={s.label} className="an-legend-row">
                    <span className="an-legend-dot" style={{ background: s.color }} />
                    <span className="an-legend-label">{s.label}</span>
                    <span className="an-legend-pct">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="comm-donut-block">
              <p className="comm-donut-label">By Status</p>
              <DonutChart segments={statusSplit} size={110} />
              <ul className="an-legend" style={{ gap: 6 }}>
                {statusSplit.map(s => (
                  <li key={s.label} className="an-legend-row">
                    <span className="an-legend-dot" style={{ background: s.color }} />
                    <span className="an-legend-label">{s.label}</span>
                    <span className="an-legend-pct">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Recent applications table */}
      <section className="an-panel" style={{ marginBottom: 40 }}>
        <div className="an-panel-head">
          <h2 className="an-panel-title"><Clock size={15} className="ph-icon" /> Recent Applications</h2>
          <span className="an-panel-sub">Last 5</span>
        </div>
        <table className="an-table">
          <thead>
            <tr><th>Applicant</th><th>Track</th><th>Status</th><th className="ta-right">Date</th></tr>
          </thead>
          <tbody>
            {recent.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>
                  <span className={`comm-track-badge ${r.track === 'Student' ? 'track-student' : 'track-pro'}`}>
                    {r.track === 'Student' ? <GraduationCap size={11} /> : <Briefcase size={11} />}
                    {r.track}
                  </span>
                </td>
                <td>
                  <span className={`comm-status-badge status-${r.status.toLowerCase()}`}>
                    {r.status === 'Approved'  && <CheckCircle2 size={11} />}
                    {r.status === 'Rejected'  && <XCircle      size={11} />}
                    {r.status === 'Pending'   && <Clock        size={11} />}
                    {r.status}
                  </span>
                </td>
                <td className="ta-right" style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
