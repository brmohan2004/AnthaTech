import React, { useRef } from 'react';
import ProjectCard from '../../../Shared/ProjectCard/ProjectCard';
import './OtherProjects.css';

const OtherProjects = ({ projects: externalProjects }) => {
    const scrollContainerRef = useRef(null);
    const projects = externalProjects || [];

    // Don't render section if there are no real related projects
    if (!projects.length) return null;

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -600, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 600, behavior: 'smooth' });
        }
    };

    return (
        <section className="other-projects-section">
            <div className="op-container">
                <div className="op-header">
                    <div className="op-badge">
                        <span>Other projects</span>
                    </div>
                    <h2 className="op-title">
                        You may
                        <span className="op-title-black">also like</span>
                    </h2>
                </div>

                <div className="op-carousel-container" ref={scrollContainerRef}>
                    <div className="op-carousel-track">
                        {projects.map(project => (
                            <div className="op-card-wrapper" key={project.id}>
                                <ProjectCard
                                    id={project.id}
                                    pill={project.pill}
                                    title={project.title}
                                    image={project.image}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="op-controls-row">
                    <div className="op-controls">
                        <button className="op-control-btn" onClick={scrollLeft}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button className="op-control-btn" onClick={scrollRight}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OtherProjects;
