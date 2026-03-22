import React, { useState, useEffect } from 'react';
import './Inbox.css';
import {
    Search, Trash2, Eye, Mail, MailOpen,
    CheckCircle2, X, Send, MoreVertical, Archive, Loader2, MessageSquare, Phone, Link
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ToastMessage from '../../components/ui/ToastMessage';
import { getContactMessages, updateMessageStatus, deleteMessage as apiDeleteMessage, markAllMessagesRead, getSiteConfig } from '../../api/content';
import { generateBrandedEmailHtml } from '../../api/emailTemplates';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('Quotes');
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [siteEmails, setSiteEmails] = useState({});

    const loadMessages = async () => {
        try {
            setLoading(true);
            const [data, config] = await Promise.all([
                getContactMessages('All'),
                getSiteConfig()
            ]);
            setMessages(data || []);
            if (config.emails) {
                setSiteEmails(typeof config.emails === 'string' ? JSON.parse(config.emails) : config.emails);
            }
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to load messages.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMessages(); }, []);

    const isQuoteMsg = (msg) => msg.content && msg.content.startsWith('Quote Request');
    const isBookingMsg = (msg) => msg.content && msg.content.startsWith('Booking Request');

    const quotesMessages = messages.filter(m => isQuoteMsg(m));
    const meetingsMessages = messages.filter(m => isBookingMsg(m));
    const generalMessages = messages.filter(m => !isQuoteMsg(m) && !isBookingMsg(m));

    const newQuotesCount = quotesMessages.filter(m => m.status === 'New' || m.status === 'new').length;
    const newMeetingsCount = meetingsMessages.filter(m => m.status === 'New' || m.status === 'new').length;
    const newGeneralCount = generalMessages.filter(m => m.status === 'New' || m.status === 'new').length;

    let currentMessages = messages;
    if (activeTab === 'Quotes') currentMessages = quotesMessages;
    else if (activeTab === 'Meetings') currentMessages = meetingsMessages;
    else if (activeTab === 'General') currentMessages = generalMessages;

    const filtered = currentMessages.filter(m => {
        const matchesSearch = m.sender.toLowerCase().includes(searchQuery.toLowerCase()) || m.preview.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || (filter === 'New' && (m.status === 'New' || m.status === 'new')) || (filter === 'Read' && (m.status === 'Read' || m.status === 'read'));
        return matchesSearch && matchesFilter;
    });

    const getMessageLinks = (msg) => {
        const isQuote = isQuoteMsg(msg);
        const isBooking = isBookingMsg(msg);
        const mMatch = typeof msg.content === 'string' && msg.content.match(/(?:Mobile|Phone):\s*([+0-9\s()-]+)/i);
        const phone = mMatch ? mMatch[1].replace(/[^0-9+]/g, '') : '';
        const waLink = phone ? `https://wa.me/${phone}` : '';
        const callLink = phone ? `tel:${phone}` : '';
        const emailLink = `mailto:${msg.email}`;
        const meetingLinkEmail = `mailto:${msg.email}?subject=Meeting%20Link&body=Hi%20${encodeURIComponent(msg.sender)},%0A%0AHere%20is%20the%20link%20for%20our%20meeting:%20`;
        return { isQuote, isBooking, waLink, callLink, emailLink, meetingLinkEmail, phone };
    };

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={32} />
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="inbox-manager">
            <header className="page-header">
                <div className="header-breadcrumbs">Messages &gt; <span>Inbox</span></div>
                <div className="header-actions">
                    <Button variant="ghost" icon={<CheckCircle2 size={16} />} onClick={markAllRead}>Mark All Read</Button>
                    <Button variant="ghost" icon={<Trash2 size={16} />} className="text-danger">Clear</Button>
                </div>
            </header>

            <div className="inbox-tabs-container">
                <button 
                    className={`inbox-tab-btn tab-quotes ${activeTab === 'Quotes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Quotes')}
                >
                    Quotes Inbox 
                    {newQuotesCount > 0 && <span className="tab-badge">{newQuotesCount} new</span>}
                </button>
                <button 
                    className={`inbox-tab-btn tab-meetings ${activeTab === 'Meetings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Meetings')}
                >
                    Meeting Inbox
                    {newMeetingsCount > 0 && <span className="tab-badge">{newMeetingsCount} new</span>}
                </button>
                <button 
                    className={`inbox-tab-btn tab-general ${activeTab === 'General' ? 'active' : ''}`}
                    onClick={() => setActiveTab('General')}
                >
                    General Inbox
                    {newGeneralCount > 0 && <span className="tab-badge">{newGeneralCount} new</span>}
                </button>
            </div>

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
                        {filtered.length > 0 ? filtered.map((msg, i) => (
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
                                        {(() => {
                                            const links = getMessageLinks(msg);
                                            return (
                                                <>
                                                    {links.isBooking && <a href={links.meetingLinkEmail} className="action-btn" style={{color:'#3B82F6'}} title="Send Meeting Link"><Link size={16} /></a>}
                                                    {(links.isQuote || links.isBooking) && links.phone && (
                                                        <>
                                                            <a href={links.callLink} className="action-btn" style={{color:'#10B981'}} title="Call"><Phone size={16} /></a>
                                                            <a href={links.waLink} target="_blank" rel="noreferrer" className="action-btn" style={{color:'#10B981'}} title="Message"><MessageSquare size={16} /></a>
                                                        </>
                                                    )}
                                                    {(links.isQuote || links.isBooking || true) && <a href={links.emailLink} className="action-btn" style={{color:'#3B82F6'}} title="Email"><Mail size={16} /></a>}
                                                </>
                                            )
                                        })()}
                                        <button className="action-btn" title="View Details" onClick={() => handleOpen(msg)}><Eye size={16} /></button>
                                        <button className="action-btn text-danger" title="Delete" onClick={() => deleteMessageHandler(msg.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No messages found in {activeTab}.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Drawer - Only render when a message is selected to prevent invisible wall issues */}
            {selectedMsg && (
                <div
                    className="drawer-overlay open"
                    onClick={() => setSelectedMsg(null)}
                >
                    <div className="detail-drawer" onClick={e => e.stopPropagation()}>
                        <header className="drawer-header">
                            <div className="header-meta">
                                <Mail className="header-icon" />
                                <span>Message Details</span>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedMsg(null)}><X size={20} /></button>
                        </header>

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

{/* Dynamic Custom Reply System */}
                            <div className="custom-reply-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Compose Custom Reply</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Subject (for Emails)" 
                                        className="form-input"
                                        id="reply-subject"
                                        defaultValue={`Re: Your inquiry at Antha Tech`}
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
                                                        to: selectedMsg.email,
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
                                            const links = getMessageLinks(selectedMsg);
                                            return links.phone ? (
                                                <Button 
                                                    variant="secondary" 
                                                    icon={<MessageSquare size={16} />} 
                                                    onClick={() => {
                                                        const body = document.getElementById('reply-body').value;
                                                        if (!body) return setToast({ type: 'error', message: 'Type a message first.' });
                                                        window.open(`https://wa.me/${links.phone}?text=${encodeURIComponent(body)}`, '_blank');
                                                    }}
                                                >
                                                    Send to WhatsApp
                                                </Button>
                                            ) : null;
                                        })()}

                                        {(() => {
                                            const links = getMessageLinks(selectedMsg);
                                            return links.phone ? (
                                                <Button variant="ghost" icon={<Phone size={16} />} onClick={() => window.location.href = links.callLink}>
                                                    Normal Call
                                                </Button>
                                            ) : null;
                                        })()}

                                        <div className="action-group-right" style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
                                            <button className="drawer-action-btn text-danger" onClick={() => deleteMessageHandler(selectedMsg.id)}><Trash2 size={18} /> <span>Delete Leads</span></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Inbox;
