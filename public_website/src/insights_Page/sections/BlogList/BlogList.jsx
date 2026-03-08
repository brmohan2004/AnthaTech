import React, { useState, useEffect } from 'react';
import './BlogList.css';
import BlogCard from '../../../Shared/BlogCard/BlogCard';
import { fetchBlogPosts } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return '';
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBlogs = () => {
        setLoading(true);
        setError(null);
        fetchBlogPosts()
            .then(rows => {
                setBlogs((rows || []).map(p => ({
                    image: p.cover_image_url || '',
                    date: p.date_label || timeAgo(p.created_at),
                    title: p.title,
                    description: p.short_description || '',
                    link: `/insights/${p.slug}`,
                })));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadBlogs();
    }, []);

    if (loading) {
        return <div className="bl-loading">Loading insights...</div>;
    }

    if (error) {
        return <ErrorMessage message={error} retry={loadBlogs} />;
    }

    if (blogs.length === 0) {
        return <div className="bl-empty">No insights published yet.</div>;
    }

    return (
        <section className="blog-list-section">
            <div className="bl-container">
                <div className="bl-grid">
                    {blogs.map((blog, index) => (
                        <BlogCard key={index} {...blog} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogList;
