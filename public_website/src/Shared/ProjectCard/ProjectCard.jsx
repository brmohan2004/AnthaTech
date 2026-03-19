import React from 'react';
import { Link } from 'react-router-dom';
import './projectCard.css';

export default function ProjectCard({ id, pill, title, image }) {
    return (
        <Link to={`/project-details/${id}`} className="project-card" id={id} style={{ textDecoration: 'none' }}>
            <div className="project-image-wrapper">
                {image && <img src={image} alt={title} className="project-preview-img" loading="lazy" />}
            </div>

            <div className="project-info">
                <div className="info-top">
                    <span className="info-pill">{pill}</span>
                    <h3 className="project-name">{title}</h3>
                </div>
                <div className="project-link-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </div>
            </div>
        </Link>
    );
}
