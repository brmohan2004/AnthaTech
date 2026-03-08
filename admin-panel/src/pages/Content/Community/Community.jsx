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
    tracks: [], stats: [], howItWorks: [], perks: []
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
                if (data?.content) setTeaser({ ...emptyTeaser, ...data.content });
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

    const addTrack = () => {
        const newTrack = { id: Date.now(), icon: '🚀', label: '', desc: '' };
        setTeaser({ ...teaser, tracks: [...(teaser.tracks || []), newTrack] });
    };

    const removeTrack = (id) => {
        setTeaser({ ...teaser, tracks: teaser.tracks.filter(t => t.id !== id) });
    };

    const addStat = () => {
        const newStat = { id: Date.now(), value: '0', label: '' };
        setTeaser({ ...teaser, stats: [...(teaser.stats || []), newStat] });
    };

    const removeStat = (id) => {
        setTeaser({ ...teaser, stats: teaser.stats.filter(s => s.id !== id) });
    };

    const addHow = () => {
        const newItem = { id: Date.now(), title: '', desc: '' };
        setTeaser({ ...teaser, howItWorks: [...(teaser.howItWorks || []), newItem] });
    };

    const updateHow = (id, field, value) => {
        setTeaser({
            ...teaser,
            howItWorks: teaser.howItWorks.map(item => item.id === id ? { ...item, [field]: value } : item)
        });
    };

    const removeHow = (id) => {
        setTeaser({ ...teaser, howItWorks: teaser.howItWorks.filter(item => item.id !== id) });
    };

    const addPerk = () => {
        const newItem = { id: Date.now(), title: '', desc: '', icon: '✨' };
        setTeaser({ ...teaser, perks: [...(teaser.perks || []), newItem] });
    };

    const updatePerk = (id, field, value) => {
        setTeaser({
            ...teaser,
            perks: teaser.perks.map(item => item.id === id ? { ...item, [field]: value } : item)
        });
    };

    const removePerk = (id) => {
        setTeaser({ ...teaser, perks: teaser.perks.filter(item => item.id !== id) });
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
                                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addTrack}>Add Track</Button>
                            </div>
                            <div className="repeatable-grid mt-4">
                                {teaser.tracks.map(track => (
                                    <div key={track.id} className="track-card">
                                        <div className="card-controls">
                                            <GripVertical size={16} />
                                            <button className="del-btn" onClick={() => removeTrack(track.id)}><X size={14} /></button>
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
                            <div className="section-header-flex">
                                <h3 className="section-title mb-0">Impact Stats</h3>
                                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addStat}>Add Stat</Button>
                            </div>
                            <div className="stats-row mt-4">
                                {teaser.stats.map(stat => (
                                    <div key={stat.id} className="stat-editor">
                                        <input type="text" value={stat.value} onChange={(e) => updateStat(stat.id, 'value', e.target.value)} className="form-input stat-val" />
                                        <input type="text" value={stat.label} onChange={(e) => updateStat(stat.id, 'label', e.target.value)} className="form-input stat-lbl" />
                                        <button className="del-btn-sub" onClick={() => removeStat(stat.id)}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'how' && (
                    <div className="how-tab">
                        <div className="section-header-flex">
                            <h3 className="section-title mb-0">How It Works Steps</h3>
                            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addHow}>Add Step</Button>
                        </div>
                        <div className="repeatable-list mt-4">
                            {(teaser.howItWorks || []).map((item, idx) => (
                                <div key={item.id} className="repeatable-item p-4 bg-page rounded-xl border border-border mb-4 flex gap-4">
                                    <div className="step-num font-bold text-accent-blue pt-2">Step {idx + 1}</div>
                                    <div className="flex-1">
                                        <input type="text" value={item.title} onChange={(e) => updateHow(item.id, 'title', e.target.value)} className="form-input mb-2" placeholder="Step Title" />
                                        <textarea value={item.desc} onChange={(e) => updateHow(item.id, 'desc', e.target.value)} className="form-input" placeholder="Step Description"></textarea>
                                    </div>
                                    <button className="del-btn pt-2" onClick={() => removeHow(item.id)}><X size={18} /></button>
                                </div>
                            ))}
                            {(teaser.howItWorks || []).length === 0 && (
                                <div className="placeholder-tab p-12 text-center border-2 border-dashed border-border rounded-xl">
                                    <p className="text-secondary mb-4">No steps added yet.</p>
                                    <Button variant="secondary" onClick={addHow}>Add First Step</Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'perks' && (
                    <div className="perks-tab">
                        <div className="section-header-flex">
                            <h3 className="section-title mb-0">Community Perks</h3>
                            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addPerk}>Add Perk</Button>
                        </div>
                        <div className="repeatable-grid mt-4 grid grid-cols-2 gap-4">
                            {(teaser.perks || []).map((item) => (
                                <div key={item.id} className="repeatable-item p-4 bg-page rounded-xl border border-border flex gap-4">
                                    <input type="text" value={item.icon} onChange={(e) => updatePerk(item.id, 'icon', e.target.value)} className="form-input w-icon text-2xl h-12 w-12 text-center" placeholder="Icon" />
                                    <div className="flex-1">
                                        <input type="text" value={item.title} onChange={(e) => updatePerk(item.id, 'title', e.target.value)} className="form-input mb-2" placeholder="Perk Title" />
                                        <textarea value={item.desc} onChange={(e) => updatePerk(item.id, 'desc', e.target.value)} className="form-input" placeholder="Perk Description"></textarea>
                                    </div>
                                    <button className="del-btn" onClick={() => removePerk(item.id)}><X size={18} /></button>
                                </div>
                            ))}
                            {(teaser.perks || []).length === 0 && (
                                <div className="placeholder-tab p-12 text-center border-2 border-dashed border-border rounded-xl col-span-2">
                                    <p className="text-secondary mb-4">No perks added yet.</p>
                                    <Button variant="secondary" onClick={addPerk}>Add First Perk</Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default CommunityManager;
