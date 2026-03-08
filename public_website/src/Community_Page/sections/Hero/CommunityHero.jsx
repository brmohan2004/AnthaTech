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
        fetchCommunityContent('hero')
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
        return <ErrorMessage message={error} retry={loadHero} />;
    }

    const tags = Array.isArray(hero.tags) ? hero.tags : [];

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
                <a href="#apply" className="cp-hero-btn">{hero.cta_label || "Apply Now — It's Free"}</a>
            </div>

            {tags.length > 0 && (
                <div className="cp-hero-tags">
                    {tags.map((t, i) => (
                        <span key={i} className="cp-tag">{t}</span>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CommunityHero;
