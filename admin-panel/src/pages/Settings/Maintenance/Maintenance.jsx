import React, { useState, useEffect, useRef } from 'react';
import './Maintenance.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getSiteConfig, updateSiteConfig } from '../../../api/content';
import { useAuth } from '../../../contexts/AuthContext';
import {
    Power,
    AlertTriangle,
    Clock,
    Shield,
    Eye,
    Info,
    ChevronRight,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

const defaultValues = {
    isEnabled: false,
    title: "We'll be back soon",
    message:
        "We're performing some scheduled maintenance. We'll be back online shortly. Thank you for your patience.",
    expectedBackAt: '',
    allowedIPs: '',
    activeSince: null,
    activationReason: '',
};

const Maintenance = () => {
    const { profile } = useAuth();
    const isSuperAdmin = profile?.role === 'Super Admin' || profile?.role === 'super_admin';
    const [data, setData] = useState(defaultValues);
    const [saved, setSaved] = useState(defaultValues);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeDuration, setActiveDuration] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingToggle, setPendingToggle] = useState(false);
    const [reasonInput, setReasonInput] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const rows = await getSiteConfig();
                // Ensure rows is an object from the cache-aware getSiteConfig
                const maintenanceValue = rows.maintenance;
                if (maintenanceValue) {
                    const parsed = typeof maintenanceValue === 'string' ? JSON.parse(maintenanceValue) : maintenanceValue;
                    setData({ ...defaultValues, ...parsed });
                    setSaved({ ...defaultValues, ...parsed });
                }
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load maintenance settings.' });
            }
        })();
    }, []);

    // --- Live "Active for X" timer ---
    useEffect(() => {
        if (data.isEnabled && data.activeSince) {
            const update = () => {
                const diffSec = Math.floor(
                    (Date.now() - new Date(data.activeSince).getTime()) / 1000
                );
                const h = Math.floor(diffSec / 3600);
                const m = Math.floor((diffSec % 3600) / 60);
                const s = diffSec % 60;
                if (h > 0) setActiveDuration(`${h}h ${m}m ${s}s`);
                else if (m > 0) setActiveDuration(`${m}m ${s}s`);
                else setActiveDuration(`${s}s`);
            };
            update();
            timerRef.current = setInterval(update, 1000);
        } else {
            setActiveDuration('');
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [data.isEnabled, data.activeSince]);

    // --- Dirty state detection (skip toggle/activeSince) ---
    useEffect(() => {
        const strip = ({ isEnabled: _, activeSince: __, activationReason: ___, ...rest }) => rest;
        setIsDirty(JSON.stringify(strip(data)) !== JSON.stringify(strip(saved)));
    }, [data, saved]);

    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    // Click the big power button
    const handleToggleClick = () => {
        setPendingToggle(!data.isEnabled);
        setReasonInput('');
        setShowConfirm(true);
    };

    // Confirm the toggle
    const handleToggleConfirm = async () => {
        const enabling = pendingToggle;
        const updated = {
            ...data,
            isEnabled: enabling,
            activeSince: enabling ? new Date().toISOString() : null,
            activationReason: enabling ? reasonInput.trim() : '',
        };
        try {
            await updateSiteConfig('maintenance', JSON.stringify(updated));
            setData(updated);
            setSaved(updated);
            setShowConfirm(false);
            setToast({
                type: enabling ? 'warning' : 'success',
                message: enabling
                    ? 'Maintenance mode ENABLED — public site is now offline.'
                    : 'Maintenance mode DISABLED — site is live.',
            });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to toggle maintenance mode.' });
            setShowConfirm(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSiteConfig('maintenance', JSON.stringify(data));
            setSaved({ ...data });
            setIsDirty(false);
            setToast({ type: 'success', message: 'Maintenance settings saved successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRevert = () => {
        setData({ ...saved });
        setToast({ type: 'warning', message: 'Changes reverted to last saved state.' });
    };

    return (
        <div className="maint-page">

            {/* ── Page Header ── */}
            <header className="maint-header">
                <div className="maint-breadcrumb">
                    <span className="bc-dim">Settings</span>
                    <ChevronRight size={14} className="bc-sep" />
                    <span className="bc-active">Maintenance Mode</span>
                </div>
                <div className="maint-header-actions">
                    <Button variant="ghost" onClick={handleRevert} disabled={!isDirty}>
                        Revert
                    </Button>
                    <Button
                        variant="primary"
                        loading={isSaving}
                        onClick={handleSave}
                        disabled={!isDirty}
                    >
                        {isSaving ? 'Saving…' : 'Save Settings'}
                    </Button>
                </div>
            </header>

            {/* ── Super Admin warning banner ── */}
            {!isSuperAdmin && (
                <div className="role-banner">
                    <Shield size={15} />
                    <span>Only <strong>Super Admins</strong> can toggle maintenance mode.</span>
                </div>
            )}

            {/* ── Main two-column layout ── */}
            <div className="maint-layout">

                {/* ─ LEFT COLUMN ─ */}
                <div className="maint-left">

                    {/* Master Toggle Card */}
                    <div className={`toggle-card ${data.isEnabled ? 'toggle-card--on' : ''}`}>
                        {/* Status pill */}
                        <div className="toggle-status-row">
                            <span className={`status-pill ${data.isEnabled ? 'pill--on' : 'pill--off'}`}>
                                <span className="pill-dot" />
                                {data.isEnabled ? 'MAINTENANCE ACTIVE' : 'SITE IS LIVE'}
                            </span>
                        </div>

                        {/* Big power button */}
                        <div className="toggle-center">
                            <button
                                className={`master-toggle ${data.isEnabled ? 'master-toggle--on' : ''}`}
                                onClick={handleToggleClick}
                                disabled={!isSuperAdmin}
                                title={
                                    isSuperAdmin
                                        ? data.isEnabled
                                            ? 'Click to bring site back online'
                                            : 'Click to enable maintenance mode'
                                        : 'Super Admin only'
                                }
                            >
                                <Power size={36} />
                            </button>
                            <p className="toggle-hint">
                                {data.isEnabled
                                    ? 'Click to bring the site back online'
                                    : 'Click to take the site offline'}
                            </p>
                        </div>

                        {/* Active since bar */}
                        {data.isEnabled && data.activeSince && (
                            <div className="active-since-bar">
                                <Clock size={13} />
                                <span>
                                    Active for <strong>{activeDuration}</strong>
                                </span>
                                {data.activationReason && (
                                    <span className="active-reason">— {data.activationReason}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Security Info Card */}
                    <div className="info-card">
                        <h4 className="info-card-title">
                            <Shield size={14} />
                            Security Behavior
                        </h4>
                        <ul className="info-list">
                            <li>
                                <AlertTriangle size={12} className="info-icon info-icon--warn" />
                                Cloudflare Worker intercepts <strong>all</strong> public requests when active
                            </li>
                            <li>
                                <CheckCircle2 size={12} className="info-icon info-icon--ok" />
                                Admin panel at <code>admin.anthatech.com</code> is <strong>unaffected</strong>
                            </li>
                            <li>
                                <Eye size={12} className="info-icon info-icon--blue" />
                                Whitelisted IPs bypass maintenance and see the live site
                            </li>
                            <li>
                                <Shield size={12} className="info-icon info-icon--blue" />
                                Only <strong>Super Admin</strong> can toggle this setting
                            </li>
                            <li>
                                <Info size={12} className="info-icon info-icon--grey" />
                                All toggle actions are logged in the Audit Trail
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ─ RIGHT COLUMN ─ */}
                <div className="maint-right">

                    {/* Maintenance Page Content Card */}
                    <div className="form-card">
                        <h3 className="form-card-title">Maintenance Page Content</h3>
                        <p className="form-card-desc">
                            This is what public visitors will see when maintenance mode is active.
                        </p>

                        <div className="form-group">
                            <label>Page Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="We'll be back soon"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Maintenance Message
                                <span className="label-hint"> — shown to public visitors</span>
                            </label>
                            <textarea
                                className="form-input"
                                rows={4}
                                value={data.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                placeholder="We're performing scheduled maintenance. We'll be back online shortly."
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Expected Back At
                                <span className="label-hint"> — shown as a countdown timer</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={data.expectedBackAt}
                                onChange={(e) => handleChange('expectedBackAt', e.target.value)}
                            />
                            {data.expectedBackAt && (
                                <span className="field-hint">
                                    <Clock size={12} />
                                    Countdown will be displayed on the maintenance page.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Access Control Card */}
                    <div className="form-card">
                        <h3 className="form-card-title">Access Control</h3>
                        <p className="form-card-desc">
                            IPs listed here will bypass maintenance mode and see the live site.
                        </p>

                        <div className="form-group">
                            <label>
                                Allowed IPs
                                <span className="label-hint"> — one IP address per line</span>
                            </label>
                            <textarea
                                className="form-input font-mono"
                                rows={5}
                                value={data.allowedIPs}
                                onChange={(e) => handleChange('allowedIPs', e.target.value)}
                                placeholder={"192.168.1.1\n10.0.0.5\n203.0.113.0"}
                                spellCheck={false}
                            />
                            <span className="field-hint">
                                <Info size={12} />
                                Add your office or VPN IP so you can preview the live site during maintenance.
                            </span>
                        </div>
                    </div>

                    {/* Live Preview Card */}
                    {(data.title || data.message) && (
                        <div className="preview-card">
                            <h3 className="form-card-title">
                                <Eye size={15} />
                                Maintenance Page Preview
                            </h3>
                            <div className="maint-preview">
                                <div className="preview-icon">
                                    <Power size={40} />
                                </div>
                                <h2 className="preview-title">{data.title || "We'll be back soon"}</h2>
                                <p className="preview-message">
                                    {data.message || 'No message set.'}
                                </p>
                                {data.expectedBackAt && (
                                    <div className="preview-eta">
                                        <Clock size={14} />
                                        <span>
                                            Expected back:{' '}
                                            <strong>
                                                {new Date(data.expectedBackAt).toLocaleString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirm Toggle Modal ── */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div
                            className={`modal-icon-wrap ${pendingToggle ? 'icon-wrap--danger' : 'icon-wrap--success'
                                }`}
                        >
                            {pendingToggle ? (
                                <AlertTriangle size={26} />
                            ) : (
                                <CheckCircle2 size={26} />
                            )}
                        </div>

                        <h3 className="modal-title">
                            {pendingToggle
                                ? 'Enable Maintenance Mode?'
                                : 'Disable Maintenance Mode?'}
                        </h3>

                        <p className="modal-desc">
                            {pendingToggle
                                ? 'This will take the public website offline immediately. All visitors will see the maintenance page until you disable it.'
                                : 'This will bring the public website back online immediately. All visitors will be able to access it normally.'}
                        </p>

                        {pendingToggle && (
                            <div className="form-group modal-reason">
                                <label>
                                    Reason
                                    <span className="label-hint"> — logged in audit trail</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={reasonInput}
                                    onChange={(e) => setReasonInput(e.target.value)}
                                    placeholder="e.g. Scheduled deployment, database migration…"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleToggleConfirm()}
                                />
                            </div>
                        )}

                        <div className="modal-actions">
                            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant={pendingToggle ? 'danger' : 'primary'}
                                onClick={handleToggleConfirm}
                            >
                                {pendingToggle ? 'Enable Maintenance Mode' : 'Bring Site Back Online'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {toast && (
                <ToastMessage
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Maintenance;
