import React from 'react';
import Header from '../Shared/Header/Header';
import InsightsHero from './sections/Hero/InsightsHero';
import BlogList from './sections/BlogList/BlogList';
import Footer from '../Shared/footer/Footer';
import Contact from '../Shared/contact/Contact';
import './insights_page.css';

const InsightsPage = () => {
    return (
        <div className="insights-page-container">
            <Header />
            <main className="insights-page-content">
                <InsightsHero />
                <BlogList />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default InsightsPage;
