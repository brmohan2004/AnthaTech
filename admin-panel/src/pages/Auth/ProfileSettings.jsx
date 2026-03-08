import React, { useState, useEffect } from 'react';
import {
    User, Mail, Shield, Camera, Eye, EyeOff, X,
    Loader2, CheckCircle2, AlertCircle, KeyRound, Bell, Palette
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrentUser, getAdminProfile, updateAdminProfile, updatePassword } from '../../api/auth';
import './ProfileSettings.css';

const ProfileSettings = ({ isOpen, onClose, defaultTab = 'profile' }) => {
    const { isDark, toggleTheme } = useTheme();

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        phone: '',
        bio: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // Password state
    const [passwords, setPasswords] = useState({
        current: '',
        newPw: '',
        confirm: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    // Notification preferences
    const [notifs, setNotifs] = useState({
        emailAlerts: true,
        securityAlerts: true,
        loginAlerts: false,
        weeklyReport: true,
    });

    // Active tab
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Reset tab when popup opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab);
            setPwError('');
            setPwSuccess(false);
            setProfileSaved(false);

            (async () => {
                setProfileLoading(true);
                setProfileError(null);
                try {
                    const user = await getCurrentUser();
                    if (!user) {
                        setProfileError('Could not retrieve current user session.');
                        setProfileLoading(false);
                        return;
                    }
                    const data = await getAdminProfile(user.id);
                    if (data) {
                        setProfile(prev => ({
                            ...prev,
                            name: data.full_name || '',
                            role: data.role === 'super_admin' ? 'Super Admin' : 'Admin User',
                            email: data.email || user.email || '',
                        }));
                    } else {
                        setProfile(prev => ({
                            ...prev,
                            name: '',
                            email: user.email || '',
                            role: '',
                        }));
                    }
                } catch (err) {
                    setProfileError(err.message || 'Failed to load profile data.');
                } finally {
                    setProfileLoading(false);
                }
            })();
        }
    }, [isOpen, defaultTab]);

    const passwordStrength = (pw) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (pw.length >= 12) score++;
        if (score <= 1) return { label: 'Weak', color: 'var(--accent-red)', pct: 25 };
        if (score <= 2) return { label: 'Fair', color: 'var(--accent-yellow)', pct: 50 };
        if (score <= 3) return { label: 'Good', color: 'var(--accent-blue)', pct: 75 };
        return { label: 'Strong', color: 'var(--accent-green)', pct: 100 };
    };

    const strength = passwordStrength(passwords.newPw);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileSaved(false);
        try {
            const user = await getCurrentUser();
            if (user) {
                await updateAdminProfile(user.id, { full_name: profile.name, email: profile.email });
            }
        } catch (err) {
            setProfileError(err.message || 'Failed to save profile.');
            setProfileSaving(false);
            return;
        }
        setProfileSaving(false);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess(false);

        if (passwords.newPw.length < 8) {
            setPwError('New password must be at least 8 characters.');
            return;
        }
        if (passwords.newPw !== passwords.confirm) {
            setPwError('Passwords do not match.');
            return;
        }

        setPwSaving(true);
        try {
            await updatePassword(passwords.newPw);
            setPwSuccess(true);
            setPasswords({ current: '', newPw: '', confirm: '' });
            setTimeout(() => setPwSuccess(false), 3000);
        } catch (err) {
            setPwError(err.message || 'Failed to update password.');
        } finally {
            setPwSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={16} /> },
        { id: 'password', label: 'Password', icon: <KeyRound size={16} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    ];

    if (!isOpen) return null;

    return (
        <div className="ps-overlay" onClick={onClose}>
            <div className="ps-popup" onClick={(e) => e.stopPropagation()}>
                <button className="ps-close" onClick={onClose}>
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="ps-header">
                    <h1 className="ps-title">Profile & Settings</h1>
                    <p className="ps-subtitle">Manage your account, security and preferences</p>
                </div>

                {/* Tabs */}
                <div className="ps-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`ps-tab ${activeTab === tab.id ? 'ps-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <form className="ps-section" onSubmit={handleProfileSave}>
                        <div className="ps-card">
                            <h2 className="ps-card-title">Personal Information</h2>
                            <p className="ps-card-desc">Update your profile details and avatar</p>

                            {profileError && (
                                <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
                                    <strong>Error:</strong> {profileError}
                                </div>
                            )}

                            {/* Avatar */}
                            <div className="ps-avatar-row">
                                <div className="ps-avatar">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" />
                                    ) : (
                                        <span className="ps-avatar-initials">
                                            {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                        </span>
                                    )}
                                    <label className="ps-avatar-overlay" htmlFor="avatar-upload">
                                        <Camera size={18} />
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        hidden
                                    />
                                </div>
                                <div className="ps-avatar-info">
                                    <span className="ps-avatar-name">{profile.name}</span>
                                    <span className="ps-avatar-role">
                                        <Shield size={13} /> {profile.role}
                                    </span>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="ps-fields">
                                <div className="ps-field">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="ps-field">
                                    <label>Email Address</label>
                                    <div className="ps-field-icon-input">
                                        <Mail size={16} className="ps-field-icon" />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="ps-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="ps-field ps-field--full">
                                    <label>Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        placeholder="A short bio about yourself..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="ps-actions">
                                <button type="submit" className="ps-btn ps-btn--primary" disabled={profileSaving}>
                                    {profileSaving && <Loader2 size={16} className="ps-spinner" />}
                                    {profileSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                {profileSaved && (
                                    <span className="ps-save-success">
                                        <CheckCircle2 size={16} /> Saved successfully
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <form className="ps-section" onSubmit={handlePasswordChange}>
                        <div className="ps-card">
                            <h2 className="ps-card-title">Change Password</h2>
                            <p className="ps-card-desc">Update your password to keep your account secure</p>

                            {pwError && (
                                <div className="ps-alert ps-alert--error">
                                    <AlertCircle size={16} /> {pwError}
                                </div>
                            )}
                            {pwSuccess && (
                                <div className="ps-alert ps-alert--success">
                                    <CheckCircle2 size={16} /> Password updated successfully
                                </div>
                            )}

                            <div className="ps-fields ps-fields--stack">
                                <div className="ps-field">
                                    <label>Current Password</label>
                                    <div className="ps-field-pw">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="ps-pw-toggle"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            tabIndex={-1}
                                        >
                                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="ps-field">
                                    <label>New Password</label>
                                    <div className="ps-field-pw">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={passwords.newPw}
                                            onChange={(e) => setPasswords({ ...passwords, newPw: e.target.value })}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="ps-pw-toggle"
                                            onClick={() => setShowNew(!showNew)}
                                            tabIndex={-1}
                                        >
                                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passwords.newPw && (
                                        <div className="ps-pw-strength">
                                            <div className="ps-pw-strength-bar">
                                                <div
                                                    className="ps-pw-strength-fill"
                                                    style={{ width: `${strength.pct}%`, background: strength.color }}
                                                />
                                            </div>
                                            <span className="ps-pw-strength-label" style={{ color: strength.color }}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="ps-field">
                                    <label>Confirm New Password</label>
                                    <div className="ps-field-pw">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="ps-pw-toggle"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passwords.confirm && passwords.newPw !== passwords.confirm && (
                                        <span className="ps-pw-mismatch">Passwords do not match</span>
                                    )}
                                </div>
                            </div>

                            <div className="ps-actions">
                                <button
                                    type="submit"
                                    className="ps-btn ps-btn--primary"
                                    disabled={pwSaving || !passwords.current || !passwords.newPw || !passwords.confirm}
                                >
                                    {pwSaving && <Loader2 size={16} className="ps-spinner" />}
                                    {pwSaving ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="ps-section">
                        <div className="ps-card">
                            <h2 className="ps-card-title">Notification Preferences</h2>
                            <p className="ps-card-desc">Choose what notifications you want to receive</p>

                            <div className="ps-notif-list">
                                <label className="ps-notif-item">
                                    <div className="ps-notif-text">
                                        <span className="ps-notif-label">Email Alerts</span>
                                        <span className="ps-notif-desc">Receive email notifications for important updates</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="ps-toggle"
                                        checked={notifs.emailAlerts}
                                        onChange={(e) => setNotifs({ ...notifs, emailAlerts: e.target.checked })}
                                    />
                                </label>

                                <label className="ps-notif-item">
                                    <div className="ps-notif-text">
                                        <span className="ps-notif-label">Security Alerts</span>
                                        <span className="ps-notif-desc">Get notified about suspicious activities and security events</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="ps-toggle"
                                        checked={notifs.securityAlerts}
                                        onChange={(e) => setNotifs({ ...notifs, securityAlerts: e.target.checked })}
                                    />
                                </label>

                                <label className="ps-notif-item">
                                    <div className="ps-notif-text">
                                        <span className="ps-notif-label">Login Alerts</span>
                                        <span className="ps-notif-desc">Notify when a new device signs into your account</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="ps-toggle"
                                        checked={notifs.loginAlerts}
                                        onChange={(e) => setNotifs({ ...notifs, loginAlerts: e.target.checked })}
                                    />
                                </label>

                                <label className="ps-notif-item">
                                    <div className="ps-notif-text">
                                        <span className="ps-notif-label">Weekly Report</span>
                                        <span className="ps-notif-desc">Receive a weekly summary of analytics and activity</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="ps-toggle"
                                        checked={notifs.weeklyReport}
                                        onChange={(e) => setNotifs({ ...notifs, weeklyReport: e.target.checked })}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="ps-section">
                        <div className="ps-card">
                            <h2 className="ps-card-title">Appearance</h2>
                            <p className="ps-card-desc">Customize the look and feel of your admin panel</p>

                            <div className="ps-appearance-grid">
                                <button
                                    className={`ps-theme-card ${!isDark ? 'ps-theme-card--active' : ''}`}
                                    onClick={() => isDark && toggleTheme()}
                                >
                                    <div className="ps-theme-preview ps-theme-preview--light">
                                        <div className="ps-theme-sidebar" />
                                        <div className="ps-theme-content">
                                            <div className="ps-theme-bar" />
                                            <div className="ps-theme-lines">
                                                <div /><div /><div />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="ps-theme-label">Light Mode</span>
                                    {!isDark && <CheckCircle2 size={16} className="ps-theme-check" />}
                                </button>

                                <button
                                    className={`ps-theme-card ${isDark ? 'ps-theme-card--active' : ''}`}
                                    onClick={() => !isDark && toggleTheme()}
                                >
                                    <div className="ps-theme-preview ps-theme-preview--dark">
                                        <div className="ps-theme-sidebar" />
                                        <div className="ps-theme-content">
                                            <div className="ps-theme-bar" />
                                            <div className="ps-theme-lines">
                                                <div /><div /><div />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="ps-theme-label">Dark Mode</span>
                                    {isDark && <CheckCircle2 size={16} className="ps-theme-check" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;
