import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectsHeader.css';

const ProjectsHeader = () => {
    const navigate = useNavigate();

    return (
        <header className="projects-header">
            <button
                className="projects-back-button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
        </header>
    );
};

export default ProjectsHeader;
