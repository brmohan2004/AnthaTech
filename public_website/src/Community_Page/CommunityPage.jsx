import React, { useEffect } from 'react';
import Header from '../Shared/Header/Header';
import CommunityHero from './sections/Hero/CommunityHero';
import HowItWorks from './sections/HowItWorks/HowItWorks';
import Perks from './sections/Perks/Perks';
import Apply from './sections/Apply/Apply';
import Contact from '../Shared/contact/Contact';
import Footer from '../Shared/footer/Footer';
import { clearCommunityCache } from '../api/content';

const CommunityPage = () => {
    useEffect(() => {
        clearCommunityCache();
    }, []);

    return (
        <div className="community-page">
            <Header />
            <main>
                <CommunityHero />
                <HowItWorks />
                <Perks />
                <Apply />
            </main>
            <Contact />
            <Footer />
        </div>
    );
};

export default CommunityPage;
