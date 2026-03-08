import React, { useState, useEffect } from 'react';
import { fetchCommunityContent } from '../../../api/content';
import './HowItWorks.css';

const HowItWorks = () => {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunityContent('how_it_works')
            .then(row => {
                const raw = row?.steps || [];
                if (Array.isArray(raw) && raw.length) {
                    setSteps(raw.map((s, i) => ({
                        num: s.num || String(i + 1).padStart(2, '0'),
                        title: s.title || '',
                        desc: s.desc || s.description || '',
                    })));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);
    return (
        <section className="how-section">
            <div className="how-inner">
                <div className="section-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>Process</span>
                </div>
                <h2 className="how-title">How it works</h2>

                {loading ? (
                    <div className="how-steps-loading">Loading...</div>
                ) : steps.length === 0 ? (
                    <p className="how-steps-empty">No steps have been added yet.</p>
                ) : (
                    <div className="how-steps">
                        {steps.map((s, i) => (
                            <div key={i} className="how-step">
                                <div className="how-step-num">{s.num}</div>
                                <div className="how-step-body">
                                    <h3 className="how-step-title">{s.title}</h3>
                                    <p className="how-step-desc">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HowItWorks;
