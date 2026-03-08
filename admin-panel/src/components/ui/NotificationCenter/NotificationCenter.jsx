import React, { useState, useMemo, useEffect } from 'react';
import {
    Mail, Users, CheckCircle, AlertTriangle, ShieldAlert, X, Bell,
    FileText, Settings, HardDrive, Briefcase, Star, Globe, Filter
} from 'lucide-react';
import { getNotifications, markAllNotificationsRead } from '../../../api/content';
import './NotificationCenter.css';


const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'message', label: 'Messages' },
    { id: 'critical', label: 'Security' },
    { id: 'content', label: 'Content' },
    { id: 'community', label: 'Community' },
    { id: 'system', label: 'System' },
    { id: 'warning', label: 'Warnings' },
];

const NotificationCenter = ({ isOpen, onClose }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);

    // Fetch real notifications and fallback to mock if empty
    useEffect(() => {
        if (isOpen) {
            (async () => {
                try {
                    setError(null);
                    const data = await getNotifications();
                    if (data && data.length > 0) {
                        setNotifications(data.map(n => ({
                            id: n.id,
                            type: n.type,
                            icon: <Bell size={16} />,
                            text: n.title,
                            time: new Date(n.created_at).toLocaleDateString(),
                            isNew: !n.is_read
                        })));
                    } else {
                        setNotifications([]);
                    }
                } catch (err) {
                    setError(err.message || 'Failed to connect to notification server.');
                    setNotifications([]);
                }
            })();
        }
    }, [isOpen]);

    const filtered = useMemo(() => {
        if (activeFilter === 'all') return notifications;
        if (activeFilter === 'unread') return notifications.filter((n) => n.isNew);
        // 'critical' filter matches both 'critical' type
        if (activeFilter === 'critical') return notifications.filter((n) => n.type === 'critical');
        return notifications.filter((n) => n.type === activeFilter);
    }, [activeFilter, notifications]);

    const unreadCount = notifications.filter((n) => n.isNew).length;

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
        try {
            await markAllNotificationsRead();
        } catch { /* ignore */ }
    };

    const handleDismiss = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div className="notif-overlay" onClick={onClose}>
            <div className="notif-popup" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="notif-popup-header">
                    <div className="notif-popup-header-left">
                        <Bell size={18} />
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="notif-header-count">{unreadCount}</span>
                        )}
                    </div>
                    <div className="notif-popup-header-right">
                        <button className="notif-mark-read" onClick={handleMarkAllRead}>
                            Mark All Read
                        </button>
                        <button className="notif-close" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="notif-filters">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            className={`notif-filter-btn ${activeFilter === f.id ? 'notif-filter-btn--active' : ''}`}
                            onClick={() => setActiveFilter(f.id)}
                        >
                            {f.label}
                            {f.id === 'unread' && unreadCount > 0 && (
                                <span className="notif-filter-count">{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <ul className="notif-list">
                    {filtered.map((n) => (
                        <li className={`notif-item notif-item--${n.type} ${n.isNew ? 'notif-item--unread' : ''}`} key={n.id}>
                            <span className="notif-icon">{n.icon}</span>
                            <div className="notif-body">
                                <div className="notif-text">
                                    {n.isNew && <span className="notif-new-badge">NEW</span>}
                                    {n.text}
                                </div>
                                <span className="notif-time">{n.time}</span>
                            </div>
                            <button className="notif-dismiss" title="Dismiss" onClick={() => handleDismiss(n.id)}>
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Empty state & Errors */}
                {error ? (
                    <div className="notif-empty" style={{ color: '#F05A63', background: 'rgba(240,90,99,0.05)', borderRadius: 8 }}>
                        <AlertTriangle size={32} />
                        <p>{error}</p>
                    </div>
                ) : filtered.length === 0 && (
                    <div className="notif-empty">
                        <Filter size={32} />
                        <p>{activeFilter === 'unread' ? 'No unread notifications' : 'No notifications in this category'}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="notif-footer">
                    <span className="notif-footer-count">
                        {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                        {activeFilter !== 'all' ? ` in "${filters.find((f) => f.id === activeFilter)?.label}"` : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
