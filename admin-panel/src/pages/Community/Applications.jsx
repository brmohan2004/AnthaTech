import React, { useState, useEffect } from 'react';
import './Applications.css';
import {
    Check, XCircle, Eye, Mail, User, Search, Filter, 
    ArrowRight, Clock, ShieldCheck, UserX, Trash2, MessageSquare, Phone, X, Send
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ToastMessage from '../../components/ui/ToastMessage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { getCommunityApplications, updateApplicationStatus, insertAuditLog, deleteCommunityApplication, getSiteConfig } from '../../api/content';
import { generateBrandedEmailHtml } from '../../api/emailTemplates';
import { getCurrentUser } from '../../api/auth';

const CommunityApplications = () => {
    const [members, setMembers] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedMember, setSelectedMember] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [siteEmails, setSiteEmails] = useState({});

    const deleteMember = async () => {
        const { id, name } = deleteModal;
        try {
            await deleteCommunityApplication(id);
            
            // Add Audit Log Entry
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Deleted Community Application: ${name || id}`,
                    result: 'success'
                });
            } catch (auditErr) {
                console.warn('Failed to log deletion:', auditErr);
            }

            setMembers(prev => prev.filter(m => m.id !== id));
            setToast({ type: 'success', message: 'Application deleted.' });
            if (selectedMember?.id === id) setSelectedMember(null);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to delete application.' });
        } finally {
            setDeleteModal({ isOpen: false, id: null, name: '' });
        }
    };

    const getAppLinks = (m) => {
        const messageToSearch = m.message || '';
        const mMatch = typeof messageToSearch === 'string' && messageToSearch.match(/(?:Mobile|Phone):\s*([+0-9\s()-]+)/i);
        const phone = mMatch ? mMatch[1].replace(/[^0-9+]/g, '') : '';
        const finalPhone = phone || m.mobile || m.phone || '';
        const waLink = finalPhone ? `https://wa.me/${finalPhone}` : '';
        const callLink = finalPhone ? `tel:${finalPhone}` : '';
        const emailLink = `mailto:${m.email}`;
        return { waLink, callLink, emailLink, finalPhone };
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [apps, config] = await Promise.all([
                getCommunityApplications(),
                getSiteConfig()
            ]);
            setMembers(apps);
            if (config.emails) {
                setSiteEmails(typeof config.emails === 'string' ? JSON.parse(config.emails) : config.emails);
            }
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
                                            <div className="member-actions" onClick={e => e.stopPropagation()}>
                                                {(()=>{
                                                    const links = getAppLinks(m);
                                                    return (
                                                        <>
                                                            {links.finalPhone && <a href={links.waLink} target="_blank" rel="noreferrer" className="action-btn" style={{color:'#10B981'}} title="Message"><MessageSquare size={16} /></a>}
                                                            {links.finalPhone && <a href={links.callLink} className="action-btn" style={{color:'#10B981'}} title="Call"><Phone size={16} /></a>}
                                                            <a href={links.emailLink} className="action-btn" style={{color:'#3B82F6'}} title="Email"><Mail size={16} /></a>
                                                        </>
                                                    );
                                                })()}
                                                {m.status === 'Pending' && (
                                                    <>
                                                        <button className="action-btn success" onClick={() => approveMember(m.id)} title="Approve"><Check size={16} /></button>
                                                        <button className="action-btn danger" onClick={() => rejectMember(m.id)} title="Reject"><XCircle size={16} /></button>
                                                    </>
                                                )}
                                                <button className="action-btn" title="View Details" onClick={() => setSelectedMember(m)}><Eye size={16} /></button>
                                                <button className="action-btn danger" title="Delete" onClick={() => setDeleteModal({ isOpen: true, id: m.id, name: m.name })}><Trash2 size={16} /></button>
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

            {selectedMember && (
                <div className="drawer-overlay open" onClick={() => setSelectedMember(null)}>
                    <div className="detail-drawer" onClick={e => e.stopPropagation()}>
                        <header className="drawer-header">
                            <div className="header-meta">
                                <User className="header-icon" />
                                <span>Application Details</span>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedMember(null)}><X size={20} /></button>
                        </header>
                        <div className="drawer-body">
                            <div className="msg-info">
                                <div className="info-row"><span className="info-label">Name:</span> <span className="info-value">{selectedMember.name}</span></div>
                                <div className="info-row"><span className="info-label">Email:</span> <span className="info-value">{selectedMember.email}</span></div>
                                <div className="info-row"><span className="info-label">Track:</span> <span className="info-value">{selectedMember.track}</span></div>
                                <div className="info-row"><span className="info-label">Applied:</span> <span className="info-value">{new Date(selectedMember.applied_at).toLocaleString()}</span></div>
                                <div className="info-row"><span className="info-label">Status:</span> <span className="info-value">{selectedMember.status}</span></div>
                            </div>
                            <div className="msg-content" style={{marginTop: '20px', padding: '15px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px'}}>
                                <h4 style={{marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)'}}>Application Message / Info</h4>
                                {selectedMember.message || 'No additional message provided.'}
                            </div>
{/* Dynamic Custom Reply System */}
                            <div className="custom-reply-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Compose Custom Reply</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Subject (for Emails)" 
                                        className="form-input"
                                        id="reply-subject"
                                        defaultValue={`Re: Your Application to Antha Tech Community`}
                                    />
                                    <textarea 
                                        placeholder="Type your custom message here..." 
                                        className="form-input" 
                                        rows="5"
                                        id="reply-body"
                                    ></textarea>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="file" id="reply-file" className="form-input" style={{ flex: 1 }} />
                                        <span className="text-secondary" style={{ fontSize: '12px' }}>*Files valid for Email only</span>
                                    </div>

                                    <div className="drawer-actions" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                        <Button 
                                            variant="primary" 
                                            icon={<Mail size={16} />} 
                                            onClick={async () => {
                                                const subject = document.getElementById('reply-subject').value;
                                                const body = document.getElementById('reply-body').value;
                                                const fileInput = document.getElementById('reply-file');
                                                
                                                if (!body) return setToast({ type: 'error', message: 'Message body cannot be empty.' });
                                                
                                                const btn = document.getElementById('btn-send-email');
                                                btn.innerHTML = 'Sending...';
                                                btn.disabled = true;

                                                try {
                                                    const { sendBrevoEmail } = await import('../../api/brevo.js');
                                                    let attachments = [];
                                                    
                                                    if (fileInput.files.length > 0) {
                                                        const file = fileInput.files[0];
                                                        const base64 = await new Promise((resolve) => {
                                                            const reader = new FileReader();
                                                            reader.onload = () => resolve(reader.result.split(',')[1]);
                                                            reader.readAsDataURL(file);
                                                        });
                                                        attachments.push({ name: file.name, base64Content: base64 });
                                                    }

                                                    const htmlContent = generateBrandedEmailHtml(siteEmails, body);

                                                    await sendBrevoEmail({
                                                        to: selectedMember.email,
                                                        subject: subject,
                                                        htmlContent: htmlContent,
                                                        attachments: attachments
                                                    });
                                                    
                                                    setToast({ type: 'success', message: 'Email sent successfully via Brevo!' });
                                                    document.getElementById('reply-body').value = '';
                                                    fileInput.value = '';
                                                } catch (err) {
                                                    setToast({ type: 'error', message: err.message });
                                                } finally {
                                                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Send Email';
                                                    btn.disabled = false;
                                                }
                                            }}
                                            id="btn-send-email"
                                        >
                                            Send Email
                                        </Button>
                                        
                                        {(()=>{
                                            const links = getAppLinks(selectedMember);
                                            return links.finalPhone ? (
                                                <Button 
                                                    variant="secondary" 
                                                    icon={<MessageSquare size={16} />} 
                                                    onClick={() => {
                                                        const body = document.getElementById('reply-body').value;
                                                        if (!body) return setToast({ type: 'error', message: 'Type a message first.' });
                                                        window.open(`https://wa.me/${links.finalPhone}?text=${encodeURIComponent(body)}`, '_blank');
                                                    }}
                                                >
                                                    Send to WhatsApp
                                                </Button>
                                            ) : null;
                                        })()}

                                        {(() => {
                                            const links = getAppLinks(selectedMember);
                                            return links.finalPhone ? (
                                                <Button variant="ghost" icon={<Phone size={16} />} onClick={() => window.location.href = links.callLink}>
                                                    Normal Call
                                                </Button>
                                            ) : null;
                                        })()}

                                        <div className="action-group-right" style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
                                            {selectedMember.status === 'Pending' && (
                                                <>
                                                    <button className="drawer-action-btn" style={{color: '#10B981'}} onClick={() => approveMember(selectedMember.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                                                        <span>Approve</span>
                                                    </button>
                                                    <button className="drawer-action-btn" style={{color: '#EF4444'}} onClick={() => rejectMember(selectedMember.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                                                        <span>Reject</span>
                                                    </button>
                                                </>
                                            )}
                                             <button className="drawer-action-btn text-danger" onClick={() => setDeleteModal({ isOpen: true, id: selectedMember.id, name: selectedMember.name })}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="Delete Application?"
                message={`Are you sure you want to delete the application from "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete Permanently"
                onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={deleteMember}
                requireTyping={false}
            />
        </div>
    );
};

export default CommunityApplications;
