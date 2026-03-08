import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './serviceCard.css';

export default function ServiceCard({ title, tags, description, buttonText, link, theme, serviceGraphic }) {
    const navigate = useNavigate();

    const isHexTheme = theme?.startsWith('#');

    return (
        <div
            className={`service-card ${isHexTheme ? 'custom-theme' : (theme || '')}`}
            style={isHexTheme ? { backgroundColor: theme } : {}}
        >
            {/* Top right floating arrow button */}
            <Link to={link || "#"} className="service-link-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
            </Link>

            {/* Top area reserved for potential imagery or just whitespace as per design */}
            <div className="service-card-top">
                {serviceGraphic && (
                    <div className="service-graphic-container">
                        {serviceGraphic}
                    </div>
                )}
            </div>

            {/* Bottom content area */}
            <div className="service-card-content">
                <h3 className="service-title">{title}</h3>

                <div className="service-tags">
                    {tags && tags.map((tag, index) => (
                        <span key={index} className="service-tag">{tag}</span>
                    ))}
                </div>

                <p className="service-description">{description}</p>

                <button
                    className="service-action-btn"
                    onClick={() => navigate(link || "#")}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
