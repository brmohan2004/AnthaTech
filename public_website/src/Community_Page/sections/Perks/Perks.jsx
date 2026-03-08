import React, { useState, useEffect } from 'react';
import { fetchCommunityContent } from '../../../api/content';
import './Perks.css';

const Perks = () => {
    const [perks, setPerks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunityContent('perks')
            .then(row => {
                const raw = row?.perks || [];
                if (Array.isArray(raw) && raw.length) {
                    setPerks(raw);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="perks-section">
            <div className="perks-inner">
                <div className="section-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>Benefits</span>
                </div>
                <h2 className="perks-title">What you get</h2>

                {loading ? (
                    <div className="perks-loading">Loading...</div>
                ) : perks.length === 0 ? (
                    <p className="perks-empty">No perks have been added yet.</p>
                ) : (
                    <div className="perks-grid">
                        {perks.map((p, i) => (
                            <div key={i} className="perk-card">
                                <div className="perk-icon">{p.icon}</div>
                                <h3 className="perk-title">{p.title}</h3>
                                <p className="perk-desc">{p.desc || p.description || ''}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Perks;
