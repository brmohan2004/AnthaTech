import React from 'react';
import './AboutServices.css';
import logoImg from '../../../assets/logo.png';

const AboutServices = () => {
    return (
        <section className="about-services-section">
            <div className="as-container">
                <div className="as-content">
                    <div className="as-logo">
                        <img src={logoImg} alt="Antha Tech Logo" />
                    </div>

                    <h2 className="as-headline">
                        We deliver cutting-edge services <span className="text-navy">that bridge</span> creativity <span className="text-navy">and</span> technology, helping businesses thrive <span className="text-navy">in a fast-paced</span> digital world.
                    </h2>

                    <p className="as-sub-headline">
                        From <span className="text-navy">design to development,</span> we craft solutions <span className="text-navy">that</span> create impact <span className="text-navy">and drive</span> results.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutServices;
