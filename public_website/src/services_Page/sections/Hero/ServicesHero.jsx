import React, { useState, useEffect } from 'react';
import { fetchPageHero } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import BackgroundAnimation from '../../../Shared/BackgroundAnimation/BackgroundAnimation';
import './ServicesHero.css';

const ServicesHero = () => {
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHero = () => {
        setLoading(true);
        setError(null);
        fetchPageHero('services')
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
            <section className="services-hero-section">
                <BackgroundAnimation />
                <div className="sh-container">
                    <div className="skeleton skeleton-badge"></div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-subtitle"></div>
                </div>
            </section>
        );
    }

    if (error || !hero) {
        // Fallback to static content if no DB config
        const fallback = {
            badge_text: 'Our Services',
            title_1: 'Crafting digital',
            title_2: 'solutions',
            description: "memorable and consistent design, these are the stories we've helped to tell."
        };
        const display = hero || fallback;

        return (
            <section className="services-hero-section">
                <BackgroundAnimation />
                <div className="sh-container">
                    <div className="sh-badge">
                        <span>{display.badge_text}</span>
                    </div>

                    <h1 className="sh-title">
                        {display.title_1}<br />
                        <span className="text-blue">{display.title_2}</span>
                    </h1>

                    <p className="sh-subtitle">
                        {display.description}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="services-hero-section">
            <BackgroundAnimation />
            <div className="sh-container">
                <div className="sh-badge">
                    <span>{hero.badge_text || 'Our Services'}</span>
                </div>

                <h1 className="sh-title">
                    {hero.title_1 || 'Crafting digital'}<br />
                    <span className="text-blue">{hero.title_2 || 'solutions'}</span>
                </h1>

                <p className="sh-subtitle">
                    {hero.description || "memorable and consistent design, these are the stories we've helped to tell."}
                </p>
            </div>
        </section>
    );
};

export default ServicesHero;
