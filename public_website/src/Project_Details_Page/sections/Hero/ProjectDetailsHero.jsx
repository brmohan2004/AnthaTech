import React from 'react';
import './ProjectDetailsHero.css';

const ProjectDetailsHero = ({ project }) => {
    const badge = project?.category;
    const title = project?.title;
    const desc = project?.hero_description;
    
    // Data extraction based on mapProject mapping in content.js
    const websiteUrl = project?.preview_link;
    const desktopImage = project?.desktop_image_url;
    const tabletImage = project?.tab_image_url || desktopImage;
    const mobileImage = project?.mobile_image_url || tabletImage || desktopImage;

    const handleViewFullScreen = () => {
        if (websiteUrl) {
            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <section className="project-details-hero">
            <div className="pd-hero-container">
                {/* Mockup Section */}
                <div className="pd-mockup-section">
                    {/* Desktop Mockup (Visible on Desktop) */}
                    <div className="mockup-container desktop-only">
                        <div className="bezel-less-device monitor">
                            <div className="device-screen">
                                <img 
                                    src={desktopImage} 
                                    alt={`${title} Desktop Preview`} 
                                    className="preview-image"
                                />
                                {websiteUrl && (
                                    <div className="fullscreen-overlay">
                                        <button className="view-fullscreen-btn" onClick={handleViewFullScreen}>
                                            <span>View Full Screen</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tablet Mockup (Visible on Tablet) */}
                    <div className="mockup-container tablet-only">
                        <div className="bezel-less-device tablet">
                            <div className="device-screen">
                                <img 
                                    src={tabletImage} 
                                    alt={`${title} Tablet Preview`} 
                                    className="preview-image"
                                />
                                {websiteUrl && (
                                    <div className="fullscreen-overlay">
                                        <button className="view-fullscreen-btn" onClick={handleViewFullScreen}>
                                            <span>View Full Screen</span>
                                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Mockup (Visible on Mobile) */}
                    <div className="mockup-container mobile-only">
                        <div className="bezel-less-device phone">
                            <div className="device-screen">
                                <img 
                                    src={mobileImage} 
                                    alt={`${title} Mobile Preview`} 
                                    className="preview-image"
                                />
                                {websiteUrl && (
                                    <div className="fullscreen-overlay mobile-top-right">
                                        <button className="view-fullscreen-btn icon-only" onClick={handleViewFullScreen} title="View Full Screen">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="pd-content-section">
                    {badge && (
                        <div className="pd-badge">
                            <span>{badge}</span>
                        </div>
                    )}
                    <h1 className="pd-title">{title}</h1>
                    <div className="pd-description">
                        <h3>Project Overview</h3>
                        <p>{desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectDetailsHero;
