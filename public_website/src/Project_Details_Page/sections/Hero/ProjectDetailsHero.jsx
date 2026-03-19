import React, { useState } from 'react';
import './ProjectDetailsHero.css';

const ProjectDetailsHero = ({ project }) => {
    const [iframeKey, setIframeKey] = useState(0);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

    const handleRefresh = () => {
        setIframeKey(prev => prev + 1);
    };

    const badge = project?.category;
    const title = project?.title;
    const desc = project?.hero_description;
    
    // Check if preview_link exists and is a valid URL (not just a fallback image)
    const hasPreviewLink = !!project?.preview_link && !project.preview_link.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
    const previewUrl = project?.preview_link;

    const galleryImages = (Array.isArray(project?.gallery_urls) && project.gallery_urls.length)
        ? project.gallery_urls
        : [];

    const handleNextGallery = () => {
        setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const handlePrevGallery = () => {
        setCurrentGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <section className="project-details-hero">
            <div className="pd-hero-container">
                {/* Visual Section: Monitor, Mobile Mock, or Gallery */}
                {hasPreviewLink ? (
                    <>
                        {/* Monitor Mockup - Desktop only via CSS */}
                        <div className="pd-monitor-section">
                            <div className="monitor-outer-frame">
                                <div className="monitor-screen">
                                    <div className="monitor-iframe-wrapper">
                                        <iframe
                                            key={iframeKey}
                                            src={previewUrl}
                                            title="Project Website Preview"
                                            className="monitor-iframe"
                                            frameBorder="0"
                                        ></iframe>
                                    </div>
                                    <div className="monitor-browser-bar">
                                        <button className="browser-btn" onClick={handleRefresh} title="Refresh Preview">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 4v6h-6"></path>
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                            </svg>
                                        </button>
                                        <div className="browser-url">{previewUrl}</div>
                                        <div className="browser-nav-btns">
                                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="browser-btn" title="View Fullscreen">
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

                        {/* Mobile Mockup - Slim Bezel - Shown on mobile via CSS */}
                        <div className="mobile-mockup-section">
                            <div className="mobile-mockup-frame">
                                <div className="mobile-screen">
                                    <div className="mobile-iframe-wrapper">
                                        <iframe
                                            key={`mob-${iframeKey}`}
                                            src={previewUrl}
                                            title="Mobile Project Preview"
                                            className="mobile-iframe"
                                            frameBorder="0"
                                        ></iframe>
                                    </div>
                                    <div className="mobile-browser-bar">
                                        <div className="browser-url">{previewUrl}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Hero Gallery integration if no Preview Link */
                    galleryImages.length > 0 && (
                        <div className="hero-gallery-wrapper">
                            <div className="hero-gallery-carousel-area">
                                <button className="hero-nav-btn prev" onClick={handlePrevGallery}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>

                                <div className="hero-gallery-carousel-content">
                                    {/* Main Scroll Container */}
                                    <div className="hero-gallery-slider">
                                        {/* Current Image */}
                                        <div className="hero-gallery-slide main-slide">
                                            <img src={galleryImages[currentGalleryIndex]} alt="current" />
                                        </div>

                                        {/* Next Image Peek */}
                                        {galleryImages.length > 1 && (
                                            <div className="hero-gallery-slide peek-slide" onClick={handleNextGallery}>
                                                <img src={galleryImages[(currentGalleryIndex + 1) % galleryImages.length]} alt="peek" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Scroll Progress Bar */}
                                    <div className="hero-gallery-progress-bg">
                                        <div 
                                            className="hero-gallery-progress-bar" 
                                            style={{ 
                                                width: `${(100 / galleryImages.length)}%`,
                                                transform: `translateX(${currentGalleryIndex * 100}%)`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <button className="hero-nav-btn next" onClick={handleNextGallery}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )
                )}

                {/* Project Content Section */}
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
