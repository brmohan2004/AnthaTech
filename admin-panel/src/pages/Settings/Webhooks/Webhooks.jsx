import React, { useState, useEffect } from 'react';
import './Webhooks.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook } from '../../../api/content';
import {
    Webhook,
    Plus,
    Pencil,
    Trash2,
    PlayCircle,
    PauseCircle,
    ChevronRight,
    Copy,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    Loader2,
    X,
    Zap,
} from 'lucide-react';

/* ── Constants ─────────────────────────────────────────── */
const EVENT_OPTIONS = [
    { id: 'new_message', label: 'New Message' },
    { id: 'new_application', label: 'New Application' },
    { id: 'project_published', label: 'Project Published' },
    { id: 'blog_published', label: 'Blog Published' },
    { id: 'maintenance_on', label: 'Maintenance ON' },
];

const EVENT_COLORS = {
    new_message: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    new_application: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
    project_published: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    blog_published: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    maintenance_on: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
};

function generateSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return 'whsec_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function maskUrl(url) {
    if (!url) return '—';
    try {
        const u = new URL(url);
        return `${u.protocol}//${u.hostname}/••••`;
    } catch {
        return url.slice(0, 20) + '••••';
    }
}

function relativeTime(iso) {
    if (!iso) return '—';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Blank form ─────────────────────────────────────────── */
const BLANK = {
    id: null,
    name: '',
    url: '',
    secret: generateSecret(),
    events: [],
    status: 'active',
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
const Webhooks = () => {
    const [hooks, setHooks] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // DEBUG: Monitor drawer state
    useEffect(() => {
        console.log('Current Drawer State:', drawerOpen);
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
            console.log('Drawer should be visible in DOM now.');
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [drawerOpen]);

    const [form, setForm] = useState(BLANK);
    const [isEditing, setIsEditing] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [testState, setTestState] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadWebhooks = async () => {
        try {
            setLoading(true);
            const data = await getWebhooks();
            setHooks(data);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to load webhooks.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadWebhooks(); }, []);

    const showToast = (type, message) => setToast({ type, message });

    /* ── Open drawer ── */
    const openAdd = () => {
        setForm({ ...BLANK, secret: generateSecret() });
        setIsEditing(false);
        setTestState(null);
        setShowSecret(false);
        setDrawerOpen(true);
    };

    const openEdit = (hook) => {
        setForm({ ...hook });
        setIsEditing(true);
        setTestState(null);
        setShowSecret(false);
        setDrawerOpen(true);
    };

    /* ── Form helpers ── */
    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const toggleEvent = (id) => {
        setForm((p) => ({
            ...p,
            events: p.events.includes(id)
                ? p.events.filter((e) => e !== id)
                : [...p.events, id],
        }));
    };

    /* ── Save ── */
    const handleSave = async () => {
        if (!form.name.trim()) return showToast('error', 'Webhook name is required.');
        if (!form.url.trim()) return showToast('error', 'Endpoint URL is required.');
        if (form.events.length === 0) return showToast('error', 'Select at least one event.');
        try { new URL(form.url); } catch { return showToast('error', 'Enter a valid URL.'); }

        try {
            if (isEditing) {
                await updateWebhook(form.id, {
                    name: form.name, url: form.url, secret: form.secret,
                    events: form.events, status: form.status,
                });
                showToast('success', `Webhook "${form.name}" updated.`);
            } else {
                await createWebhook({
                    name: form.name, url: form.url, secret: form.secret,
                    events: form.events, status: form.status,
                });
                showToast('success', `Webhook "${form.name}" created.`);
            }
            await loadWebhooks();
            setDrawerOpen(false);
        } catch (err) {
            showToast('error', 'Failed to save webhook.');
        }
    };

    /* ── Toggle pause/active ── */
    const toggleStatus = async (id) => {
        const hook = hooks.find(h => h.id === id);
        if (!hook) return;
        const newStatus = hook.status === 'active' ? 'paused' : 'active';
        try {
            await updateWebhook(id, { status: newStatus });
            setHooks((prev) => prev.map((h) => h.id === id ? { ...h, status: newStatus } : h));
        } catch (err) {
            showToast('error', 'Failed to toggle status.');
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        try {
            await deleteWebhook(deleteTarget.id);
            setHooks((prev) => prev.filter((h) => h.id !== deleteTarget.id));
            showToast('success', `Webhook "${deleteTarget.name}" deleted.`);
        } catch (err) {
            showToast('error', 'Failed to delete webhook.');
        } finally {
            setDeleteTarget(null);
        }
    };

    /* ── Test webhook ── */
    const handleTest = async () => {
        if (!form.url.trim()) return showToast('error', 'Enter a URL first.');
        try { new URL(form.url); } catch { return showToast('error', 'Enter a valid URL.'); }

        setTestState('loading');
        try {
            const res = await fetch(form.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': form.secret
                },
                body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() })
            });
            const text = await res.text();
            setTestState({
                ok: res.ok,
                code: res.status,
                body: text.slice(0, 500) || '(Empty response)',
            });
        } catch (err) {
            setTestState({
                ok: false,
                code: 'Network Error',
                body: err.message + '\n\nNote: This may be due to CORS restrictions blocking the test from the browser. Real payloads sent by the backend will bypass CORS.',
            });
        }
    };

    /* ── Copy secret ── */
    const copySecret = () => {
        navigator.clipboard.writeText(form.secret);
        showToast('success', 'Secret copied to clipboard.');
    };

    /* ── Regenerate secret ── */
    const regenSecret = () => setField('secret', generateSecret());

    /* ════════════════ RENDER ════════════════ */
    return (
        <div className="wh-page">

            {/* ── Page Header ── */}
            <header className="wh-header">
                <div>
                    <div className="wh-breadcrumb">
                        <span className="bc-dim">Settings</span>
                        <ChevronRight size={14} className="bc-sep" />
                        <span className="bc-active">Webhook Manager</span>
                    </div>
                    <p className="wh-sub">
                        Notify external services when content events occur in your admin panel.
                    </p>
                </div>
                <button 
                    className="btn btn--primary btn--md" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        console.log('Opening Add Webhook Drawer');
                        openAdd();
                    }}
                >
                    <Plus size={15} />
                    <span>Add Webhook</span>
                </button>
            </header>

            {/* ── Webhooks Table ── */}
            {hooks.length === 0 ? (
                <div className="wh-empty">
                    <Webhook size={40} className="wh-empty-icon" />
                    <h3>No webhooks yet</h3>
                    <p>Connect Slack, Zapier, or any HTTP endpoint to receive real-time events.</p>
                    <button 
                        className="btn btn--primary btn--md" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer' 
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            console.log('Opening Add Webhook Drawer (Empty State)');
                            openAdd();
                        }}
                    >
                        <Plus size={15} />
                        <span>Add your first webhook</span>
                    </button>
                </div>
            ) : (
                <div className="wh-table-wrap">
                    <table className="wh-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Endpoint URL</th>
                                <th>Events</th>
                                <th>Status</th>
                                <th>Last Triggered</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hooks.map((h) => (
                                <tr key={h.id || (h.url + h.name)} className={h.status === 'paused' ? 'row--paused' : ''}>
                                    {/* Name */}
                                    <td className="td-name">
                                        <span className="hook-dot" data-status={h.status} />
                                        <span className="hook-name">{h.name}</span>
                                    </td>

                                    {/* Endpoint URL masked */}
                                    <td className="td-url">
                                        <code className="url-masked">{maskUrl(h.url)}</code>
                                    </td>

                                    {/* Events */}
                                    <td className="td-events">
                                        <div className="event-badges">
                                            {h.events.map((ev) => {
                                                const opt = EVENT_OPTIONS.find((o) => o.id === ev);
                                                const color = EVENT_COLORS[ev];
                                                return (
                                                    <span
                                                        key={ev}
                                                        className="event-badge"
                                                        style={{
                                                            background: color.bg,
                                                            color: color.text,
                                                            borderColor: color.border,
                                                        }}
                                                    >
                                                        {opt?.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="td-status">
                                        <span className={`status-badge status--${h.status}`}>
                                            {h.status === 'active' ? 'Active' : 'Paused'}
                                        </span>
                                    </td>

                                    {/* Last triggered */}
                                    <td className="td-last">
                                        <div className="last-trigger-cell">
                                            {h.lastResult === 'ok' && <CheckCircle2 size={13} className="result-ok" />}
                                            {h.lastResult === 'error' && <XCircle size={13} className="result-err" />}
                                            <span>{relativeTime(h.lastTriggered)}</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="td-actions">
                                        <button
                                            className="icon-btn icon-btn--blue"
                                            title="Edit"
                                            onClick={() => openEdit(h)}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            className={`icon-btn ${h.status === 'active' ? 'icon-btn--warn' : 'icon-btn--green'}`}
                                            title={h.status === 'active' ? 'Pause' : 'Activate'}
                                            onClick={() => toggleStatus(h.id)}
                                        >
                                            {h.status === 'active'
                                                ? <PauseCircle size={14} />
                                                : <PlayCircle size={14} />}
                                        </button>
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            title="Delete"
                                            onClick={() => setDeleteTarget(h)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ════════════════════════════════════════
                ADD / EDIT DRAWER
                ════════════════════════════════════════ */}
            {drawerOpen && (
                <div 
                    className="drawer-overlay" 
                    style={{ display: 'flex !important', visibility: 'visible !important', opacity: 1 }}
                    onClick={() => {
                        console.log('Closing drawer via overlay click');
                        setDrawerOpen(false);
                    }}
                >
                    <aside className="wh-drawer" onClick={(e) => e.stopPropagation()}>

                        {/* Drawer header */}
                        <div className="drawer-header">
                            <div className="drawer-title-block">
                                <Zap size={18} className="drawer-title-icon" />
                                <h2 className="drawer-title">
                                    {isEditing ? 'Edit Webhook' : 'Add Webhook'}
                                </h2>
                            </div>
                            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Drawer body */}
                        <div className="drawer-body">

                            {/* Name */}
                            <div className="form-group">
                                <label>Webhook Name <span className="req">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    placeholder="e.g. Slack — New Messages"
                                />
                            </div>

                            {/* Endpoint URL */}
                            <div className="form-group">
                                <label>Endpoint URL <span className="req">*</span></label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={form.url}
                                    onChange={(e) => setField('url', e.target.value)}
                                    placeholder="https://hooks.slack.com/services/…"
                                />
                                <span className="field-hint">URL will be masked after saving.</span>
                            </div>

                            {/* Secret Key */}
                            <div className="form-group">
                                <label>Secret Key <span className="label-hint">— HMAC signature for verification</span></label>
                                <div className="secret-row">
                                    <input
                                        type={showSecret ? 'text' : 'password'}
                                        className="form-input font-mono secret-input"
                                        value={form.secret}
                                        readOnly
                                    />
                                    <button
                                        className="secret-btn"
                                        title={showSecret ? 'Hide' : 'Reveal'}
                                        onClick={() => setShowSecret((v) => !v)}
                                    >
                                        {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button className="secret-btn" title="Copy" onClick={copySecret}>
                                        <Copy size={14} />
                                    </button>
                                    <button className="secret-btn" title="Regenerate" onClick={regenSecret}>
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                                <span className="field-hint">
                                    Use this secret to verify incoming payloads on your server.
                                </span>
                            </div>

                            {/* Events */}
                            <div className="form-group">
                                <label>Trigger Events <span className="req">*</span></label>
                                <div className="events-grid">
                                    {EVENT_OPTIONS.map((opt) => {
                                        const checked = form.events.includes(opt.id);
                                        const color = EVENT_COLORS[opt.id];
                                        return (
                                            <label
                                                key={opt.id}
                                                className={`event-checkbox ${checked ? 'event-checkbox--checked' : ''}`}
                                                style={checked ? {
                                                    background: color.bg,
                                                    borderColor: color.border,
                                                    color: color.text,
                                                } : {}}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleEvent(opt.id)}
                                                />
                                                <span>{opt.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>Status</label>
                                <div className="radio-row">
                                    {['active', 'paused'].map((s) => (
                                        <label key={s} className={`radio-option ${form.status === s ? 'radio-option--active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="wh-status"
                                                value={s}
                                                checked={form.status === s}
                                                onChange={() => setField('status', s)}
                                            />
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* ── Test Section ── */}
                            <div className="test-section">
                                <div className="test-section-header">
                                    <span className="test-section-label">Test Webhook</span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleTest}
                                        loading={testState === 'loading'}
                                        icon={testState !== 'loading' ? <PlayCircle size={13} /> : null}
                                    >
                                        {testState === 'loading' ? 'Sending…' : 'Send Test'}
                                    </Button>
                                </div>
                                <p className="test-desc">
                                    Sends a sample payload to the endpoint and shows the response.
                                </p>

                                {testState && testState !== 'loading' && (
                                    <div className={`test-result ${testState.ok ? 'test-result--ok' : 'test-result--err'}`}>
                                        <div className="test-result-header">
                                            {testState.ok
                                                ? <><CheckCircle2 size={14} /> <strong>200 OK</strong> — Webhook is working</>
                                                : <><XCircle size={14} /> <strong>{testState.code}</strong> — Endpoint returned error</>
                                            }
                                        </div>
                                        <pre className="test-result-body">{testState.body}</pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Drawer footer */}
                        <div className="drawer-footer">
                            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                {isEditing ? 'Save Changes' : 'Create Webhook'}
                            </Button>
                        </div>
                    </aside>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
                message="This webhook will be permanently removed. Any services listening to this endpoint will stop receiving events."
                confirmText={deleteTarget ? `Delete ${deleteTarget.name}` : 'Delete'}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

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

export default Webhooks;
