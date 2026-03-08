import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetailsHeader from './sections/Header/ProjectDetailsHeader';
import ProjectDetailsHero from './sections/Hero/ProjectDetailsHero';
import Challenges from './sections/Challenges/Challenges';
import ProjectGallery from './sections/Gallery/ProjectGallery';
import Solutions from './sections/Solutions/Solutions';
import Review from './sections/Review/Review';
import OtherProjects from './sections/OtherProjects/OtherProjects';
import Contact from '../Shared/contact/Contact';
import Footer from '../Shared/footer/Footer';
import { fetchProjectBySlug, fetchProjects } from '../api/content';
import ErrorMessage from '../Shared/ErrorMessage/ErrorMessage';
import './project_Details.css';

const ProjectDetails = () => {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [otherProjects, setOtherProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjectDetails = () => {
        if (!slug) return;
        setLoading(true);
        setError(null);

        Promise.all([
            fetchProjectBySlug(slug),
            fetchProjects()
        ])
            .then(([projectData, allProjects]) => {
                setProject(projectData);
                if (allProjects?.length) {
                    setOtherProjects(
                        allProjects.filter(p => p.slug !== slug).slice(0, 3).map(p => ({
                            id: p.slug,
                            pill: p.category_pill || '',
                            title: p.title,
                            image: p.cover_image_url || '',
                        }))
                    );
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadProjectDetails();
    }, [slug]);

    if (loading) {
        return (
            <div className="project-details-page-loading">
                <ProjectDetailsHeader />
                <div className="pd-loading-spinner">Loading project details...</div>
                <Footer />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="project-details-page-error">
                <ProjectDetailsHeader />
                <ErrorMessage
                    message={error || "The project you're looking for was not found."}
                    retry={loadProjectDetails}
                />
                <Footer />
            </div>
        );
    }

    return (
        <div className="project-details-page">
            <ProjectDetailsHeader />
            <main className="project-details-content">
                <ProjectDetailsHero project={project} />
                <Challenges project={project} />
                <ProjectGallery project={project} />
                <Solutions project={project} />
                <Review project={project} />
                <OtherProjects projects={otherProjects} />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default ProjectDetails;
