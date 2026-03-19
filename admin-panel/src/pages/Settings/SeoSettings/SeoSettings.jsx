import React, { useState, useEffect } from 'react';
import './SeoSettings.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getSiteConfig, updateSiteConfigBatch } from '../../../api/content';

const defaultValues = {
    siteName: '',
    defaultTitle: '',
    defaultDesc: '',
    ogImage: '',
    perPage: [],
};

const SeoSettings = () => {
    const [data, setData] = useState(defaultValues);
    const [savedData, setSavedData] = useState(defaultValues);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const configMap = await getSiteConfig();
                const loaded = configMap.seo ? (typeof configMap.seo === 'string' ? JSON.parse(configMap.seo) : configMap.seo) : defaultValues;
                setData(loaded);
                setSavedData(loaded);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load SEO settings.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        setIsDirty(JSON.stringify(data) !== JSON.stringify(savedData));
    }, [data, savedData]);

    const handleChange = (field, value) => {
        setData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleMetaChange = (index, field, value) => {
        setData((prev) => {
            const newArr = [...prev.perPage];
            newArr[index] = { ...newArr[index], [field]: value };
            return { ...prev, perPage: newArr };
        });
    };

    const addMetaRow = () => {
        setData((prev) => ({
            ...prev,
            perPage: [...prev.perPage, { page: '', title: '', desc: '', ogImage: '' }],
        }));
    };

    const removeMetaRow = (idx) => {
        setData((prev) => ({
            ...prev,
            perPage: prev.perPage.filter((_, i) => i !== idx),
        }));
    };

    const handleRevert = () => {
        setData(savedData);
        setToast({ type: 'warning', message: 'Changes reverted to last saved state.' });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSiteConfigBatch([
                { key: 'seo', value: JSON.stringify(data) }
            ]);
            setSavedData(data);
            setIsDirty(false);
            setToast({ type: 'success', message: 'SEO settings saved successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save SEO settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading SEO settings...</div>;
    }

    return (
        <div className="seo-settings">
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Settings &gt; <span>SEO / Meta</span>
                </div>
                <div className="header-actions">
                    <Button
                        variant="ghost"
                        onClick={handleRevert}
                        disabled={!isDirty || saving}
                    >
                        Revert
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </header>

            <div className="settings-content">
                <div className="tab-content">
                    <div className="form-section-header">Global Meta Defaults</div>
                    <div className="form-group">
                        <label>Site Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. AnthaTech"
                            value={data.siteName || ''}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Meta Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Title used when no specific page title is set"
                            value={data.defaultTitle || ''}
                            onChange={(e) => handleChange('defaultTitle', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Meta Description</label>
                        <textarea
                            className="form-input"
                            rows={2}
                            placeholder="Brief description of your site for search results"
                            value={data.defaultDesc || ''}
                            onChange={(e) => handleChange('defaultDesc', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Default OG Image URL</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="URL to image for social media sharing"
                            value={data.ogImage || ''}
                            onChange={(e) => handleChange('ogImage', e.target.value)}
                        />
                    </div>

                    <div className="form-section-divider">Per-Page Meta Tags</div>
                    <p className="section-description">
                        Customize how specific pages appear in search results and social media.
                    </p>
                    
                    <div className="meta-list">
                        {data.perPage && data.perPage.map((row, idx) => (
                            <div key={idx} className="meta-card">
                                <div className="meta-card-header">
                                    <input
                                        type="text"
                                        className="meta-page-name"
                                        placeholder="Page Name (e.g. Home, Services)"
                                        value={row.page}
                                        onChange={(e) => handleMetaChange(idx, 'page', e.target.value)}
                                    />
                                    <button
                                        className="meta-remove-btn"
                                        onClick={() => removeMetaRow(idx)}
                                        title="Remove page meta"
                                    >✕</button>
                                </div>
                                <div className="meta-card-body">
                                    <div className="meta-field">
                                        <label>Meta Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={row.title}
                                            onChange={(e) => handleMetaChange(idx, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="meta-field">
                                        <label>Meta Description</label>
                                        <textarea
                                            className="form-input"
                                            rows={2}
                                            value={row.desc}
                                            onChange={(e) => handleMetaChange(idx, 'desc', e.target.value)}
                                        />
                                    </div>
                                    <div className="meta-field">
                                        <label>OG Image URL</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={row.ogImage}
                                            onChange={(e) => handleMetaChange(idx, 'ogImage', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="add-meta-btn" onClick={addMetaRow}>
                        + Add Page Configuration
                    </button>
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SeoSettings;
