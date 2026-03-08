import React from 'react';
import './Benefits.css';

const Benefits = ({ benefits }) => {
    return (
        <section className="benefits-section">
            <div className="benefits-container">
                <div className="benefits-card">
                    <h2 className="benefits-headline">Why choose this service?</h2>
                    <div className="benefits-list">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="benefit-item">
                                <span className="check-icon">✓</span>
                                <span className="benefit-text">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Benefits;
