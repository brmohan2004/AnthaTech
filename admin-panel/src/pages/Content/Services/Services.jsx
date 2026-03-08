import React, { useState, useEffect } from 'react';
import './Services.css';
import {
    Plus, Search, Edit2, Trash2, ArrowLeft, Save,
    X, GripVertical, Image as ImageIcon, Layout,
    ListChecks, TrendingUp, Palette, ChevronRight,
    ChevronUp, ChevronDown
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { getServices, getServiceBySlug, createService, updateService, deleteService, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';
import ScheduledPublishPicker from '../../../components/ui/ScheduledPublishPicker/ScheduledPublishPicker';

const initialServiceState = {
    id: null,
    name: '',
    slug: '',
    description: '',
    tags: [],
    theme: 'Charcoal', // Match options in screenshot
    heroBgColor: '#e6fffa',
    graphic: null,
    offers: [{ id: 1, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>', title: '', text: '' }],
    process: [{ id: 1, title: '', text: '' }],
    benefits: [{ id: 1, text: '' }],
    status: 'Draft'
};

const ServicesManager = () => {
    const [currentView, setCurrentView] = useState('table');
    const [activeTab, setActiveTab] = useState('overview');
    const [services, setServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Editor state
    const [formData, setFormData] = useState(initialServiceState);
    const [tagInput, setTagInput] = useState('');

    // UI states
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [saving, setSaving] = useState(false);
    const [mediaOpen, setMediaOpen] = useState(false);

    useEffect(() => { loadServices(); }, []);

    const loadServices = async () => {
        try {
            const data = await getServices();
            setServices(data || []);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load services.' });
        } finally {
            setLoading(false);
        }
    };

    // ------ Table Filter ------
    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ------ Handlers ------
    const handleAddNew = () => {
        setFormData(initialServiceState);
        setCurrentView('edit');
        setActiveTab('overview');
    };

    const handleEdit = (service) => {
        const { hero_bg_color, ...rest } = service;
        setFormData({ ...initialServiceState, ...rest, heroBgColor: hero_bg_color || initialServiceState.heroBgColor });
        setCurrentView('edit');
        setActiveTab('overview');
    };

    const confirmDelete = (id, name) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const executeDelete = async () => {
        try {
            await deleteService(deleteModal.id);

            // Log the deletion to the audit trail
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Deleted Service: ${deleteModal.name}`,
                    result: 'success'
                });
            } catch (logError) {
                console.error("Failed to insert audit log:", logError);
            }

            setToast({ type: 'success', message: `Service "${deleteModal.name}" deleted.` });
            setDeleteModal({ isOpen: false, id: null, name: '' });
            await loadServices();
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to delete.' });
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const saveService = async () => {
        setSaving(true);
        try {
            const user = await getCurrentUser();
            if (formData.id) {
                const { id, heroBgColor, ...updates } = formData;
                await updateService(id, { ...updates, hero_bg_color: heroBgColor });

                // Log the update
                try {
                    await insertAuditLog({
                        admin_id: user?.id,
                        event_type: 'content',
                        description: `Updated Service: ${formData.name}`,
                        result: 'success'
                    });
                } catch (logErr) {
                    console.error('Audit log failed:', logErr);
                }
            } else {
                const { id, heroBgColor, ...newData } = formData;
                await createService({ ...newData, hero_bg_color: heroBgColor });

                // Log the creation
                try {
                    await insertAuditLog({
                        admin_id: user?.id,
                        event_type: 'content',
                        description: `Created Service: ${formData.name}`,
                        result: 'success'
                    });
                } catch (logErr) {
                    console.error('Audit log failed:', logErr);
                }
            }
            setToast({ type: 'success', message: 'Service saved successfully.' });
            setCurrentView('table');
            await loadServices();
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    // ------ Repeatable Row Handlers ------
    const updateRepeatable = (field, id, subField, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map(item => item.id === id ? { ...item, [subField]: value } : item)
        }));
    };

    const addRepeatable = (field) => {
        const newItems = [...formData[field]];
        if (field === 'offers' && newItems.length >= 6) {
            setToast({ type: 'warning', message: 'Maximum 6 offers allowed.' });
            return;
        }
        const newItem = field === 'benefits' ? { id: Date.now(), text: '' } : { id: Date.now(), title: '', text: '' };
        if (field === 'offers') newItem.icon = '✨';
        setFormData(prev => ({ ...prev, [field]: [...prev[field], newItem] }));
    };

    const removeRepeatable = (field, id) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item.id !== id)
        }));
    };

    const moveRepeatable = (field, index, direction) => {
        const newItems = [...formData[field]];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setFormData(prev => ({ ...prev, [field]: newItems }));
    };

    const handleMediaSelect = (url) => {
        setFormData(prev => ({ ...prev, graphic: url }));
        setMediaOpen(false);
        setToast({ type: 'success', message: 'Graphic updated.' });
    };

    // ------ Render Table View ------
    if (currentView === 'table') {
        return (
            <div className="services-manager table-view">
                <header className="page-header">
                    <div className="header-breadcrumbs">Content &gt; <span>Services</span></div>
                    <Button variant="primary" icon={<Plus size={16} />} onClick={handleAddNew}>
                        Add New Service
                    </Button>
                </header>

                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="panel p-0 overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th width="40">#</th>
                                <th>Service Name</th>
                                <th>Tags</th>
                                <th>Theme</th>
                                <th>Status</th>
                                <th width="80">Acts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service, i) => (
                                <tr key={service.id}>
                                    <td className="text-secondary">{i + 1}</td>
                                    <td className="font-medium clickable" onClick={() => handleEdit(service)}>{service.name}</td>
                                    <td>
                                        <div className="tag-pills">
                                            {service.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="theme-indicator">
                                            <span className="theme-dot" style={{ backgroundColor: service.theme.startsWith('#') ? service.theme : '#3B82F6' }}></span>
                                            <code>{service.theme}</code>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${service.status.toLowerCase()}`}>
                                            {service.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="action-btn" onClick={() => handleEdit(service)}><Edit2 size={16} /></button>
                                            <button className="action-btn text-danger" onClick={() => confirmDelete(service.id, service.name)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    title="Delete Service?"
                    message={`Are you sure you want to delete the "${deleteModal.name}" service?`}
                    onCancel={() => setDeleteModal({ isOpen: false })}
                    onConfirm={executeDelete}
                    requireTyping={true}
                />
                {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            </div>
        );
    }

    // ------ Render Editor View ------
    return (
        <div className="services-manager editor-view">
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Content &gt; <span className="clickable" onClick={() => setCurrentView('table')}>Services</span> &gt; <span>{formData.id ? `Edit — ${formData.name}` : 'New Service'}</span>
                </div>
                <div className="header-actions">
                    <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => setCurrentView('table')}>Cancel</Button>
                    <Button variant="primary" icon={<Save size={16} />} onClick={saveService}>Save Changes</Button>
                </div>
            </header>

            <div className="editor-tabs">
                <button className={`editor-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`editor-tab ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>What We Offer</button>
                <button className={`editor-tab ${activeTab === 'process' ? 'active' : ''}`} onClick={() => setActiveTab('process')}>Process</button>
                <button className={`editor-tab ${activeTab === 'benefits' ? 'active' : ''}`} onClick={() => setActiveTab('benefits')}>Benefits</button>
            </div>

            <div className="panel editor-content">
                <div className="editor-layout">
                    <div className="form-panel-main">
                        {activeTab === 'overview' && (
                            <div className="overview-tab grid-2">
                                <div className="form-col">
                                    <div className="form-group">
                                        <label>Service Title</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="form-input" placeholder="e.g. Branding" />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug</label>
                                        <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} className="form-input" placeholder="e.g. branding" />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} className="form-input tall" placeholder="Service description..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Tags (Press Enter)</label>
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={addTag}
                                            className="form-input"
                                            placeholder="Add a tag..."
                                        />
                                        <div className="tag-pills mt-2">
                                            {formData.tags.map(t => (
                                                <span key={t} className="tag-pill-removable">
                                                    {t} <X size={12} onClick={() => removeTag(t)} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-col">
                                    <div className="form-group">
                                        <label>Theme Color</label>
                                        <div className="color-picker-input">
                                            <input type="color" name="theme" value={formData.theme.startsWith('#') ? formData.theme : '#3B82F6'} onChange={handleFormChange} />
                                            <code>{formData.theme}</code>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ display: 'none' }}>
                                        <label>Status</label>
                                        <select 
                                            name="status" 
                                            style={{ color: 'red', border: '1px solid red' }}
                                            value={formData.status} 
                                            onChange={handleFormChange} 
                                            className="form-input"
                                        >
                                            <option value="Published">STATUS: Published</option>
                                            <option value="Draft">STATUS: Draft</option>
                                            <option value="Scheduled">STATUS: Scheduled</option>
                                            <option value="Preview">STATUS: Preview</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Hero BG Color</label>
                                        <div className="color-picker-input">
                                            <input type="color" name="heroBgColor" value={formData.heroBgColor} onChange={handleFormChange} />
                                            <code>{formData.heroBgColor}</code>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Service Graphic</label>
                                        <div className="media-selector-box" onClick={() => setMediaOpen(true)} style={{ cursor: 'pointer', padding: '16px' }}>
                                            {formData.graphic ? (
                                                <img src={formData.graphic} alt="Graphic Preview" style={{ maxWidth: '100%', maxHeight: '60px', marginBottom: '8px', borderRadius: '4px' }} />
                                            ) : (
                                                <ImageIcon size={24} />
                                            )}
                                            <p style={{ margin: '4px 0', fontSize: '11px' }}>{formData.graphic ? 'Click to change' : 'Select graphic'}</p>
                                            <Button variant="secondary" size="sm">Change</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'offers' && (
                            <div className="offers-tab">
                                <div className="section-header">
                                    <h3>Service Offerings</h3>
                                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => addRepeatable('offers')}>Add Offer Item</Button>
                                </div>
                                <div className="repeatable-list">
                                    {formData.offers.map((offer, i) => (
                                        <div key={offer.id} className="repeatable-row">
                                            <div className="move-controls">
                                                <button className="move-btn" onClick={() => moveRepeatable('offers', i, 'up')} disabled={i === 0}>
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button className="move-btn" onClick={() => moveRepeatable('offers', i, 'down')} disabled={i === formData.offers.length - 1}>
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                            <div className="icon-editor">
                                                <div
                                                    className="icon-preview"
                                                    dangerouslySetInnerHTML={{ __html: offer.icon }}
                                                    title="SVG Preview"
                                                />
                                                <textarea
                                                    className="form-input icon-textarea"
                                                    value={offer.icon}
                                                    onChange={(e) => updateRepeatable('offers', offer.id, 'icon', e.target.value)}
                                                    placeholder="SVG Code..."
                                                />
                                            </div>
                                            <div className="row-inputs">
                                                <input type="text" className="form-input" value={offer.title} onChange={(e) => updateRepeatable('offers', offer.id, 'title', e.target.value)} placeholder="Title (e.g. Visual Identity)" />
                                                <textarea className="form-input tall-input" value={offer.text} onChange={(e) => updateRepeatable('offers', offer.id, 'text', e.target.value)} placeholder="Description text..."></textarea>
                                            </div>
                                            <button className="del-btn" onClick={() => removeRepeatable('offers', offer.id)}><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'process' && (
                            <div className="process-tab">
                                <div className="section-header">
                                    <h3>Service Process</h3>
                                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => addRepeatable('process')}>Add Process Step</Button>
                                </div>
                                <div className="repeatable-list">
                                    {formData.process.map((step, i) => (
                                        <div key={step.id} className="repeatable-row">
                                            <div className="move-controls">
                                                <button className="move-btn" onClick={() => moveRepeatable('process', i, 'up')} disabled={i === 0}>
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button className="move-btn" onClick={() => moveRepeatable('process', i, 'down')} disabled={i === formData.process.length - 1}>
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                            <div className="step-num">Step {String(i + 1).padStart(2, '0')}</div>
                                            <div className="row-inputs">
                                                <input type="text" className="form-input" value={step.title} onChange={(e) => updateRepeatable('process', step.id, 'title', e.target.value)} placeholder="Step Title" />
                                                <textarea className="form-input tall-input" value={step.text} onChange={(e) => updateRepeatable('process', step.id, 'text', e.target.value)} placeholder="Step process description..."></textarea>
                                            </div>
                                            <button className="del-btn" onClick={() => removeRepeatable('process', step.id)}><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'benefits' && (
                            <div className="benefits-tab">
                                <div className="section-header">
                                    <h3>Service Benefits</h3>
                                    <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => addRepeatable('benefits')}>Add Benefit</Button>
                                </div>
                                <div className="repeatable-list">
                                    {formData.benefits.map((benefit, i) => (
                                        <div key={benefit.id} className="repeatable-row">
                                            <div className="move-controls">
                                                <button className="move-btn" onClick={() => moveRepeatable('benefits', i, 'up')} disabled={i === 0}>
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button className="move-btn" onClick={() => moveRepeatable('benefits', i, 'down')} disabled={i === formData.benefits.length - 1}>
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                            <input type="text" className="form-input" value={benefit.text} onChange={(e) => updateRepeatable('benefits', benefit.id, 'text', e.target.value)} placeholder="e.g. Consistent Brand Voice" />
                                            <button className="del-btn" onClick={() => removeRepeatable('benefits', benefit.id)}><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="preview-panel">
                        <div className="preview-title">Real-time Preview</div>
                        <div className="preview-container">
                            {activeTab === 'overview' && (
                                <div className="preview-card custom-theme" style={{ '--theme-bg': formData.theme }}>
                                    <div className="preview-card-link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="7" y1="17" x2="17" y2="7"></line>
                                            <polyline points="7 7 17 7 17 17"></polyline>
                                        </svg>
                                    </div>
                                    <div className="preview-card-top">
                                        {formData.graphic && <img src={formData.graphic} alt="Graphic" className="preview-card-graphic" />}
                                    </div>
                                    <div className="preview-card-content">
                                        <h3 className="preview-card-title">{formData.name || 'Service Title'}</h3>
                                        <div className="preview-card-tags">
                                            {formData.tags?.map((tag, idx) => (
                                                <span key={idx} className="preview-card-tag">{tag}</span>
                                            ))}
                                            {(!formData.tags || formData.tags.length === 0) && <span className="preview-card-tag" style={{ opacity: 0.5 }}>Tags here</span>}
                                        </div>
                                        <p className="preview-card-description">{formData.description || 'Describe your service to attract clients...'}</p>
                                        <button className="preview-card-btn">Learn More</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'offers' && (
                                <div className="preview-offers-grid">
                                    <div className="section-badge mb-2"><span className="tag-pill" style={{ color: 'var(--accent-blue)' }}>Solutions</span></div>
                                    <h4 className="mb-2" style={{ fontSize: '14px', fontWeight: 700 }}>What we offer</h4>
                                    {formData.offers?.map((offer, idx) => (
                                        <div key={idx} className="preview-offer-card">
                                            <div className="preview-offer-icon" dangerouslySetInnerHTML={{ __html: offer.icon || '✨' }} />
                                            <h5 className="preview-offer-title">{offer.title || 'Offering Title'}</h5>
                                            <p className="preview-offer-text">{offer.text || 'Brief details about what is included...'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'process' && (
                                <div className="preview-process-list">
                                    <div className="section-badge mb-2"><span className="tag-pill" style={{ color: 'var(--accent-blue)' }}>Workflow</span></div>
                                    <h4 className="mb-2" style={{ fontSize: '14px', fontWeight: 700 }}>How we work</h4>
                                    {formData.process?.map((step, idx) => (
                                        <div key={idx} className="preview-process-item">
                                            <div className="preview-process-num">{String(idx + 1).padStart(2, '0')}</div>
                                            <div className="preview-process-content">
                                                <h5 className="preview-process-title">{step.title || `Step ${idx + 1}`}</h5>
                                                <p className="preview-process-text">{step.text || 'Describe what happens at this stage...'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'benefits' && (
                                <div className="preview-benefits-card">
                                    <h4 className="preview-benefits-headline">Why choose this service?</h4>
                                    <div className="preview-benefits-list">
                                        {formData.benefits?.map((benefit, idx) => (
                                            <div key={idx} className="preview-benefit-item">
                                                <span className="preview-benefit-check">✓</span>
                                                <span>{benefit.text || 'Add a benefit point...'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <MediaPickerModal
                isOpen={mediaOpen}
                onClose={() => setMediaOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default ServicesManager;
