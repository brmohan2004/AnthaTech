import React from 'react';
import Header from '../Shared/Header/Header';
import ServicesHero from './sections/Hero/ServicesHero';
import AboutServices from './sections/AboutServices/AboutServices';
import Services from '../landing_Page/sections/services/Services';
import Footer from '../Shared/footer/Footer';
import Contact from '../Shared/contact/Contact';
import './services_page.css';

const ServicesPage = () => {
    return (
        <div className="services-page-container">
            <Header />
            <main className="services-page-content">
                <ServicesHero />
                <Services />
                <AboutServices />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default ServicesPage;
