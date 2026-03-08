import React from 'react';
import './reviewCard.css';

export default function ReviewCard({ quote, author, role, company, avatar }) {
    return (
        <div className="review-card">
            <div className="review-card-inner">
                <p className="review-quote">"{quote}"</p>

                <div className="review-author-box">
                    <div className="review-avatar">
                        {avatar ? <img src={avatar} alt={author} /> : (
                            <div className="avatar-placeholder">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="review-info">
                        <h4 className="review-name">{author}</h4>
                        <p className="review-role">{role} @ {company}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
