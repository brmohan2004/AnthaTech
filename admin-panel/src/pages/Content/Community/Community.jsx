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
    const [members, setMembers] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getCommunityContent('teaser');
                if (data?.content) setTeaser(data.content);
                const apps = await getCommunityApplications();
                setMembers(apps);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load community data.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateCommunityContent('teaser', { content: teaser });

            // Log the action
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Updated Community Teaser settings`,
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

    const updateTrack = (id, field, value) => {
        setTeaser({
            ...teaser,
            tracks: teaser.tracks.map(t => t.id === id ? { ...t, [field]: value } : t)
        });
    };

    const updateStat = (id, field, value) => {
        setTeaser({
            ...teaser,
            stats: teaser.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
        });
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
                <Button variant="primary" icon={<Save size={16} />} onClick={handleSave}>Save Changes</Button>
            </header>

            <div className="editor-tabs">
                <button className={`tab-btn ${activeTab === 'teaser' ? 'active' : ''}`} onClick={() => setActiveTab('teaser')}>Teaser Content</button>
                <button className={`tab-btn ${activeTab === 'how' ? 'active' : ''}`} onClick={() => setActiveTab('how')}>How It Works</button>
                <button className={`tab-btn ${activeTab === 'perks' ? 'active' : ''}`} onClick={() => setActiveTab('perks')}>Perks</button>
                <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
            </div>

            <div className="panel editor-panel">
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
                                    <label>Section Title L2</label>
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
                            <div className="section-header-flex">
                                <h3 className="section-title mb-0">Tracks (max 4)</h3>
                                <Button variant="secondary" size="sm" icon={<Plus size={14} />}>Add Track</Button>
                            </div>
                            <div className="repeatable-grid mt-4">
                                {teaser.tracks.map(track => (
                                    <div key={track.id} className="track-card">
                                        <div className="card-controls">
                                            <GripVertical size={16} />
                                            <button className="del-btn"><X size={14} /></button>
                                        </div>
                                        <div className="track-inputs">
                                            <div className="flex gap-2">
                                                <input type="text" value={track.icon} onChange={(e) => updateTrack(track.id, 'icon', e.target.value)} className="form-input w-icon" placeholder="Icon" />
                                                <input type="text" value={track.label} onChange={(e) => updateTrack(track.id, 'label', e.target.value)} className="form-input flex-1" placeholder="Label" />
                                            </div>
                                            <textarea value={track.desc} onChange={(e) => updateTrack(track.id, 'desc', e.target.value)} className="form-input mt-2" placeholder="Description"></textarea>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-section mt-6">
                            <h3 className="section-title">Impact Stats</h3>
                            <div className="stats-row mt-4">
                                {teaser.stats.map(stat => (
                                    <div key={stat.id} className="stat-editor">
                                        <input type="text" value={stat.value} onChange={(e) => updateStat(stat.id, 'value', e.target.value)} className="form-input stat-val" />
                                        <input type="text" value={stat.label} onChange={(e) => updateStat(stat.id, 'label', e.target.value)} className="form-input stat-lbl" />
                                    </div>
                                ))}
                            </div>
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
                                    {members.map((m, i) => (
                                        <tr key={m.id}>
                                            <td className="text-secondary">{i + 1}</td>
                                            <td className="font-bold">{m.name}</td>
                                            <td>{m.email}</td>
                                            <td><span className="track-tag">{m.track}</span></td>
                                            <td><span className={`status-pill ${m.status.toLowerCase()}`}>{m.status}</span></td>
                                            <td>
                                                <div className="member-actions">
                                                    {m.status === 'Pending' && (
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

                {/* Tab placeholders for simplicity in this demo build */}
                {(activeTab === 'how' || activeTab === 'perks') && (
                    <div className="placeholder-tab">
                        <div className="placeholder-icon"><Plus size={48} /></div>
                        <h3>Manage {activeTab === 'how' ? 'How It Works' : 'Perks'}</h3>
                        <p>Similar to the Tracks section, you can add and reorder items for this section.</p>
                        <Button variant="secondary">Add First Item</Button>
                    </div>
                )}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default CommunityManager;
