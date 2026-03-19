import React from 'react';
import BackgroundAnimation from '../../../Shared/BackgroundAnimation/BackgroundAnimation';
import './ServicesHero.css';

const ServicesHero = () => {
    return (
        <section className="services-hero-section">
            <BackgroundAnimation />
            <div className="sh-container">
                <div className="sh-badge">
                    <span>Our Services</span>
                </div>

                <h1 className="sh-title">
                    Crafting digital<br />
                    <span className="text-blue">solutions</span>
                </h1>

                <p className="sh-subtitle">
                    memorable and consistent design, these are the stories we've helped to tell.
                </p>
            </div>
        </section>
    );
};

export default ServicesHero;
