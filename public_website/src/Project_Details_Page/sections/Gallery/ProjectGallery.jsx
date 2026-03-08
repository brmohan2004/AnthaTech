import React, { useState } from 'react';
import './ProjectGallery.css';

const ProjectGallery = ({ project }) => {
    const FALLBACK_IMAGES = [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1400&q=80"
    ];
    const carouselImages = (Array.isArray(project?.gallery_urls) && project.gallery_urls.length)
        ? project.gallery_urls
        : FALLBACK_IMAGES;

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    return (
        <section className="pd-gallery-section">
            <div className="pd-gallery-container">
                <div className="gallery-badge">
                    <span>Project Gallery</span>
                </div>

                {/* Top Carousel Section */}
                <div className="gallery-carousel-area">
                    <button className="gallery-nav-btn prev" onClick={handlePrev}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <div className="gallery-carousel-content">
                        {/* Blur effect left */}
                        <div className="carousel-blur-left"></div>

                        {/* Previous Mockup */}
                        <div className="mockup-frame side-frame prev-frame">
                            <div className="mockup-header">
                                <span className="mockup-dot red"></span>
                                <span className="mockup-dot yellow"></span>
                                <span className="mockup-dot green"></span>
                            </div>
                            <div className="mockup-body">
                                <img src={carouselImages[(currentIndex - 1 + carouselImages.length) % carouselImages.length]} alt="Previous project mockup" />
                            </div>
                        </div>

                        {/* Main Current Mockup */}
                        <div className="mockup-frame main-carousel-frame">
                            <div className="mockup-header">
                                <span className="mockup-dot red"></span>
                                <span className="mockup-dot yellow"></span>
                                <span className="mockup-dot green"></span>
                            </div>
                            <div className="mockup-body">
                                <img src={carouselImages[currentIndex]} alt="Project mockup" />
                            </div>
                        </div>

                        {/* Next Mockup */}
                        <div className="mockup-frame side-frame next-frame">
                            <div className="mockup-header">
                                <span className="mockup-dot red"></span>
                                <span className="mockup-dot yellow"></span>
                                <span className="mockup-dot green"></span>
                            </div>
                            <div className="mockup-body">
                                <img src={carouselImages[(currentIndex + 1) % carouselImages.length]} alt="Next project mockup" />
                            </div>
                        </div>

                        {/* Blur effect right */}
                        <div className="carousel-blur-right"></div>
                    </div>

                    <button className="gallery-nav-btn next" onClick={handleNext}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* Bottom Static Mockups */}
                <div className="gallery-static-mockups">
                    <div className="mockup-frame mobile-mockup">
                        <div className="mockup-header">
                            <span className="mockup-dot red"></span>
                            <span className="mockup-dot yellow"></span>
                            <span className="mockup-dot green"></span>
                        </div>
                        <div className="mockup-body">
                            <img src="https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&w=600&q=80" alt="Mobile mockup" />
                        </div>
                    </div>

                    <div className="mockup-frame desktop-mockup">
                        <div className="mockup-header">
                            <span className="mockup-dot red"></span>
                            <span className="mockup-dot yellow"></span>
                            <span className="mockup-dot green"></span>
                        </div>
                        <div className="mockup-body">
                            <img src="https://images.unsplash.com/photo-1507238691741-b4a1a5b82cce?auto=format&fit=crop&w=1200&q=80" alt="Desktop secondary mockup" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectGallery;
