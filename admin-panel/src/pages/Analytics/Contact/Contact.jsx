import React, { useState, useEffect } from 'react';
import '../Traffic/Traffic.css';
import './Contact.css';
import {
  Mail, ChevronRight, TrendingUp, Clock, MessageSquare, BarChart3,
} from 'lucide-react';
import { getContactMessages } from '../../../api/content';

function DonutChart({ segments, size = 110 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((s) => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const slice = { ...s, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
      {slices.map((s) => (
        <circle key={s.label} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth="16"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circ * 0.25}
        />
      ))}
    </svg>
  );
}

export default function ContactAnalytics() {
  const [weekly, setWeekly] = useState([]);
  const [statusSplit, setStatusSplit] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [totalMonth, setTotalMonth] = useState(0);
  const [avgPerWeek, setAvgPerWeek] = useState(0);
  const [readRate, setReadRate] = useState(0);
  const [peakInfo, setPeakInfo] = useState({ count: 0, label: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SLOT_LABELS = ['Morning', 'Afternoon', 'Evening'];

  useEffect(() => {
    (async () => {
      try {
        const messages = await getContactMessages('All');

        // Compute weekly buckets (last 6 weeks)
        const now = new Date();
        const weeks = [];
        for (let i = 5; i >= 0; i--) {
          const start = new Date(now);
          start.setDate(now.getDate() - (i + 1) * 7);
          const end = new Date(start);
          end.setDate(start.getDate() + 7);
          const count = messages.filter(m => {
            const d = new Date(m.created_at);
            return d >= start && d < end;
          }).length;
          weeks.push({ label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count });
        }
        setWeekly(weeks);

        const total = weeks.reduce((a, w) => a + w.count, 0);
        setTotalMonth(total);
        setAvgPerWeek(weeks.length ? Math.round(total / weeks.length) : 0);

        const peak = weeks.reduce((max, w) => w.count > max.count ? w : max, { count: 0, label: '' });
        setPeakInfo(peak);

        // Status split
        const newCount = messages.filter(m => (m.status || '').toLowerCase() === 'new').length;
        const readCount = messages.filter(m => (m.status || '').toLowerCase() === 'read').length;
        const msTotal = newCount + readCount || 1;
        setStatusSplit([
          { label: 'New', pct: Math.round((newCount / msTotal) * 100), color: '#3B82F6' },
          { label: 'Read', pct: Math.round((readCount / msTotal) * 100), color: '#4ADE80' },
        ]);
        setReadRate(Math.round((readCount / msTotal) * 100));

        // Heatmap
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hm = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
          const dayIdx = dayNames.indexOf(day);
          const dayMessages = messages.filter(m => new Date(m.created_at).getDay() === dayIdx);
          const slots = [
            dayMessages.filter(m => { const h = new Date(m.created_at).getHours(); return h >= 6 && h < 12; }).length,
            dayMessages.filter(m => { const h = new Date(m.created_at).getHours(); return h >= 12 && h < 18; }).length,
            dayMessages.filter(m => { const h = new Date(m.created_at).getHours(); return h >= 18 || h < 6; }).length,
          ];
          return { day, slots };
        });
        setHeatmap(hm);
      } catch (err) {
        setError(err.message || 'Failed to load contact analytics. Check your database connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxBar = Math.max(...weekly.map(w => w.count), 1);

  return (
    <div className="an-container">

      {/* Header */}
      <header className="an-header">
        <div className="an-breadcrumb">
          <span className="bc-dim">Analytics</span>
          <ChevronRight size={14} className="bc-sep" />
          <span className="bc-active">Contact Analytics</span>
        </div>
        <div className="an-title-row">
          <div className="an-title-block">
            <Mail size={22} className="an-title-icon" />
            <h1 className="an-title">Contact Form Analytics</h1>
          </div>
        </div>
        <p className="an-readonly-note">Contact form submissions overview</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* KPI mini cards */}
      <div className="an-mini-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="an-mini-stat">
          <div className="an-mini-num">{totalMonth}</div>
          <div className="an-mini-label">Total submissions this month</div>
        </div>
        <div className="an-mini-stat">
          <div className="an-mini-num">{avgPerWeek}</div>
          <div className="an-mini-label">Average per week</div>
        </div>
        <div className="an-mini-stat">
          <div className="an-mini-num">{peakInfo.count}</div>
          <div className="an-mini-label">Peak — week of {peakInfo.label}</div>
        </div>
        <div className="an-mini-stat">
          <div className="an-mini-num">{readRate}%</div>
          <div className="an-mini-label">Read rate</div>
          <div className="an-mini-label" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{100 - readRate}% still unread</div>
        </div>
      </div>

      {/* Bar chart + Donut side-by-side */}
      <div className="an-mid-grid">

        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title"><BarChart3 size={15} className="ph-icon" /> Submissions per Week</h2>
            <span className="an-panel-sub">Last 6 weeks</span>
          </div>
          <div className="an-bars-wrap" style={{ height: 120 }}>
            {weekly.map(w => {
              const h = Math.max((w.count / maxBar) * 108, 4);
              return (
                <div className="an-bar-col" key={w.label}>
                  <span className="an-bar-val">{w.count}</span>
                  <div className="an-bar-fill" style={{ height: `${h}px` }} />
                  <span className="an-bar-x">{w.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title"><MessageSquare size={15} className="ph-icon" /> New vs Read</h2>
            <span className="an-panel-sub">All time</span>
          </div>
          <div className="an-donut-wrap">
            <DonutChart segments={statusSplit} size={120} />
            <ul className="an-legend">
              {statusSplit.map(s => (
                <li key={s.label} className="an-legend-row">
                  <span className="an-legend-dot" style={{ background: s.color }} />
                  <span className="an-legend-label">{s.label}</span>
                  <span className="an-legend-pct">{s.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Heatmap */}
      <section className="an-panel" style={{ marginBottom: 40 }}>
        <div className="an-panel-head">
          <h2 className="an-panel-title"><Clock size={15} className="ph-icon" /> Peak Submission Times</h2>
          <span className="an-panel-sub">by day &amp; time slot</span>
        </div>
        <div className="contact-heatmap">
          <div className="hm-slots-row">
            <div className="hm-day-spacer" />
            {SLOT_LABELS.map(s => <span key={s} className="hm-slot-label">{s}</span>)}
          </div>
          {heatmap.map(row => (
            <div className="hm-row" key={row.day}>
              <span className="hm-day-label">{row.day}</span>
              {row.slots.map((v, i) => {
                const maxSlot = Math.max(...heatmap.flatMap(r => r.slots), 1);
                const intensity = v / maxSlot;
                return (
                  <div key={i} className="hm-cell"
                    style={{ background: `rgba(59,130,246,${Math.max(intensity, 0.06)})` }}
                    title={`${row.day} ${SLOT_LABELS[i]}: ${v} submissions`}
                  >
                    {v > 0 && <span className="hm-cell-val">{v}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
