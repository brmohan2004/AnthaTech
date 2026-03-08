import React from 'react';
import './BlogCard.css';

const BlogCard = ({ image, date, title, description, link }) => {
    return (
        <div className="blog-card">
            <div className="blog-card-image-wrapper">
                <img src={image} alt={title} className="blog-card-image" />
                <a href={link} className="blog-card-arrow-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </a>
            </div>

            <div className="blog-card-content">
                <div className="blog-card-meta">
                    <span className="blog-date-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </span>
                    <span className="blog-date">{date}</span>
                </div>

                <h3 className="blog-title">{title}</h3>
                <p className="blog-description">{description}</p>
            </div>
        </div>
    );
};

export default BlogCard;
