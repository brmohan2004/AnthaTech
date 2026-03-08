import React, { useState, useEffect } from 'react';
import './Highlights.css';
import {
    Save, RotateCcw, Plus, X, GripVertical,
    Sparkles, Code, Eye
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getHighlightsContent, updateHighlightsContent, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';

const emptyData = { header: [], items: [] };

const HighlightsManager = () => {
    const [formData, setFormData] = useState(emptyData);
    const [savedData, setSavedData] = useState(emptyData);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getHighlightsContent();
                const mapped = {
                    header: data.header || [],
                    items: data.items || [],
                };
                setFormData(mapped);
                setSavedData(mapped);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load highlights.' });
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
        setToast({ type: 'warning', message: 'Changes reverted.' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateHighlightsContent(formData);

            // Log the action
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Updated Highlights section content`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setSavedData(formData);
            setIsDirty(false);
            setToast({ type: 'success', message: 'Highlights saved successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    // Header Handlers
    const updateHeaderChunk = (id, field, value) => {
        setFormData($ => ({
            ...$,
            header: $.header.map(c => c.id === id ? { ...c, [field]: value } : c)
        }));
    };

    const addHeaderChunk = () => {
        setFormData($ => ({
            ...$,
            header: [...$.header, { id: Date.now(), text: '', color: 'normal' }]
        }));
    };

    const removeHeaderChunk = (id) => {
        setFormData($ => ({
            ...$,
            header: $.header.filter(c => c.id !== id)
        }));
    };

    // Item Handlers
    const updateItem = (id, field, value) => {
        setFormData($ => ({
            ...$,
            items: $.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addItem = () => {
        if (formData.items.length >= 4) {
            setToast({ type: 'warning', message: 'Maximum 4 highlight items allowed.' });
            return;
        }
        setFormData($ => ({
            ...$,
            items: [...$.items, { id: Date.now(), iconSvg: '', title1: '', title2: '' }]
        }));
    };

    const removeItem = (id) => {
        setFormData($ => ({
            ...$,
            items: $.items.filter(item => item.id !== id)
        }));
    };

    return (
        <div className="highlights-manager">
            <header className="page-header">
                <div className="header-breadcrumbs">Content &gt; <span>Highlights</span></div>
                <div className="header-actions">
                    <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={handleRevert} disabled={!isDirty}>Revert</Button>
                    <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={!isDirty}>Save Changes</Button>
                </div>
            </header>

            <div className="manager-grid">
                <div className="form-column">

                    <div className="panel">
                        <h3 className="panel-title">Header Text (Rich)</h3>
                        <div className="rich-text-builder">
                            {formData.header.map(chunk => (
                                <div className="chunk-row" key={chunk.id}>
                                    <select
                                        className="color-select"
                                        value={chunk.color}
                                        onChange={(e) => updateHeaderChunk(chunk.id, 'color', e.target.value)}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="highlight">Highlight</option>
                                    </select>
                                    <input
                                        type="text"
                                        className="form-input chunk-input"
                                        value={chunk.text}
                                        onChange={(e) => updateHeaderChunk(chunk.id, 'text', e.target.value)}
                                    />
                                    <button className="icon-btn-danger" onClick={() => removeHeaderChunk(chunk.id)}><X size={16} /></button>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={addHeaderChunk}>Add Phrase</Button>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header-flex">
                            <h3 className="panel-title mb-0">Highlight Items</h3>
                            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addItem}>Add Item</Button>
                        </div>

                        <div className="items-list">
                            {formData.items.map((item, idx) => (
                                <div className="highlight-item-card" key={item.id}>
                                    <div className="card-top">
                                        <div className="drag-handle"><GripVertical size={16} /><span>Item {idx + 1}</span></div>
                                        <button className="icon-btn-danger" onClick={() => removeItem(item.id)}><X size={16} /></button>
                                    </div>

                                    <div className="card-body">
                                        <div className="svg-input-group">
                                            <div className="input-with-label">
                                                <label>SVG Icon Code</label>
                                                <textarea
                                                    className="form-input svg-textarea"
                                                    value={item.iconSvg}
                                                    onChange={(e) => updateItem(item.id, 'iconSvg', e.target.value)}
                                                    placeholder="<svg>...</svg>"
                                                ></textarea>
                                            </div>
                                            <div className="svg-preview">
                                                <label>Preview</label>
                                                <div className="mini-svg-box" dangerouslySetInnerHTML={{ __html: item.iconSvg }}></div>
                                            </div>
                                        </div>

                                        <div className="form-row mt-3">
                                            <div className="form-group flex-1">
                                                <label>Title Line 1</label>
                                                <input type="text" className="form-input" value={item.title1} onChange={(e) => updateItem(item.id, 'title1', e.target.value)} />
                                            </div>
                                            <div className="form-group flex-1">
                                                <label>Title Line 2</label>
                                                <input type="text" className="form-input" value={item.title2} onChange={(e) => updateItem(item.id, 'title2', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="preview-column">
                    <h3 className="preview-title">Visual Preview</h3>
                    <div className="highlights-sim">
                        <div className="sim-header">
                            {formData.header.map(c => (
                                <span key={c.id} className={`sim-text-${c.color}`}>{c.text} </span>
                            ))}
                        </div>

                        <div className="sim-grid">
                            {formData.items.map(item => (
                                <div key={item.id} className="sim-item">
                                    <div className="sim-item-icon" dangerouslySetInnerHTML={{ __html: item.iconSvg }}></div>
                                    <div className="sim-item-title">{item.title1}<br />{item.title2}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default HighlightsManager;
