import React from 'react';
import { Map, RefreshCw, ExternalLink } from 'lucide-react';
import './SitemapTab.css';

const SitemapTab = ({ sitemap, setSitemap }) => {
    const updatePage = (idx, field, value) => {
        setSitemap(p => {
            const pages = [...p.pages];
            pages[idx] = { ...pages[idx], [field]: value };
            return { ...p, pages };
        });
    };

    return (
        <div className="seo-panel">
            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><Map size={18} /></span>
                    XML Sitemap Configuration
                </div>
                <p className="seo-section-desc">Control which pages are included in your sitemap and how search engines prioritize them.</p>
            </div>

            <div className="sitemap-header-row">
                <span>Page</span>
                <span>Priority</span>
                <span>Frequency</span>
                <span>Include</span>
            </div>

            <div className="sitemap-page-list">
                {(sitemap.pages || []).map((p, idx) => (
                    <div key={idx} className="sitemap-page-row">
                        <div>
                            <div className="page-name">{p.page}</div>
                            <div className="page-url">{p.url}</div>
                        </div>
                        <select value={p.priority || '0.8'} onChange={e => updatePage(idx, 'priority', e.target.value)}>
                            <option value="1.0">1.0 (Highest)</option>
                            <option value="0.8">0.8 (High)</option>
                            <option value="0.6">0.6 (Medium)</option>
                            <option value="0.4">0.4 (Low)</option>
                            <option value="0.2">0.2 (Lowest)</option>
                        </select>
                        <select value={p.frequency || 'weekly'} onChange={e => updatePage(idx, 'frequency', e.target.value)}>
                            <option value="always">Always</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="never">Never</option>
                        </select>
                        <label className="sitemap-toggle">
                            <input type="checkbox" checked={p.included !== false} onChange={e => updatePage(idx, 'included', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="seo-inline-btn primary">
                    <RefreshCw size={14} /> Regenerate Sitemap
                </button>
                <button className="seo-inline-btn">
                    <ExternalLink size={14} /> Ping Google
                </button>
                <button className="seo-inline-btn">
                    <ExternalLink size={14} /> Ping Bing
                </button>
            </div>
        </div>
    );
};

export default SitemapTab;
