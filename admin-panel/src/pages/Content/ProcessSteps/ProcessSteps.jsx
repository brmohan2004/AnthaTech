import React, { useState, useEffect } from 'react';
import './ProcessSteps.css';
import {
    Save, RotateCcw, Plus, X, GripVertical,
    UploadCloud, Image as ImageIcon, ArrowRight
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';
import { getProcessSteps, updateProcessSteps, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { uploadFile, generateFilePath } from '../../../api/media';

const emptyData = { badge: '', title1: '', title2: '', ctaText: '', steps: [] };

const ProcessStepsManager = () => {
    const [formData, setFormData] = useState(emptyData);
    const [savedData, setSavedData] = useState(emptyData);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mediaTargetStepId, setMediaTargetStepId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await getProcessSteps();
                const mapped = {
                    badge: data.badge || '',
                    title1: data.title1 || '',
                    title2: data.title2 || '',
                    ctaText: data.cta_text || '',
                    steps: data.steps || [],
                };
                setFormData(mapped);
                setSavedData(mapped);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load process steps.' });
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
            await updateProcessSteps({
                badge: formData.badge,
                title1: formData.title1,
                title2: formData.title2,
                cta_text: formData.ctaText,
                steps: formData.steps,
            });

            // Log the action
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Updated "Process Steps" section content`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setSavedData(formData);
            setIsDirty(false);
            setToast({ type: 'success', message: 'Process steps saved successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStepImageUpload = async (id, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const path = generateFilePath('process/steps', file.name);
            const url = await uploadFile(path, file);
            updateStep(id, 'image', url);
            setToast({ type: 'success', message: 'Step image uploaded.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload image.' });
        } finally {
            setSaving(false);
        }
    };

    const handleMediaSelect = (url) => {
        if (mediaTargetStepId) {
            updateStep(mediaTargetStepId, 'image', url);
            setToast({ type: 'success', message: 'Step image updated from library.' });
        }
    };

    const updateStep = (id, field, value) => {
        setFormData($ => ({
            ...$,
            steps: $.steps.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const addStep = () => {
        if (formData.steps.length >= 6) {
            setToast({ type: 'warning', message: 'Maximum 6 steps allowed.' });
            return;
        }
        setFormData($ => ({
            ...$,
            steps: [...$.steps, { id: Date.now(), title: '', description: '', image: null }]
        }));
    };

    const removeStep = (id) => {
        if (formData.steps.length <= 2) {
            setToast({ type: 'warning', message: 'Minimum 2 steps required.' });
            return;
        }
        setFormData($ => ({
            ...$,
            steps: $.steps.filter(s => s.id !== id)
        }));
    };

    return (
        <div className="process-manager">
            <header className="page-header">
                <div className="header-breadcrumbs">Content &gt; <span>Process Steps</span></div>
                <div className="header-actions">
                    <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={handleRevert} disabled={!isDirty}>Revert</Button>
                    <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={!isDirty}>Save Changes</Button>
                </div>
            </header>

            <div className="manager-grid">
                <div className="form-column">

                    <div className="panel">
                        <h3 className="panel-title">Section Header</h3>
                        <div className="form-group">
                            <label>Section Badge</label>
                            <input type="text" name="badge" value={formData.badge} onChange={handleFormChange} className="form-input" />
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Title Line 1</label>
                                <input type="text" name="title1" value={formData.title1} onChange={handleFormChange} className="form-input" />
                            </div>
                            <div className="form-group flex-1">
                                <label>Title Line 2</label>
                                <input type="text" name="title2" value={formData.title2} onChange={handleFormChange} className="form-input" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>CTA Button Text</label>
                            <input type="text" name="ctaText" value={formData.ctaText} onChange={handleFormChange} className="form-input" />
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header-flex">
                            <h3 className="panel-title mb-0">Steps</h3>
                            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addStep}>Add Step</Button>
                        </div>

                        <div className="steps-list">
                            {formData.steps.map((step, idx) => (
                                <div className="step-card" key={step.id}>
                                    <div className="card-top">
                                        <div className="drag-handle"><GripVertical size={16} /><span>STEP {String(idx + 1).padStart(2, '0')}</span></div>
                                        <button className="icon-btn-danger" onClick={() => removeStep(step.id)}><X size={16} /></button>
                                    </div>

                                    <div className="card-body">
                                        <div className="step-main-info">
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input type="text" className="form-input" value={step.title} onChange={(e) => updateStep(step.id, 'title', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea className="form-input" value={step.description} onChange={(e) => updateStep(step.id, 'description', e.target.value)}></textarea>
                                            </div>
                                        </div>

                                        <div className="step-media">
                                            <label>Step Image</label>
                                            <div className="media-placeholder-box">
                                                {step.image ? <img src={step.image} alt="" className="step-preview-img" /> : <><ImageIcon size={24} /> <span>No image</span></>}
                                            </div>
                                            <div className="flex-col gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    className="btn-link"
                                                    onClick={() => setMediaTargetStepId(step.id)}
                                                >
                                                    📁 Media Library
                                                </button>
                                                <label className="btn-link cursor-pointer">
                                                    <UploadCloud size={14} /> Change Image
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={(e) => handleStepImageUpload(step.id, e)}
                                                        disabled={saving}
                                                    />
                                                </label>
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
                    <div className="process-sim">
                        <div className="sim-badge">{formData.badge}</div>
                        <h2 className="sim-title">{formData.title1}<br />{formData.title2}</h2>

                        <div className="sim-steps-list">
                            {formData.steps.map((step, idx) => (
                                <div key={step.id} className="sim-step-item">
                                    <div className="sim-step-header">
                                        <span className="sim-step-num">0{idx + 1}</span>
                                        <span className="sim-step-title">{step.title}</span>
                                    </div>
                                    <p className="sim-step-desc">{step.description}</p>
                                </div>
                            ))}
                        </div>

                        <button className="sim-cta-btn">{formData.ctaText} <ArrowRight size={14} /></button>
                    </div>
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <MediaPickerModal
                isOpen={!!mediaTargetStepId}
                onClose={() => setMediaTargetStepId(null)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default ProcessStepsManager;
