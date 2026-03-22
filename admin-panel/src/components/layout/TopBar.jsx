import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, ChevronDown, LogOut, User, KeyRound } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { signOut } from '../../api/auth';
import { getNotifications } from '../../api/content';
import NotificationCenter from '../ui/NotificationCenter/NotificationCenter';
import ProfileSettings from '../../pages/Auth/ProfileSettings';
import './TopBar.css';

const TopBar = ({ pageTitle = 'Dashboard', collapsed }) => {
    const { isDark, toggleTheme } = useTheme();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profilePopup, setProfilePopup] = useState({ open: false, tab: 'profile' });
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        const fetchNotifs = async () => {
            try {
                const data = await getNotifications();
                if (data && mounted) {
                    setUnreadCount(data.filter(n => !n.is_read).length);
                }
            } catch (err) {}
        };
        fetchNotifs();
        return () => { mounted = false; };
    }, [showNotifs]);

    return (
        <header className={`topbar ${collapsed ? 'topbar--collapsed' : ''}`}>
            <div className="topbar-left">
                <span className="topbar-badge">ADMIN</span>
                <span className="topbar-page-title">{pageTitle}</span>
            </div>

            <div className="topbar-right">
                {/* Dark Mode Toggle */}
                <button
                    className="topbar-icon-btn"
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notification Bell */}
                <div className="topbar-notif-wrapper">
                    <button
                        className="topbar-icon-btn"
                        onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>
                </div>

                {/* Profile Dropdown */}
                <div className="topbar-profile-wrapper">
                    <button
                        className="topbar-profile-btn"
                        onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
                    >
                        <span className="profile-avatar">AB</span>
                        <span className="profile-name">Admin</span>
                        <ChevronDown size={14} />
                    </button>
                    {showProfile && (
                        <div className="profile-dropdown">
                            <button className="dropdown-item" onClick={() => { setProfilePopup({ open: true, tab: 'profile' }); setShowProfile(false); }}>
                                <User size={16} /> Profile Settings
                            </button>
                            <button className="dropdown-item" onClick={() => { setProfilePopup({ open: true, tab: 'password' }); setShowProfile(false); }}>
                                <KeyRound size={16} /> Change Password
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item dropdown-item--danger" onClick={async () => { await signOut(); window.location.href = '/login'; }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <NotificationCenter
                isOpen={showNotifs}
                onClose={() => setShowNotifs(false)}
            />

            <ProfileSettings
                isOpen={profilePopup.open}
                onClose={() => setProfilePopup({ open: false, tab: 'profile' })}
                defaultTab={profilePopup.tab}
            />
        </header>
    );
};

export default TopBar;
