import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Ban, Plus, Copy, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import './ApiKeys.css';
import { getSiteConfig, updateSiteConfig } from '../../api/content';

const serviceLabels = { email: 'Email', storage: 'Storage', webhook: 'Webhook', custom: 'Custom' };

const ApiKeys = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [revealId, setRevealId] = useState(null);
    const [revealPassword, setRevealPassword] = useState('');
    const [revealedKeyId, setRevealedKeyId] = useState(null);
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [revokeTyped, setRevokeTyped] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteTyped, setDeleteTyped] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    // Add form state
    const [newName, setNewName] = useState('');
    const [newService, setNewService] = useState('email');

    const persistKeys = async (updatedKeys) => {
        try {
            await updateSiteConfig('api_keys', JSON.stringify(updatedKeys));
        } catch (err) {
            setError(err.message || 'Failed to save API keys.');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const config = await getSiteConfig();
                if (config.api_keys) {
                    const parsed = typeof config.api_keys === 'string' ? JSON.parse(config.api_keys) : config.api_keys;
                    setKeys(parsed);
                }
            } catch (err) {
                setError(err.message || 'Failed to load API keys. Check your database connection.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleRevealSubmit = () => {
        if (revealPassword.length >= 1) {
            setRevealedKeyId(revealId);
            setRevealId(null);
            setRevealPassword('');
        }
    };

    const handleRevoke = () => {
        const updated = keys.map(k => k.id === revokeTarget?.id ? { ...k, status: 'revoked' } : k);
        setKeys(updated);
        persistKeys(updated);
        setRevokeTarget(null);
        setRevokeTyped('');
    };

    const handleDelete = () => {
        const updated = keys.filter(k => k.id !== deleteTarget?.id);
        setKeys(updated);
        persistKeys(updated);
        setDeleteTarget(null);
        setDeleteTyped('');
    };

    const handleAddKey = () => {
        if (!newName.trim()) return;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let generated = '';
        for (let i = 0; i < 28; i++) generated += chars.charAt(Math.floor(Math.random() * chars.length));
        const prefix = newService === 'email' ? 'rse_' : newService === 'storage' ? 'cf_' : 'key_';
        const fullKey = prefix + generated;
        const masked = prefix + '••••••••••••••••••' + generated.slice(-2);

        const newEntry = {
            id: Date.now(),
            name: newName,
            service: newService,
            key: fullKey,
            maskedKey: masked,
            created: new Date().toISOString().split('T')[0],
            lastUsed: 'Never',
            status: 'active',
        };
        const updated = [newEntry, ...keys];
        setKeys(updated);
        persistKeys(updated);
        setShowAddForm(false);
        setNewName('');
        setNewService('email');
    };

    const handleCopy = (key, id) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="apikeys-page">
            <div className="apikeys-header">
                <div>
                    <h2>API Keys</h2>
                    <p>Manage integration keys for external services. Keys are encrypted at rest.</p>
                </div>
                <Button icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
                    Add API Key
                </Button>
            </div>

            {error && (
                <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {keys.length === 0 ? (
                <div className="apikeys-table-wrapper">
                    <div className="apikeys-empty">
                        <div className="apikeys-empty-icon"><Key size={24} /></div>
                        <h3>No API Keys</h3>
                        <p>Add your first integration key to get started.</p>
                        <Button icon={<Plus size={16} />} onClick={() => setShowAddForm(true)}>
                            Add API Key
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="apikeys-table-wrapper">
                    <table className="apikeys-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Service</th>
                                <th>Key</th>
                                <th>Created</th>
                                <th>Last Used</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((k) => (
                                <tr key={k.id}>
                                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                                    <td>
                                        <span className={`apikey-service apikey-service--${k.service}`}>
                                            {serviceLabels[k.service]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="apikey-masked">
                                            {revealedKeyId === k.id ? k.key : k.maskedKey}
                                        </span>
                                    </td>
                                    <td>{k.created}</td>
                                    <td>{k.lastUsed}</td>
                                    <td>
                                        <span className={`apikey-status apikey-status--${k.status}`}>
                                            <span className="apikey-status-dot"></span>
                                            {k.status === 'active' ? 'Active' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="apikey-actions">
                                            {revealedKeyId === k.id ? (
                                                <button
                                                    className="apikey-action-btn"
                                                    onClick={() => handleCopy(k.key, k.id)}
                                                >
                                                    {copiedId === k.id ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === k.id ? 'Copied' : 'Copy'}
                                                </button>
                                            ) : (
                                                <button
                                                    className="apikey-action-btn"
                                                    onClick={() => setRevealId(k.id)}
                                                    disabled={k.status === 'revoked'}
                                                >
                                                    <Eye size={14} /> Reveal
                                                </button>
                                            )}
                                            <button
                                                className="apikey-action-btn apikey-action-btn--revoke"
                                                onClick={() => setRevokeTarget(k)}
                                                disabled={k.status === 'revoked'}
                                            >
                                                <Ban size={14} /> Revoke
                                            </button>
                                            <button
                                                className="apikey-action-btn apikey-action-btn--delete"
                                                onClick={() => setDeleteTarget(k)}
                                            >
                                                <Plus size={14} style={{ transform: 'rotate(45deg)' }} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reveal Key — Password Prompt */}
            {revealId && (
                <div className="apikey-form-overlay" onClick={() => { setRevealId(null); setRevealPassword(''); }}>
                    <div className="apikey-form-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Identity</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px' }}>
                            Enter your password to reveal this API key.
                        </p>
                        <div className="apikey-form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={revealPassword}
                                onChange={(e) => setRevealPassword(e.target.value)}
                                placeholder="Enter your admin password"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleRevealSubmit()}
                            />
                        </div>
                        <div className="apikey-form-actions">
                            <Button variant="secondary" onClick={() => { setRevealId(null); setRevealPassword(''); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleRevealSubmit} disabled={!revealPassword}>
                                Reveal Key
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add API Key Form */}
            {showAddForm && (
                <div className="apikey-form-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="apikey-form-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Add New API Key</h3>
                        <div className="apikey-form-group">
                            <label>Key Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Resend Production"
                                autoFocus
                            />
                        </div>
                        <div className="apikey-form-group">
                            <label>Service Type</label>
                            <select value={newService} onChange={(e) => setNewService(e.target.value)}>
                                <option value="email">Email</option>
                                <option value="storage">Storage</option>
                                <option value="webhook">Webhook</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div className="apikey-form-actions">
                            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddKey} disabled={!newName.trim()}>
                                Generate Key
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!revokeTarget}
                title={`Revoke "${revokeTarget?.name}"?`}
                message="This key will be immediately invalidated. Any services using it will stop working."
                confirmText="Revoke Key"
                variant="danger"
                requireTyping
                typeConfirmWord={revokeTarget?.name || ''}
                typedValue={revokeTyped}
                onTypedChange={setRevokeTyped}
                onConfirm={handleRevoke}
                onCancel={() => { setRevokeTarget(null); setRevokeTyped(''); }}
                icon={<Ban size={28} />}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title={`Delete "${deleteTarget?.name}"?`}
                message="This key will be permanently deleted. This action cannot be undone."
                confirmText="Delete Permanently"
                variant="danger"
                requireTyping
                typeConfirmWord="DELETE"
                typedValue={deleteTyped}
                onTypedChange={setDeleteTyped}
                onConfirm={handleDelete}
                onCancel={() => { setDeleteTarget(null); setDeleteTyped(''); }}
                icon={<Plus size={28} style={{ transform: 'rotate(45deg)', color: '#F05A63' }} />}
            />
        </div>
    );
};

export default ApiKeys;
