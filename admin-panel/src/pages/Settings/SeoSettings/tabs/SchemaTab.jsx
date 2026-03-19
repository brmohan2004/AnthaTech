import React, { useMemo } from 'react';
import { Code2, Eye, Copy, Check, AlertTriangle, ExternalLink, FileCode2 } from 'lucide-react';
import './SchemaTab.css';

const SCHEMA_TYPES = [
    { id: 'organization', label: 'Organization', icon: '🏢' },
    { id: 'localBusiness', label: 'Local Business', icon: '📍' },
    { id: 'website', label: 'WebSite', icon: '🌐' },
    { id: 'service', label: 'Service', icon: '⚙️' },
    { id: 'faqPage', label: 'FAQ Page', icon: '❓' },
    { id: 'breadcrumb', label: 'Breadcrumb', icon: '🔗' },
    { id: 'article', label: 'Article', icon: '📝' },
    { id: 'review', label: 'Review', icon: '⭐' },
];

const SchemaTab = ({ schema, setSchema, generatedSchema, copySchema, copiedSchema }) => {
    const ch = (f, v) => setSchema(p => ({ ...p, [f]: v }));
    const isValidJson = useMemo(() => {
        try { JSON.parse(generatedSchema); return true; } catch { return false; }
    }, [generatedSchema]);

    return (
        <div className="seo-panel">
            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><Code2 size={18} /></span>
                    Structured Data (Schema.org)
                </div>
                <p className="seo-section-desc">Schema markup helps search engines understand your content and display rich results.</p>
            </div>

            <div className="seo-form-group">
                <label>Schema Type</label>
                <div className="schema-type-grid">
                    {SCHEMA_TYPES.map(t => (
                        <button key={t.id} className={`schema-type-card ${schema.activeType === t.id ? 'selected' : ''}`} onClick={() => ch('activeType', t.id)}>
                            <div className="schema-icon">{t.icon}</div>
                            <div className="schema-label">{t.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>Organization / Business Name</label>
                    <input className="seo-input" value={schema.orgName || ''} onChange={e => ch('orgName', e.target.value)} placeholder="Antha Tech" />
                </div>
                <div className="seo-form-group">
                    <label>Organization Description</label>
                    <input className="seo-input" value={schema.orgDesc || ''} onChange={e => ch('orgDesc', e.target.value)} placeholder="Premier digital agency in Chennai..." />
                </div>
            </div>
            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>Website URL</label>
                    <input className="seo-input" value={schema.orgUrl || ''} onChange={e => ch('orgUrl', e.target.value)} placeholder="https://anthatech.me" />
                </div>
                <div className="seo-form-group">
                    <label>Logo URL</label>
                    <input className="seo-input" value={schema.orgLogo || ''} onChange={e => ch('orgLogo', e.target.value)} placeholder="https://..." />
                </div>
                <div className="seo-form-group">
                    <label>Phone</label>
                    <input className="seo-input" value={schema.orgPhone || ''} onChange={e => ch('orgPhone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
            </div>
            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>Email</label>
                    <input className="seo-input" value={schema.orgEmail || ''} onChange={e => ch('orgEmail', e.target.value)} placeholder="info@anthatech.me" />
                </div>
                <div className="seo-form-group">
                    <label>Founding Date</label>
                    <input className="seo-input" type="text" value={schema.orgFoundingDate || ''} onChange={e => ch('orgFoundingDate', e.target.value)} placeholder="2024" />
                </div>
            </div>
            <div className="seo-form-group">
                <label>Street Address</label>
                <input className="seo-input" value={schema.orgAddress || ''} onChange={e => ch('orgAddress', e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>City</label>
                    <input className="seo-input" value={schema.orgCity || ''} onChange={e => ch('orgCity', e.target.value)} />
                </div>
                <div className="seo-form-group">
                    <label>Region / State</label>
                    <input className="seo-input" value={schema.orgRegion || ''} onChange={e => ch('orgRegion', e.target.value)} />
                </div>
            </div>
            <div className="seo-form-group">
                <label>Social Profile URLs <span className="label-hint">(comma-separated)</span></label>
                <input className="seo-input" value={schema.socialUrls || ''} onChange={e => ch('socialUrls', e.target.value)} placeholder="https://linkedin.com/..., https://instagram.com/..." />
            </div>

            <div className="seo-form-group">
                <label>Custom JSON-LD Override <span className="label-hint">(leave empty to use auto-generated)</span></label>
                <textarea className="seo-input" rows={4} value={schema.customJson || ''} onChange={e => ch('customJson', e.target.value)} placeholder='Paste custom JSON-LD here to override auto-generated schema...' style={{ fontFamily: "'Consolas', monospace", fontSize: '12px' }} />
            </div>

            <div className={`schema-status ${isValidJson ? 'valid' : 'warning'}`}>
                {isValidJson ? <><Check size={16} /> Valid JSON-LD</> : <><AlertTriangle size={16} /> Invalid JSON</>}
            </div>

            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><Eye size={18} /></span>
                    JSON-LD Preview
                </div>
            </div>
            <div className="schema-preview-box">
                <button className="copy-btn" onClick={copySchema}>
                    {copiedSchema ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
                <pre>{generatedSchema}</pre>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="seo-inline-btn">
                    <ExternalLink size={14} /> Test with Google Rich Results
                </a>
                <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="seo-inline-btn">
                    <FileCode2 size={14} /> Schema Validator
                </a>
            </div>
        </div>
    );
};

export default SchemaTab;
