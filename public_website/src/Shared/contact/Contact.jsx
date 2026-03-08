import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './contact.css';
import { useModal } from '../../context/ModalContext';
import { fetchSiteConfig } from '../../api/content';

export default function Contact() {
    const location = useLocation();
    const { openContactModal } = useModal();
    const [config, setConfig] = useState({});
    const isCompactPage = ['/insights', '/services'].includes(location.pathname);

    useEffect(() => {
        fetchSiteConfig()
            .then(data => {
                if (data) setConfig(data);
            })
            .catch(() => { });
    }, []);

    const badgeText = config.contact_badge || "Let's make it happen";
    const titleLine1 = config.contact_title_1 || "Ready to";
    const titleLine2 = config.contact_title_2 || "Get started";
    const ctaText = config.contact_cta_text || "Let's Get Start";

    return (
        <section className={`contact-section ${isCompactPage ? 'is-compact' : ''}`} id="contact">
            <div className="contact-container">
                <div className="contact-content">
                    {/* Badge */}
                    <div className="section-badge">
                        <span className="badge-text" style={{ textTransform: 'none' }}>{badgeText}</span>
                    </div>

                    {/* Title */}
                    <h2 className="contact-title">
                        <span className="text-dark-blue">{titleLine1}</span><br />
                        <span className="text-black">{titleLine2}</span>
                    </h2>

                    {/* Large Hover Button */}
                    <div className="contact-cta-wrapper">
                        <button
                            className="contact-cta-button"
                            onClick={openContactModal}
                            style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                            <div className="circle-bg">
                                <span className="arrow-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="7" y1="17" x2="17" y2="7"></line>
                                        <polyline points="7 7 17 7 17 17"></polyline>
                                    </svg>
                                </span>
                            </div>
                            <span className="cta-text">{ctaText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
