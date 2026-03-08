import React, { useState, useEffect } from 'react';
import './Overview.css';
import {
    ShieldCheck,
    MonitorSmartphone,
    Lock,
    Eye,
    ArrowUpRight,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    Wifi,
    ChevronRight,
    X,
    KeyRound,
    Users,
    FileText,
    Ban,
    Settings,
} from 'lucide-react';
import { getAuditLog, getActiveSessions } from '../../../api/content';
import { listMFAFactors } from '../../../api/auth';

const quickNavItems = [
    { label: 'Active Sessions', icon: MonitorSmartphone, path: '/security/sessions', badge: '1' },
    { label: 'MFA Settings', icon: KeyRound, path: '/security/mfa', badge: null },
    { label: 'Audit Log', icon: FileText, path: '/security/audit-log', badge: null },
    { label: 'IP Blocklist', icon: Ban, path: '/security/ip-blocklist', badge: null },
    { label: 'Password Policy', icon: Lock, path: '/security/password-policy', badge: null },
];

const SecurityOverview = () => {
    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [statusCards, setStatusCards] = useState([]);
    const [score, setScore] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setError(null);
                const [sessions, logs, factors] = await Promise.all([
                    getActiveSessions(),
                    getAuditLog({}),
                    listMFAFactors(),
                ]);
                const failedLogs = logs.filter(l => l.action_type === 'failed_login');
                const lastLogin = logs.find(l => l.action_type === 'login');
                const mfaActive = (factors?.totp || factors || []).length > 0;

                setStatusCards([
                    { id: 'sessions', label: 'Active Sessions', value: `${sessions.length} active`, sub: 'Current device', icon: MonitorSmartphone, color: 'blue', link: '/security/sessions' },
                    { id: 'failed', label: 'Failed Login Attempts', value: String(failedLogs.length), sub: 'Last 24 hours', icon: Ban, color: failedLogs.length > 5 ? 'red' : 'green', link: '/security/ip-blocklist' },
                    { id: 'last-login', label: 'Last Successful Login', value: lastLogin ? new Date(lastLogin.created_at).toLocaleTimeString() : '—', sub: lastLogin?.ip_address ? `IP: ${lastLogin.ip_address}` : '', icon: Clock, color: 'blue', link: '/security/audit-log' },
                    { id: 'mfa', label: 'MFA Status', value: mfaActive ? 'Enabled' : 'Disabled', sub: mfaActive ? 'TOTP active' : 'Not configured', icon: KeyRound, color: mfaActive ? 'green' : 'red', link: '/security/mfa' },
                ]);

                // Compute a simple score
                let s = 50;
                if (mfaActive) s += 25;
                if (failedLogs.length < 3) s += 15;
                if (sessions.length <= 2) s += 10;
                setScore(Math.min(s, 100));

                // Convert recent failed logs to alerts
                const alertItems = failedLogs.slice(0, 5).map((l, i) => ({
                    id: l.id || i,
                    level: 'warning',
                    text: l.description || `Failed login from ${l.ip_address || 'unknown'}`,
                    time: l.created_at ? new Date(l.created_at).toLocaleString() : '',
                    ip: l.ip_address,
                }));
                setAlerts(alertItems);
            } catch (err) {
                setError(err.message || 'Failed to load security overview. Check your Supabase connection.');
            }
        })();
    }, []);

    const handleDismiss = (id) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    const handleViewDetails = (alert) => {
        setSelectedAlert(alert);
    };

    const handleCloseDrawer = () => {
        setSelectedAlert(null);
    };

    const activeAlerts = alerts.filter((a) => !a.dismissed);

    const scoreColor =
        score >= 90 ? '#4ADE80' :
        score >= 70 ? '#3B82F6' :
        score >= 50 ? '#FBBF24' : '#F05A63';

    return (
        <div className="sec-overview-container">

            {/* ── Page Header ── */}
            <header className="sov-header">
                <div className="sov-breadcrumb">
                    <span className="bc-dim">Security</span>
                    <ChevronRight size={14} className="bc-sep" />
                    <span className="bc-active">Overview</span>
                </div>
                <div className="sov-title-row">
                    <div className="sov-title-block">
                        <Shield size={22} className="sov-title-icon" />
                        <h1 className="sov-title">Security Overview</h1>
                    </div>
                    <span className="sov-badge">Security Center</span>
                </div>
            </header>

            {error && (
                <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* ── Security Score Banner ── */}
            <section className="score-banner">
                <div className="score-banner-left">
                    <div className="score-icon-wrap">
                        <ShieldCheck size={28} style={{ color: scoreColor }} />
                    </div>
                    <div className="score-text">
                        <p className="score-label">Security Score</p>
                        <p className="score-sub">
                            {score >= 90
                                ? 'Excellent — your account is fully secured.'
                                : 'Enable MFA for all admins to reach 100'}
                        </p>
                    </div>
                </div>
                <div className="score-meter-block">
                    <div className="score-number" style={{ color: scoreColor }}>
                        {score}<span className="score-denom">/100</span>
                    </div>
                    <div className="score-bar-track">
                        <div
                            className="score-bar-fill"
                            style={{ width: `${score}%`, background: scoreColor }}
                        />
                    </div>
                </div>
            </section>

            {/* ── Status Cards ── */}
            <section className="sov-cards-row">
                {statusCards.map((card) => {
                    const Icon = card.icon;
                    const isGreen = card.color === 'green';
                    return (
                        <div className={`sov-stat-card sov-card-${card.color}`} key={card.id}>
                            <div className="sov-card-top">
                                <span className={`sov-card-icon-wrap icon-${card.color}`}>
                                    <Icon size={18} />
                                </span>
                                <span className="sov-card-label">{card.label}</span>
                            </div>
                            <div className="sov-card-value">{card.value}</div>
                            <div className="sov-card-meta">
                                {isGreen
                                    ? <CheckCircle2 size={12} className="meta-icon meta-green" />
                                    : <Eye size={12} className="meta-icon meta-blue" />}
                                <span>{card.sub}</span>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* ── Lower Grid ── */}
            <div className="sov-grid">

                {/* Suspicious Alerts */}
                <section className="sov-panel alerts-panel">
                    <div className="sov-panel-header">
                        <div className="sov-panel-title-row">
                            <AlertTriangle size={16} className="panel-title-icon warn" />
                            <h2 className="sov-panel-title">Recent Suspicious Alerts</h2>
                            {activeAlerts.length > 0 && (
                                <span className="alert-count-badge">{activeAlerts.length}</span>
                            )}
                        </div>
                        <button className="panel-link-btn">
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>

                    {activeAlerts.length === 0 ? (
                        <div className="alerts-empty">
                            <CheckCircle2 size={32} className="alerts-empty-icon" />
                            <p>No active alerts — all clear</p>
                        </div>
                    ) : (
                        <ul className="alert-list">
                            {activeAlerts.map((alert) => (
                                <li key={alert.id} className={`alert-item alert-${alert.level}`}>
                                    <div className="alert-header">
                                        <div className="alert-indicator-row">
                                            {alert.level === 'danger'
                                                ? <XCircle size={15} className="ai-icon danger" />
                                                : <AlertTriangle size={15} className="ai-icon warn" />}
                                            <span className="alert-text">{alert.text}</span>
                                        </div>
                                        <button
                                            className="alert-dismiss"
                                            onClick={() => handleDismiss(alert.id)}
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="alert-footer">
                                        <Clock size={12} className="alert-clock" />
                                        <span className="alert-time">{alert.time}</span>
                                        <button
                                            className="alert-action-btn"
                                            onClick={() => handleViewDetails(alert)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Cloudflare Access */}
                <section className="sov-panel cf-panel">
                    <div className="sov-panel-header">
                        <div className="sov-panel-title-row">
                            <Wifi size={16} className="panel-title-icon blue" />
                            <h2 className="sov-panel-title">Cloudflare Access</h2>
                        </div>
                    </div>
                    <div className="cf-status-row">
                        <span className="cf-status-dot connected" />
                        <span className="cf-status-label">Connected</span>
                    </div>
                    <div className="cf-info-list">
                        <div className="cf-info-row">
                            <span className="cf-info-key">Policy</span>
                            <span className="cf-info-val">Email Whitelist</span>
                        </div>
                        <div className="cf-info-row">
                            <span className="cf-info-key">Protected</span>
                            <span className="cf-info-val mono">admin.antha.com</span>
                        </div>
                        <div className="cf-info-row">
                            <span className="cf-info-key">WAF</span>
                            <span className="cf-info-val cf-active">Active</span>
                        </div>
                        <div className="cf-info-row">
                            <span className="cf-info-key">DDoS</span>
                            <span className="cf-info-val cf-active">Protected</span>
                        </div>
                    </div>
                    <button className="cf-manage-btn">
                        Manage in CF Dashboard
                        <ArrowUpRight size={14} />
                    </button>
                </section>

                {/* Quick Security Nav */}
                <section className="sov-panel quicknav-panel">
                    <div className="sov-panel-header">
                        <div className="sov-panel-title-row">
                            <Settings size={16} className="panel-title-icon blue" />
                            <h2 className="sov-panel-title">Security Controls</h2>
                        </div>
                    </div>
                    <ul className="quicknav-list">
                        {quickNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.label} className="quicknav-item">
                                    <span className="qn-icon-wrap"><Icon size={16} /></span>
                                    <span className="qn-label">{item.label}</span>
                                    {item.badge && (
                                        <span className="qn-badge">{item.badge}</span>
                                    )}
                                    <ChevronRight size={14} className="qn-chevron" />
                                </li>
                            );
                        })}
                    </ul>
                </section>

            </div>

            {/* ── Alert Detail Drawer ── */}
            {selectedAlert && (
                <>
                    <div className="drawer-backdrop" onClick={handleCloseDrawer} />
                    <div className="alert-detail-drawer">
                        <div className="drawer-header">
                            <h2 className="drawer-title">Alert Details</h2>
                            <button
                                className="drawer-close-btn"
                                onClick={handleCloseDrawer}
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="drawer-content">
                            {/* Alert Level Badge */}
                            <div className={`alert-level-badge alert-${selectedAlert.level}`}>
                                {selectedAlert.level === 'danger' ? (
                                    <XCircle size={14} />
                                ) : (
                                    <AlertTriangle size={14} />
                                )}
                                <span>
                                    {selectedAlert.level === 'danger' ? 'Critical' : 'Warning'}
                                </span>
                            </div>

                            {/* Main Alert Text */}
                            <div className="drawer-section">
                                <p className="drawer-alert-text">{selectedAlert.text}</p>
                                <p className="drawer-alert-time">{selectedAlert.time}</p>
                            </div>

                            {/* Full Description */}
                            <div className="drawer-section">
                                <h3 className="drawer-section-title">Description</h3>
                                <p className="drawer-description">
                                    {selectedAlert.fullDescription}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="drawer-section">
                                <h3 className="drawer-section-title">Device & Location</h3>
                                <div className="details-grid">
                                    <div className="detail-row">
                                        <span className="detail-label">Device</span>
                                        <span className="detail-value">{selectedAlert.device}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Browser</span>
                                        <span className="detail-value">{selectedAlert.browser}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Operating System</span>
                                        <span className="detail-value">{selectedAlert.os}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">IP Address</span>
                                        <span className="detail-value mono">{selectedAlert.ip}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Location</span>
                                        <span className="detail-value">{selectedAlert.location}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Action</span>
                                        <span className="detail-value">{selectedAlert.action}</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Agent */}
                            <div className="drawer-section">
                                <h3 className="drawer-section-title">User Agent</h3>
                                <code className="user-agent">{selectedAlert.userAgent}</code>
                            </div>

                            {/* Recommendation */}
                            <div className="drawer-section recommendation-box">
                                <h3 className="drawer-section-title">Recommended Action</h3>
                                <p className="recommendation">{selectedAlert.recommendation}</p>
                            </div>
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="drawer-footer">
                            <button
                                className="drawer-btn drawer-btn-secondary"
                                onClick={handleCloseDrawer}
                            >
                                Close
                            </button>
                            <button className="drawer-btn drawer-btn-primary">
                                Block IP: {selectedAlert.ip}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SecurityOverview;
