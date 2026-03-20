import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './progress.css';
import ProgressCard from '../../../Shared/ProgressCard/ProgressCard';
import { fetchProcessSteps } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';

export default function Progress() {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProgress = () => {
        setLoading(true);
        setError(null);
        fetchProcessSteps()
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
        loadProgress();
    }, []);

    // Scroll-based liquid animation
    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current || !content?.steps) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const sectionHeight = sectionRef.current.offsetHeight;
            const scrollProgress = -rect.top / (sectionHeight - window.innerHeight);

            if (scrollProgress >= 0 && scrollProgress <= 1) {
                const index = Math.round(scrollProgress * (content.steps.length - 1));
                setActiveIndex(index);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [content?.steps?.length]);

    if (loading) {
        return (
            <section className="progress-section" id="progress">
                <div className="progress-loading">Loading Process...</div>
            </section>
        );
    }

    if (error || !content) {
        return <ErrorMessage message={error} retry={loadProgress} />;
    }

    const steps = Array.isArray(content.steps) ? content.steps.map((s, i) => ({
        title: s.title || '',
        description: s.description || s.text || '',
        step: s.step || String(i + 1).padStart(2, '0'),
        image: s.image || s.image_url || null,
    })) : [];

    return (
        <section className="progress-section" id="progress" ref={sectionRef}>
            <div className="progress-sticky-container">
                <div className="progress-content-wrapper">
                    {/* Header */}
                    <div className="progress-header">
                        <div className="progress-header-left">
                            <div className="section-badge">
                                <span className="badge-text" style={{ textTransform: 'none' }}>{content.badge_text || 'How we work'}</span>
                            </div>
                            <h2 className="progress-title">
                                <span className="text-dark-blue">{content.title_1 || 'How we bring'}</span><br />
                                <span className="text-black">{content.title_2 || 'ideas to life'}</span>
                            </h2>
                        </div>
                        <div className="progress-header-right">
                            <Link to="/about" className="btn-solid-blue">More about us</Link>
                        </div>
                    </div>

                    {/* Stacked Cards Area */}
                    <div className="progress-cards-container">
                        <div className="progress-stack">
                            {steps.map((step, index) => (
                                <ProgressCard
                                    key={index}
                                    index={index}
                                    activeIndex={activeIndex}
                                    total={steps.length}
                                    title={step.title}
                                    description={step.description}
                                    step={step.step}
                                    image={step.image}
                                />
                            ))}
                        </div>

                        {/* Right Side Scroll Indicator */}
                        {steps.length > 1 && (
                            <div className="progress-scroll-indicator">
                                <div className="indicator-track">
                                    <div
                                        className="indicator-fill"
                                        style={{ height: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="indicator-dots">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`indicator-dot ${activeIndex === i ? 'active' : ''}`}
                                        >
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
