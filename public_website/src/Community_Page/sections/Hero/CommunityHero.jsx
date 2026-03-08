import React, { useState, useEffect } from 'react';
import { fetchCommunityContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import './CommunityHero.css';

const CommunityHero = () => {
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHero = () => {
        setLoading(true);
        setError(null);
        fetchCommunityContent('teaser')
            .then(data => {
                setHero(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadHero();
    }, []);

    if (loading) {
        return (
            <section className="cp-hero">
                <div className="cp-hero-inner">
                    <div className="cp-hero-loading">Loading Community Header...</div>
                </div>
            </section>
        );
    }

    if (error || !hero) {
        const fallback = {
            badge_text: 'Community',
            title_1: 'Join our',
            title_2: 'creative network',
            description: 'Connect with developers, designers, and tech enthusiasts building the future.',
            tags: ['Networking', 'Growth', 'Mentorship']
        };
        const display = hero || fallback;

        return (
            <section className="cp-hero">
                <div className="cp-hero-inner">
                    <div className="section-badge cp-hero-badge">
                        <span className="badge-text" style={{ textTransform: 'none' }}>{display.badge_text}</span>
                    </div>
                    <h1 className="cp-hero-title">
                        {display.title_1}<br />
                        <span className="cp-hero-accent">{display.title_2}</span>
                    </h1>
                    <p className="cp-hero-desc">
                        {display.description}
                    </p>
                    <a href="#apply" className="cp-hero-btn">{display.cta_label || "Apply Now — It's Free"}</a>
                </div>

                {display.tags?.length > 0 && (
                    <div className="cp-hero-tags">
                        {display.tags.map((t, i) => (
                            <span key={i} className="cp-tag">{t}</span>
                        ))}
                    </div>
                )}
            </section>
        );
    }

    const tags = Array.isArray(hero.tracks) ? hero.tracks : [];

    return (
        <section className="cp-hero">
            <div className="cp-hero-inner">
                <div className="section-badge cp-hero-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>{hero.badge_text || 'Community'}</span>
                </div>
                <h1 className="cp-hero-title">
                    {hero.title_1}<br />
                    <span className="cp-hero-accent">{hero.title_2}</span>
                </h1>
                <p className="cp-hero-desc">
                    {hero.description}
                </p>
                <a href="#apply" className="cp-hero-btn">{hero.cta_text || "Apply Now — It's Free"}</a>
            </div>

            {Array.isArray(hero.stats) && hero.stats.length > 0 && (
                <div className="cp-hero-stats">
                    {hero.stats.map((s, i) => (
                        <div key={i} className="cp-stat">
                            <span className="cp-stat-value">{s.value}</span>
                            <span className="cp-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {tags.length > 0 && (
                <div className="cp-hero-tags">
                    {tags.map((t, i) => (
                        <span key={i} className="cp-tag">{typeof t === 'object' ? (t.label || t.title || '') : t}</span>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CommunityHero;
