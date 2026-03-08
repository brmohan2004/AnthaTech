import React from 'react';
import Header from '../Shared/Header/Header';
import Hero from './sections/hero/Hero';
import Projects from './sections/projects/Projects';
import About1 from './sections/about_1/About1';
import Services from './sections/services/Services';
import About2 from './sections/about_2/About2';
import Highlights from './sections/highlights/Highlights';
import Progress from './sections/progress/Progress';
import Reviews from './sections/reviews/Reviews';
import Contact from '../Shared/contact/Contact';
import Footer from '../Shared/footer/Footer';
import Community from './sections/community/Community';

export default function LandingPage() {
    return (
        <React.Fragment>
            <Header />
            <main>
                <Hero />
                <Projects />
                <About1 />
                <Services />
                <About2 />
                <Highlights />
                <Progress />
                <Reviews />
                <Community />
                <Contact />
                <Footer />
            </main>
        </React.Fragment>
    );
}
