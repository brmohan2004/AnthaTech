import React, { useState } from 'react';
import { submitContactMessage } from '../../api/content';
import './ContactPopup.css';

const HELP_OPTIONS = ['Web Design', 'App Dev', 'Branding', 'SEO', 'Consulting', 'Marketing', 'E-commerce'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

const ContactPopup = ({ isOpen, onClose }) => {
    const [view, setView] = useState('selection'); // selection, quote, booking, success
    const [quoteForm, setQuoteForm] = useState({
        name: '', email: '', mobile: '', project: '', budget: '', help: []
    });
    const [booking, setBooking] = useState({
        name: '', email: '', duration: '15 min', date: 'Mar 10', time: '10:00 AM', type: 'Video Call', message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    if (!isOpen) return null;

    const handleHelpToggle = (option) => {
        setQuoteForm(prev => {
            const exists = prev.help.includes(option);
            const help = exists ? prev.help.filter(h => h !== option) : [...prev.help, option];
            return { ...prev, help };
        });
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            const combinedMessage = `Quote Request\nMobile: ${quoteForm.mobile}\nBudget: ${quoteForm.budget}\nNeeds: ${quoteForm.help.join(', ')}\nDetails: ${quoteForm.project}`;
            await submitContactMessage({
                name: quoteForm.name,
                email: quoteForm.email,
                message: combinedMessage
            });
            setView('success');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to send request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            const combinedMessage = `Booking Request\nDuration: ${booking.duration}\nDate: ${booking.date} at ${booking.time}\nType: ${booking.type}\nNote: ${booking.message}`;
            await submitContactMessage({
                name: booking.name,
                email: booking.email,
                message: combinedMessage
            });
            setView('success');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to schedule booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSelection = () => (
        <div className="contact-selection-grid">
            <button className="selection-card" onClick={() => setView('quote')}>
                <div className="selection-icon">📄</div>
                <div className="selection-text">
                    <h4>Request for Quote</h4>
                    <p>Share your project details and get a tailored estimate.</p>
                </div>
            </button>
            <button className="selection-card" onClick={() => setView('booking')}>
                <div className="selection-icon">📅</div>
                <div className="selection-text">
                    <h4>Book a Free Call</h4>
                    <p>Schedule a 1-on-1 discovery call with our experts.</p>
                </div>
            </button>
        </div>
    );

    const renderQuote = () => (
        <>
            <div className="modal-content-scrollable">
                <div className="field-full">
                    <h3 className="form-title">Tell us about your project</h3>
                    <p className="form-subtitle">Fill in the details below and we'll get back to you with a quote.</p>
                    {errorMsg && <div style={{ color: '#F05A63', background: 'rgba(240,90,99,0.05)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>{errorMsg}</div>}
                </div>

                <form className="quote-form" id="quote-form-element" onSubmit={handleQuoteSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" placeholder="Your Name" required value={quoteForm.name} onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="email@example.com" required value={quoteForm.email} onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input type="tel" placeholder="+1 (555) 000-0000" required value={quoteForm.mobile} onChange={e => setQuoteForm({ ...quoteForm, mobile: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Estimated Budget</label>
                        <select value={quoteForm.budget} onChange={e => setQuoteForm({ ...quoteForm, budget: e.target.value })}>
                            <option value="">Select Range</option>
                            <option value="< $5k">Under $5k</option>
                            <option value="$5k - $15k">$5k - $15k</option>
                            <option value="$15k+">$15k+</option>
                        </select>
                    </div>
                    <div className="form-group field-full">
                        <label>How can we help? (Select multiple)</label>
                        <div className="help-options">
                            {HELP_OPTIONS.map(opt => (
                                <span
                                    key={opt}
                                    className={`help-tag ${quoteForm.help.includes(opt) ? 'active' : ''}`}
                                    onClick={() => handleHelpToggle(opt)}
                                >
                                    {opt}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="form-group field-full">
                        <label>About your project</label>
                        <textarea rows="3" placeholder="Describe your vision..." value={quoteForm.project} onChange={e => setQuoteForm({ ...quoteForm, project: e.target.value })} />
                    </div>
                </form>
            </div>
            <div className="modal-fixed-footer">
                <button type="submit" form="quote-form-element" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Request →'}
                </button>
                <button className="back-link" onClick={() => { setView('selection'); setErrorMsg(null); }}>← Back to options</button>
            </div>
        </>
    );

    const renderBooking = () => (
        <>
            <div className="modal-content-scrollable">
                <h3 className="form-title">Book a free call</h3>
                <p className="form-subtitle">Choose a duration and schedule your discovery session.</p>
                {errorMsg && <div style={{ color: '#F05A63', background: 'rgba(240,90,99,0.05)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>{errorMsg}</div>}

                <form id="booking-form-element" onSubmit={handleBookingSubmit} className="quote-form" style={{ marginBottom: '24px' }}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" placeholder="Your Name" required value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="email@example.com" required value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} />
                    </div>
                </form>

                <div className="booking-options">
                    {['15 min', '30 min', 'Custom'].map(d => (
                        <button
                            key={d}
                            className={`booking-btn ${booking.duration === d ? 'active' : ''}`}
                            onClick={() => setBooking({ ...booking, duration: d })}
                        >
                            <h5>{d}</h5>
                            <p>{d === 'Custom' ? 'Tailored time' : 'Discovery session'}</p>
                        </button>
                    ))}
                </div>

                <div className="scheduler-container">
                    <div className="calendar-mini">
                        <div className="calendar-header">March 2026</div>
                        <div className="calendar-days">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} style={{ fontSize: '11px', color: '#94a3b8' }}>{d}</span>)}
                            {Array.from({ length: 31 }, (_, i) => (
                                <div
                                    key={i}
                                    className={`day-cell ${i === 9 ? 'active' : ''}`}
                                    onClick={() => { }}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="time-picker">
                        <div className="time-slots">
                            {TIME_SLOTS.map(t => (
                                <button
                                    key={t}
                                    className={`time-btn ${booking.time === t ? 'active' : ''}`}
                                    onClick={() => setBooking({ ...booking, time: t })}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="call-type-toggle">
                            <button
                                className={booking.type === 'Video Call' ? 'active' : ''}
                                onClick={() => setBooking({ ...booking, type: 'Video Call' })}
                            >
                                Video Call
                            </button>
                            <button
                                className={booking.type === 'Phone Call' ? 'active' : ''}
                                onClick={() => setBooking({ ...booking, type: 'Phone Call' })}
                            >
                                Phone Call
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label>Add a note (Optional)</label>
                    <textarea form="booking-form-element" rows="2" placeholder="Tell us what you'd like to discuss..." value={booking.message} onChange={e => setBooking({ ...booking, message: e.target.value })} />
                </div>
            </div>
            <div className="modal-fixed-footer">
                <button type="submit" form="booking-form-element" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
                <button className="back-link" onClick={() => { setView('selection'); setErrorMsg(null); }}>← Back to options</button>
            </div>
        </>
    );

    const renderSuccess = () => (
        <div className="success-view" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Excellent!</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                We've received your {view === 'success' && booking.time ? 'booking request' : 'quote request'}.<br />
                Our team will reach out to you within 24 hours.
            </p>
            <button className="submit-btn" onClick={() => { setView('selection'); onClose(); }} style={{ width: '200px', marginTop: '32px' }}>Great, thanks!</button>
        </div>
    );

    return (
        <div className="contact-modal-overlay" onClick={onClose}>
            <div className="contact-modal-container" onClick={e => e.stopPropagation()}>
                <button className="contact-modal-close" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div className="contact-modal-body">
                    <div className="contact-modal-sidebar">
                        <div className="sidebar-content">
                            <h3>Let's create something<br />amazing.</h3>
                            <p>Whether it's a new brand, a custom app, or a simple consultation — we're here to help you scale.</p>
                        </div>
                        <div className="sidebar-footer">
                            <span style={{ fontSize: '12px', opacity: 0.5 }}>ANTHA TECH BY QYNTA</span>
                        </div>
                    </div>
                    <div className="contact-modal-main">
                        {view === 'selection' && renderSelection()}
                        {view === 'quote' && renderQuote()}
                        {view === 'booking' && renderBooking()}
                        {view === 'success' && renderSuccess()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPopup;
