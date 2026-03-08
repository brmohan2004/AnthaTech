import React, { useState, useEffect } from 'react';
import './Applications.css';
import {
    Check, XCircle, Eye, Mail, User, Search, Filter, 
    ArrowRight, Clock, ShieldCheck, UserX
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ToastMessage from '../../components/ui/ToastMessage';
import { getCommunityApplications, updateApplicationStatus, insertAuditLog } from '../../api/content';
import { getCurrentUser } from '../../api/auth';

const CommunityApplications = () => {
    const [members, setMembers] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const loadData = async () => {
        try {
            setLoading(true);
            const apps = await getCommunityApplications();
            setMembers(apps);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load community data.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const approveMember = async (id) => {
        try {
            await updateApplicationStatus(id, 'approved');
            const member = members.find(m => m.id === id);
            
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Approved Community Application: ${member?.full_name || id}`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setMembers(members.map(m => m.id === id ? { ...m, status: 'Approved' } : m));
            setToast({ type: 'success', message: 'Member application approved.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to approve member.' });
        }
    };

    const rejectMember = async (id) => {
        try {
            const member = members.find(m => m.id === id);
            await updateApplicationStatus(id, 'rejected');

            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Rejected Community Application: ${member?.full_name || id}`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setMembers(members.map(m => m.id === id ? { ...m, status: 'Rejected' } : m));
            setToast({ type: 'info', message: 'Member application rejected.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to reject member.' });
        }
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             m.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || m.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="applications-page">
            <header className="page-header">
                <div className="header-breadcrumbs">Community &gt; <span>Applications</span></div>
                <div className="header-actions">
                    <Button variant="secondary" size="sm" onClick={loadData}>Refresh</Button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-mini-card">
                    <div className="stat-icon pending"><Clock size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">{members.filter(m => m.status === 'Pending').length}</span>
                    </div>
                </div>
                <div className="stat-mini-card">
                    <div className="stat-icon approved"><ShieldCheck size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Approved</span>
                        <span className="stat-value">{members.filter(m => m.status === 'Approved').length}</span>
                    </div>
                </div>
                <div className="stat-mini-card">
                    <div className="stat-icon rejected"><UserX size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Rejected</span>
                        <span className="stat-value">{members.filter(m => m.status === 'Rejected').length}</span>
                    </div>
                </div>
            </div>

            <div className="panel filter-panel">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="panel table-panel">
                {loading ? (
                    <div className="loading-state">Loading applications...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Applicant</th>
                                    <th>Track</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length > 0 ? filteredMembers.map((m, i) => (
                                    <tr key={m.id}>
                                        <td className="text-secondary">{i + 1}</td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{m.name.charAt(0)}</div>
                                                <div className="user-details">
                                                    <span className="user-name">{m.name}</span>
                                                    <span className="user-email">{m.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="track-tag">{m.track}</span></td>
                                        <td>{new Date(m.applied_at).toLocaleDateString()}</td>
                                        <td><span className={`status-pill ${m.status.toLowerCase()}`}>{m.status}</span></td>
                                        <td>
                                            <div className="member-actions">
                                                {m.status === 'Pending' && (
                                                    <>
                                                        <button className="action-btn success" onClick={() => approveMember(m.id)} title="Approve"><Check size={16} /></button>
                                                        <button className="action-btn danger" onClick={() => rejectMember(m.id)} title="Reject"><XCircle size={16} /></button>
                                                    </>
                                                )}
                                                <button className="action-btn" title="View Details"><Eye size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="empty-row">No applications found matching your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default CommunityApplications;
