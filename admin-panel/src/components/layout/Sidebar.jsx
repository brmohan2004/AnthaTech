import React, { useState } from 'react';
import {
    LayoutDashboard, ShieldCheck, FolderOpen, Mail, Image,
    BarChart3, Settings, Key, HardDrive, Users,
    ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
    Home, Info, Briefcase, Wrench, Sparkles, ListOrdered,
    Star, UsersRound, FileText, Eye, MonitorSmartphone,
    Fingerprint, Lock, ShieldAlert, ScrollText, AlertTriangle,
    Globe, Link, Search, Construction, Webhook
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../assets/logo.png';

const navSections = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={18} />,
        path: '/admin/dashboard',
    },
    {
        id: 'security',
        label: 'Security',
        icon: <ShieldCheck size={18} />,
        badge: true,
        children: [
            { id: 'sec-overview', label: 'Overview', icon: <Eye size={16} />, path: '/admin/security/overview' },
            { id: 'sec-sessions', label: 'Sessions', icon: <MonitorSmartphone size={16} />, path: '/admin/security/sessions' },
            { id: 'sec-mfa', label: 'MFA', icon: <Fingerprint size={16} />, path: '/admin/security/mfa' },
            { id: 'sec-passwords', label: 'Passwords', icon: <Lock size={16} />, path: '/admin/security/passwords' },
            { id: 'sec-ipblock', label: 'IP Blocklist', icon: <ShieldAlert size={16} />, path: '/admin/security/ip-blocklist' },
            { id: 'sec-audit', label: 'Audit Log', icon: <ScrollText size={16} />, path: '/admin/security/audit-log' },
            { id: 'sec-alerts', label: 'Alerts', icon: <AlertTriangle size={16} />, path: '/admin/security/alerts' },
        ],
    },
    {
        id: 'content',
        label: 'Content',
        icon: <FolderOpen size={18} />,
        children: [
            { id: 'cnt-hero', label: 'Hero', icon: <Home size={16} />, path: '/admin/content/hero' },
            { id: 'cnt-about', label: 'About', icon: <Info size={16} />, path: '/admin/content/about' },
            { id: 'cnt-projects', label: 'Projects', icon: <Briefcase size={16} />, path: '/admin/content/projects' },
            { id: 'cnt-services', label: 'Services', icon: <Wrench size={16} />, path: '/admin/content/services' },
            { id: 'cnt-highlights', label: 'Highlights', icon: <Sparkles size={16} />, path: '/admin/content/highlights' },
            { id: 'cnt-process', label: 'Process', icon: <ListOrdered size={16} />, path: '/admin/content/process' },
            { id: 'cnt-reviews', label: 'Reviews', icon: <Star size={16} />, path: '/admin/content/reviews' },
            { id: 'cnt-community', label: 'Community', icon: <UsersRound size={16} />, path: '/admin/content/community' },
            { id: 'cnt-blog', label: 'Blog', icon: <FileText size={16} />, path: '/admin/content/blog' },
        ],
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: <Mail size={18} />,
        path: '/admin/messages',
    },
    {
        id: 'media',
        label: 'Media Lib',
        icon: <Image size={18} />,
        path: '/admin/media',
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 size={18} />,
        children: [
            { id: 'an-traffic', label: 'Traffic', path: '/admin/analytics/traffic' },
            { id: 'an-perf', label: 'Performance', path: '/admin/analytics/performance' },
            { id: 'an-contact', label: 'Contact', path: '/admin/analytics/contact' },
            { id: 'an-community', label: 'Community', path: '/admin/analytics/community' },
        ],
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={18} />,
        children: [
            { id: 'set-general', label: 'General Info', icon: <Globe size={16} />, path: '/admin/settings/general-info' },
            { id: 'set-maint', label: 'Maintenance', icon: <Construction size={16} />, path: '/admin/settings/maintenance' },
            { id: 'set-webhooks', label: 'Webhooks', icon: <Webhook size={16} />, path: '/admin/settings/webhooks' },
            { id: 'set-apikeys', label: 'API Keys', icon: <Key size={16} />, path: '/admin/api-keys' },
            { id: 'set-backup', label: 'Backup', icon: <HardDrive size={16} />, path: '/admin/backup' },
            { id: 'set-adminusers', label: 'Admin Users', icon: <Users size={16} />, path: '/admin/users' },
        ],
    },
];

const Sidebar = ({ collapsed, onToggle, activePath = '/admin/dashboard' }) => {
    const [openSections, setOpenSections] = useState(['content', 'security']);
    const navigate = useNavigate();

    const toggleSection = (id) => {
        setOpenSections((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Company Logo Section */}
            <div className="sidebar-logo-container">
                <img src={logo} alt="AnthaTech Logo" className="sidebar-logo-img" />
                {!collapsed && <span className="sidebar-logo-text">by Qynta</span>}
            </div>

            <nav className="sidebar-nav">
                {navSections.map((section) => {
                    const isOpen = openSections.includes(section.id);
                    const isActive = activePath === section.path;
                    const hasChildren = section.children && section.children.length > 0;

                    return (
                        <div className="nav-group" key={section.id}>
                            <button
                                className={`nav-item ${isActive ? 'nav-item--active' : ''} ${hasChildren && isOpen ? 'nav-item--open' : ''}`}
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleSection(section.id);
                                    } else if (section.path) {
                                        navigate(section.path);
                                    }
                                }}
                                title={collapsed ? section.label : undefined}
                            >
                                <span className="nav-item-icon">{section.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className="nav-item-label">{section.label}</span>
                                        {section.badge && <span className="nav-alert-dot"></span>}
                                        {hasChildren && (
                                            <span className="nav-chevron">
                                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>

                            {hasChildren && isOpen && !collapsed && (
                                <div className="nav-children">
                                    {section.children.map((child) => {
                                        const isChildActive = activePath === child.path;
                                        return (
                                            <button
                                                className={`nav-child ${isChildActive ? 'nav-child--active' : ''}`}
                                                key={child.id}
                                                onClick={() => child.path && navigate(child.path)}
                                            >
                                                {child.icon && <span className="nav-child-icon">{child.icon}</span>}
                                                <span className="nav-child-label">{child.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <button className="sidebar-collapse-btn" onClick={onToggle}>
                {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                {!collapsed && <span>Collapse</span>}
            </button>
        </aside>
    );
};

export default Sidebar;
