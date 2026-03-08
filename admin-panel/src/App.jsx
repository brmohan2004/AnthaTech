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

// A wrapper to pass the current path to AppShell
const AppLayout = ({ children }) => {
    const location = useLocation();

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
        '/admin/analytics/community': 'Community Analytics',
        '/admin/settings/general-info': 'General Info',
        '/admin/settings/maintenance': 'Maintenance Mode',
        '/admin/settings/webhooks': 'Webhook Manager',
        '/admin/api-keys': 'API Key Manager',
        '/admin/backup': 'Backup & Export Center',
    };

    const title = titles[location.pathname] || 'Dashboard';

    return (
        <AppShell pageTitle={title} activePath={location.pathname}>
            {children}
        </AppShell>
    );
};

// Protected route wrapper using Supabase session
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    return children;
};

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>;

    return (
        <Routes>
            {/* Login Route */}
            <Route
                path="/admin/login"
                element={
                    isAuthenticated
                        ? <Navigate to="/admin/dashboard" replace />
                        : <Login />
                }
            />

            {/* Protected Admin Routes */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            <Route path="/admin/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/hero" element={<ProtectedRoute><AppLayout><HeroManager /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/about" element={<ProtectedRoute><AppLayout><AboutTabs /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/services" element={<ProtectedRoute><AppLayout><Services /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/projects" element={<ProtectedRoute><AppLayout><Projects /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/highlights" element={<ProtectedRoute><AppLayout><Highlights /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/process" element={<ProtectedRoute><AppLayout><ProcessSteps /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/reviews" element={<ProtectedRoute><AppLayout><Reviews /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/community" element={<ProtectedRoute><AppLayout><Community /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/content/blog" element={<ProtectedRoute><AppLayout><Blog /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute><AppLayout><Inbox /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute><AppLayout><MediaLibrary /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/overview" element={<ProtectedRoute><AppLayout><SecurityOverview /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/sessions" element={<ProtectedRoute><AppLayout><ActiveSessions /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/mfa" element={<ProtectedRoute><AppLayout><MFASettings /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/passwords" element={<ProtectedRoute><AppLayout><PasswordPolicy /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/audit-log" element={<ProtectedRoute><AppLayout><AuditLog /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/ip-blocklist" element={<ProtectedRoute><AppLayout><IPBlocklist /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/security/alerts" element={<ProtectedRoute><AppLayout><SuspiciousActivityAlerts /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/analytics/traffic" element={<ProtectedRoute><AppLayout><TrafficOverview /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/analytics/performance" element={<ProtectedRoute><AppLayout><PerformanceMetrics /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/analytics/contact" element={<ProtectedRoute><AppLayout><ContactAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/analytics/community" element={<ProtectedRoute><AppLayout><CommunityAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/settings/maintenance" element={<ProtectedRoute><AppLayout><Maintenance /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/settings/webhooks" element={<ProtectedRoute><AppLayout><Webhooks /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/settings/general-info" element={<ProtectedRoute><AppLayout><SiteSettings defaultTab="contact" /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/api-keys" element={<ProtectedRoute><AppLayout><ApiKeys /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/backup" element={<ProtectedRoute><AppLayout><BackupExport /></AppLayout></ProtectedRoute>} />
            {/* Fallback for unbuilt pages */}
            <Route path="*" element={
                isAuthenticated ? (
                    <AppLayout>
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <h2>Page under construction</h2>
                            <p>This section is currently being built.</p>
                        </div>
                    </AppLayout>
                ) : <Navigate to="/admin/login" replace />
            } />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
