import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ProjectGallery.css';
import ImageLightbox from './ImageLightbox';

const ProjectGallery = ({ project }) => {
    const images = (Array.isArray(project?.gallery_urls) && project.gallery_urls.length)
        ? project.gallery_urls
        : [];

    const [lightboxSrc, setLightboxSrc] = useState(null);

    const openLightbox = (src) => setLightboxSrc(src);
    const closeLightbox = () => setLightboxSrc(null);

    if (images.length === 0) return null;

    return (
        <section className="pd-gallery-list-section">
            <div className="gallery-container">
                <div className="pd-gallery-header">
                    <div className="gallery-badge">
                        <span>Project Gallery</span>
                    </div>
                    <h2 className="gallery-title">Visual Showcase</h2>
                </div>

                <div className="gallery-vertical-list">
                    {images.map((url, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ 
                                opacity: 0, 
                                x: idx % 2 === 0 ? -100 : 100,
                                scale: 0.9
                            }}
                            whileInView={{ 
                                opacity: 1, 
                                x: 0,
                                scale: 1
                            }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ 
                                duration: 0.8, 
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.1
                            }}
                            className="gallery-item-list"
                            onClick={() => openLightbox(url)}
                        >
                            <div className="gallery-image-wrapper">
                                <img src={url} alt={`Gallery image ${idx + 1}`} />
                                <div className="image-overlay">
                                    <span className="view-btn">View Image</span>
                                </div>
                                <div className="image-number">{String(idx + 1).padStart(2, '0')}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <ImageLightbox
                    src={lightboxSrc}
                    alt="Project discovery image"
                    onClose={closeLightbox}
                />
            )}
        </section>
    );
};

export default ProjectGallery;
