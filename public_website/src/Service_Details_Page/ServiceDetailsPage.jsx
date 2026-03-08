import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ServiceDetailsHeader from './sections/Header/ServiceDetailsHeader';
import WhatWeOffer from './sections/WhatWeOffer/WhatWeOffer';
import OurProcess from './sections/OurProcess/OurProcess';
import Benefits from './sections/Benefits/Benefits';
import Contact from '../Shared/contact/Contact';
import Footer from '../Shared/footer/Footer';
import { fetchServiceBySlug } from '../api/content';
import ErrorMessage from '../Shared/ErrorMessage/ErrorMessage';
import './service_details.css';

const ServiceDetailsPage = () => {
    const { serviceId } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadServiceDetails = () => {
        if (!serviceId) return;
        setLoading(true);
        setError(null);
        fetchServiceBySlug(serviceId)
            .then(row => {
                if (row) {
                    setService({
                        title: row.title,
                        subtitle: row.short_description || '',
                        description: row.short_description || '',
                        heroColor: row.hero_bg_color || '#f3f4f6',
                        offers: Array.isArray(row.offers) ? row.offers : [],
                        process: Array.isArray(row.process_steps) ? row.process_steps : [],
                        benefits: Array.isArray(row.benefits) ? row.benefits : [],
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadServiceDetails();
    }, [serviceId]);

    if (loading) {
        return (
            <div className="service-details-container loading">
                <ServiceDetailsHeader />
                <div className="sd-loading-spinner">Loading service details...</div>
                <Footer />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="service-details-container error">
                <ServiceDetailsHeader />
                <ErrorMessage
                    message={error || "The service you're looking for was not found."}
                    retry={loadServiceDetails}
                />
                <Footer />
            </div>
        );
    }

    return (
        <div className="service-details-container">
            <ServiceDetailsHeader />
            <main>
                <section className="sd-hero" style={{ backgroundColor: service.heroColor }}>
                    <div className="sd-hero-content">
                        <div className="section-badge">
                            <span className="badge-text" style={{ textTransform: 'none' }}>Solutions / {service.title}</span>
                        </div>
                        <h1 className="sd-title">{service.title}</h1>
                        <h2 className="sd-subtitle">{service.subtitle}</h2>
                        <p className="sd-description">{service.description}</p>
                    </div>
                </section>

                <WhatWeOffer offers={service.offers} />
                <OurProcess steps={service.process} />
                <Benefits benefits={service.benefits} />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default ServiceDetailsPage;
