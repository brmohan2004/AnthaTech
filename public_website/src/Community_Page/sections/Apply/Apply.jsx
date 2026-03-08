import React, { useState } from 'react';
import './Apply.css';
import { submitCommunityApplication } from '../../../api/content';

const TRACK_OPTIONS = ['Student', 'Working Professional'];

const Apply = () => {
    const [track, setTrack] = useState('Student');
    const [form, setForm] = useState({ name: '', email: '', portfolio: '', track: 'Student', message: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTrackSelect = (t) => {
        setTrack(t);
        setForm({ ...form, track: t });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await submitCommunityApplication({
                full_name: form.name,
                email: form.email,
                portfolio_url: form.portfolio,
                track: form.track,
                message: form.message,
                status: 'pending'
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="apply-section" id="apply">
            <div className="apply-inner">
                <div className="apply-header">
                    <div className="section-badge">
                        <span className="badge-text" style={{ textTransform: 'none' }}>Join Us</span>
                    </div>
                    <h2 className="apply-title">Apply to join</h2>
                    <p className="apply-desc">Tell us a bit about yourself and we'll review your application within 3–5 days.</p>
                </div>

                {submitted ? (
                    <div className="apply-success">
                        <div className="apply-success-icon">✓</div>
                        <h3>Application Received!</h3>
                        <p>Thank you for applying. We'll review your request and get back to you within 3–5 business days.</p>
                    </div>
                ) : (
                    <form className="apply-form" onSubmit={handleSubmit}>
                        {error && <div className="apply-error-message" style={{ color: '#ff5630', background: 'rgba(255, 86, 48, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
                        {/* Track Selector */}
                        <div className="apply-track-selector">
                            {TRACK_OPTIONS.map((t) => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`apply-track-btn ${track === t ? 'active' : ''}`}
                                    onClick={() => handleTrackSelect(t)}
                                    disabled={loading}
                                >
                                    {t === 'Student' ? '🎓' : '💼'} {t}
                                </button>
                            ))}
                        </div>

                        <div className="apply-form-row">
                            <div className="apply-form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input id="name" name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required disabled={loading} />
                            </div>
                            <div className="apply-form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input id="email" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required disabled={loading} />
                            </div>
                        </div>

                        <div className="apply-form-group">
                            <label htmlFor="portfolio">Portfolio / LinkedIn URL *</label>
                            <input id="portfolio" name="portfolio" type="url" placeholder="https://your-portfolio.com" value={form.portfolio} onChange={handleChange} required disabled={loading} />
                        </div>

                        <div className="apply-form-group">
                            <label htmlFor="message">Tell us about yourself & your skills *</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                placeholder="I'm a 3rd-year CS student with experience in React and Figma..."
                                value={form.message}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="apply-submit-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application →'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default Apply;
