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
import { fetchSiteConfig } from './api/content';
import MaintenancePage from './Shared/Maintenance/MaintenancePage';
import SEO from './Shared/SEO';
import LegalPage from './Legal_Pages/LegalPage';
import { useState, useEffect } from 'react';
// ModalProvider moved to main.jsx


function App() {
    const [maintenance, setMaintenance] = useState(null);
    const [siteConfig, setSiteConfig] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const config = await fetchSiteConfig();
                
                // Parse standard JSON fields from site_config
                const processed = { ...config };
                ['contact', 'social', 'pricing', 'seo', 'seo_schema', 'seo_sitemap', 'seo_robots', 'seo_redirects', 'maintenance'].forEach(key => {
                    if (config[key] && typeof config[key] === 'string') {
                        try {
                            processed[key] = JSON.parse(config[key]);
                        } catch (e) {
                            console.warn(`Failed to parse site_config key: ${key}`, e);
                        }
                    }
                });

                setSiteConfig(processed);
                if (processed.maintenance) {
                    setMaintenance(processed.maintenance);
                }
            } catch (err) {
                console.error('Failed to load site configuration', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Bypass check: if ?bypass=1 is in URL or local storage has bypass_maint=true
    const queryParams = new URLSearchParams(window.location.search);
    const bypassUrl = queryParams.get('bypass') === '1';
    const bypassStorage = localStorage.getItem('bypass_maint') === 'true';

    if (bypassUrl) {
      localStorage.setItem('bypass_maint', 'true');
    }

    const shouldShowMaintenance = maintenance?.isEnabled && !bypassUrl && !bypassStorage;

    if (loading) return null; // Or a simple loader

    if (shouldShowMaintenance) {
      return (
        <MaintenancePage 
          title={maintenance.title} 
          message={maintenance.message} 
          expectedBackAt={maintenance.expectedBackAt} 
        />
      );
    }

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SEO config={siteConfig} />
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
                <Route path="/privacy-policy" element={<LegalPage />} />
                <Route path="/terms-conditions" element={<LegalPage />} />
                <Route path="/conditions" element={<LegalPage />} />
                <Route path="/cookies-policy" element={<LegalPage />} />
            </Routes>

            <FollowUs />
        </Router>

    );
}

export default App;
