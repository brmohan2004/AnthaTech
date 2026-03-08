import React, { useState, useEffect } from 'react';
import { getCloudflareTraffic, getSupabaseUsage, getCloudinaryUsage } from '../../../api/analytics';
import './Traffic.css';
import {
  Eye, Users, Wifi, ChevronRight, TrendingUp, TrendingDown,
  Globe, BarChart2, ArrowUpRight, BarChart3,
} from 'lucide-react';

// ── Default empty states ─────────────────────────────────────────────────
const EMPTY_STATS = [
  { id: 'views', label: 'Total Page Views', value: '—', delta: 'No data yet', up: null, icon: Eye, color: 'blue' },
  { id: 'visitors', label: 'Unique Visitors', value: '—', delta: 'No data yet', up: null, icon: Users, color: 'green' },
  { id: 'bw', label: 'Bandwidth Served', value: '—', delta: 'No data yet', up: null, icon: Wifi, color: 'purple' },
  { id: 'bounce', label: 'Bounce Rate', value: '—', delta: 'No data yet', up: null, icon: BarChart2, color: 'orange' },
];

const EMPTY_FREE_TIER = [
  { label: 'CF Cache Hit Rate', used: 0, total: 100, unit: '%', suffix: '%', health: 'good' },
  { label: 'Error Rate (4/5xx)', used: 0, total: 1, unit: '%', suffix: '%', health: 'good' },
  { label: 'Supabase Bandwidth', used: 0, total: 2048, unit: 'MB', suffix: ' MB / 2 GB', health: 'good' },
  { label: 'Cloudinary Credits', used: 0, total: 25, unit: '', suffix: ' / 25', health: 'good' },
];

const PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];

// ── Sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const W = 80, H = 28;
  const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} className="sparkline-svg">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ── Donut chart ─────────────────────────────────────────────────────────
function DonutChart({ segments, size = 110 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((s) => {
    const dash = (s.pct / 100) * circ;
    const gap = circ - dash;
    const slice = { ...s, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
      {slices.map((s) => (
        <circle
          key={s.label}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="16"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">Sources</text>
    </svg>
  );
}

export default function TrafficOverview() {
  const [period, setPeriod] = useState('Last 30 days');
  const [periodOpen, setPeriodOpen] = useState(false);

  const [realStats, setRealStats] = useState(EMPTY_STATS);
  const [realSparkline, setRealSparkline] = useState([]);
  const [realFreeTier, setRealFreeTier] = useState(EMPTY_FREE_TIER);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealAnalytics() {
      try {
        setError(null);
        const cfData = await getCloudflareTraffic(import.meta.env.VITE_CF_ACCOUNT_ID);
        if (cfData) {
          setRealStats([
            { id: 'views', label: 'Total Page Views', value: cfData.pageViews.toLocaleString(), delta: 'Real Time', up: null, icon: Eye, color: 'blue' },
            { id: 'visitors', label: 'Unique Visitors', value: cfData.uniqueVisitors.toLocaleString(), delta: 'Real Time', up: null, icon: Users, color: 'green' },
            { id: 'bw', label: 'Bandwidth Served', value: (cfData.bandwidthBytes / (1024 * 1024)).toFixed(1) + ' MB', delta: 'Real Time', up: null, icon: Wifi, color: 'purple' },
            { id: 'bounce', label: 'Hit Rate', value: 'Unknown', delta: '—', up: null, icon: BarChart2, color: 'orange' },
          ]);
          const maxViews = Math.max(...cfData.sparkline, 1);
          setRealSparkline(cfData.sparkline.map(v => (v / maxViews) * 100));
        } else {
          setError('Cloudflare Analytics data not available. Ensure VITE_CF_ACCOUNT_ID is set and the site has traffic.');
        }

        const supabaseUsage = await getSupabaseUsage();
        const cloudinaryUsage = await getCloudinaryUsage();

        setRealFreeTier(prev => {
          const newTier = [...prev];
          if (supabaseUsage) {
            newTier[2] = { ...newTier[2], used: supabaseUsage.bandwidthMB, suffix: ` MB / ${supabaseUsage.maxMB} MB` };
          }
          if (cloudinaryUsage) {
            newTier[3] = { ...newTier[3], used: cloudinaryUsage.creditsUsed, suffix: ` / ${cloudinaryUsage.maxCredits}` };
          }
          return newTier;
        });
      } catch (err) {
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }

    loadRealAnalytics();
  }, []);

  return (
    <div className="an-container">

      {/* Header */}
      <header className="an-header">
        <div className="an-breadcrumb">
          <span className="bc-dim">Analytics</span>
          <ChevronRight size={14} className="bc-sep" />
          <span className="bc-active">Traffic Overview</span>
        </div>
        <div className="an-title-row">
          <div className="an-title-block">
            <BarChart3 size={22} className="an-title-icon" />
            <h1 className="an-title">Traffic Overview</h1>
          </div>
          <div className="an-period-picker">
            <button className="an-period-btn" onClick={() => setPeriodOpen(v => !v)}>
              {period} <ArrowUpRight size={13} />
            </button>
            {periodOpen && (
              <ul className="an-period-dropdown">
                {PERIODS.map(p => (
                  <li key={p}
                    className={`an-period-opt ${p === period ? 'opt-active' : ''}`}
                    onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                  >{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <p className="an-readonly-note">
          Read-only — data pulled from Cloudflare Analytics (GDPR-compliant, no cookies)
        </p>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Note:</strong> {error}
        </div>
      )}

      {/* Stats cards */}
      <section className="an-stats-row">
        {realStats.map(s => {
          const Icon = s.icon;
          return (
            <div className={`an-stat-card card-${s.color}`} key={s.id}>
              <div className="an-stat-top">
                <span className={`an-stat-icon-wrap icon-wrap-${s.color}`}><Icon size={17} /></span>
                <span className="an-stat-label">{s.label}</span>
              </div>
              <div className="an-stat-value">{s.value}</div>
              <div className="an-stat-footer">
                {s.up === null
                  ? <span className="an-stat-neutral">{s.delta}</span>
                  : s.up
                    ? <span className="an-delta-up"><TrendingUp size={12} /> {s.delta} vs prev period</span>
                    : <span className="an-delta-dn"><TrendingDown size={12} /> {s.delta} vs prev period</span>
                }
                {s.id === 'views' && <Sparkline data={realSparkline} color="#3B82F6" />}
                {s.id === 'visitors' && <Sparkline data={realSparkline.map((v, i) => Math.round(v * 0.34))} color="#4ADE80" />}
              </div>
            </div>
          );
        })}
      </section>

      {/* Middle grid: Top Pages + Top Countries */}
      <div className="an-mid-grid">

        {/* Top Pages */}
        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title">Top Pages</h2>
            <span className="an-panel-sub">{period}</span>
          </div>
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            No page-level data available. Cloudflare Analytics will populate this once the site receives traffic.
          </div>
        </section>

        {/* Top Countries */}
        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title"><Globe size={16} className="ph-icon" /> Top Countries</h2>
            <span className="an-panel-sub">{period}</span>
          </div>
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            No country-level data available. Cloudflare Analytics will populate this once the site receives traffic.
          </div>
        </section>
      </div>

      {/* Bottom grid: Sources donut + Free tier */}
      <div className="an-bot-grid">

        {/* Traffic Sources */}
        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title">Traffic Sources</h2>
            <span className="an-panel-sub">{period}</span>
          </div>
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            No traffic source data available. Cloudflare Analytics will populate this once the site receives traffic.
          </div>
        </section>

        {/* Free Tier Usage */}
        <section className="an-panel an-panel-wide">
          <div className="an-panel-head">
            <h2 className="an-panel-title">Free Tier Usage</h2>
            <span className="an-panel-sub">CF + Supabase + Cloudinary</span>
          </div>
          <ul className="an-tier-list">
            {realFreeTier.map(t => {
              const pct = Math.min((t.used / t.total) * 100, 100);
              const warn = pct > 80;
              return (
                <li key={t.label} className="an-tier-row">
                  <div className="an-tier-head">
                    <span className="an-tier-label">{t.label}</span>
                    <span className={`an-tier-val ${warn ? 'tv-warn' : 'tv-ok'}`}>
                      {t.used}{t.suffix} {warn ? '⚠️' : '✅'}
                    </span>
                  </div>
                  <div className="an-tier-track">
                    <div
                      className={`an-tier-fill ${warn ? 'fill-warn' : 'fill-ok'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

    </div>
  );
}
