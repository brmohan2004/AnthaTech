import React from 'react';
import { Globe, Search, Plus, X } from 'lucide-react';
import './MetaTagsTab.css';

const ROBOTS_OPTIONS = [
    'index, follow',
    'index, nofollow',
    'noindex, follow',
    'noindex, nofollow',
    'noarchive',
    'nosnippet',
];

const MetaTagsTab = ({ meta, setMeta, charStatus, addPerPage, updatePerPage, removePerPage }) => {
    const ch = (f, v) => setMeta(p => ({ ...p, [f]: v }));
    return (
        <div className="seo-panel">
            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><Globe size={18} /></span>
                    Global Meta Defaults
                </div>
                <p className="seo-section-desc">These defaults apply to all pages unless overridden per-page below.</p>
            </div>

            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>Site Name</label>
                    <input className="seo-input" placeholder="e.g. AnthaTech" value={meta.siteName || ''} onChange={e => ch('siteName', e.target.value)} />
                </div>
                <div className="seo-form-group">
                    <label>Author / Publisher</label>
                    <input className="seo-input" placeholder="e.g. Antha Tech Team" value={meta.author || ''} onChange={e => ch('author', e.target.value)} />
                </div>
            </div>

            <div className="seo-form-group">
                <label>Default Meta Title <span className="label-hint">(50–60 chars recommended)</span></label>
                <input className="seo-input" placeholder="Your compelling page title for search engines" value={meta.defaultTitle || ''} onChange={e => ch('defaultTitle', e.target.value)} />
                <span className={`char-counter ${charStatus(meta.defaultTitle, 50, 60)}`}>{(meta.defaultTitle || '').length} / 60</span>
            </div>

            <div className="seo-form-group">
                <label>Default Meta Description <span className="label-hint">(150–160 chars recommended)</span></label>
                <textarea className="seo-input" rows={2} placeholder="Brief, compelling description of your site" value={meta.defaultDesc || ''} onChange={e => ch('defaultDesc', e.target.value)} />
                <span className={`char-counter ${charStatus(meta.defaultDesc, 150, 160)}`}>{(meta.defaultDesc || '').length} / 160</span>
            </div>

            <div className="seo-form-group">
                <label>Meta Keywords <span className="label-hint">(comma-separated, max 10)</span></label>
                <input className="seo-input" placeholder="web development, design, chennai, digital agency" value={meta.keywords || ''} onChange={e => ch('keywords', e.target.value)} />
                <span className={`char-counter ${(meta.keywords || '').split(',').filter(k => k.trim()).length <= 10 ? 'good' : 'bad'}`}>
                    {(meta.keywords || '').split(',').filter(k => k.trim()).length} / 10 keywords
                </span>
            </div>

            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>Default OG Image URL</label>
                    <input className="seo-input" type="url" placeholder="https://..." value={meta.ogImage || ''} onChange={e => ch('ogImage', e.target.value)} />
                </div>
                <div className="seo-form-group">
                    <label>Canonical Base URL</label>
                    <input className="seo-input" type="url" placeholder="https://anthatech.me" value={meta.canonicalBase || ''} onChange={e => ch('canonicalBase', e.target.value)} />
                </div>
            </div>

            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>Default Robots Meta</label>
                    <select className="seo-input" value={meta.robotsMeta || 'index, follow'} onChange={e => ch('robotsMeta', e.target.value)}>
                        {ROBOTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
                <div className="seo-form-group">
                    <label>Language / Locale</label>
                    <select className="seo-input" value={meta.language || 'en_US'} onChange={e => ch('language', e.target.value)}>
                        <option value="en_US">English (US)</option>
                        <option value="en_GB">English (UK)</option>
                        <option value="en_IN">English (India)</option>
                        <option value="ta_IN">Tamil (India)</option>
                    </select>
                </div>
            </div>

            {/* SERP Preview */}
            <div className="serp-preview">
                <div className="serp-preview-title">
                    <Search size={14} /> Google SERP Preview
                </div>
                <div className="serp-card">
                    <div className="serp-url">
                        <Globe size={12} />
                        {meta.canonicalBase || 'https://your-domain.com'}
                    </div>
                    <div className="serp-title">
                        {meta.defaultTitle || 'Your Page Title Will Appear Here'}
                    </div>
                    <div className="serp-desc">
                        {meta.defaultDesc || 'Your meta description will appear here. Write a compelling description to improve click-through rates from search results.'}
                    </div>
                </div>
            </div>

            {/* Per-Page */}
            <div>
                <div className="seo-section-title">Per-Page Meta Overrides</div>
                <p className="seo-section-desc">Customize how specific pages appear in search results and social media.</p>
            </div>

            <div className="page-meta-list">
                {(meta.perPage || []).map((row, idx) => (
                    <div key={idx} className="page-meta-card">
                        <div className="page-meta-card-header">
                            <input placeholder="Page Name (e.g. Home, Services)" value={row.page} onChange={e => updatePerPage(idx, 'page', e.target.value)} />
                            <button className="page-meta-remove" onClick={() => removePerPage(idx)} title="Remove"><X size={14} /></button>
                        </div>
                        <div className="page-meta-card-body">
                            <div className="seo-form-group">
                                <label>Meta Title</label>
                                <input className="seo-input" value={row.title || ''} onChange={e => updatePerPage(idx, 'title', e.target.value)} />
                                <span className={`char-counter ${charStatus(row.title, 50, 60)}`}>{(row.title || '').length} / 60</span>
                            </div>
                            <div className="seo-form-group">
                                <label>Meta Description</label>
                                <textarea className="seo-input" rows={2} value={row.desc || ''} onChange={e => updatePerPage(idx, 'desc', e.target.value)} />
                                <span className={`char-counter ${charStatus(row.desc, 150, 160)}`}>{(row.desc || '').length} / 160</span>
                            </div>
                            <div className="seo-form-row">
                                <div className="seo-form-group">
                                    <label>OG Image URL</label>
                                    <input className="seo-input" type="url" value={row.ogImage || ''} onChange={e => updatePerPage(idx, 'ogImage', e.target.value)} />
                                </div>
                                <div className="seo-form-group">
                                    <label>Robots Meta</label>
                                    <select className="seo-input" value={row.robotsMeta || 'index, follow'} onChange={e => updatePerPage(idx, 'robotsMeta', e.target.value)}>
                                        {ROBOTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="seo-add-btn" onClick={addPerPage}>
                <Plus size={16} /> Add Page Configuration
            </button>
        </div>
    );
};

export default MetaTagsTab;
