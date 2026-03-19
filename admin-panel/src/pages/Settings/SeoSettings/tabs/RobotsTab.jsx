import React from 'react';
import { Bot, Eye, Plus, X } from 'lucide-react';
import './RobotsTab.css';

const RobotsTab = ({ robots, setRobots, robotsPreview, newRule, setNewRule, addRobotsRule, removeRobotsRule }) => {
    const togglePredefined = (key) => {
        setRobots(p => ({ ...p, predefined: { ...p.predefined, [key]: !p.predefined[key] } }));
    };

    return (
        <div className="seo-panel">
            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><Bot size={18} /></span>
                    Robots.txt Configuration
                </div>
                <p className="seo-section-desc">Control which parts of your site search engine crawlers can access.</p>
            </div>

            <div className="seo-form-row">
                <div className="seo-form-group">
                    <label>User-Agent</label>
                    <input className="seo-input" value={robots.userAgent || '*'} onChange={e => setRobots(p => ({ ...p, userAgent: e.target.value }))} />
                </div>
                <div className="seo-form-group">
                    <label>Crawl Delay (seconds)</label>
                    <input className="seo-input" type="number" min="0" value={robots.crawlDelay || '10'} onChange={e => setRobots(p => ({ ...p, crawlDelay: e.target.value }))} />
                </div>
            </div>

            {/* Pre-defined Rules */}
            <div className="seo-form-group">
                <label>Quick Rules</label>
                <div className="robots-predefined">
                    {[
                        ['blockAdmin', 'Block /admin'],
                        ['blockLogin', 'Block /login'],
                        ['blockSearch', 'Block /search'],
                        ['blockApi', 'Block /api'],
                        ['blockPrint', 'Block /print'],
                        ['blockThankYou', 'Block /thank-you'],
                    ].map(([key, label]) => (
                        <label key={key} className="robots-checkbox">
                            <input type="checkbox" checked={robots.predefined?.[key] || false} onChange={() => togglePredefined(key)} />
                            {label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Current Rules */}
            <div className="seo-form-group">
                <label>Active Rules</label>
                <div className="robots-rules-list">
                    {(robots.allowPaths || []).map((p, i) => (
                        <div key={`a-${i}`} className="robots-rule-row">
                            <span className="rule-type allow">Allow</span>
                            <span className="rule-path">{p}</span>
                            <button className="rule-remove" onClick={() => removeRobotsRule('Allow', i)}><X size={14} /></button>
                        </div>
                    ))}
                    {(robots.disallowPaths || []).map((p, i) => (
                        <div key={`d-${i}`} className="robots-rule-row">
                            <span className="rule-type disallow">Disallow</span>
                            <span className="rule-path">{p}</span>
                            <button className="rule-remove" onClick={() => removeRobotsRule('Disallow', i)}><X size={14} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule */}
            <div className="add-rule-form">
                <select value={newRule.type} onChange={e => setNewRule(p => ({ ...p, type: e.target.value }))}>
                    <option value="Allow">Allow</option>
                    <option value="Disallow">Disallow</option>
                </select>
                <input placeholder="/path-to-block" value={newRule.path} onChange={e => setNewRule(p => ({ ...p, path: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addRobotsRule()} />
                <button className="seo-inline-btn primary" onClick={addRobotsRule}>
                    <Plus size={14} /> Add Rule
                </button>
            </div>

            {/* Preview */}
            <div>
                <div className="seo-section-title">
                    <span className="section-icon"><Eye size={18} /></span>
                    robots.txt Preview
                </div>
            </div>
            <div className="robots-preview">
                <pre>{robotsPreview}</pre>
            </div>
        </div>
    );
};

export default RobotsTab;
