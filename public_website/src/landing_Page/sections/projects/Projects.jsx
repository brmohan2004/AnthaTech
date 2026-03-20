import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './projects.css';
import ProjectCard from '../../../Shared/ProjectCard/ProjectCard';
import { fetchProjects } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';

export default function Projects() {
    const carouselRef = useRef(null);
    const [projectsData, setProjectsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjectsData = () => {
        setLoading(true);
        setError(null);
        fetchProjects()
            .then(rows => {
                setProjectsData((rows || []).map((p) => ({
                    id: p.slug,
                    pill: p.category_pill || '',
                    title: p.title,
                    image: p.cover_image_url || null,
                })));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadProjectsData();
    }, []);

    // Card width (1100px) + Gap (20px)
    const SCROLL_AMOUNT = 1120;

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <section className="projects-section" id="projects">
                <div className="projects-loading">Loading Projects...</div>
            </section>
        );
    }

    if (error) {
        return <ErrorMessage message={error} retry={loadProjectsData} />;
    }

    return (
        <section className="projects-section" id="projects">
            <div className="projects-header-container">
                <div className="projects-header-top">
                    <div className="section-badge fade-in-up">
                        <span className="badge-text">Featured projects</span>
                    </div>
                </div>

                <div className="projects-header-bottom">
                    <h2 className="projects-title fade-in-up delay-1">
                        <span className="text-dark-blue">How we helped</span><br />
                        <span>other succeed</span>
                    </h2>

                    <div className="projects-header-action fade-in-up delay-1">
                        <Link to="/projects" className="view-all-btn">
                            View all project
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="carousel-wrapper fade-in-up delay-2" ref={carouselRef}>
                <div className="projects-carousel">
                    {projectsData.map((project, index) => (
                        <ProjectCard
                            key={project.id || index}
                            id={project.id}
                            pill={project.pill}
                            title={project.title}
                            image={project.image}
                        />
                    ))}
                    {projectsData.length === 0 && (
                        <div className="no-projects-carousel-msg">
                            No featured projects available.
                        </div>
                    )}
                </div>
            </div>

            {projectsData.length > 0 && (
                <div className="carousel-controls fade-in-up delay-3">
                    <button className="control-btn prev-btn" onClick={scrollLeft} aria-label="Previous project">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button className="control-btn next-btn" onClick={scrollRight} aria-label="Next project">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            )}
        </section>
    );
}
