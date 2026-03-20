import React, { useState, useEffect } from 'react';
import { fetchPageHero } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import BackgroundAnimation from '../../../Shared/BackgroundAnimation/BackgroundAnimation';
import './InsightsHero.css';

const InsightsHero = () => {
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHero = () => {
        setLoading(true);
        setError(null);
        fetchPageHero('insights')
            .then(data => {
                if (data) {
                    setHero(data);
                }
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
            <section className="insights-hero-section">
                <BackgroundAnimation />
                <div className="ih-container">
                    <div className="skeleton skeleton-badge"></div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-subtitle"></div>
                </div>
            </section>
        );
    }

    // If fetchPageHero returns null (no config in DB), we can show fallback or error
    if (error || !hero) {
        return <ErrorMessage message={error || "Insights header configuration not found."} retry={loadHero} />;
    }

    return (
        <section className="insights-hero-section">
            <BackgroundAnimation />
            <div className="ih-container">
                <div className="ih-badge">
                    <span>{hero.badge_text || 'Blogs'}</span>
                </div>

                <h1 className="ih-title">
                    {hero.title_1 || 'Insights'}<br />
                    <span className="text-blue">{hero.title_2 || 'solutions'}</span>
                </h1>

                <p className="ih-subtitle">
                    {hero.description || 'Explore the ever-evolving digital landscape with insights on design, development, and business strategies.'}
                </p>
            </div>
        </section>
    );
};

export default InsightsHero;
