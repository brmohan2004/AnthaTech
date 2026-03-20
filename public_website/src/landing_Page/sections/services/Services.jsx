import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './services.css';
import ServiceCard from '../../../Shared/ServiceCard/ServiceCard';
import { fetchServices } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';

export default function Services() {
    const cardsRef = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const isServicesPage = location.pathname === '/services';
    const [servicesData, setServicesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadServicesData = () => {
        setLoading(true);
        setError(null);
        fetchServices()
            .then(rows => {
                console.log('Raw Services Rows:', rows);
                const normalizedRows = (rows || []).map(s => {
                    const status = (s.status || '').trim().toLowerCase();
                    console.log(`Service: ${s.title}, DB Status: "${s.status}", Normalized: "${status}"`);
                    return {
                        ...s,
                        status
                    };
                });
                const publishedServices = normalizedRows.filter(s => s.status === 'published');
                console.log('Filtered Published Services:', publishedServices);
                
                setServicesData(publishedServices.map((s) => ({
                    title: s.title,
                    tags: Array.isArray(s.tags) ? s.tags : [],
                    description: s.short_description || '',
                    buttonText: `${s.title} services`,
                    link: `/service/${s.slug}`,
                    theme: s.theme || 'theme-dark-green',
                    graphicSrc: s.graphic_url || null,
                })));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadServicesData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const cards = cardsRef.current;
            if (!cards || !cards.length) return;

            cards.forEach((wrapper, index) => {
                if (!wrapper) return;
                const card = wrapper.querySelector('.service-card');
                if (!card) return;

                const stickyTop = 100;
                const nextWrapper = cards[index + 1];
                if (nextWrapper) {
                    const nextRect = nextWrapper.getBoundingClientRect();
                    const fadeStart = window.innerHeight * 0.8;
                    const fadeEnd = stickyTop + 100;
                    const progress = Math.max(0, Math.min(1, (fadeStart - nextRect.top) / (fadeStart - fadeEnd)));

                    const scale = 1 - (progress * 0.15);
                    const opacity = 1 - progress;
                    const borderRadius = 20 + (progress * 30);

                    card.style.transform = `scale(${scale})`;
                    card.style.opacity = opacity;
                    card.style.borderRadius = `${borderRadius}px`;
                    wrapper.style.opacity = opacity;
                } else {
                    card.style.transform = 'scale(1)';
                    card.style.opacity = '1';
                    card.style.borderRadius = '20px';
                    wrapper.style.opacity = '1';
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [servicesData.length]);

    if (loading) {
        return (
            <section className={`services-section ${isServicesPage ? 'is-page' : ''}`} id="solutions">
                <div className="services-container">
                    <div className="services-loading">Loading Services...</div>
                </div>
            </section>
        );
    }

    if (error) {
        return <ErrorMessage message={error} retry={loadServicesData} />;
    }

    return (
        <section className={`services-section ${isServicesPage ? 'is-page' : ''}`} id="solutions">
            <div className="services-container">
                {!isServicesPage && (
                    <div className="services-header fade-in-up">
                        <div className="services-header-left">
                            <div className="section-badge">
                                <span className="badge-text" style={{ textTransform: 'none' }}>Our solutions</span>
                            </div>
                            <h2 className="services-title">
                                <span className="text-dark-blue">Transforming</span><br />
                                <span className="text-black">ideas into reality</span>
                            </h2>
                        </div>

                        <div className="services-header-right">
                            <button className="btn-solid-blue" onClick={() => navigate('/services')}>Our services</button>
                        </div>
                    </div>
                )}

                <div className="services-cards-wrapper fade-in-up delay-2">
                    {servicesData.map((service, index) => (
                        <div
                            key={index}
                            className="sticky-card-wrapper"
                            ref={el => cardsRef.current[index] = el}
                            style={{
                                position: 'sticky',
                                top: '100px',
                                zIndex: index + 1
                            }}
                        >
                            <ServiceCard
                                title={service.title}
                                tags={service.tags}
                                description={service.description}
                                buttonText={service.buttonText}
                                link={service.link}
                                theme={service.theme}
                                serviceGraphic={
                                    <img src={service.graphicSrc} alt={`${service.title} Service`} className="service-graphic-img" loading="lazy" />
                                }
                            />
                        </div>
                    ))}
                    {servicesData.length === 0 && (
                        <div className="no-services-msg">
                            Our services are currently being updated. Please check back later!
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
