import React, { useState, useEffect } from 'react';
import './SiteSettings.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getSiteConfig, updateSiteConfigBatch, getCountrySettings, updateCountrySettings, deleteCountrySetting } from '../../../api/content';

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
    const [pricingList, setPricingList] = useState([]);
    const [savedPricingList, setSavedPricingList] = useState([]);
    const [deletedCountries, setDeletedCountries] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [configMap, countries] = await Promise.all([
                    getSiteConfig(),
                    getCountrySettings()
                ]);

                const loaded = {
                    contact: configMap.contact ? (typeof configMap.contact === 'string' ? JSON.parse(configMap.contact) : configMap.contact) : defaultValues.contact,
                    social: configMap.social ? (typeof configMap.social === 'string' ? JSON.parse(configMap.social) : configMap.social) : defaultValues.social,
                };
                setData(loaded);
                setSavedData(loaded);
                setPricingList(countries);
                setSavedPricingList(countries);
            } catch (err) {
                setToast({ type: 'error', message: 'Failed to load settings.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // track dirtiness for the current tab
    useEffect(() => {
        if (activeTab === 'pricing') {
            setIsDirty(JSON.stringify(pricingList) !== JSON.stringify(savedPricingList));
            return;
        }
        const current = data[activeTab];
        const orig = savedData[activeTab];
        setIsDirty(JSON.stringify(current) !== JSON.stringify(orig));
    }, [activeTab, data, savedData, pricingList, savedPricingList]);

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
            if (activeTab === 'pricing') {
                // handle deletions
                const deletePromises = deletedCountries.map(id => {
                    if (typeof id === 'string' && id.length > 10) return deleteCountrySetting(id);
                    return Promise.resolve();
                });
                await Promise.all(deletePromises);
                
                await updateCountrySettings(pricingList);
                const updated = await getCountrySettings();
                setPricingList(updated);
                setSavedPricingList(updated);
                setDeletedCountries([]);
            } else {
                await updateSiteConfigBatch([
                    { key: activeTab, value: JSON.stringify(data[activeTab]) }
                ]);
                setSavedData(prev => ({ ...prev, [activeTab]: data[activeTab] }));
            }
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
                <button
                    className={activeTab === 'pricing' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('pricing')}
                >
                    Country & Pricing
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

                {activeTab === 'pricing' && (
                    <div className="tab-content">
                        <div className="pricing-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p className="tab-description" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Configure country-specific billing details. These affect the contact forms on the public website.
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => {
                                const newCountry = {
                                    id: Date.now(), // temporary numeric id
                                    name: '',
                                    code: '',
                                    phone_code: '+',
                                    currency: '',
                                    budgets: [''],
                                    is_active: true
                                };
                                setPricingList([...pricingList, newCountry]);
                            }}>
                                + Add Country
                            </Button>
                        </div>

                        <div className="countries-list" style={{ display: 'grid', gap: '24px' }}>
                            {pricingList.map((country, index) => (
                                <div key={country.id} className="country-card" style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <h4 style={{ margin: 0 }}>Country #{index + 1}</h4>
                                        <button 
                                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '13px' }}
                                            onClick={() => {
                                                setDeletedCountries([...deletedCountries, country.id]);
                                                setPricingList(pricingList.filter(c => c.id !== country.id));
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div className="form-group">
                                            <label>Country Name</label>
                                            <input 
                                                className="form-input" 
                                                value={country.name} 
                                                placeholder="e.g. India"
                                                onChange={e => {
                                                    const updated = [...pricingList];
                                                    updated[index].name = e.target.value;
                                                    setPricingList(updated);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Country Code (ISO)</label>
                                            <input 
                                                className="form-input" 
                                                value={country.code} 
                                                placeholder="e.g. IN"
                                                onChange={e => {
                                                    const updated = [...pricingList];
                                                    updated[index].code = e.target.value;
                                                    setPricingList(updated);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div className="form-group">
                                            <label>Phone Code</label>
                                            <input 
                                                className="form-input" 
                                                value={country.phone_code} 
                                                placeholder="+91"
                                                onChange={e => {
                                                    const updated = [...pricingList];
                                                    updated[index].phone_code = e.target.value;
                                                    setPricingList(updated);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Currency Symbol</label>
                                            <input 
                                                className="form-input" 
                                                value={country.currency} 
                                                placeholder="₹"
                                                onChange={e => {
                                                    const updated = [...pricingList];
                                                    updated[index].currency = e.target.value;
                                                    setPricingList(updated);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Budget Ranges (Comma separated)</label>
                                        <textarea 
                                            className="form-input" 
                                            value={country.budgets.join(', ')} 
                                            placeholder="< ₹80k, ₹80k - ₹4L, ₹4L+"
                                            rows={2}
                                            onChange={e => {
                                                const updated = [...pricingList];
                                                updated[index].budgets = e.target.value.split(',').map(s => s.trim());
                                                setPricingList(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SiteSettings;
