import React, { useEffect, useRef, useState } from 'react';
import './reviews.css';
import ReviewCard from '../../../Shared/ReviewCard/ReviewCard';
import { fetchReviews } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';

export default function Reviews() {
    const scrollRef = useRef(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadReviewsData = () => {
        setLoading(true);
        setError(null);
        fetchReviews()
            .then(rows => {
                setReviews((rows || []).map(r => ({
                    quote: r.quote,
                    author: r.author_name,
                    role: r.author_role || '',
                    company: r.company || '',
                    avatar: r.avatar_url || null,
                })));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadReviewsData();
    }, []);

    if (loading) {
        return (
            <section className="reviews-section" id="reviews">
                <div className="reviews-container">
                    <div className="reviews-loading">Loading Reviews...</div>
                </div>
            </section>
        );
    }

    if (error) {
        return <ErrorMessage message={error} retry={loadReviewsData} />;
    }

    if (reviews.length === 0) {
        return null; // Don't show the section if no reviews
    }

    // Duplicate reviews for infinite scroll
    const infiniteReviews = [...reviews, ...reviews, ...reviews];

    return (
        <section className="reviews-section" id="reviews">
            <div className="reviews-container">
                {/* Header */}
                <div className="reviews-header">
                    <div className="reviews-header-left">
                        <div className="section-badge">
                            <span className="badge-text" style={{ textTransform: 'none' }}>Stories of success</span>
                        </div>
                        <h2 className="reviews-title">
                            <span className="text-dark-blue">Hear it from</span><br />
                            <span className="text-black">our clients</span>
                        </h2>
                    </div>
                </div>

                {/* Carousel Container */}
                <div className="reviews-carousel-wrapper">
                    <div className="reviews-track">
                        {infiniteReviews.map((review, index) => (
                            <ReviewCard
                                key={index}
                                {...review}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
