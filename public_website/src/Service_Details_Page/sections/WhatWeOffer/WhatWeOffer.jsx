import React from 'react';
import './WhatWeOffer.css';

const WhatWeOffer = ({ offers }) => {
    return (
        <section className="offers-section">
            <div className="offers-container">
                <div className="section-badge">
                    <span className="badge-text" style={{ textTransform: 'none' }}>Solutions</span>
                </div>
                <h2 className="offers-title">What we offer</h2>

                <div className="offers-grid">
                    {offers.map((offer, index) => (
                        <div key={index} className="offer-card">
                            <div className="offer-icon">{offer.icon}</div>
                            <h3 className="offer-card-title">{offer.title}</h3>
                            <p className="offer-card-text">{offer.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhatWeOffer;
