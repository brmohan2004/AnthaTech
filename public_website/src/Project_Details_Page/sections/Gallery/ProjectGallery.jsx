import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './ProjectGallery.css';
import ImageLightbox from './ImageLightbox';

const ProjectGallery = ({ project }) => {
    const images = (Array.isArray(project?.gallery_urls) && project.gallery_urls.length)
        ? project.gallery_urls
        : [];

    const sectionRef = useRef(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);

    // Track scroll progress within the section
    const { scrollYProgress } = useScroll({
        target: sectionRef,
    });

    // Transform vertical scroll progress into horizontal translation
    // Calculation: (Number of images * item width) - viewport width
    // To keep it simple and responsive, let's use a percentage-based move
    const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(images.length - 1) * 60}%`]);

    const openLightbox = (src) => setLightboxSrc(src);
    const closeLightbox = () => setLightboxSrc(null);

    if (images.length === 0) return null;

    return (
        <section ref={sectionRef} className="pd-gallery-parallax-section">
            <div className="gallery-sticky-wrapper">
                <div className="pd-gallery-header">
                    <div className="gallery-badge">
                        <span>Gallery</span>
                    </div>
                </div>

                <motion.div style={{ x }} className="gallery-horizontal-track">
                    {images.map((url, idx) => (
                        <div 
                            key={idx} 
                            className="gallery-item"
                            onClick={() => openLightbox(url)}
                        >
                            <img src={url} alt={`Visualization ${idx + 1}`} />
                        </div>
                    ))}
                </motion.div>
                
                {/* Visual Progress indicator at the bottom */}
                <div className="gallery-progress-container">
                    <div className="gallery-progress-track">
                        <motion.div 
                            className="gallery-progress-bar" 
                            style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
                        ></motion.div>
                    </div>
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
