import React, { useState, useEffect } from 'react';
import { fetchCommunityContent } from '../../../api/content';
import './Perks.css';

const FALLBACK_PERKS = [
    { icon: '🚀', title: 'Real Projects', desc: 'Work on live, industry-grade projects curated for community members — not just exercises.' },
    { icon: '🤝', title: 'Mentorship', desc: 'Connect with senior designers and engineers at Antha Tech who guide you through the project lifecycle.' },
    { icon: '📁', title: 'Portfolio Boost', desc: 'Walk away with professional case studies and references that actually matter to employers.' },
    { icon: '🔒', title: 'Exclusive Access', desc: 'Only verified members get invited to projects. Quality over quantity — always.' },
    { icon: '🌐', title: 'Global Network', desc: 'Collaborate with a diverse community of like-minded builders from around the world.' },
    { icon: '📜', title: 'Certificate of Collaboration', desc: 'Receive an official certification after completing a project, recognised by our partner companies.' },
];

const Perks = () => {
    const [perks, setPerks] = useState(FALLBACK_PERKS);

    useEffect(() => {
        fetchCommunityContent('perks')
            .then(row => {
                if (row?.perks && Array.isArray(row.perks) && row.perks.length) {
                    setPerks(row.perks);
                }
            })
            .catch(() => {});
    }, []);
    return (
        <section className="perks-section">
            <div className="perks-inner">
                <div className="section-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>Benefits</span>
                </div>
                <h2 className="perks-title">What you get</h2>

                <div className="perks-grid">
                    {perks.map((p, i) => (
                        <div key={i} className="perk-card">
                            <div className="perk-icon">{p.icon}</div>
                            <h3 className="perk-title">{p.title}</h3>
                            <p className="perk-desc">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Perks;
