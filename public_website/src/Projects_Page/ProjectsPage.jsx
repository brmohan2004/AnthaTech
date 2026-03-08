import React from 'react';
import Header from '../Shared/Header/Header';
import ProjectsHero from './sections/Hero/ProjectsHero';
import Footer from '../Shared/footer/Footer';
import Contact from '../Shared/contact/Contact';
import ProjectList from './sections/ProjectList/ProjectList';
import './projects_page.css';

const ProjectsPage = () => {
    return (
        <div className="projects-page-container">
            <Header />
            <main className="projects-page-content">
                <ProjectsHero />
                <ProjectList />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default ProjectsPage;
