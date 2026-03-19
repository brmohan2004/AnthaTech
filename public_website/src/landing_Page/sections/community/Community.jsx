import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCommunityContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import './Community.css';

export default function Community() {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCommunity = () => {
        setLoading(true);
        setError(null);
        fetchCommunityContent('teaser')
            .then(data => {
                if (data) {
                    setContent(data);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadCommunity();
    }, []);

    if (loading) {
        return (
            <section className="community-teaser-section" id="community">
                <div className="ct-container">
                    <div className="ct-loading">Loading Community...</div>
                </div>
            </section>
        );
    }

    if (error || !content) {
        return <ErrorMessage message={error} retry={loadCommunity} />;
    }

    const stats = Array.isArray(content.stats) ? content.stats : [];
    const tracks = Array.isArray(content.tracks) ? content.tracks : [];
    const steps = Array.isArray(content.steps) && content.steps.length > 0
        ? content.steps
        : ['Request to Join', 'Verification', 'Join Community', 'Exclusive Projects'];

    return (
        <section className="community-teaser-section" id="community">
            <div className="ct-container">
                <div className="ct-header">
                    <div className="ct-header-left">
                        <div className="section-badge">
                            <span className="badge-text">Community</span>
                        </div>
                        <h2 className="ct-title">
                            <span className="ct-title-blue">{content.title_1 || 'Build together,'}</span><br />
                            <span className="ct-title-black">{content.title_2 || 'grow together.'}</span>
                        </h2>
                    </div>
                    <div className="ct-header-right">
                        <button className="ct-cta-btn" onClick={() => navigate('/community')}>
                            {content.cta_text || 'Apply to Join'}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="ct-grid">
                    <div className="ct-left">
                        <p className="ct-description">
                            {content.description}
                        </p>

                        <div className="ct-tracks">
                            {tracks.map((t, i) => (
                                <div key={i} className="ct-track-card">
                                    <span className="ct-track-icon">{t.icon}</span>
                                    <div>
                                        <p className="ct-track-label">{t.label}</p>
                                        <p className="ct-track-desc">{t.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ct-right">
                        <div className="ct-stats-grid">
                            {stats.map((s, i) => (
                                <div key={i} className="ct-stat-card">
                                    <p className="ct-stat-value">{s.value}</p>
                                    <p className="ct-stat-label">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="ct-process-visual">
                            {steps.map((step, i) => (
                                <div key={i} className="ct-process-step">
                                    <div className="ct-step-num">{String(i + 1).padStart(2, '0')}</div>
                                    <div className="ct-step-label">{typeof step === 'string' ? step : step.label}</div>
                                    {i < steps.length - 1 && <div className="ct-step-connector" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
