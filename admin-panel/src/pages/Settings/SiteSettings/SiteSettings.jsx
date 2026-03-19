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
        facebook: '',
        youtube: '',
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
                const configMap = await getSiteConfig();
                const loaded = {
                    contact: configMap.contact ? (typeof configMap.contact === 'string' ? JSON.parse(configMap.contact) : configMap.contact) : defaultValues.contact,
                    social: configMap.social ? (typeof configMap.social === 'string' ? JSON.parse(configMap.social) : configMap.social) : defaultValues.social,
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
                    Settings &gt; <span>{activeTab === 'contact' ? 'Contact Info' : 'Social Links'}</span>
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
                            <label>Map Link (Google Maps URL)</label>
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
                        <div className="form-group">
                            <label>Facebook URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.facebook}
                                onChange={(e) => handleChange('social', 'facebook', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>YouTube URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={data.social.youtube}
                                onChange={(e) => handleChange('social', 'youtube', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SiteSettings;
