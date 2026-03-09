import React, { useState } from 'react';
import './ProjectDetailsHero.css';

const ProjectDetailsHero = ({ project }) => {
    const [iframeKey, setIframeKey] = useState(0);

    const handleRefresh = () => {
        setIframeKey(prev => prev + 1);
    };

    const badge = project?.category;
    const title = project?.title;
    const desc = project?.hero_description;
    const previewUrl = project?.preview_link || (project?.gallery?.length > 0 ? project.gallery[0].url : project?.image);

    return (
        <section className="project-details-hero">
            <div className="pd-hero-container">
                {/* Left side: Monitor Mockup */}
                <div className="pd-monitor-section">
                    <div className="monitor-outer-frame">
                        <div className="monitor-screen">
                            <div className="monitor-iframe-wrapper">
                                {previewUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || previewUrl.includes('supabase.co') ? (
                                    <img
                                        key={iframeKey}
                                        src={previewUrl}
                                        alt="Project Preview"
                                        className="monitor-iframe"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <iframe
                                        key={iframeKey}
                                        src={previewUrl}
                                        title="Project Website Preview"
                                        className="monitor-iframe"
                                        frameBorder="0"
                                    ></iframe>
                                )}
                            </div>
                            <div className="monitor-browser-bar">
                                <button
                                    className="browser-btn"
                                    onClick={handleRefresh}
                                    title="Refresh Preview"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 4v6h-6"></path>
                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                    </svg>
                                </button>
                                <div className="browser-url">
                                    {previewUrl}
                                </div>
                                <div className="browser-nav-btns">
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="browser-btn"
                                        title="View Fullscreen"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="monitor-stand"></div>
                        <div className="monitor-base"></div>
                    </div>
                </div>

                {/* Right side: Project Content */}
                <div className="pd-content-section">
                    {badge && (
                        <div className="pd-badge">
                            <span>{badge}</span>
                        </div>
                    )}
                    <h1 className="pd-title">{title}</h1>
                    <div className="pd-description">
                        <h3>{title}</h3>
                        <p>{desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectDetailsHero;
