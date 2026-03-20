import React, { useState, useEffect } from 'react';
import ProjectCard from '../../../Shared/ProjectCard/ProjectCard';
import './ProjectList.css';
import { fetchProjects } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';

const ProjectList = () => {
    const [projectsData, setProjectsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjectsList = () => {
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
        loadProjectsList();
    }, []);

    if (loading) {
        return <div className="pl-loading">Loading projects...</div>;
    }

    if (error) {
        return <ErrorMessage message={error} retry={loadProjectsList} />;
    }

    if (projectsData.length === 0) {
        return <div className="pl-empty">No projects available at the moment.</div>;
    }

    return (
        <section className="project-list-section">
            <div className="pl-container">
                <div className="pl-grid">
                    {projectsData.map((project) => (
                        <div key={project.id} className="pl-card-wrapper">
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
        </section>
    );
};

export default ProjectList;
