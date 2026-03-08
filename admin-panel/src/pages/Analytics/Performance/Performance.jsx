import React, { useState, useEffect } from 'react';
import '../Traffic/Traffic.css';
import './Performance.css';
import {
  Zap, ChevronRight, Clock, AlertCircle, Database,
  HardDrive, CheckCircle2, Activity, BarChart3,
} from 'lucide-react';
import { getCloudflareTraffic, getSupabaseUsage, getCloudinaryUsage } from '../../../api/analytics';

export default function Performance() {
  const [gauges, setGauges] = useState([]);
  const [responseTimes, setResponseTimes] = useState([]);
  const [errorLog, setErrorLog] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const cfData = await getCloudflareTraffic(import.meta.env.VITE_CF_ACCOUNT_ID);
        const supabaseUsage = await getSupabaseUsage();
        const cloudinaryUsage = await getCloudinaryUsage();

        const gaugeItems = [];

        if (cfData) {
          const totalReqs = cfData.totalRequests || 0;
          const errorRate = cfData.errors ? (cfData.errors.reduce((s, e) => s + e.count, 0) / Math.max(totalReqs, 1) * 100).toFixed(1) : '0.0';

          gaugeItems.push({
            id: 'errors', label: 'Error Rate (4xx/5xx)', value: `${errorRate}%`,
            num: parseFloat(errorRate), max: 5, source: 'Cloudflare',
            barCls: parseFloat(errorRate) < 1 ? 'gb-green' : 'gb-yellow',
            valCls: parseFloat(errorRate) < 1 ? 'gv-green' : 'gv-yellow',
            icon: AlertCircle, note: 'Alert threshold: > 1%',
            status: parseFloat(errorRate) < 1 ? 'Normal' : 'Elevated',
          });

          if (cfData.responseTimes && cfData.responseTimes.length > 0) {
            setResponseTimes(cfData.responseTimes);
            const avgMs = Math.round(cfData.responseTimes.reduce((s, r) => s + r.ms, 0) / cfData.responseTimes.length);
            gaugeItems.push({
              id: 'response', label: 'Avg Response Time', value: `${avgMs} ms`,
              num: avgMs, max: 500, source: 'CF Worker',
              barCls: avgMs < 300 ? 'gb-blue' : 'gb-yellow',
              valCls: avgMs < 300 ? 'gv-blue' : 'gv-yellow',
              icon: Clock, note: 'Target < 300 ms',
              status: avgMs < 300 ? 'Good' : 'Slow',
            });
          }

          if (cfData.errors && cfData.errors.length > 0) {
            setErrorLog(cfData.errors);
          }
        }

        if (supabaseUsage) {
          const pctUsed = ((supabaseUsage.bandwidthMB / supabaseUsage.maxMB) * 100).toFixed(0);
          gaugeItems.push({
            id: 'supabw', label: 'Supabase Bandwidth', value: `${supabaseUsage.bandwidthMB.toFixed(0)} MB`,
            num: supabaseUsage.bandwidthMB, max: supabaseUsage.maxMB, source: 'Supabase',
            barCls: supabaseUsage.bandwidthMB / supabaseUsage.maxMB < 0.8 ? 'gb-green' : 'gb-yellow',
            valCls: supabaseUsage.bandwidthMB / supabaseUsage.maxMB < 0.8 ? 'gv-green' : 'gv-yellow',
            icon: Database,
            note: `${pctUsed}% of free tier used`,
            status: `${supabaseUsage.bandwidthMB.toFixed(0)} MB / ${(supabaseUsage.maxMB / 1024).toFixed(0)} GB`,
          });
        }

        if (cloudinaryUsage) {
          const pctUsed = ((cloudinaryUsage.creditsUsed / cloudinaryUsage.maxCredits) * 100).toFixed(0);
          gaugeItems.push({
            id: 'cloudinary', label: 'Cloudinary Credits', value: `${cloudinaryUsage.creditsUsed}`,
            num: cloudinaryUsage.creditsUsed, max: cloudinaryUsage.maxCredits, source: 'Cloudinary',
            barCls: cloudinaryUsage.creditsUsed / cloudinaryUsage.maxCredits < 0.8 ? 'gb-green' : 'gb-yellow',
            valCls: cloudinaryUsage.creditsUsed / cloudinaryUsage.maxCredits < 0.8 ? 'gv-green' : 'gv-yellow',
            icon: HardDrive,
            note: `${pctUsed}% of free tier used`,
            status: `${cloudinaryUsage.creditsUsed} / ${cloudinaryUsage.maxCredits} credits`,
          });
        }

        setGauges(gaugeItems);

        if (gaugeItems.length === 0 && !cfData && !supabaseUsage && !cloudinaryUsage) {
          setError('No performance data available. Ensure Cloudflare Analytics is configured and the site has traffic. Supabase and Cloudinary usage will appear once content is added.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load performance metrics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="an-container">

      {/* Header */}
      <header className="an-header">
        <div className="an-breadcrumb">
          <span className="bc-dim">Analytics</span>
          <ChevronRight size={14} className="bc-sep" />
          <span className="bc-active">Performance</span>
        </div>
        <div className="an-title-row">
          <div className="an-title-block">
            <Zap size={22} className="an-title-icon" />
            <h1 className="an-title">Performance Metrics</h1>
          </div>
        </div>
        <p className="an-readonly-note">
          Read-only — Cloudflare Analytics + Supabase API
        </p>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Note:</strong> {error}
        </div>
      )}

      {/* Gauge cards grid */}
      {gauges.length > 0 ? (
        <div className="an-gauge-grid">
          {gauges.map(g => {
            const Icon = g.icon;
            const pct = Math.min((g.num / g.max) * 100, 100);
            return (
              <div className="an-gauge-card" key={g.id}>
                <div className="perf-gauge-top">
                  <span className="perf-source-tag">{g.source}</span>
                  <Icon size={15} className={`perf-icon ${g.valCls}`} />
                </div>
                <div className={`an-gauge-value ${g.valCls}`}>{g.value}</div>
                <div className="an-gauge-label">{g.label}</div>
                <div className="an-gauge-bar-wrap">
                  <div className={`an-gauge-bar ${g.barCls}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="an-gauge-sub">{g.status}</div>
                <div className="perf-note">{g.note}</div>
              </div>
            );
          })}
        </div>
      ) : !loading && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
          No performance gauge data available yet.
        </div>
      )}

      {/* Response time history + Error log */}
      <div className="an-mid-grid">

        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title"><Activity size={15} className="ph-icon" /> Response Time History</h2>
            <span className="an-panel-sub">Recent</span>
          </div>
          {responseTimes.length > 0 ? (
            <div className="an-bars-wrap">
              {responseTimes.map(r => {
                const h = (r.ms / 300) * 90;
                return (
                  <div className="an-bar-col" key={r.label}>
                    <span className="an-bar-val">{r.ms}ms</span>
                    <div className="an-bar-fill" style={{ height: `${h}px`, background: 'var(--accent-blue)' }} />
                    <span className="an-bar-x">{r.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No response time data available. Cloudflare Analytics will populate this once there is traffic.
            </div>
          )}
        </section>

        <section className="an-panel">
          <div className="an-panel-head">
            <h2 className="an-panel-title"><AlertCircle size={15} className="ph-icon" /> Top Error URLs</h2>
            <span className="an-panel-sub">From Cloudflare</span>
          </div>
          {errorLog.length > 0 ? (
            <table className="an-table">
              <thead>
                <tr><th>Code</th><th>Path</th><th className="ta-right">Count</th><th className="ta-right">Last seen</th></tr>
              </thead>
              <tbody>
                {errorLog.map((e, i) => (
                  <tr key={i}>
                    <td><span className={`perf-code-badge ${e.code.startsWith('5') ? 'code-500' : 'code-404'}`}>{e.code}</span></td>
                    <td className="an-url-cell" style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{e.path}</td>
                    <td className="ta-right an-views">{e.count}</td>
                    <td className="ta-right" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No HTTP errors recorded. This is good — no 4xx/5xx responses detected.
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
