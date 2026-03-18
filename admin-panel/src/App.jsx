import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard/Dashboard';
import HeroManager from './pages/Content/Hero/Hero';
import AboutTabs from './pages/Content/AboutTabs/AboutTabs';
import Services from './pages/Content/Services/Services';
import Projects from './pages/Content/Projects/Projects';
import Highlights from './pages/Content/Highlights/Highlights';
import ProcessSteps from './pages/Content/ProcessSteps/ProcessSteps';
import Reviews from './pages/Content/Reviews/Reviews';
import Community from './pages/Content/Community/Community';
import CommunityApplications from './pages/Community/Applications';
import Blog from './pages/Content/Blog/Blog';
import Inbox from './pages/Messages/Inbox';
import SiteSettings from './pages/Settings/SiteSettings/SiteSettings';
import AdminUsers from './pages/AdminUsers/AdminUsers';
import MediaLibrary from './pages/MediaLibrary/MediaLibrary';
import SecurityOverview from './pages/Security/Overview/Overview';
import ActiveSessions from './pages/Security/ActiveSessions/ActiveSessions';
import MFASettings from './pages/Security/MFASettings/MFASettings';
import PasswordPolicy from './pages/Security/PasswordPolicy/PasswordPolicy';
import AuditLog from './pages/Security/AuditLog/AuditLog';
import IPBlocklist from './pages/Security/IPBlocklist/IPBlocklist';
import SuspiciousActivityAlerts from './pages/Security/Alerts/Alerts';
import Maintenance from './pages/Settings/Maintenance/Maintenance';
import Webhooks from './pages/Settings/Webhooks/Webhooks';
import TrafficOverview from './pages/Analytics/Traffic/Traffic';
import PerformanceMetrics from './pages/Analytics/Performance/Performance';
import ContactAnalytics from './pages/Analytics/Contact/Contact';
import CommunityAnalytics from './pages/Analytics/Community/Community';
import BackupExport from './pages/ApiKeys/Backup/Backup';
import ApiKeys from './pages/ApiKeys/ApiKeys';
import Login from './pages/Auth/Login';
import LegalPages from './pages/Content/LegalPages/LegalPages';

import { Outlet } from 'react-router-dom';

// Admin Layout that persists across routes
const AdminLayout = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Quick map to get page titles based on path
    const titles = {
        '/admin/dashboard': 'Overview',
        '/admin/content/hero': 'Hero Section Manager',
        '/admin/content/about': 'About Section Manager',
        '/admin/content/services': 'Services Manager',
        '/admin/content/projects': 'Projects Manager',
        '/admin/content/highlights': 'Highlights Manager',
        '/admin/content/process': 'Process Steps Manager',
        '/admin/content/reviews': 'Reviews Manager',
        '/admin/content/community': 'Community Manager',
        '/admin/community/applications': 'Community Applications',
        '/admin/content/blog': 'Blog / Insights Manager',
        '/admin/messages': 'Messages Inbox',
        '/admin/media': 'Media Library',
        '/admin/users': 'Admin Users',
        '/admin/security/overview': 'Security Overview',
        '/admin/security/sessions': 'Active Sessions',
        '/admin/security/mfa': 'MFA Settings',
        '/admin/security/passwords': 'Password Policy',
        '/admin/security/audit-log': 'Audit Log',
        '/admin/security/ip-blocklist': 'IP Blocklist',
        '/admin/security/alerts': 'Suspicious Activity Alerts',
        '/admin/analytics/traffic': 'Traffic Overview',
        '/admin/analytics/performance': 'Performance Metrics',
        '/admin/analytics/contact': 'Contact Analytics',
        '/admin/messages/contact-analytics': 'Contact Form Analytics',
        '/admin/analytics/community': 'Community Analytics',
        '/admin/settings/general-info': 'General Info',
        '/admin/settings/maintenance': 'Maintenance Mode',
        '/admin/settings/webhooks': 'Webhook Manager',
        '/admin/api-keys': 'API Key Manager',
        '/admin/backup': 'Backup & Export Center',
        '/admin/content/legal': 'Legal Pages Manager',
    };

    const title = titles[location.pathname] || 'Dashboard';

    return (
        <AppShell pageTitle={title} activePath={location.pathname}>
            <Outlet />
        </AppShell>
    );
};

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>;

    return (
        <Routes>
            {/* Login Route - Separate from AdminLayout */}
            <Route
                path="/admin/login"
                element={
                    isAuthenticated
                        ? <Navigate to="/admin/dashboard" replace />
                        : <Login />
                }
            />

            {/* Admin Routes with Persistent Layout */}
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/content/hero" element={<HeroManager />} />
                <Route path="/admin/content/about" element={<AboutTabs />} />
                <Route path="/admin/content/services" element={<Services />} />
                <Route path="/admin/content/projects" element={<Projects />} />
                <Route path="/admin/content/highlights" element={<Highlights />} />
                <Route path="/admin/content/process" element={<ProcessSteps />} />
                <Route path="/admin/content/reviews" element={<Reviews />} />
                <Route path="/admin/content/community" element={<Community />} />
                <Route path="/admin/community/applications" element={<CommunityApplications />} />
                <Route path="/admin/content/blog" element={<Blog />} />
                <Route path="/admin/content/legal" element={<LegalPages />} />
                <Route path="/admin/messages" element={<Inbox />} />
                <Route path="/admin/media" element={<MediaLibrary />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/security/overview" element={<SecurityOverview />} />
                <Route path="/admin/security/sessions" element={<ActiveSessions />} />
                <Route path="/admin/security/mfa" element={<MFASettings />} />
                <Route path="/admin/security/passwords" element={<PasswordPolicy />} />
                <Route path="/admin/security/audit-log" element={<AuditLog />} />
                <Route path="/admin/security/ip-blocklist" element={<IPBlocklist />} />
                <Route path="/admin/security/alerts" element={<SuspiciousActivityAlerts />} />
                <Route path="/admin/analytics/traffic" element={<TrafficOverview />} />
                <Route path="/admin/analytics/performance" element={<PerformanceMetrics />} />
                <Route path="/admin/analytics/contact" element={<ContactAnalytics />} />
                <Route path="/admin/messages/contact-analytics" element={<ContactAnalytics />} />
                <Route path="/admin/analytics/community" element={<CommunityAnalytics />} />
                <Route path="/admin/settings/maintenance" element={<Maintenance />} />
                <Route path="/admin/settings/webhooks" element={<Webhooks />} />
                <Route path="/admin/settings/general-info" element={<SiteSettings defaultTab="contact" />} />
                <Route path="/admin/api-keys" element={<ApiKeys />} />
                <Route path="/admin/backup" element={<BackupExport />} />

                {/* Fallback for unbuilt pages */}
                <Route path="*" element={
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <h2>Page under construction</h2>
                        <p>This section is currently being built.</p>
                    </div>
                } />
            </Route>

            {/* External Fallback */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
