import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './landing_Page/landing';
import ProjectDetails from './Project_Details_Page/project_Details';
import AboutPage from './about_Page/AboutPage';
import ProjectsPage from './Projects_Page/ProjectsPage';
import ServicesPage from './services_Page/ServicesPage';
import InsightsPage from './insights_Page/InsightsPage';
import ServiceDetailsPage from './Service_Details_Page/ServiceDetailsPage';
import CommunityPage from './Community_Page/CommunityPage';
import FollowUs from './Shared/FollowUs/FollowUs';
import ScrollToTop from './Shared/ScrollToTop';
// ModalProvider moved to main.jsx

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/project-details/:slug" element={<ProjectDetails />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/service/:serviceId" element={<ServiceDetailsPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/community" element={<CommunityPage />} />
            </Routes>
            <FollowUs />
        </Router>
    );
}

export default App;
