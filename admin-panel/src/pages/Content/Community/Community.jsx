import React, { useState, useEffect } from 'react';
import './Community.css';
import {
    Plus, Save, X, GripVertical, Check, XCircle,
    Eye, GraduationCap, Briefcase, Mail, User
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getCommunityContent, updateCommunityContent, getCommunityApplications, updateApplicationStatus, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';

const emptyTeaser = {
    title1: '', title2: '', description: '', ctaText: '',
    tracks: [], stats: []
};

const CommunityManager = () => {
    const [activeTab, setActiveTab] = useState('teaser');
    const [teaser, setTeaser] = useState(emptyTeaser);
    const [howItWorks, setHowItWorks] = useState([]);
    const [perks, setPerks] = useState([]);
    const [members, setMembers] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            // Load each section independently so one failure doesn't block others
            try {
                const teaserData = await getCommunityContent('teaser');
                if (teaserData?.content && typeof teaserData.content === 'object' && !Array.isArray(teaserData.content)) {
                    const raw = teaserData.content;
                    // Normalise tracks: old data may be [{id, label, ...}] objects → convert to plain strings
                    const normalTracks = Array.isArray(raw.tracks)
                        ? raw.tracks.map(t => (typeof t === 'object' ? (t.label || '') : t))
                        : [];
                    setTeaser({ ...emptyTeaser, ...raw, tracks: normalTracks });
                }
            } catch (e) { console.warn('Failed to load teaser:', e); }

            try {
                const howData = await getCommunityContent('how_it_works');
                const c = howData?.content;
                // DB stores as { steps: [] } initially; after admin save it becomes an array directly
                if (Array.isArray(c)) setHowItWorks(c);
                else if (Array.isArray(c?.steps)) setHowItWorks(c.steps);
            } catch (e) { console.warn('Failed to load how_it_works:', e); }

            try {
                const perksData = await getCommunityContent('perks');
                const c = perksData?.content;
                // DB stores as { perks: [] } initially; after admin save it becomes an array directly
                if (Array.isArray(c)) setPerks(c);
                else if (Array.isArray(c?.perks)) setPerks(c.perks);
            } catch (e) { console.warn('Failed to load perks:', e); }

            try {
                const apps = await getCommunityApplications();
                setMembers(apps);
            } catch (e) { console.warn('Failed to load applications:', e); }

            setLoading(false);
        })();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            
            if (activeTab === 'teaser') {
                await updateCommunityContent('teaser', { content: teaser });
            } else if (activeTab === 'how') {
                // Store as array directly so public website mapCommunityRow picks it up
                await updateCommunityContent('how_it_works', { content: howItWorks });
            } else if (activeTab === 'perks') {
                // Store as array directly so public website mapCommunityRow picks it up
                await updateCommunityContent('perks', { content: perks });
            }

            // Log the action
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Updated Community ${activeTab} settings`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setToast({ type: 'success', message: 'Community settings saved.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save community settings.' });
        } finally {
            setSaving(false);
        }
    };

    const updateTeaser = (field, value) => {
        setTeaser({ ...teaser, [field]: value });
    };

    const [trackInput, setTrackInput] = useState('');

    const addTrack = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const val = trackInput.trim();
        if (!val || teaser.tracks.length >= 4) return;
        if (!teaser.tracks.includes(val)) {
            setTeaser({ ...teaser, tracks: [...teaser.tracks, val] });
        }
        setTrackInput('');
    };

    const removeTrack = (val) => {
        setTeaser({ ...teaser, tracks: teaser.tracks.filter(t => t !== val) });
    };

    const addStat = () => {
        const newStat = { id: Date.now(), value: '0', label: 'Label' };
        setTeaser({ ...teaser, stats: [...teaser.stats, newStat] });
    };

    const removeStat = (id) => {
        setTeaser({ ...teaser, stats: teaser.stats.filter(s => s.id !== id) });
    };

    const updateStat = (id, field, value) => {
        setTeaser({
            ...teaser,
            stats: teaser.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
        });
    };

    // How It Works Handlers
    const addHowItem = () => {
        const newItem = { id: Date.now(), title: 'New Step', desc: 'Description' };
        setHowItWorks([...howItWorks, newItem]);
    };

    const removeHowItem = (id) => {
        setHowItWorks(howItWorks.filter(item => item.id !== id));
    };

    const updateHowItem = (id, field, value) => {
        setHowItWorks(howItWorks.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    // Perks Handlers
    const addPerkItem = () => {
        const newItem = { id: Date.now(), title: 'New Perk', desc: 'Description', icon: 'Star' };
        setPerks([...perks, newItem]);
    };

    const removePerkItem = (id) => {
        setPerks(perks.filter(item => item.id !== id));
    };

    const updatePerkItem = (id, field, value) => {
        setPerks(perks.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const approveMember = async (id) => {
        try {
            await updateApplicationStatus(id, 'approved');

            // Log the approval
            try {
                const user = await getCurrentUser();
                const member = members.find(m => m.id === id);
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Approved Community Application: ${member?.full_name || id}`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setMembers(members.map(m => m.id === id ? { ...m, status: 'approved' } : m));
            setToast({ type: 'success', message: 'Member application approved.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to approve member.' });
        }
    };

    const rejectMember = async (id) => {
        try {
            const member = members.find(m => m.id === id);
            await updateApplicationStatus(id, 'rejected');

            // Log the rejection
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Rejected Community Application: ${member?.full_name || id}`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setMembers(members.filter(m => m.id !== id));
            setToast({ type: 'info', message: 'Member application rejected.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to reject member.' });
        }
    };

    return (
        <div className="community-manager">
            <header className="page-header">
                <div className="header-breadcrumbs">Content &gt; <span>Community</span></div>
                {activeTab !== 'members' && (
                    <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                )}
            </header>

            <div className="editor-tabs">
                <button className={`tab-btn ${activeTab === 'teaser' ? 'active' : ''}`} onClick={() => setActiveTab('teaser')}>Teaser Content</button>
                <button className={`tab-btn ${activeTab === 'how' ? 'active' : ''}`} onClick={() => setActiveTab('how')}>How It Works</button>
                <button className={`tab-btn ${activeTab === 'perks' ? 'active' : ''}`} onClick={() => setActiveTab('perks')}>Perks</button>
                <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
            </div>

            <div className="panel editor-panel">
                <div className="community-editor-layout">
                    {/* ── FORM COLUMN ── */}
                    <div className="community-form-main">
                        {activeTab === 'teaser' && (
                            <div className="teaser-tab">
                                <div className="form-section">
                                    <h3 className="section-title">Section Identity</h3>
                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label>Section Title L1</label>
                                            <input type="text" value={teaser.title1} onChange={(e) => updateTeaser('title1', e.target.value)} className="form-input" />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label>Section Title L2 (Gradient)</label>
                                            <input type="text" value={teaser.title2} onChange={(e) => updateTeaser('title2', e.target.value)} className="form-input" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea value={teaser.description} onChange={(e) => updateTeaser('description', e.target.value)} className="form-input"></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>CTA Button Text</label>
                                        <input type="text" value={teaser.ctaText} onChange={(e) => updateTeaser('ctaText', e.target.value)} className="form-input" />
                                    </div>
                                </div>

                                <div className="form-section mt-6">
                                    <div className="form-group">
                                        <label>Tracks (max 4 — Press Enter)</label>
                                        <input
                                            type="text"
                                            value={trackInput}
                                            onChange={(e) => setTrackInput(e.target.value)}
                                            onKeyDown={addTrack}
                                            className="form-input"
                                            placeholder="e.g. Networking"
                                            disabled={teaser.tracks.length >= 4}
                                        />
                                        <div className="tag-pills mt-2">
                                            {teaser.tracks.map((t, i) => (
                                                <span key={i} className="tag-pill-removable">
                                                    {typeof t === 'object' ? (t.label || '') : t}
                                                    <X size={12} onClick={() => removeTrack(t)} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section mt-6">
                                    <div className="section-header-flex">
                                        <h3 className="section-title mb-0">Impact Stats</h3>
                                        <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addStat}>Add Stat</Button>
                                    </div>
                                    <div className="stats-row mt-4">
                                        {teaser.stats.map(stat => (
                                            <div key={stat.id} className="stat-editor">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <input type="text" value={stat.value} onChange={(e) => updateStat(stat.id, 'value', e.target.value)} className="form-input stat-val" placeholder="Value" />
                                                        <button className="del-btn" onClick={() => removeStat(stat.id)}><X size={14} /></button>
                                                    </div>
                                                    <input type="text" value={stat.label} onChange={(e) => updateStat(stat.id, 'label', e.target.value)} className="form-input stat-lbl" placeholder="Label" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'how' && (
                            <div className="how-tab">
                                <div className="section-header-flex">
                                    <h3 className="section-title mb-0">Manage How It Works</h3>
                                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addHowItem}>Add Step</Button>
                                </div>
                                <div className="repeatable-list mt-4">
                                    {howItWorks.length > 0 ? howItWorks.map((item, idx) => (
                                        <div key={item.id} className="item-card">
                                            <div className="card-controls">
                                                <span className="idx-num">{String(idx + 1).padStart(2, '0')}</span>
                                                <button className="del-btn" onClick={() => removeHowItem(item.id)}><X size={14} /></button>
                                            </div>
                                            <div className="item-inputs">
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateHowItem(item.id, 'title', e.target.value)}
                                                    className="form-input font-bold"
                                                    placeholder="Step Title"
                                                />
                                                <textarea
                                                    value={item.desc}
                                                    onChange={(e) => updateHowItem(item.id, 'desc', e.target.value)}
                                                    className="form-input mt-2"
                                                    placeholder="Step Description"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="placeholder-tab">
                                            <div className="placeholder-icon"><Plus size={48} /></div>
                                            <h3>Manage How It Works</h3>
                                            <p>Add steps to explain how the community works.</p>
                                            <Button variant="secondary" onClick={addHowItem}>Add First Item</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'perks' && (
                            <div className="perks-tab">
                                <div className="section-header-flex">
                                    <h3 className="section-title mb-0">Manage Perks</h3>
                                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addPerkItem}>Add Perk</Button>
                                </div>
                                <div className="repeatable-grid mt-4">
                                    {perks.length > 0 ? perks.map(item => (
                                        <div key={item.id} className="perk-card-edit">
                                            <div className="card-top-row">
                                                <input
                                                    type="text"
                                                    value={item.icon}
                                                    onChange={(e) => updatePerkItem(item.id, 'icon', e.target.value)}
                                                    className="form-input w-icon"
                                                    placeholder="🎯"
                                                />
                                                <button className="del-btn" onClick={() => removePerkItem(item.id)}><X size={14} /></button>
                                            </div>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updatePerkItem(item.id, 'title', e.target.value)}
                                                className="form-input font-bold"
                                                placeholder="Perk Title"
                                            />
                                            <textarea
                                                value={item.desc}
                                                onChange={(e) => updatePerkItem(item.id, 'desc', e.target.value)}
                                                className="form-input mt-2"
                                                placeholder="Perk Description"
                                            ></textarea>
                                        </div>
                                    )) : (
                                        <div className="placeholder-tab" style={{ gridColumn: '1 / -1' }}>
                                            <div className="placeholder-icon"><Plus size={48} /></div>
                                            <h3>Manage Perks</h3>
                                            <p>Add perks that community members receive.</p>
                                            <Button variant="secondary" onClick={addPerkItem}>Add First Item</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="members-tab">
                                <h3 className="section-title">Community Members & Applications</h3>
                                <div className="table-container mt-4">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Track</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.length === 0 ? (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No applications yet.</td></tr>
                                            ) : members.map((m, i) => (
                                                <tr key={m.id}>
                                                    <td className="text-secondary">{i + 1}</td>
                                                    <td className="font-bold">{m.full_name || m.name}</td>
                                                    <td>{m.email}</td>
                                                    <td><span className="track-tag">{m.track}</span></td>
                                                    <td><span className={`status-pill ${(m.status || '').toLowerCase()}`}>{m.status}</span></td>
                                                    <td>
                                                        <div className="member-actions">
                                                            {(m.status || '').toLowerCase() === 'pending' && (
                                                                <>
                                                                    <button className="action-btn success" onClick={() => approveMember(m.id)} title="Approve"><Check size={16} /></button>
                                                                    <button className="action-btn danger" onClick={() => rejectMember(m.id)} title="Reject"><XCircle size={16} /></button>
                                                                </>
                                                            )}
                                                            <button className="action-btn" title="View Details"><Eye size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── PREVIEW COLUMN ── */}
                    <div className="community-preview-panel">
                        <div className="preview-label">Real-time Preview</div>
                        <div className="preview-inner">
                            {activeTab === 'teaser' && (
                                <div>
                                    <div className="preview-teaser-badge">Community</div>
                                    <h2 className="preview-teaser-title">
                                        {teaser.title1 || 'Join our'}<br />
                                        <span>{teaser.title2 || 'creative network'}</span>
                                    </h2>
                                    <p className="preview-teaser-desc">{teaser.description || 'A short description about the community...'}</p>
                                    {teaser.ctaText && <span className="preview-teaser-cta">{teaser.ctaText}</span>}
                                    {teaser.stats?.length > 0 && (
                                        <div className="preview-teaser-stats">
                                            {teaser.stats.map((s, i) => (
                                                <div key={i} className="preview-stat-item">
                                                    <div className="preview-stat-value">{s.value}</div>
                                                    <div className="preview-stat-label">{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {teaser.tracks?.length > 0 && (
                                        <div className="preview-teaser-tracks">
                                            {teaser.tracks.map((t, i) => (
                                                <span key={i} className="preview-track-pill">
                                                    {typeof t === 'object' ? (t.label || '') : t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'how' && (
                                <div className="preview-how-list">
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>Process</div>
                                    <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>How it works</div>
                                    {howItWorks.length === 0 ? (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Add steps to see the preview.</p>
                                    ) : howItWorks.map((item, idx) => (
                                        <div key={idx} className="preview-how-item">
                                            <div className="preview-how-num">{String(idx + 1).padStart(2, '0')}</div>
                                            <div>
                                                <div className="preview-how-title">{item.title || 'Step Title'}</div>
                                                <div className="preview-how-desc">{item.desc || 'Step description...'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'perks' && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>Benefits</div>
                                    <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>What you get</div>
                                    {perks.length === 0 ? (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>Add perks to see the preview.</p>
                                    ) : (
                                        <div className="preview-perks-grid">
                                            {perks.map((p, i) => (
                                                <div key={i} className="preview-perk-card">
                                                    <div className="preview-perk-icon">{p.icon}</div>
                                                    <div className="preview-perk-title">{p.title || 'Perk Title'}</div>
                                                    <div className="preview-perk-desc">{p.desc || 'Description...'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'members' && (
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Applicants</div>
                                    {members.length === 0 ? (
                                        <p className="preview-members-note">No applications yet.</p>
                                    ) : (
                                        <div className="preview-member-rows">
                                            {members.slice(0, 5).map((m, i) => (
                                                <div key={i} className="preview-member-row">
                                                    <div className="preview-member-avatar">
                                                        {(m.full_name || m.name || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="preview-member-name">{m.full_name || m.name}</div>
                                                        <div className="preview-member-track">{m.track}</div>
                                                    </div>
                                                    <span className={`preview-member-status ${(m.status || '').toLowerCase()}`}>{m.status}</span>
                                                </div>
                                            ))}
                                            {members.length > 5 && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '8px' }}>+{members.length - 5} more</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default CommunityManager;
