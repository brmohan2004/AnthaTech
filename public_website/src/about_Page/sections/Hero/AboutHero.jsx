import React, { useState, useEffect } from 'react';
import { fetchAboutContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import './AboutHero.css';

const AboutHero = () => {
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHero = () => {
        setLoading(true);
        setError(null);
        fetchAboutContent('hero')
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
            <section className="about-hero-section">
                <div className="ah-container">
                    <div className="ah-loading">Loading Header...</div>
                </div>
            </section>
        );
    }

    if (error || !hero) {
        const fallback = {
            badge_text: 'About us',
            title_1: 'We are',
            title_2: 'Antha Tech',
            description: 'We are a digital design studio founded by tech passionate enthusiasts.'
        };
        const display = hero || fallback;
        
        return (
            <section className="about-hero-section">
                <div className="ah-container">
                    <div className="ah-badge">
                        <span>{display.badge_text}</span>
                    </div>

                    <h1 className="ah-title">
                        {display.title_1}<br />
                        <span className="text-blue">{display.title_2}</span>
                    </h1>

                    <p className="ah-subtitle">
                        {display.description}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="about-hero-section">
            <div className="ah-container">
                <div className="ah-badge">
                    <span>{hero.badge_text}</span>
                </div>

                <h1 className="ah-title">
                    {hero.title_1}<br />
                    <span className="text-blue">{hero.title_2}</span>
                </h1>

                <p className="ah-subtitle">
                    {hero.description}
                </p>
            </div>
        </section>
    );
};

export default AboutHero;
