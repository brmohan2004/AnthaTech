import React, { useState, useEffect, useMemo } from 'react';
import './Alerts.css';
import {
  AlertTriangle, XCircle, Info as InfoIcon,
  CheckCircle2, X, Clock, ChevronRight,
  Shield, Eye, Globe, Lock,
  Trash2, UserPlus, UserMinus, KeyRound,
  ShieldOff, MapPin, Monitor, Settings2,
  Search, ChevronDown, ChevronUp, Bell,
} from 'lucide-react';
import { getAuditLog, getSiteConfig, updateSiteConfig, insertAuditLog } from '../../../api/content';

// ── Trigger icon map ──────────────────────────────────────────────────────
const TRIGGER_ICONS = {
  brute_force_locked: Lock,
  mfa_disabled: ShieldOff,
  new_ip_login: Globe,
  failed_attempts: AlertTriangle,
  admin_deleted: UserMinus,
  bulk_delete: Trash2,
  password_changed: KeyRound,
  admin_created: UserPlus,
  outside_hours: Clock,
};


const TABS = ['All', 'Critical', 'Warning', 'Info', 'Dismissed'];

// ── Helper ─────────────────────────────────────────────────────────────────
function levelMeta(level) {
  switch (level) {
    case 'critical': return { label: 'Critical', cls: 'critical', Icon: XCircle };
    case 'warning': return { label: 'Warning', cls: 'warning', Icon: AlertTriangle };
    default: return { label: 'Info', cls: 'info', Icon: InfoIcon };
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function AcknowledgeModal({ alert, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const { label, cls } = levelMeta(alert.level);

  return (
    <div className="sa-overlay" role="dialog" aria-modal="true">
      <div className="sa-modal">
        <button className="sa-modal-close" onClick={onClose}><X size={16} /></button>

        <div className={`sa-modal-level-bar level-bar-${cls}`} />

        <div className="sa-modal-head">
          <Shield size={20} className={`sa-modal-icon icon-${cls}`} />
          <div>
            <p className="sa-modal-eyebrow">Acknowledge &amp; Dismiss Alert</p>
            <h2 className="sa-modal-title">{alert.trigger}</h2>
          </div>
        </div>

        <p className="sa-modal-meta">
          <span className={`sa-level-badge badge-${cls}`}>{label}</span>
          <span className="sa-modal-when"><Clock size={12} /> {alert.when}</span>
          <span className="sa-modal-account">{alert.account}</span>
        </p>

        <p className="sa-modal-body">
          By acknowledging this alert you confirm that you have investigated the
          event and taken any necessary action. This acknowledgement will be
          recorded in the Audit Log.
        </p>

        <label className="sa-note-label">Investigation note (optional)</label>
        <textarea
          className="sa-note-input"
          rows={3}
          placeholder="e.g. Confirmed as authorised — admin was travelling..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div className="sa-modal-actions">
          <button className="sa-btn sa-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="sa-btn sa-btn-confirm"
            onClick={() => onConfirm(alert.id, note)}
          >
            <CheckCircle2 size={15} /> Acknowledge &amp; Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ alert, onClose, onAcknowledge }) {
  const { label, cls, Icon } = levelMeta(alert.level);
  const TriggerIcon = TRIGGER_ICONS[alert.triggerType] || AlertTriangle;

  return (
    <div className="sa-drawer-overlay" onClick={onClose}>
      <aside className="sa-drawer" onClick={e => e.stopPropagation()}>
        <div className={`sa-drawer-accent accent-${cls}`} />

        <header className="sa-drawer-header">
          <div className="sa-drawer-header-top">
            <span className={`sa-level-badge badge-${cls}`}>
              <Icon size={12} /> {label}
            </span>
            <button className="sa-drawer-close" onClick={onClose}><X size={16} /></button>
          </div>
          <h2 className="sa-drawer-title">{alert.trigger}</h2>
          <p className="sa-drawer-when"><Clock size={13} /> {alert.when}</p>
        </header>

        <div className="sa-drawer-body">

          <section className="sa-drawer-section">
            <h3 className="sa-drawer-section-title">What happened</h3>
            <p className="sa-drawer-desc">{alert.description}</p>
          </section>

          <section className="sa-drawer-section">
            <h3 className="sa-drawer-section-title">Event details</h3>
            <ul className="sa-detail-list">
              <li>
                <span className="sdl-icon"><TriggerIcon size={14} /></span>
                <span className="sdl-key">Trigger</span>
                <span className="sdl-val">{alert.trigger}</span>
              </li>
              <li>
                <span className="sdl-icon"><Monitor size={14} /></span>
                <span className="sdl-key">Account</span>
                <span className="sdl-val sdl-mono">{alert.account}</span>
              </li>
              <li>
                <span className="sdl-icon"><Globe size={14} /></span>
                <span className="sdl-key">IP Address</span>
                <span className="sdl-val sdl-mono">{alert.ip}</span>
              </li>
              <li>
                <span className="sdl-icon"><MapPin size={14} /></span>
                <span className="sdl-key">Location</span>
                <span className="sdl-val">{alert.location}</span>
              </li>
              <li>
                <span className="sdl-icon"><Monitor size={14} /></span>
                <span className="sdl-key">Device</span>
                <span className="sdl-val">{alert.device}</span>
              </li>
            </ul>
          </section>

          <section className="sa-drawer-section sa-recommend-section">
            <h3 className="sa-drawer-section-title">
              <span className="recommend-dot" /> Recommended action
            </h3>
            <p className="sa-recommend-text">{alert.recommendation}</p>
          </section>

        </div>

        <footer className="sa-drawer-footer">
          {!alert.dismissed && (
            <button
              className="sa-btn sa-btn-confirm w-full"
              onClick={() => onAcknowledge(alert)}
            >
              <CheckCircle2 size={15} /> Acknowledge &amp; Dismiss
            </button>
          )}
          {alert.dismissed && (
            <div className="sa-drawer-dismissed-note">
              <CheckCircle2 size={15} className="dismissed-check" />
              This alert has been acknowledged
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SuspiciousActivityAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [dismissTarget, setDismissTarget] = useState(null); // opens modal
  const [detailAlert, setDetailAlert] = useState(null); // opens drawer
  const [hoursOpen, setHoursOpen] = useState(false);

  // Business hours config state
  const [bhStart, setBhStart] = useState('09:00');
  const [bhEnd, setBhEnd] = useState('19:00');
  const [bhTz, setBhTz] = useState('IST');
  const [bhDays, setBhDays] = useState([true, true, true, true, true, false, false]);
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    (async () => {
      try {
        const [logs, config] = await Promise.all([getAuditLog(), getSiteConfig()]);

        // Load business hours from config
        if (config.business_hours) {
          const bh = typeof config.business_hours === 'string' ? JSON.parse(config.business_hours) : config.business_hours;
          if (bh.start) setBhStart(bh.start);
          if (bh.end) setBhEnd(bh.end);
          if (bh.tz) setBhTz(bh.tz);
          if (bh.days) setBhDays(bh.days);
        }

        // Load dismissed alert IDs from config
        let dismissedIds = [];
        if (config.dismissed_alerts) {
          dismissedIds = typeof config.dismissed_alerts === 'string' ? JSON.parse(config.dismissed_alerts) : config.dismissed_alerts;
        }

        // Map audit log entries to alert format
        const alertItems = logs
          .filter(row => row.result === 'failure' || (row.description && (
            row.description.toLowerCase().includes('failed login') ||
            row.description.toLowerCase().includes('mfa disabled') ||
            row.description.toLowerCase().includes('deleted') ||
            row.description.toLowerCase().includes('password changed') ||
            row.description.toLowerCase().includes('created') ||
            row.description.toLowerCase().includes('blocked')
          )))
          .map(row => {
            const d = new Date(row.created_at);
            const when = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' \u00b7 ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const desc = row.description || '';
            let level = 'info';
            let triggerType = 'outside_hours';
            let trigger = desc;
            let recommendation = 'Review the audit log for context.';

            if (desc.toLowerCase().includes('failed login')) {
              level = row.result === 'failure' ? 'warning' : 'warning';
              triggerType = 'failed_attempts';
              trigger = 'Failed login attempt';
              recommendation = 'Monitor this IP for further attempts. Block via IP Blocklist if suspicious.';
            } else if (desc.toLowerCase().includes('mfa disabled')) {
              level = 'critical';
              triggerType = 'mfa_disabled';
              trigger = 'MFA disabled on admin account';
              recommendation = 'Contact this admin immediately. Re-enable MFA if unauthorized.';
            } else if (desc.toLowerCase().includes('deleted')) {
              level = 'warning';
              triggerType = desc.toLowerCase().includes('bulk') ? 'bulk_delete' : 'admin_deleted';
              trigger = desc;
              recommendation = 'Verify this action was authorized.';
            } else if (desc.toLowerCase().includes('password changed')) {
              level = 'info';
              triggerType = 'password_changed';
              trigger = 'Password changed';
              recommendation = 'No action required if expected.';
            } else if (desc.toLowerCase().includes('created')) {
              level = 'info';
              triggerType = 'admin_created';
              trigger = 'New admin user created';
              recommendation = 'Ensure the new admin enables MFA.';
            } else if (desc.toLowerCase().includes('blocked')) {
              level = 'warning';
              triggerType = 'brute_force_locked';
              trigger = 'IP blocked';
              recommendation = 'Review the blocked IP and surrounding activity.';
            }

            return {
              id: row.id,
              level,
              triggerType,
              trigger,
              description: desc,
              when,
              account: row.admin_id || '\u2014',
              ip: row.ip_address || '\u2014',
              location: '\u2014',
              device: row.user_agent || '\u2014',
              recommendation,
              dismissed: dismissedIds.includes(row.id),
            };
          });

        if (alertItems.length === 0) {
          setAlerts([]);
        } else {
          setAlerts(alertItems);
        }
      } catch (err) {
        setError(err.message || 'Failed to load security alerts. Check your database connection.');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Counts ────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    critical: alerts.filter(a => a.level === 'critical' && !a.dismissed).length,
    warning: alerts.filter(a => a.level === 'warning' && !a.dismissed).length,
    info: alerts.filter(a => a.level === 'info' && !a.dismissed).length,
    dismissed: alerts.filter(a => a.dismissed).length,
  }), [alerts]);

  const activeCount = counts.critical + counts.warning + counts.info;

  // ── Filtered list ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return alerts.filter(a => {
      const matchTab =
        activeTab === 'All' ? !a.dismissed :
          activeTab === 'Critical' ? a.level === 'critical' && !a.dismissed :
            activeTab === 'Warning' ? a.level === 'warning' && !a.dismissed :
              activeTab === 'Info' ? a.level === 'info' && !a.dismissed :
        /* Dismissed */             a.dismissed;
      const matchSearch = !q ||
        a.trigger.toLowerCase().includes(q) ||
        a.account.toLowerCase().includes(q) ||
        a.ip.includes(q) ||
        a.location.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [alerts, activeTab, search]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleConfirmDismiss = async (id, note) => {
    try {
      // Persist dismissed state
      const config = await getSiteConfig();
      let dismissedIds = [];
      if (config.dismissed_alerts) {
        dismissedIds = typeof config.dismissed_alerts === 'string' ? JSON.parse(config.dismissed_alerts) : config.dismissed_alerts;
      }
      dismissedIds.push(id);
      await updateSiteConfig('dismissed_alerts', JSON.stringify(dismissedIds));
      // Log acknowledgement
      await insertAuditLog({ event_type: 'security', description: `Alert acknowledged: ${note || 'No note'}`, result: 'success' });
    } catch (err) {
      console.error('Failed to persist dismissal:', err);
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true, note } : a));
    setDismissTarget(null);
    if (detailAlert?.id === id) setDetailAlert(prev => ({ ...prev, dismissed: true }));
  };

  const handleAcknowledgeFromDrawer = (alert) => {
    setDetailAlert(null);
    setDismissTarget(alert);
  };

  const toggleDay = (i) => setBhDays(prev => prev.map((v, idx) => idx === i ? !v : v));

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="sa-container">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <header className="sa-header">
        <div className="sa-breadcrumb">
          <span className="bc-dim">Security</span>
          <ChevronRight size={14} className="bc-sep" />
          <span className="bc-active">Suspicious Activity Alerts</span>
        </div>
        <div className="sa-title-row">
          <div className="sa-title-block">
            <Bell size={22} className="sa-title-icon" />
            <h1 className="sa-title">Suspicious Activity Alerts</h1>
            {counts.critical > 0 && (
              <span className="sa-critical-pulse">🔴 {counts.critical} Critical</span>
            )}
          </div>
          <span className="sa-page-badge">Security Center</span>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <section className="sa-stats-row">
        <div className="sa-stat-card stat-critical">
          <XCircle size={20} className="stat-icon icon-critical" />
          <div className="stat-body">
            <span className="stat-num">{counts.critical}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
        <div className="sa-stat-card stat-warning">
          <AlertTriangle size={20} className="stat-icon icon-warning" />
          <div className="stat-body">
            <span className="stat-num">{counts.warning}</span>
            <span className="stat-label">Warning</span>
          </div>
        </div>
        <div className="sa-stat-card stat-info">
          <InfoIcon size={20} className="stat-icon icon-info" />
          <div className="stat-body">
            <span className="stat-num">{counts.info}</span>
            <span className="stat-label">Info</span>
          </div>
        </div>
        <div className="sa-stat-card stat-dismissed">
          <CheckCircle2 size={20} className="stat-icon icon-dismissed" />
          <div className="stat-body">
            <span className="stat-num">{counts.dismissed}</span>
            <span className="stat-label">Dismissed</span>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ───────────────────────────────────────────── */}
      <div className="sa-toolbar">
        <div className="sa-tabs">
          {TABS.map(tab => {
            const cnt =
              tab === 'All' ? activeCount :
                tab === 'Critical' ? counts.critical :
                  tab === 'Warning' ? counts.warning :
                    tab === 'Info' ? counts.info :
                      counts.dismissed;
            return (
              <button
                key={tab}
                className={`sa-tab ${activeTab === tab ? 'sa-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className={`sa-tab-cnt ${tab === 'Critical' ? 'cnt-critical' :
                  tab === 'Warning' ? 'cnt-warning' : ''
                  }`}>{cnt}</span>
              </button>
            );
          })}
        </div>
        <div className="sa-search-wrap">
          <Search size={15} className="sa-search-icon" />
          <input
            className="sa-search"
            type="text"
            placeholder="Search alerts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Alert Cards ──────────────────────────────────────────── */}
      <section className="sa-feed">
        {filtered.length === 0 ? (
          <div className="sa-empty">
            <CheckCircle2 size={40} className="sa-empty-icon" />
            <p className="sa-empty-title">No alerts found</p>
            <p className="sa-empty-sub">
              {activeTab === 'Dismissed'
                ? 'No dismissed alerts yet.'
                : 'All clear — no suspicious activity detected.'}
            </p>
          </div>
        ) : (
          filtered.map(alert => {
            const { label, cls, Icon } = levelMeta(alert.level);
            const TriggerIcon = TRIGGER_ICONS[alert.triggerType] || AlertTriangle;
            return (
              <div key={alert.id} className={`sa-card card-${cls} ${alert.dismissed ? 'card-dismissed' : ''}`}>
                <div className={`sa-card-accent accent-${cls}`} />

                <div className="sa-card-head">
                  <div className="sa-card-head-left">
                    <span className={`sa-level-badge badge-${cls}`}>
                      <Icon size={12} /> {label}
                    </span>
                    <h3 className="sa-card-trigger">{alert.trigger}</h3>
                  </div>
                  <span className="sa-card-when">
                    <Clock size={12} /> {alert.when}
                  </span>
                </div>

                <p className="sa-card-desc">{alert.description}</p>

                <ul className="sa-card-meta-row">
                  <li><TriggerIcon size={13} className="cmr-icon" /><span>{alert.account}</span></li>
                  <li><Globe size={13} className="cmr-icon" /><span className="mono">{alert.ip}</span></li>
                  <li><MapPin size={13} className="cmr-icon" /><span>{alert.location}</span></li>
                  <li><Monitor size={13} className="cmr-icon" /><span>{alert.device}</span></li>
                </ul>

                <div className="sa-card-recommend">
                  <span className="recommend-dot" />
                  <span><strong>Recommended:</strong> {alert.recommendation}</span>
                </div>

                <div className="sa-card-footer">
                  <button
                    className="sa-btn sa-btn-outline"
                    onClick={() => setDetailAlert(alert)}
                  >
                    <Eye size={14} /> View Details
                  </button>
                  {!alert.dismissed ? (
                    <button
                      className="sa-btn sa-btn-dismiss"
                      onClick={() => setDismissTarget(alert)}
                    >
                      <CheckCircle2 size={14} /> Acknowledge &amp; Dismiss
                    </button>
                  ) : (
                    <span className="sa-acknowledged-label">
                      <CheckCircle2 size={14} className="ack-check" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ── Business Hours Config ─────────────────────────────────── */}
      <section className="sa-bh-section">
        <button
          className="sa-bh-toggle"
          onClick={() => setHoursOpen(v => !v)}
        >
          <Settings2 size={16} />
          <span>Business Hours Configuration</span>
          <span className="sa-bh-sub">— alerts for logins outside these hours</span>
          {hoursOpen ? <ChevronUp size={15} className="bh-chevron" /> : <ChevronDown size={15} className="bh-chevron" />}
        </button>

        {hoursOpen && (
          <div className="sa-bh-body">
            <div className="sa-bh-row">
              <label className="sa-bh-label">
                From
                <input
                  type="time"
                  className="sa-bh-input"
                  value={bhStart}
                  onChange={e => setBhStart(e.target.value)}
                />
              </label>
              <label className="sa-bh-label">
                To
                <input
                  type="time"
                  className="sa-bh-input"
                  value={bhEnd}
                  onChange={e => setBhEnd(e.target.value)}
                />
              </label>
              <label className="sa-bh-label">
                Timezone
                <select className="sa-bh-select" value={bhTz} onChange={e => setBhTz(e.target.value)}>
                  <option>IST</option>
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                  <option>CET</option>
                  <option>GST</option>
                </select>
              </label>
            </div>

            <div className="sa-bh-days">
              {DAY_LABELS.map((day, i) => (
                <button
                  key={day}
                  className={`sa-day-btn ${bhDays[i] ? 'day-active' : ''}`}
                  onClick={() => toggleDay(i)}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="sa-bh-actions">
              <p className="sa-bh-preview">
                Alerts will fire for logins outside{' '}
                <strong>{bhStart} – {bhEnd} {bhTz}</strong>{' '}
                on <strong>{bhDays.map((v, i) => v ? DAY_LABELS[i] : null).filter(Boolean).join(', ')}</strong>
              </p>
              <button className="sa-btn sa-btn-save" onClick={async () => {
                try {
                  await updateSiteConfig('business_hours', JSON.stringify({ start: bhStart, end: bhEnd, tz: bhTz, days: bhDays }));
                } catch (err) {
                  console.error('Failed to save business hours:', err);
                }
              }}>Save Configuration</button>
            </div>
          </div>
        )}
      </section>

      {/* ── Acknowledge Modal ─────────────────────────────────────── */}
      {dismissTarget && (
        <AcknowledgeModal
          alert={dismissTarget}
          onClose={() => setDismissTarget(null)}
          onConfirm={handleConfirmDismiss}
        />
      )}

      {/* ── Detail Drawer ─────────────────────────────────────────── */}
      {detailAlert && (
        <DetailDrawer
          alert={detailAlert}
          onClose={() => setDetailAlert(null)}
          onAcknowledge={handleAcknowledgeFromDrawer}
        />
      )}

    </div>
  );
}
