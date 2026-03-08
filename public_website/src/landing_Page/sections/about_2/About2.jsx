import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAboutContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import './about2.css';

const DOT_COLORS = ['dot-red', 'dot-yellow', 'dot-green'];

export default function About2() {
    const navigate = useNavigate();
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAbout2 = () => {
        setLoading(true);
        setError(null);
        fetchAboutContent('about2')
            .then(data => {
                if (data) {
                    setAbout(data);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadAbout2();
    }, []);

    if (loading) {
        return (
            <section className="about2-section" id="about-2">
                <div className="about2-container">
                    <div className="about2-loading">Loading Highlights...</div>
                </div>
            </section>
        );
    }

    if (error || !about) {
        return <ErrorMessage message={error} retry={loadAbout2} />;
    }

    const stats = Array.isArray(about.stats) && about.stats.length > 0 ? about.stats : [];

    return (
        <section className="about2-section" id="about-2">
            <div className="about2-container">
                <div className="about2-header fade-in-up">
                    <div className="about2-header-left">
                        <div className="section-badge">
                            <span className="badge-text" style={{ textTransform: 'none' }}>{about.badge_text || 'Highlights'}</span>
                        </div>
                        <h2 className="about2-title">
                            <span className="text-dark-blue">{about.title_1}</span><br />
                            <span className="text-black">{about.title_2}</span>
                        </h2>
                    </div>
                    <div className="about2-header-right">
                        <button className="btn-solid-blue" onClick={() => navigate('/about')}>More About us</button>
                    </div>
                </div>

                <div className="about2-stats fade-in-up delay-2">
                    {stats.map((stat, i) => (
                        <div className="stat-card" key={i}>
                            <div className="stat-number-wrapper">
                                <span
                                    className="stat-dot"
                                    style={{ backgroundColor: stat.color || (i === 0 ? '#F05A63' : i === 1 ? '#FBBF24' : '#4ADE80') }}
                                ></span>
                                <h3 className="stat-number">{stat.number}</h3>
                            </div>
                            <p className="stat-text">{(stat.label || stat.text || '')?.split('\n').map((line, j) => (
                                <React.Fragment key={j}>{line}{j === 0 && <br />}</React.Fragment>
                            ))}</p>
                        </div>
                    ))}
                    {stats.length === 0 && <p className="no-stats-text">No statistics available at the moment.</p>}
                </div>
            </div>
        </section>
    );
}
