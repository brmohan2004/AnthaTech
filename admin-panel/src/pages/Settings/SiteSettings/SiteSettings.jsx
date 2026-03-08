import React, { useState, useEffect } from 'react';
import './SiteSettings.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getSiteConfig, updateSiteConfigBatch } from '../../../api/content';

const defaultValues = {
    contact: {
        businessEmail: '',
        phone: '',
        address: '',
        mapUrl: '',
    },
    social: {
        instagram: '',
        linkedin: '',
        twitter: '',
        behance: '',
        github: '',
    },
    seo: {
        siteName: '',
        defaultTitle: '',
        defaultDesc: '',
        ogImage: '',
        perPage: [],
    },
};

const SiteSettings = ({ defaultTab = 'contact' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
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
                const rows = await getSiteConfig();
                const configMap = {};
                rows.forEach(r => { configMap[r.key] = r.value; });
                const loaded = {
                    contact: configMap.contact ? JSON.parse(configMap.contact) : defaultValues.contact,
                    social: configMap.social ? JSON.parse(configMap.social) : defaultValues.social,
                    seo: configMap.seo ? JSON.parse(configMap.seo) : defaultValues.seo,
                };
                setData(loaded);
                setSavedData(loaded);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load settings.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // track dirtiness for the current tab
    useEffect(() => {
        const current = data[activeTab];
        const orig = savedData[activeTab];
        setIsDirty(JSON.stringify(current) !== JSON.stringify(orig));
    }, [activeTab, data, savedData]);

    const handleChange = (tab, field, value) => {
        setData((prev) => ({
            ...prev,
            [tab]: { ...prev[tab], [field]: value },
        }));
    };

    const handleMetaChange = (index, field, value) => {
        setData((prev) => {
            const newArr = [...prev.seo.perPage];
            newArr[index] = { ...newArr[index], [field]: value };
            return { ...prev, seo: { ...prev.seo, perPage: newArr } };
        });
    };

    const addMetaRow = () => {
        setData((prev) => ({
            ...prev,
            seo: {
                ...prev.seo,
                perPage: [...prev.seo.perPage, { page: '', title: '', desc: '', ogImage: '' }],
            },
        }));
    };

    const removeMetaRow = (idx) => {
        setData((prev) => ({
            ...prev,
            seo: {
                ...prev.seo,
                perPage: prev.seo.perPage.filter((_, i) => i !== idx),
            },
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
                { key: activeTab, value: JSON.stringify(data[activeTab]) }
            ]);
            setSavedData(prev => ({ ...prev, [activeTab]: data[activeTab] }));
            setIsDirty(false);
            setToast({ type: 'success', message: 'Settings saved successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="site-settings">
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Settings &gt; <span>{activeTab === 'contact' ? 'Contact Info' : activeTab === 'social' ? 'Social Links' : 'SEO / Meta'}</span>
                </div>
                <div className="header-actions">
                    <Button
                        variant="ghost"
                        onClick={handleRevert}
                        disabled={!isDirty}
                    >
                        Revert
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!isDirty}
                    >
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="settings-tabs">
                <button
                    className={activeTab === 'contact' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('contact')}
                >
                    Contact Info
                </button>
                <button
                    className={activeTab === 'social' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('social')}
                >
                    Social Links
                </button>
                <button
                    className={activeTab === 'seo' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('seo')}
                >
                    SEO / Meta
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'contact' && (
                    <div className="tab-content">
                        <div className="form-group">
                            <label>Business Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={data.contact.businessEmail}
                                onChange={(e) => handleChange('contact', 'businessEmail', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.contact.phone}
                                onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Physical Address</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                value={data.contact.address}
                                onChange={(e) => handleChange('contact', 'address', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Map Embed URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.contact.mapUrl}
                                onChange={(e) => handleChange('contact', 'mapUrl', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="tab-content">
                        <div className="form-group">
                            <label>Instagram URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.instagram}
                                onChange={(e) => handleChange('social', 'instagram', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.linkedin}
                                onChange={(e) => handleChange('social', 'linkedin', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Twitter/X URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.twitter}
                                onChange={(e) => handleChange('social', 'twitter', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Behance URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.behance}
                                onChange={(e) => handleChange('social', 'behance', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>GitHub URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.github}
                                onChange={(e) => handleChange('social', 'github', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="tab-content">
                        <div className="form-group">
                            <label>Site Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.seo.siteName}
                                onChange={(e) => handleChange('seo', 'siteName', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Default Meta Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={data.seo.defaultTitle}
                                onChange={(e) => handleChange('seo', 'defaultTitle', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Default Meta Description</label>
                            <textarea
                                className="form-input"
                                rows={2}
                                value={data.seo.defaultDesc}
                                onChange={(e) => handleChange('seo', 'defaultDesc', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Default OG Image URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.seo.ogImage}
                                onChange={(e) => handleChange('seo', 'ogImage', e.target.value)}
                            />
                        </div>

                        <div className="form-section-divider">Per-Page Meta</div>
                        {data.seo.perPage.map((row, idx) => (
                            <div key={idx} className="meta-row">
                                <input
                                    type="text"
                                    className="form-input meta-input"
                                    placeholder="Page Name"
                                    value={row.page}
                                    onChange={(e) => handleMetaChange(idx, 'page', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input meta-input"
                                    placeholder="Title"
                                    value={row.title}
                                    onChange={(e) => handleMetaChange(idx, 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input meta-input"
                                    placeholder="Description"
                                    value={row.desc}
                                    onChange={(e) => handleMetaChange(idx, 'desc', e.target.value)}
                                />
                                <input
                                    type="url"
                                    className="form-input meta-input"
                                    placeholder="OG Image URL"
                                    value={row.ogImage}
                                    onChange={(e) => handleMetaChange(idx, 'ogImage', e.target.value)}
                                />
                                <button
                                    className="meta-remove"
                                    onClick={() => removeMetaRow(idx)}
                                    title="Remove row"
                                >✕</button>
                            </div>
                        ))}
                        <button className="add-meta-row" onClick={addMetaRow}>
                            + Add Row
                        </button>
                    </div>
                )}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SiteSettings;
