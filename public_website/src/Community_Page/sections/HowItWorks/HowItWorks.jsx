import React, { useState, useEffect } from 'react';
import { fetchCommunityContent } from '../../../api/content';
import './HowItWorks.css';

const FALLBACK_STEPS = [
    { num: '01', title: 'Submit a Request', desc: 'Fill in the application form with your background, track preference, and a brief portfolio or LinkedIn.' },
    { num: '02', title: 'Verification Review', desc: 'Our team reviews your request within 3–5 business days to ensure the right fit for the community.' },
    { num: '03', title: 'Join the Community', desc: 'Once approved, you receive access to our private workspace and are introduced to the team.' },
    { num: '04', title: 'Work on Projects', desc: 'Get invited to real, curated projects based on your skills and availability. Ship great work.' },
];

const HowItWorks = () => {
    const [steps, setSteps] = useState(FALLBACK_STEPS);

    useEffect(() => {
        fetchCommunityContent('how_it_works')
            .then(row => {
                if (row?.steps && Array.isArray(row.steps) && row.steps.length) {
                    setSteps(row.steps.map((s, i) => ({
                        num: s.num || String(i + 1).padStart(2, '0'),
                        title: s.title || '',
                        desc: s.desc || s.description || '',
                    })));
                }
            })
            .catch(() => {});
    }, []);
    return (
        <section className="how-section">
            <div className="how-inner">
                <div className="section-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>Process</span>
                </div>
                <h2 className="how-title">How it works</h2>

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
            </div>
        </section>
    );
};

export default HowItWorks;
