import React, { useState, useEffect, useMemo } from 'react';
import {
    UserPlus, Search, Edit2, ShieldOff, ShieldCheck,
    Trash2, X, Send, ChevronDown, Lock, Users, Filter,
    KeyRound, Eye, Pencil, Check, LayoutDashboard,
    FolderOpen, Mail, Image, BarChart3, Settings, Key as KeyIcon, HardDrive
} from 'lucide-react';
import './AdminUsers.css';
import Button from '../../components/ui/Button';
import ToastMessage from '../../components/ui/ToastMessage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { listAdminProfiles, updateAdminProfile, deleteAdminProfile } from '../../api/auth';
import { createAdminUser, deleteAdminUser } from '../../api/edgeFunctions';
import { getSiteConfig, updateSiteConfig } from '../../api/content';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = ['Admin', 'Editor', 'Viewer'];

// Map between display names and DB values
const roleToDb = (display) => display.toLowerCase().replace(/\s/g, '_');
const roleToDisplay = (db) => {
    const map = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
    return map[db] || db;
};

const ACCESS_SECTIONS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, category: 'Main' },
    { id: 'content', label: 'Content Management', icon: <FolderOpen size={16} />, category: 'Main' },
    { id: 'messages', label: 'Messages', icon: <Mail size={16} />, category: 'Main' },
    { id: 'media', label: 'Media Library', icon: <Image size={16} />, category: 'Main' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} />, category: 'Main' },
    { id: 'settings', label: 'Site Settings', icon: <Settings size={16} />, category: 'System' },
    { id: 'security', label: 'Security Center', icon: <ShieldCheck size={16} />, category: 'System' },
    { id: 'api-keys', label: 'API Keys', icon: <KeyIcon size={16} />, category: 'System' },
    { id: 'backup', label: 'Backup & Export', icon: <HardDrive size={16} />, category: 'System' },
    { id: 'admin-users', label: 'Admin Users', icon: <Users size={16} />, category: 'System' },
];

const DEFAULT_PERMISSIONS = {
    Admin: {
        dashboard: { view: true, edit: true },
        content: { view: true, edit: true },
        messages: { view: true, edit: true },
        media: { view: true, edit: true },
        analytics: { view: true, edit: false },
        settings: { view: true, edit: false },
        security: { view: true, edit: false },
        'api-keys': { view: false, edit: false },
        backup: { view: true, edit: false },
        'admin-users': { view: true, edit: false },
    },
    Editor: {
        dashboard: { view: true, edit: false },
        content: { view: true, edit: true },
        messages: { view: true, edit: false },
        media: { view: true, edit: true },
        analytics: { view: false, edit: false },
        settings: { view: false, edit: false },
        security: { view: false, edit: false },
        'api-keys': { view: false, edit: false },
        backup: { view: false, edit: false },
        'admin-users': { view: false, edit: false },
    },
    Viewer: {
        dashboard: { view: true, edit: false },
        content: { view: true, edit: false },
        messages: { view: true, edit: false },
        media: { view: true, edit: false },
        analytics: { view: false, edit: false },
        settings: { view: false, edit: false },
        security: { view: false, edit: false },
        'api-keys': { view: false, edit: false },
        backup: { view: false, edit: false },
        'admin-users': { view: false, edit: false },
    },
};

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const getAvatarColor = (name) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const AdminUsers = () => {
    const { profile } = useAuth();
    const currentUserRole = roleToDisplay(profile?.role || 'editor');
    const [users, setUsers] = useState([]);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await listAdminProfiles();
            setUsers(data.map(u => ({
                id: u.id,
                name: u.full_name || u.email,
                email: u.email,
                role: roleToDisplay(u.role),
                lastLogin: u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never',
                status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : 'Active',
            })));

            const config = await getSiteConfig();
            if (config.role_permissions) {
                const parsedConfig = typeof config.role_permissions === 'string'
                    ? JSON.parse(config.role_permissions)
                    : config.role_permissions;
                setRolePermissions(prev => ({ ...prev, ...parsedConfig }));
            }
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load admin users or permissions.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Admin', sendInvite: true });
    const [formErrors, setFormErrors] = useState({});

    // Confirm modal
    const [confirmModal, setConfirmModal] = useState({ open: false, userId: null, action: '', userName: '' });

    // Access customization modal
    const [accessModal, setAccessModal] = useState({ open: false, user: null });
    const [accessPerms, setAccessPerms] = useState({});
    const [rolePermissions, setRolePermissions] = useState(DEFAULT_PERMISSIONS);

    const isSuperAdmin = currentUserRole === 'Super Admin' || profile?.role === 'super_admin';

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !searchQuery ||
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'All' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        suspended: users.filter(u => u.status === 'Suspended').length,
        superAdmins: users.filter(u => u.role === 'Super Admin').length,
    }), [users]);

    const openAddForm = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'Admin', sendInvite: true });
        setFormErrors({});
        setShowForm(true);
    };

    const openEditForm = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, sendInvite: false });
        setFormErrors({});
        setShowForm(true);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Full name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        else if (!editingUser && users.some(u => u.email.toLowerCase() === formData.email.toLowerCase()))
            errors.email = 'This email is already registered';
        if (!editingUser && !formData.password.trim()) errors.password = 'Password is required';
        else if (!editingUser && formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
        if (!formData.role) errors.role = 'Role is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editingUser) {
                await updateAdminProfile(editingUser.id, {
                    full_name: formData.name,
                    email: formData.email,
                    role: roleToDb(formData.role),
                });
                setUsers(prev => prev.map(u =>
                    u.id === editingUser.id ? { ...u, name: formData.name, email: formData.email, role: formData.role } : u
                ));
                setToast({ type: 'success', message: `"${formData.name}" updated successfully.` });
            } else {
                await createAdminUser({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.name,
                    role: roleToDb(formData.role),
                });
                setToast({ type: 'success', message: `"${formData.name}" created successfully.` });
                await loadUsers();
            }
            setShowForm(false);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save user.' });
        }
    };

    const openAccessModal = (user) => {
        const perms = rolePermissions[user.role] || DEFAULT_PERMISSIONS[user.role] || {};
        const permsCopy = {};
        ACCESS_SECTIONS.forEach(s => {
            permsCopy[s.id] = { ...(perms[s.id] || { view: false, edit: false }) };
        });
        setAccessPerms(permsCopy);
        setAccessModal({ open: true, user });
    };

    const toggleAccessPerm = (sectionId, type) => {
        setAccessPerms(prev => {
            const updated = { ...prev, [sectionId]: { ...prev[sectionId] } };
            if (type === 'view' && prev[sectionId].view) {
                updated[sectionId].view = false;
                updated[sectionId].edit = false;
            } else if (type === 'view') {
                updated[sectionId].view = true;
            } else if (type === 'edit' && !prev[sectionId].view) {
                updated[sectionId].view = true;
                updated[sectionId].edit = true;
            } else {
                updated[sectionId].edit = !prev[sectionId].edit;
            }
            return updated;
        });
    };

    const saveAccessPerms = async () => {
        const user = accessModal.user;
        const newPerms = {
            ...rolePermissions,
            [user.role]: { ...rolePermissions[user.role], ...accessPerms },
        };

        try {
            await updateSiteConfig('role_permissions', JSON.stringify(newPerms));
            setRolePermissions(newPerms);
            setAccessModal({ open: false, user: null });
            setToast({ type: 'success', message: `Access permissions updated for "${user.name}".` });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save access permissions.' });
        }
    };

    const getPermSummary = (perms) => {
        const viewCount = Object.values(perms).filter(p => p.view).length;
        const editCount = Object.values(perms).filter(p => p.edit).length;
        return { viewCount, editCount, total: ACCESS_SECTIONS.length };
    };

    const requestSuspend = (user) => {
        const action = user.status === 'Active' ? 'suspend' : 'activate';
        setConfirmModal({ open: true, userId: user.id, action, userName: user.name });
    };

    const requestDelete = (user) => {
        setConfirmModal({ open: true, userId: user.id, action: 'delete', userName: user.name });
    };

    const handleConfirm = async () => {
        const { userId, action } = confirmModal;
        try {
            if (action === 'delete') {
                try { await deleteAdminUser(userId); } catch (_) { /* edge fn may not be deployed yet */ }
                await deleteAdminProfile(userId);
                setUsers(prev => prev.filter(u => u.id !== userId));
                setToast({ type: 'success', message: `"${confirmModal.userName}" has been deleted.` });
            } else {
                const newStatus = action === 'suspend' ? 'Suspended' : 'Active';
                await updateAdminProfile(userId, { status: newStatus.toLowerCase() });
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
                setToast({ type: 'success', message: `"${confirmModal.userName}" has been ${newStatus.toLowerCase()}.` });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'Action failed.' });
        } finally {
            setConfirmModal({ open: false, userId: null, action: '', userName: '' });
        }
    };

    return (
        <div className="au-page">
            {/* Page header */}
            <header className="au-header">
                <div>
                    <h1 className="au-title">Admin Users</h1>
                    <p className="au-subtitle">Manage admin accounts and permissions</p>
                </div>
                {isSuperAdmin && (
                    <Button variant="primary" icon={<UserPlus size={16} />} onClick={openAddForm}>
                        Add New Admin
                    </Button>
                )}
            </header>

            {/* Stats cards */}
            <div className="au-stats">
                <div className="au-stat-card">
                    <Users size={20} className="au-stat-icon au-stat-icon--blue" />
                    <div className="au-stat-info">
                        <span className="au-stat-number">{stats.total}</span>
                        <span className="au-stat-label">Total Admins</span>
                    </div>
                </div>
                <div className="au-stat-card">
                    <ShieldCheck size={20} className="au-stat-icon au-stat-icon--green" />
                    <div className="au-stat-info">
                        <span className="au-stat-number">{stats.active}</span>
                        <span className="au-stat-label">Active</span>
                    </div>
                </div>
                <div className="au-stat-card">
                    <ShieldOff size={20} className="au-stat-icon au-stat-icon--red" />
                    <div className="au-stat-info">
                        <span className="au-stat-number">{stats.suspended}</span>
                        <span className="au-stat-label">Suspended</span>
                    </div>
                </div>
                <div className="au-stat-card">
                    <Lock size={20} className="au-stat-icon au-stat-icon--purple" />
                    <div className="au-stat-info">
                        <span className="au-stat-number">{stats.superAdmins}</span>
                        <span className="au-stat-label">Super Admins</span>
                    </div>
                </div>
            </div>

            {/* Toolbar: search + filters */}
            <div className="au-toolbar">
                <div className="au-search-box">
                    <Search size={16} className="au-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="au-search-input"
                    />
                    {searchQuery && (
                        <button className="au-search-clear" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="au-filters">
                    <div className="au-filter-group">
                        <Filter size={14} />
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="au-filter-select">
                            <option value="All">All Roles</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown size={14} className="au-select-arrow" />
                    </div>
                    <div className="au-filter-group">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="au-filter-select">
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                        <ChevronDown size={14} className="au-select-arrow" />
                    </div>
                </div>
            </div>

            {/* Users table */}
            <div className="au-table-wrap">
                <table className="au-table">
                    <thead>
                        <tr>
                            <th className="au-th-avatar">Avatar</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Access</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            {isSuperAdmin && <th className="au-th-actions">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={isSuperAdmin ? 8 : 7} className="au-empty-row">
                                    <Users size={32} />
                                    <span>No admin users found</span>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => (
                                <tr key={u.id} className={u.status === 'Suspended' ? 'au-row--suspended' : ''}>
                                    <td>
                                        <div
                                            className="au-avatar"
                                            style={{ background: getAvatarColor(u.name) }}
                                            title={u.name}
                                        >
                                            {getInitials(u.name)}
                                        </div>
                                    </td>
                                    <td className="au-cell-name">{u.name}</td>
                                    <td className="au-cell-email">{u.email}</td>
                                    <td>
                                        <span className={`au-role-badge au-role--${u.role.toLowerCase().replace(/\s/g, '-')}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        {u.role === 'Super Admin' ? (
                                            <span className="au-access-badge au-access--full">
                                                <Check size={12} /> Full Access
                                            </span>
                                        ) : (
                                            <button
                                                className="au-access-btn"
                                                onClick={() => isSuperAdmin && openAccessModal(u)}
                                                disabled={!isSuperAdmin}
                                                title={isSuperAdmin ? 'Edit access permissions' : 'Only Super Admin can edit'}
                                            >
                                                <KeyRound size={13} />
                                                <span>Customize</span>
                                            </button>
                                        )}
                                    </td>
                                    <td className="au-cell-date">{u.lastLogin}</td>
                                    <td>
                                        <span className={`au-status-badge au-status--${u.status.toLowerCase()}`}>
                                            <span className="au-status-dot" />
                                            {u.status}
                                        </span>
                                    </td>
                                    {isSuperAdmin && (
                                        <td>
                                            <div className="au-actions">
                                                <button className="au-action-btn au-action--edit" title="Edit" onClick={() => openEditForm(u)}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className={`au-action-btn ${u.status === 'Active' ? 'au-action--suspend' : 'au-action--activate'}`}
                                                    title={u.status === 'Active' ? 'Suspend' : 'Activate'}
                                                    onClick={() => requestSuspend(u)}
                                                >
                                                    {u.status === 'Active' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                                                </button>
                                                <button className="au-action-btn au-action--delete" title="Delete" onClick={() => requestDelete(u)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="au-table-footer">
                    Showing {filteredUsers.length} of {users.length} admin users
                </div>
            </div>

            {/* Read-only notice for non-super-admins */}
            {!isSuperAdmin && (
                <div className="au-readonly-notice">
                    <Lock size={16} />
                    <span>Only <strong>Super Admin</strong> can create, edit, or delete admin users. You have read-only access.</span>
                </div>
            )}

            {/* Add / Edit admin modal */}
            {showForm && (
                <div className="au-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="au-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="au-modal-header">
                            <h2>{editingUser ? 'Edit Admin User' : 'Create New Admin'}</h2>
                            <button className="au-modal-close" onClick={() => setShowForm(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="au-form">
                            <div className="au-form-group">
                                <label className="au-label">Full Name</label>
                                <input
                                    type="text"
                                    className={`au-input ${formErrors.name ? 'au-input--error' : ''}`}
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    autoFocus
                                />
                                {formErrors.name && <span className="au-field-error">{formErrors.name}</span>}
                            </div>
                            <div className="au-form-group">
                                <label className="au-label">Email</label>
                                <input
                                    type="email"
                                    className={`au-input ${formErrors.email ? 'au-input--error' : ''}`}
                                    placeholder="Enter login email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={!!editingUser}
                                />
                                {formErrors.email && <span className="au-field-error">{formErrors.email}</span>}
                            </div>
                            {!editingUser && (
                                <div className="au-form-group">
                                    <label className="au-label">Password</label>
                                    <input
                                        type="password"
                                        className={`au-input ${formErrors.password ? 'au-input--error' : ''}`}
                                        placeholder="Min 8 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                    {formErrors.password && <span className="au-field-error">{formErrors.password}</span>}
                                </div>
                            )}
                            <div className="au-form-group">
                                <label className="au-label">Role</label>
                                <div className="au-select-wrap">
                                    <select
                                        className={`au-input au-select ${formErrors.role ? 'au-input--error' : ''}`}
                                        value={formData.role}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="au-select-arrow" />
                                </div>
                                {formErrors.role && <span className="au-field-error">{formErrors.role}</span>}
                            </div>
                            {!editingUser && (
                                <div className="au-form-group au-toggle-row">
                                    <div className="au-toggle-info">
                                        <Send size={16} />
                                        <div>
                                            <span className="au-label">Send Invite</span>
                                            <span className="au-toggle-desc">Send an invitation email to this admin</span>
                                        </div>
                                    </div>
                                    <label className="au-toggle">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendInvite}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sendInvite: e.target.checked }))}
                                        />
                                        <span className="au-toggle-slider" />
                                    </label>
                                </div>
                            )}
                            <div className="au-form-actions">
                                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button variant="primary" type="submit">
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Access customization modal */}
            {accessModal.open && accessModal.user && (
                <div className="au-modal-overlay" onClick={() => setAccessModal({ open: false, user: null })}>
                    <div className="au-modal au-modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="au-modal-header">
                            <div className="au-access-header-info">
                                <h2>Access Customization</h2>
                                <div className="au-access-for">
                                    <div
                                        className="au-avatar au-avatar--sm"
                                        style={{ background: getAvatarColor(accessModal.user.name) }}
                                    >
                                        {getInitials(accessModal.user.name)}
                                    </div>
                                    <div>
                                        <span className="au-access-for-name">{accessModal.user.name}</span>
                                        <span className={`au-role-badge au-role--${accessModal.user.role.toLowerCase().replace(/\s/g, '-')}`}>
                                            {accessModal.user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="au-modal-close" onClick={() => setAccessModal({ open: false, user: null })}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="au-access-body">
                            {/* Summary bar */}
                            <div className="au-access-summary">
                                {(() => {
                                    const s = getPermSummary(accessPerms);
                                    return (
                                        <>
                                            <div className="au-access-summary-item">
                                                <Eye size={14} />
                                                <span><strong>{s.viewCount}</strong> of {s.total} sections viewable</span>
                                            </div>
                                            <div className="au-access-summary-item">
                                                <Pencil size={14} />
                                                <span><strong>{s.editCount}</strong> of {s.total} sections editable</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Permissions grid */}
                            <div className="au-perm-grid">
                                <div className="au-perm-grid-header">
                                    <span className="au-perm-grid-label">Section</span>
                                    <span className="au-perm-grid-col"><Eye size={13} /> View</span>
                                    <span className="au-perm-grid-col"><Pencil size={13} /> Edit</span>
                                </div>

                                {['Main', 'System'].map(category => (
                                    <div key={category}>
                                        <div className="au-perm-category">{category}</div>
                                        {ACCESS_SECTIONS.filter(s => s.category === category).map(section => (
                                            <div className="au-perm-row" key={section.id}>
                                                <div className="au-perm-section">
                                                    {section.icon}
                                                    <span>{section.label}</span>
                                                </div>
                                                <div className="au-perm-toggle-cell">
                                                    <label className="au-perm-check">
                                                        <input
                                                            type="checkbox"
                                                            checked={accessPerms[section.id]?.view || false}
                                                            onChange={() => toggleAccessPerm(section.id, 'view')}
                                                        />
                                                        <span className="au-perm-check-box">
                                                            {accessPerms[section.id]?.view && <Check size={12} />}
                                                        </span>
                                                    </label>
                                                </div>
                                                <div className="au-perm-toggle-cell">
                                                    <label className="au-perm-check">
                                                        <input
                                                            type="checkbox"
                                                            checked={accessPerms[section.id]?.edit || false}
                                                            onChange={() => toggleAccessPerm(section.id, 'edit')}
                                                        />
                                                        <span className={`au-perm-check-box ${!accessPerms[section.id]?.view ? 'au-perm-check--disabled' : ''}`}>
                                                            {accessPerms[section.id]?.edit && <Check size={12} />}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="au-access-hint">
                                <KeyRound size={14} />
                                <span>Disabling <strong>View</strong> also disables <strong>Edit</strong>. Enabling <strong>Edit</strong> auto-enables <strong>View</strong>.</span>
                            </div>
                        </div>

                        <div className="au-access-footer">
                            <Button variant="ghost" onClick={() => setAccessModal({ open: false, user: null })}>Cancel</Button>
                            <Button variant="primary" onClick={saveAccessPerms}>Save Permissions</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm modal for suspend/activate/delete */}
            <ConfirmModal
                isOpen={confirmModal.open}
                title={
                    confirmModal.action === 'delete'
                        ? `Delete "${confirmModal.userName}"?`
                        : confirmModal.action === 'suspend'
                            ? `Suspend "${confirmModal.userName}"?`
                            : `Activate "${confirmModal.userName}"?`
                }
                message={
                    confirmModal.action === 'delete'
                        ? 'This admin will be permanently removed. This action cannot be undone.'
                        : confirmModal.action === 'suspend'
                            ? 'This admin will lose access until reactivated.'
                            : 'This admin will regain access to the panel.'
                }
                confirmText={
                    confirmModal.action === 'delete' ? 'Delete' : confirmModal.action === 'suspend' ? 'Suspend' : 'Activate'
                }
                variant={confirmModal.action === 'delete' ? 'danger' : confirmModal.action === 'suspend' ? 'danger' : 'primary'}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmModal({ open: false, userId: null, action: '', userName: '' })}
            />

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminUsers;