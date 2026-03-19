import React from 'react';
import { ArrowRightLeft, Plus, Trash2 } from 'lucide-react';
import './RedirectsTab.css';

const RedirectsTab = ({ redirects, newRedirect, setNewRedirect, addRedirect, removeRedirect }) => {
    return (
        <div className="seo-panel">
            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><ArrowRightLeft size={18} /></span>
                    URL Redirect Manager
                </div>
                <p className="seo-section-desc">Manage 301/302 redirects to preserve SEO value when URLs change.</p>
            </div>

            {/* Add New */}
            <div className="redirect-add-form">
                <div className="seo-form-group">
                    <label>From URL</label>
                    <input className="seo-input" placeholder="/old-page" value={newRedirect.from} onChange={e => setNewRedirect(p => ({ ...p, from: e.target.value }))} />
                </div>
                <div className="seo-form-group">
                    <label>To URL</label>
                    <input className="seo-input" placeholder="/new-page" value={newRedirect.to} onChange={e => setNewRedirect(p => ({ ...p, to: e.target.value }))} />
                </div>
                <div className="seo-form-group">
                    <label>Type</label>
                    <select className="seo-input" value={newRedirect.type} onChange={e => setNewRedirect(p => ({ ...p, type: e.target.value }))}>
                        <option value="301">301 Permanent</option>
                        <option value="302">302 Temporary</option>
                    </select>
                </div>
                <div className="seo-form-group">
                    <label>&nbsp;</label>
                    <button className="seo-inline-btn primary" onClick={addRedirect} style={{ height: '44px' }}>
                        <Plus size={14} /> Add
                    </button>
                </div>
            </div>

            {/* Table */}
            {redirects.rules.length > 0 ? (
                <div className="redirects-table-wrap">
                    <table className="redirects-table">
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>To</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {redirects.rules.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ fontFamily: "'Consolas', monospace" }}>{r.from}</td>
                                    <td style={{ fontFamily: "'Consolas', monospace" }}>{r.to}</td>
                                    <td><span className={`redirect-type-badge r${r.type}`}>{r.type}</span></td>
                                    <td><span className="redirect-status"><span className="dot"></span> {r.status}</span></td>
                                    <td><button className="redirect-delete-btn" onClick={() => removeRedirect(r.id)}><Trash2 size={14} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="seo-empty-state">
                    <div className="empty-icon">↪️</div>
                    <p>No redirects configured yet. Add your first redirect above.</p>
                </div>
            )}
        </div>
    );
};

export default RedirectsTab;
