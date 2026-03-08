import React, { useRef } from 'react';
import ProjectCard from '../../../Shared/ProjectCard/ProjectCard';
import './OtherProjects.css';

const FALLBACK_PROJECTS = [
    { id: 'project-1', pill: 'Human Recruitment', title: 'RecruiterOne', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80' },
    { id: 'project-2', pill: 'FinTech', title: 'PayStream', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80' },
    { id: 'project-3', pill: 'E-commerce', title: 'ShopSmart', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80' },
];

const OtherProjects = ({ projects: externalProjects }) => {
    const scrollContainerRef = useRef(null);
    const projects = externalProjects?.length ? externalProjects : FALLBACK_PROJECTS;

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
