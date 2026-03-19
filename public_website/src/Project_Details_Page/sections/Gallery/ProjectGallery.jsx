import React, { useState } from 'react';
import './ProjectGallery.css';
import ImageLightbox from './ImageLightbox';

const ProjectGallery = ({ project }) => {
    const carouselImages = (Array.isArray(project?.gallery_urls) && project.gallery_urls.length)
        ? project.gallery_urls
        : [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxSrc, setLightboxSrc] = useState(null);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    const openLightbox = (src) => setLightboxSrc(src);
    const closeLightbox = () => setLightboxSrc(null);

    return (
        <section className="pd-gallery-section">
            <div className="pd-gallery-container">
                <div className="gallery-badge">
                    <span>Project Gallery</span>
                </div>

                {/* Top Carousel Section — only shown if gallery images exist AND preview link is present (otherwise shown in hero) */}
                {carouselImages.length > 0 && project?.preview_link && (
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

                        {/* Main Current Mockup — clickable */}
                        <div
                            className="mockup-frame main-carousel-frame lb-clickable"
                            onClick={() => openLightbox(carouselImages[currentIndex])}
                            title="Click to view full image"
                        >
                            <div className="mockup-header">
                                <span className="mockup-dot red"></span>
                                <span className="mockup-dot yellow"></span>
                                <span className="mockup-dot green"></span>
                            </div>
                            <div className="mockup-body">
                                <img src={carouselImages[currentIndex]} alt="Project mockup" />
                            </div>
                            <div className="lb-expand-hint">🔍 Click to expand</div>
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
                )}

                {/* Bottom Static Mockups */}
                <div className="gallery-static-mockups">

                    {/* Mobile Image — clickable */}
                    {project.mobile_image_url && (
                        <div
                            className="static-image-item static-image-mobile lb-clickable"
                            onClick={() => openLightbox(project.mobile_image_url)}
                            title="Click to view full image"
                        >
                            <img src={project.mobile_image_url} alt="Mobile view" />
                            <div className="lb-expand-hint">🔍 Click to expand</div>
                        </div>
                    )}

                    {/* Tab/Desktop Image — clickable */}
                    {project.tab_image_url && (
                        <div
                            className="static-image-item static-image-desktop lb-clickable"
                            onClick={() => openLightbox(project.tab_image_url)}
                            title="Click to view full image"
                        >
                            <img src={project.tab_image_url} alt="Desktop view" />
                            <div className="lb-expand-hint">🔍 Click to expand</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <ImageLightbox
                    src={lightboxSrc}
                    alt="Project image"
                    onClose={closeLightbox}
                />
            )}
        </section>
    );
};

export default ProjectGallery;
