import React from 'react';
import './Review.css';

const Review = ({ project }) => {
    const quote = project?.review_quote || 'Working with digitalhero has been incredible. Their strategic design expertise and versatility quickly grasped our vision, transforming our landing page design, creating pitch decks, and delivering comprehensive branding services. Unmatched B2B design agency!';
    const authorName = project?.review_author || 'Lokesh Kumar';
    const authorRole = project?.review_role ? `${project.review_role}${project.review_company ? ' @ ' + project.review_company : ''}` : 'CEO @ RecruiterOne';

    return (
        <section className="pd-review-section">
            <div className="pd-review-container">
                <div className="pd-review-card">
                    <p className="pd-review-text">
                        {quote}
                    </p>
                </div>

                <div className="pd-review-author">
                    <div className="pd-author-avatar">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                            {/* A 5-petal flower SVG similar to the one in the user's mockup */}
                            <path d="M50 20 C60 0, 75 25, 60 40 C80 30, 95 50, 70 60 C85 80, 50 85, 50 65 C50 85, 15 80, 30 60 C5 50, 20 30, 40 40 C25 25, 40 0, 50 20 Z" />
                        </svg>
                    </div>
                    <div className="pd-author-info">
                        <h4 className="pd-author-name">{authorName}</h4>
                        <span className="pd-author-title">{authorRole}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Review;
