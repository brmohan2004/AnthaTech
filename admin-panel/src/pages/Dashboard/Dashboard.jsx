import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
    Folder, FileText, Mail, Users,
    Plus, Edit, Image as ImageIcon, Settings,
    ArrowUpRight, ArrowRight, Minus, Loader2
} from 'lucide-react';
import { getDashboardStats, getContactMessages, getAuditLog } from '../../api/content';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Total Projects', value: '—', trend: '', trendUp: null, icon: <Folder /> },
        { label: 'Total Blog Posts', value: '—', trend: '', trendUp: null, icon: <FileText /> },
        { label: 'Unread Messages', value: '—', trend: '', trendUp: null, icon: <Mail /> },
        { label: 'Community Apps', value: '—', trend: '', trendUp: null, icon: <Users /> }
    ]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setError(null);
                const [dashStats, messages, logs] = await Promise.all([
                    getDashboardStats(),
                    getContactMessages('All'),
                    getAuditLog({})
                ]);

                setStats([
                    { label: 'Total Projects', value: String(dashStats.totalProjects), trend: '', trendUp: null, icon: <Folder /> },
                    { label: 'Total Blog Posts', value: String(dashStats.totalBlogPosts), trend: '', trendUp: null, icon: <FileText /> },
                    { label: 'Unread Messages', value: `${dashStats.unreadMessages} new`, trend: '', trendUp: dashStats.unreadMessages > 0, icon: <Mail /> },
                    { label: 'Community Members', value: String(dashStats.communityMembers), trend: '', trendUp: null, icon: <Users /> }
                ]);

                setRecentMessages((messages || []).slice(0, 5).map(m => ({
                    name: m.name || m.sender_name || 'Unknown',
                    text: `"${(m.message || m.preview || '').substring(0, 30)}..."`,
                    unread: m.status === 'new'
                })));

                setActivities((logs || []).slice(0, 4).map(log => ({
                    id: log.id,
                    action: log.description || `${log.event_type} on ${log.target || ''}`,
                    time: new Date(log.created_at).toLocaleDateString(),
                    admin: (log.admin_email || 'A').substring(0, 2).toUpperCase()
                })));
            } catch (err) {
                setError(err.message || 'Failed to load dashboard data. Check your Supabase connection.');
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    const quickActions = [
        { label: 'Add Project', desc: 'Create a new portfolio item', icon: <Plus size={20} />, color: '#3B82F6', path: '/admin/content/projects' },
        { label: 'New Blog', desc: 'Write a new article or update', icon: <FileText size={20} />, color: '#10B981', path: '/admin/content/blog' },
        { label: 'Messages', desc: 'Review client inquiries', icon: <Mail size={20} />, color: '#F59E0B', path: '/admin/messages' },
        { label: 'Media Library', desc: 'Manage images and assets', icon: <ImageIcon size={20} />, color: '#6366F1', path: '/admin/media' },
        { label: 'Hero Section', desc: 'Update landing page content', icon: <Edit size={20} />, color: '#EF4444', path: '/admin/content/hero' },
        { label: 'Settings', desc: 'General system configuration', icon: <Settings size={20} />, color: '#6B7280', path: '/admin/settings/general-info' },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="breadcrumb">Dashboard &gt; <span>Overview</span></div>
                <h1 className="page-title">Dashboard</h1>
            </header>

            {error && (
                <div className="dashboard-error" style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Stats Row */}
            <section className="stats-row">
                {stats.map((stat, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-header">
                            <span className="stat-icon">{stat.icon}</span>
                            <h3 className="stat-label">{stat.label}</h3>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className={`stat-trend ${stat.trendUp === true ? 'positive' : stat.trendUp === false ? 'negative' : 'neutral'}`}>
                            {stat.trendUp === true && <ArrowUpRight size={14} />}
                            {stat.trendUp === null && <Minus size={14} />}
                            <span>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="dashboard-grid">

                {/* Recent Messages Panel */}
                <section className="recent-messages-panel panel">
                    <div className="panel-header">
                        <h2>Recent Messages</h2>
                    </div>
                    <ul className="message-list">
                        {recentMessages.map((msg, i) => (
                            <li
                                className={`message-item ${msg.unread ? 'unread' : ''}`}
                                key={i}
                                onClick={() => navigate('/admin/messages')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="message-dot"></div>
                                <div className="message-content">
                                    <span className="message-name">{msg.name}</span>
                                    <span className="message-text">{msg.text}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="view-all-btn" onClick={() => navigate('/admin/messages')}>
                        View All Messages <ArrowRight size={16} />
                    </button>
                </section>

                {/* Quick Actions Panel */}
                <section className="quick-actions-panel panel">
                    <div className="panel-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="actions-grid">
                        {quickActions.map((action, i) => (
                            <button
                                className="action-card"
                                key={i}
                                onClick={() => navigate(action.path)}
                                style={{ '--action-color': action.color }}
                            >
                                <div className="action-icon">
                                    {action.icon}
                                </div>
                                <div className="action-info">
                                    <span className="action-title">{action.label}</span>
                                    <span className="action-desc">{action.desc}</span>
                                </div>
                                <div className="action-arrow">
                                    <ArrowRight size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                </section>


                {/* Recent Activity Log Panel */}
                <section className="activity-log-panel panel">
                    <div className="panel-header">
                        <h2>Recent Activity Log</h2>
                    </div>
                    <ul className="activity-list">
                        {activities.map((act) => (
                            <li className="activity-item" key={act.id}>
                                <div className="activity-avatar">{act.admin}</div>
                                <div className="activity-details">
                                    <span className="activity-action">{act.action}</span>
                                    <span className="activity-time">{act.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default Dashboard;
