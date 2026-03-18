import React, { useState, useEffect } from 'react';
import './Hero.css';
import { Save, RotateCcw, Image as ImageIcon, Plus, X, UploadCloud, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';
import { getHeroContent, updateHeroContent, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { uploadFile, generateFilePath } from '../../../api/media';
import { useAuth } from '../../../contexts/AuthContext';

const emptyData = {
    badge: '',
    title1: '',
    title2: '',
    subtitle1: '',
    subtitle2: '',
    primary_cta_text: '',
    primary_cta_link: '/services',
    secondary_cta_text: '',
    logos: [],
};

const HeroManager = () => {
    const { canEdit, checkPermission } = useAuth();
    const hasEditPermission = canEdit('content-hero');
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
                const data = await getHeroContent();
                const mapped = {
                    badge: data.badge || '',
                    title1: data.title1 || '',
                    title2: data.title2 || '',
                    subtitle1: data.subtitle1 || '',
                    subtitle2: data.subtitle2 || '',
                    primary_cta_text: data.primary_cta_text || '',
                    primary_cta_link: data.primary_cta_link || '/services',
                    secondary_cta_text: data.secondary_cta_text || '',
                    logos: data.logos || [],
                };
                setFormData(mapped);
                setSavedData(mapped);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load hero content.' });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Check dirtiness
    useEffect(() => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedData);
        setIsDirty(hasChanges);
    }, [formData, savedData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRevert = () => {
        setFormData(savedData);
        setToast({ type: 'warning', message: 'Changes reverted to last saved state.' });
    };

    const handleSave = async () => {
        if (!checkPermission('content-hero')) {
            setToast({ type: 'error', message: 'Read-only access: You do not have permission to modify this section.' });
            return;
        }
        setSaving(true);
        try {
            await updateHeroContent(formData);
            setSavedData(formData);
            setIsDirty(false);
            setToast({ type: 'success', message: 'Hero section saved successfully.' });

            // Add Audit Log Entry
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Updated Hero Section: "${formData.title1} ${formData.title2}"`,
                    result: 'success'
                });
            } catch (auditErr) {
                console.warn('Failed to log hero update:', auditErr);
            }
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save hero content.' });
        } finally {
            setSaving(false);
        }
    };

    const removeLogo = (id) => {
        setFormData((prev) => ({
            ...prev,
            logos: prev.logos.filter((logo) => logo.id !== id),
        }));
    };

    const handleMediaSelect = (url) => {
        const newLogo = {
            id: Date.now(),
            url: url
        };
        setFormData(prev => ({
            ...prev,
            logos: [...prev.logos, newLogo]
        }));
        setToast({ type: 'success', message: 'Logo added from media library.' });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const path = generateFilePath('hero-logos', file.name);
            const url = await uploadFile(path, file);

            const newLogo = {
                id: Date.now(),
                url: url
            };

            setFormData(prev => ({
                ...prev,
                logos: [...prev.logos, newLogo]
            }));

            setToast({ type: 'success', message: 'Logo uploaded successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload logo.' });
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading hero content...</div>;

    return (
        <div className="hero-manager">
            {/* Header */}
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Content &gt; <span>Hero Section</span>
                    {!hasEditPermission && <span className="readonly-badge" style={{ marginLeft: 12, fontSize: 10, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>READ ONLY</span>}
                </div>
                <div className="header-actions">
                    <Button
                        variant="ghost"
                        icon={<RotateCcw size={16} />}
                        onClick={handleRevert}
                        disabled={!isDirty || !hasEditPermission}
                    >
                        Revert
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Save size={16} />}
                        onClick={handleSave}
                        disabled={!isDirty}
                    >
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="manager-content">
                {/* FORM PANEL */}
                <div className="form-panel">
                    <h2 className="panel-title">Form Panel</h2>

                    <div className="form-group">
                        <label>Badge Text</label>
                        <input
                            type="text"
                            name="badge"
                            value={formData.badge}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                Title Line 1
                                <span className="char-count">{formData.title1.length}/30</span>
                            </label>
                            <input
                                type="text"
                                name="title1"
                                value={formData.title1}
                                onChange={handleChange}
                                maxLength={30}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                Title Line 2 (Gradient)
                                <span className="char-count">{formData.title2.length}/30</span>
                            </label>
                            <input
                                type="text"
                                name="title2"
                                value={formData.title2}
                                onChange={handleChange}
                                maxLength={30}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Subtitle Line 1</label>
                        <input
                            type="text"
                            name="subtitle1"
                            value={formData.subtitle1}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Subtitle Line 2</label>
                        <input
                            type="text"
                            name="subtitle2"
                            value={formData.subtitle2}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-section-divider">CTA Buttons</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Primary Button Text</label>
                            <input
                                type="text"
                                name="primary_cta_text"
                                value={formData.primary_cta_text}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Primary Route</label>
                            <select
                                name="primary_cta_link"
                                value={formData.primary_cta_link}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="/services">/services</option>
                                <option value="/projects">/projects</option>
                                <option value="/about">/about</option>
                                <option value="/contact">/contact</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Secondary Button Text</label>
                        <input
                            type="text"
                            name="secondary_cta_text"
                            value={formData.secondary_cta_text}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-section-divider">Trusted By — Client Logos</div>

                    <div className="logos-grid">
                        {formData.logos.map((logo) => (
                            <div className="logo-preview-card" key={logo.id}>
                                <img src={logo.url} alt={`Client logo ${logo.id}`} />
                                <button
                                    className="logo-remove-btn"
                                    onClick={() => removeLogo(logo.id)}
                                    title="Remove logo"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            className="add-logo-btn"
                            type="button"
                            onClick={() => setIsMediaOpen(true)}
                        >
                            <ImageIcon size={20} />
                            <span>Media Library</span>
                        </button>
                        <label className="add-logo-btn">
                            <UploadCloud size={20} />
                            <span>Upload New</span>
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

                {/* PREVIEW PANEL */}
                <div className="preview-panel">
                    <h2 className="panel-title">Preview Panel (approx.)</h2>

                    <div className="preview-canvas">
                        {/* Visual simulation of the public website hero */}
                        <div className="hero-sim">
                            <div className="hero-sim-badge">{formData.badge || 'Badge Text'}</div>
                            <h1 className="hero-sim-title">
                                <span className="title-plain">{formData.title1 || 'Line 1'}</span>
                                <br />
                                <span className="title-gradient">{formData.title2 || 'Line 2'}</span>
                            </h1>
                            <p className="hero-sim-subtitle">
                                {formData.subtitle1} <br /> {formData.subtitle2}
                            </p>

                            <div className="hero-sim-ctas">
                                <button className="sim-btn sim-btn-primary">
                                    {formData.primaryCtaText}
                                    <span className="sim-btn-arrow">→</span>
                                </button>
                                <button className="sim-btn sim-btn-secondary">
                                    {formData.secondaryCtaText}
                                </button>
                            </div>

                            <div className="hero-sim-trusted">
                                <p>They trusted us</p>
                                <div className="sim-logos">
                                    {formData.logos.map((logo) => (
                                        <img src={logo.url} alt="Logo" key={logo.id} />
                                    ))}
                                    {formData.logos.length === 0 && (
                                        <span className="sim-no-logos">No logos added</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

export default HeroManager;
