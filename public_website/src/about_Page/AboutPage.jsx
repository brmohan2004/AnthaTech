import React from 'react';
import Header from '../Shared/Header/Header';
import AboutHero from './sections/Hero/AboutHero';
import About1 from '../landing_Page/sections/about_1/About1';
import About2 from '../landing_Page/sections/about_2/About2';
import Highlights from '../landing_Page/sections/highlights/Highlights';
import Progress from '../landing_Page/sections/progress/Progress';
import Footer from '../Shared/footer/Footer';
import Contact from '../Shared/contact/Contact';
import './about_page.css';

const AboutPage = () => {
    return (
        <div className="about-page-container">
            <Header />
            <main className="about-page-content">
                <AboutHero />
                <About1 />
                <About2 />
                <Highlights />
                <Progress />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default AboutPage;
