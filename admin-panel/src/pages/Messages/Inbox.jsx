import React, { useState, useEffect } from 'react';
import './Inbox.css';
import {
    Search, Trash2, Eye, Mail, MailOpen,
    CheckCircle2, X, Send, MoreVertical, Archive
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ToastMessage from '../../components/ui/ToastMessage';
import { getContactMessages, updateMessageStatus, deleteMessage as apiDeleteMessage, markAllMessagesRead } from '../../api/content';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await getContactMessages('All');
            setMessages(data);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to load messages.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMessages(); }, []);

    const filtered = messages.filter(m => {
        const matchesSearch = m.sender.toLowerCase().includes(searchQuery.toLowerCase()) || m.preview.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || (filter === 'New' && (m.status === 'New' || m.status === 'new')) || (filter === 'Read' && (m.status === 'Read' || m.status === 'read'));
        return matchesSearch && matchesFilter;
    });

    const handleOpen = async (msg) => {
        setSelectedMsg(msg);
        if (msg.status === 'new' || msg.status === 'New') {
            try {
                await updateMessageStatus(msg.id, 'read');
                setMessages(messages.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
            } catch (err) { /* silent */ }
        }
    };

    const deleteMessageHandler = async (id) => {
        try {
            await apiDeleteMessage(id);
            setMessages(messages.filter(m => m.id !== id));
            setToast({ type: 'success', message: 'Message deleted.' });
            if (selectedMsg?.id === id) setSelectedMsg(null);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to delete message.' });
        }
    };

    const markAllRead = async () => {
        try {
            await markAllMessagesRead();
            setMessages(messages.map(m => ({ ...m, status: 'read' })));
            setToast({ type: 'success', message: 'All messages marked as read.' });
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to mark all as read.' });
        }
    };

    return (
        <div className="inbox-manager">
            <header className="page-header">
                <div className="header-breadcrumbs">Messages &gt; <span>Inbox</span></div>
                <div className="header-actions">
                    <Button variant="ghost" icon={<CheckCircle2 size={16} />} onClick={markAllRead}>Mark All Read</Button>
                    <Button variant="ghost" icon={<Trash2 size={16} />} className="text-danger">Clear</Button>
                </div>
            </header>

            <div className="table-toolbar">
                <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button className={`filter-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
                    <button className={`filter-btn ${filter === 'New' ? 'active' : ''}`} onClick={() => setFilter('New')}>New</button>
                    <button className={`filter-btn ${filter === 'Read' ? 'active' : ''}`} onClick={() => setFilter('Read')}>Read</button>
                </div>
            </div>

            <div className="panel p-0 overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th width="40">#</th>
                            <th width="60">Status</th>
                            <th>Sender</th>
                            <th>Message Preview</th>
                            <th>Date</th>
                            <th width="100">Acts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((msg, i) => (
                            <tr key={msg.id} className={(msg.status === 'New' || msg.status === 'new') ? 'row-unread' : ''} onClick={() => handleOpen(msg)}>
                                <td className="text-secondary">{i + 1}</td>
                                <td>
                                    {(msg.status === 'New' || msg.status === 'new') ? <span className="badge-new">NEW</span> : <MailOpen size={16} className="text-muted" />}
                                </td>
                                <td className="font-bold">{msg.sender}</td>
                                <td className="text-secondary preview-cell">{msg.preview}</td>
                                <td className="text-secondary">{msg.date}</td>
                                <td>
                                    <div className="row-actions" onClick={e => e.stopPropagation()}>
                                        <button className="action-btn" onClick={() => handleOpen(msg)}><Eye size={16} /></button>
                                        <button className="action-btn text-danger" onClick={() => deleteMessageHandler(msg.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Drawer */}
            <div className={`drawer-overlay ${selectedMsg ? 'open' : ''}`} onClick={() => setSelectedMsg(null)}>
                <div className="detail-drawer" onClick={e => e.stopPropagation()}>
                    <header className="drawer-header">
                        <div className="header-meta">
                            <Mail className="header-icon" />
                            <span>Message Details</span>
                        </div>
                        <button className="close-btn" onClick={() => setSelectedMsg(null)}><X size={20} /></button>
                    </header>

                    {selectedMsg && (
                        <div className="drawer-body">
                            <div className="msg-info">
                                <div className="info-row">
                                    <span className="info-label">From:</span>
                                    <span className="info-value">{selectedMsg.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Received:</span>
                                    <span className="info-value">{selectedMsg.timestamp}</span>
                                </div>
                            </div>

                            <div className="msg-content">
                                {selectedMsg.content}
                            </div>

                            <div className="drawer-actions">
                                <Button
                                    variant="primary"
                                    icon={<Send size={16} />}
                                    onClick={() => window.location.href = `mailto:${selectedMsg.email}?subject=Re: Application Inquiry - ANTHA Tech&body=Hi ${selectedMsg.sender},%0D%0A%0D%0AThank you for reaching out to us.%0D%0A%0D%0A--- Original Message ---%0D%0A${selectedMsg.content}`}
                                >
                                    Reply via Email
                                </Button>
                                <div className="action-group-right">
                                    <button className="drawer-action-btn"><Archive size={18} /> <span>Archive</span></button>
                                    <button className="drawer-action-btn text-danger" onClick={() => deleteMessageHandler(selectedMsg.id)}><Trash2 size={18} /> <span>Delete</span></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Inbox;
