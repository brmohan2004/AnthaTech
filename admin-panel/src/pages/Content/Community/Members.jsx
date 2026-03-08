import React, { useState, useEffect } from 'react';
import './Community.css'; // Reusing community styles
import {
    Check, XCircle, Eye, Mail, User, Search, Filter, RefreshCcw
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { getCommunityApplications, updateApplicationStatus, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';

const MembersManager = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => { loadMembers(); }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const apps = await getCommunityApplications();
            setMembers(apps || []);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load community members.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateApplicationStatus(id, status);
            const member = members.find(m => m.id === id);

            // Log the action
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `${status === 'approved' ? 'Approved' : 'Rejected'} Community Application: ${member?.full_name || member?.name || id}`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setMembers(members.map(m => m.id === id ? { ...m, status } : m));
            setToast({ type: 'success', message: `Application ${status}.` });
        } catch (err) {
            setToast({ type: 'error', message: `Failed to ${status} member.` });
        }
    };

    const filteredMembers = members.filter(m => {
        const nameMatch = (m.full_name || m.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const statusMatch = statusFilter === 'All' || m.status === statusFilter;
        return (nameMatch || emailMatch) && statusMatch;
    });

    if (loading) return <div className="p-8 text-center">Loading members...</div>;

    return (
        <div className="members-page p-8">
            <header className="page-header flex justify-between items-center mb-8">
                <div className="header-left">
                    <div className="header-breadcrumbs">Community &gt; <span>Members & Applications</span></div>
                    <h1 className="text-2xl font-bold mt-2">Community Members</h1>
                </div>
                <Button variant="ghost" icon={<RefreshCcw size={16} />} onClick={loadMembers}>Refresh</Button>
            </header>

            <div className="table-toolbar flex gap-4 mb-6">
                <div className="search-box relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="form-input pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="form-input w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="panel bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="data-table w-full border-collapse">
                    <thead>
                        <tr className="bg-page text-left border-bottom border-border">
                            <th className="p-4 text-xs font-semibold text-secondary uppercase tracking-wider">#</th>
                            <th className="p-4 text-xs font-semibold text-secondary uppercase tracking-wider">Name</th>
                            <th className="p-4 text-xs font-semibold text-secondary uppercase tracking-wider">Email</th>
                            <th className="p-4 text-xs font-semibold text-secondary uppercase tracking-wider">Track</th>
                            <th className="p-4 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((m, i) => (
                            <tr key={m.id} className="border-bottom border-border hover:bg-page transition-colors">
                                <td className="p-4 text-sm text-secondary">{i + 1}</td>
                                <td className="p-4 text-sm font-semibold">{m.full_name || m.name}</td>
                                <td className="p-4 text-sm text-secondary">{m.email}</td>
                                <td className="p-4 text-sm"><span className="track-tag bg-active text-blue-600 px-2 py-1 rounded-full text-xs font-medium">{m.track}</span></td>
                                <td className="p-4 text-sm">
                                    <span className={`status-pill ${m.status.toLowerCase()} px-2 py-1 rounded-full text-xs font-bold`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-right">
                                    <div className="flex justify-end gap-2">
                                        {m.status === 'Pending' && (
                                            <>
                                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" onClick={() => handleStatusUpdate(m.id, 'approved')} title="Approve"><Check size={18} /></button>
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleStatusUpdate(m.id, 'rejected')} title="Reject"><XCircle size={18} /></button>
                                            </>
                                        )}
                                        <button className="p-2 text-tertiary hover:bg-page rounded-lg transition-colors" title="View Details"><Eye size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                            <tr><td colSpan="6" className="p-12 text-center text-secondary">No members found matching criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MembersManager;
