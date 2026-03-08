import React, { useState, useEffect } from 'react';
import './AboutTabs.css';
import { Save, RotateCcw, Image as ImageIcon, Plus, X, UploadCloud, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';
import { getAboutContent, updateAboutContent, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { uploadFile, generateFilePath } from '../../../api/media';

const emptyData = {
    about1: { logoUrl: '', paragraph1: [], paragraph2: [], button1Text: '', button2Text: '' },
    about2: { badge: '', title1: '', title2: '', buttonText: '', stats: [] }
};

const AboutTabs = () => {
    const [activeTab, setActiveTab] = useState('about1');
    const [formData, setFormData] = useState(emptyData);
    const [savedData, setSavedData] = useState(emptyData);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMediaOpen, setIsMediaOpen] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [a1, a2] = await Promise.all([
                    getAboutContent('about1'),
                    getAboutContent('about2')
                ]);
                const loaded = {
                    about1: {
                        logoUrl: a1.content?.logoUrl || '',
                        paragraph1: a1.content?.paragraph1 || [],
                        paragraph2: a1.content?.paragraph2 || [],
                        button1Text: a1.content?.button1Text || '',
                        button2Text: a1.content?.button2Text || '',
                    },
                    about2: {
                        badge: a2.content?.badge || '',
                        title1: a2.content?.title1 || '',
                        title2: a2.content?.title2 || '',
                        buttonText: a2.content?.buttonText || '',
                        stats: a2.content?.stats || [],
                    }
                };
                setFormData(loaded);
                setSavedData(loaded);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load about content.' });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        setIsDirty(JSON.stringify(formData) !== JSON.stringify(savedData));
    }, [formData, savedData]);

    const handleRevert = () => {
        setFormData(savedData);
        setToast({ type: 'warning', message: 'Changes reverted to last saved state.' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                updateAboutContent('about1', { content: formData.about1 }),
                updateAboutContent('about2', { content: formData.about2 })
            ]);

            // Log the action
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Updated "About Us" page sections`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setSavedData(formData);
            setIsDirty(false);
            setToast({ type: 'success', message: 'About sections saved successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    // About 1 Handlers
    const handleA1Change = (e) => {
        setFormData($ => ({ ...$, about1: { ...$.about1, [e.target.name]: e.target.value } }));
    };

    const handleMediaSelect = (url) => {
        setFormData($ => ({
            ...$,
            about1: { ...$.about1, logoUrl: url }
        }));
        setToast({ type: 'success', message: 'Logo selected from library.' });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const path = generateFilePath('about/logos', file.name);
            const url = await uploadFile(path, file);
            setFormData($ => ({
                ...$,
                about1: { ...$.about1, logoUrl: url }
            }));
            setToast({ type: 'success', message: 'Logo uploaded.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload logo.' });
        } finally {
            setSaving(false);
        }
    };

    const updateParagraphChunk = (pIndex, chunkId, field, value) => {
        setFormData($ => {
            const paragraph = pIndex === 1 ? 'paragraph1' : 'paragraph2';
            return {
                ...$,
                about1: {
                    ...$.about1,
                    [paragraph]: $.about1[paragraph].map(chunk =>
                        chunk.id === chunkId ? { ...chunk, [field]: value } : chunk
                    )
                }
            };
        });
    };

    const addChunk = (pIndex) => {
        setFormData($ => {
            const paragraph = pIndex === 1 ? 'paragraph1' : 'paragraph2';
            const newId = Date.now();
            return {
                ...$,
                about1: {
                    ...$.about1,
                    [paragraph]: [...$.about1[paragraph], { id: newId, text: '', color: 'blue' }]
                }
            };
        });
    };

    const removeChunk = (pIndex, chunkId) => {
        setFormData($ => {
            const paragraph = pIndex === 1 ? 'paragraph1' : 'paragraph2';
            return {
                ...$,
                about1: {
                    ...$.about1,
                    [paragraph]: $.about1[paragraph].filter(chunk => chunk.id !== chunkId)
                }
            };
        });
    };

    // About 2 Handlers
    const handleA2Change = (e) => {
        setFormData($ => ({ ...$, about2: { ...$.about2, [e.target.name]: e.target.value } }));
    };

    const updateStat = (id, field, value) => {
        setFormData($ => ({
            ...$,
            about2: {
                ...$.about2,
                stats: $.about2.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
            }
        }));
    };

    const removeStat = (id) => {
        setFormData($ => ({
            ...$,
            about2: {
                ...$.about2,
                stats: $.about2.stats.filter(s => s.id !== id)
            }
        }));
    };

    const addStat = () => {
        if (formData.about2.stats.length >= 6) {
            setToast({ type: 'error', message: 'Maximum 6 stats allowed.' });
            return;
        }
        setFormData($ => ({
            ...$,
            about2: {
                ...$.about2,
                stats: [...$.about2.stats, { id: Date.now(), color: '#3B82F6', number: '0', label: 'New Stat' }]
            }
        }));
    };

    const moveStat = (index, direction) => {
        const newStats = [...formData.about2.stats];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newStats.length) return;

        [newStats[index], newStats[targetIndex]] = [newStats[targetIndex], newStats[index]];
        setFormData($ => ({
            ...$,
            about2: { ...$.about2, stats: newStats }
        }));
    };

    return (
        <div className="about-manager">
            {/* Header */}
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Content &gt; <span>About</span>
                </div>
                <div className="header-actions">
                    <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={handleRevert} disabled={!isDirty}>
                        Revert
                    </Button>
                    <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={!isDirty}>
                        Save Changes
                    </Button>
                </div>
            </header>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'about1' ? 'active' : ''}`}
                    onClick={() => setActiveTab('about1')}
                >
                    About1 — Studio Description
                </button>
                <button
                    className={`tab-btn ${activeTab === 'about2' ? 'active' : ''}`}
                    onClick={() => setActiveTab('about2')}
                >
                    About2 — Numbers Stats
                </button>
            </div>

            <div className="tab-content">

                {/* ABOUT 1 TAB */}
                {activeTab === 'about1' && (
                    <div className="tab-panel flex-row">
                        <div className="form-column">

                            <div className="form-group">
                                <label>Logo Image</label>
                                <div className="image-picker-row">
                                    {formData.about1.logoUrl ? (
                                        <img src={formData.about1.logoUrl} alt="Logo preview" className="logo-preview-img" />
                                    ) : (
                                        <div className="placeholder"><ImageIcon size={40} /></div>
                                    )}
                                    <div className="flex-col gap-2">
                                        <button
                                            type="button"
                                            className="btn-link secondary"
                                            onClick={() => setIsMediaOpen(true)}
                                        >
                                            📁 Media Library
                                        </button>
                                        <label className="btn-link secondary cursor-pointer">
                                            <UploadCloud size={16} /> <span>{formData.about1.logoUrl ? 'Change Image →' : 'Upload Image →'}</span>
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={saving}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section-divider">Paragraph 1 — Rich Text</div>
                            <div className="rich-text-builder">
                                {formData.about1.paragraph1.map((chunk, i) => (
                                    <div className="chunk-row" key={chunk.id}>
                                        <select
                                            className="color-select"
                                            value={chunk.color}
                                            onChange={(e) => updateParagraphChunk(1, chunk.id, 'color', e.target.value)}
                                        >
                                            <option value="blue">● Blue</option>
                                            <option value="dark">● Dark</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input chunk-input"
                                            value={chunk.text}
                                            onChange={(e) => updateParagraphChunk(1, chunk.id, 'text', e.target.value)}
                                        />
                                        <button className="icon-btn-danger" onClick={() => removeChunk(1, chunk.id)}><X size={16} /></button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => addChunk(1)}>
                                    Add Word Group
                                </Button>
                            </div>

                            <div className="form-section-divider">Paragraph 2 — Rich Text</div>
                            <div className="rich-text-builder">
                                {formData.about1.paragraph2.map((chunk, i) => (
                                    <div className="chunk-row" key={chunk.id}>
                                        <select
                                            className="color-select"
                                            value={chunk.color}
                                            onChange={(e) => updateParagraphChunk(2, chunk.id, 'color', e.target.value)}
                                        >
                                            <option value="blue">● Blue</option>
                                            <option value="dark">● Dark</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input chunk-input"
                                            value={chunk.text}
                                            onChange={(e) => updateParagraphChunk(2, chunk.id, 'text', e.target.value)}
                                        />
                                        <button className="icon-btn-danger" onClick={() => removeChunk(2, chunk.id)}><X size={16} /></button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => addChunk(2)}>
                                    Add Word Group
                                </Button>
                            </div>

                            <div className="form-section-divider">Action Buttons</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Button 1 Text</label>
                                    <input type="text" name="button1Text" value={formData.about1.button1Text} onChange={handleA1Change} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Button 2 Text</label>
                                    <input type="text" name="button2Text" value={formData.about1.button2Text} onChange={handleA1Change} className="form-input" />
                                </div>
                            </div>

                        </div>

                        <div className="preview-column">
                            <h3 className="preview-title">Visual Preview</h3>
                            <div className="about-sim">
                                <img src={formData.about1.logoUrl} alt="Logo" className="sim-about-logo" />
                                <p className="sim-about-p">
                                    {formData.about1.paragraph1.map(c => (
                                        <span key={c.id} className={`sim-text-${c.color}`}>{c.text} </span>
                                    ))}
                                </p>
                                <p className="sim-about-p">
                                    {formData.about1.paragraph2.map(c => (
                                        <span key={c.id} className={`sim-text-${c.color}`}>{c.text} </span>
                                    ))}
                                </p>
                                <div className="sim-about-actions">
                                    <button className="sim-btn-primary">{formData.about1.button1Text}</button>
                                    <button className="sim-btn-secondary">{formData.about1.button2Text}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABOUT 2 TAB */}
                {activeTab === 'about2' && (
                    <div className="tab-panel flex-row">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Section Badge Text</label>
                                <input type="text" name="badge" value={formData.about2.badge} onChange={handleA2Change} className="form-input" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title Line 1</label>
                                    <input type="text" name="title1" value={formData.about2.title1} onChange={handleA2Change} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Title Line 2</label>
                                    <input type="text" name="title2" value={formData.about2.title2} onChange={handleA2Change} className="form-input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Button Text</label>
                                <input type="text" name="buttonText" value={formData.about2.buttonText} onChange={handleA2Change} className="form-input" />
                            </div>

                            <div className="form-section-divider">Stats <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>(Max 6)</span></div>

                            <div className="stats-list">
                                {formData.about2.stats.map((stat, i) => (
                                    <div className="stat-row" key={stat.id}>
                                        <div className="move-controls">
                                            <button
                                                className="move-btn"
                                                onClick={() => moveStat(i, 'up')}
                                                disabled={i === 0}
                                                title="Move Up"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                className="move-btn"
                                                onClick={() => moveStat(i, 'down')}
                                                disabled={i === formData.about2.stats.length - 1}
                                                title="Move Down"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                        <input
                                            type="color"
                                            className="stat-color-picker"
                                            value={stat.color && stat.color.startsWith('#') ? stat.color : '#3B82F6'}
                                            onChange={(e) => updateStat(stat.id, 'color', e.target.value)}
                                            title="Pick Color"
                                        />
                                        <input
                                            type="text"
                                            className="form-input stat-number"
                                            value={stat.number}
                                            onChange={(e) => updateStat(stat.id, 'number', e.target.value)}
                                            placeholder="e.g. 10+"
                                        />
                                        <input
                                            type="text"
                                            className="form-input stat-label"
                                            value={stat.label}
                                            onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                                            placeholder="Label"
                                        />
                                        <button className="icon-btn-danger" onClick={() => removeStat(stat.id)}><X size={16} /></button>
                                    </div>
                                ))}
                                {formData.about2.stats.length < 6 && (
                                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addStat}>
                                        Add Stat
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="preview-column">
                            <h3 className="preview-title">Visual Preview</h3>
                            <div className="about-sim-2">
                                <div className="sim2-badge">{formData.about2.badge}</div>
                                <h2 className="sim2-title">{formData.about2.title1}<br />{formData.about2.title2}</h2>
                                <button className="sim-btn-primary" style={{ marginBottom: '32px' }}>{formData.about2.buttonText}</button>

                                <div className="sim2-stats-grid">
                                    {formData.about2.stats.map(s => (
                                        <div className="sim2-stat-card" key={s.id}>
                                            <div className="sim2-stat-dot" style={{ backgroundColor: s.color }}></div>
                                            <div className="sim2-stat-num">{s.number}</div>
                                            <div className="sim2-stat-label">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {toast && (
                <ToastMessage
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <MediaPickerModal
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default AboutTabs;
