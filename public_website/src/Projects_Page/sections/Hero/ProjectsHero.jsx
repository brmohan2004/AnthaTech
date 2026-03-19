import React, { useState, useEffect } from 'react';
import { fetchPageHero } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import BackgroundAnimation from '../../../Shared/BackgroundAnimation/BackgroundAnimation';
import './ProjectsHero.css';

const ProjectsHero = () => {
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHero = () => {
        setLoading(true);
        setError(null);
        fetchPageHero('projects')
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
            <section className="projects-hero-section">
                <BackgroundAnimation />
                <div className="ph-container">
                    <div className="ph-loading">Loading Projects...</div>
                </div>
            </section>
        );
    }

    if (error || !hero) {
        return <ErrorMessage message={error || "Projects header configuration not found."} retry={loadHero} />;
    }

    return (
        <section className="projects-hero-section">
            <BackgroundAnimation />
            <div className="ph-container">
                <div className="ph-badge">
                    <span>{hero.badge_text || 'Our projects'}</span>
                </div>

                <h1 className="ph-title">
                    {hero.title_1 || 'Latest Projects'}
                    {hero.title_2 && <><br /><span className="ph-accent">{hero.title_2}</span></>}
                </h1>

                <p className="ph-subtitle">
                    {hero.description || "Every project is a journey. From the first spark of an idea to a brand identity that resonates across digital and physical spaces. With passion, precision and a knack for memorable and consistent design, these are the stories we've helped to tell."}
                </p>
            </div>
        </section>
    );
};

export default ProjectsHero;
