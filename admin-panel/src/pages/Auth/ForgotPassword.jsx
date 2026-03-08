import React, { useState, useEffect } from 'react';
import { X, Mail, Loader2, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react';
import supabase from '../../config/supabaseClient';
import './ForgotPassword.css';

const ForgotPassword = ({ isOpen, onClose }) => {
    // Step: 'request' | 'sent' | 'reset' | 'done'
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset password fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Reset state when popup opens
    useEffect(() => {
        if (isOpen) {
            setStep('request');
            setEmail('');
            setError('');
            setNewPassword('');
            setConfirmPassword('');
            setShowNew(false);
            setShowConfirm(false);
        }
    }, [isOpen]);

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

    const strength = passwordStrength(newPassword);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (loading || !email) return;
        setError('');
        setLoading(true);
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/login`,
            });
            if (resetError) throw resetError;
            setStep('sent');
        } catch (err) {
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;
            setStep('done');
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="forgot-overlay" onClick={onClose}>
            <div className="forgot-popup" onClick={(e) => e.stopPropagation()}>
                <button className="forgot-close" onClick={onClose}>
                    <X size={18} />
                </button>

                {/* STEP 1: Request reset link */}
                {step === 'request' && (
                    <>
                        <div className="forgot-icon-circle">
                            <Mail size={28} />
                        </div>
                        <h2 className="forgot-title">Forgot your password?</h2>
                        <p className="forgot-desc">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form className="forgot-form" onSubmit={handleRequestReset}>
                            {error && <div className="forgot-error">{error}</div>}

                            <div className="forgot-field">
                                <label htmlFor="forgot-email">Email Address</label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@anthatech.com"
                                    required
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                className="forgot-submit"
                                disabled={loading || !email}
                            >
                                {loading && <Loader2 size={18} className="forgot-spinner" />}
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <button className="forgot-back" onClick={onClose}>
                            ← Back to Login
                        </button>
                    </>
                )}

                {/* STEP 2: Link sent confirmation */}
                {step === 'sent' && (
                    <div className="forgot-success">
                        <div className="forgot-success-icon">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="forgot-title">Check your email</h2>
                        <p className="forgot-desc">
                            We've sent a password reset link to <strong>{email}</strong>. 
                            Please check your inbox and follow the instructions.
                        </p>
                        <p className="forgot-hint">
                            Didn't receive the email? Check your spam folder or{' '}
                            <button
                                type="button"
                                className="forgot-resend"
                                onClick={() => setStep('request')}
                            >
                                try again
                            </button>.
                        </p>
                        <button className="forgot-back" onClick={onClose}>
                            ← Back to Login
                        </button>
                    </div>
                )}

                {/* STEP 3: Reset password form */}
                {step === 'reset' && (
                    <>
                        <div className="forgot-icon-circle forgot-icon-circle--key">
                            <KeyRound size={28} />
                        </div>
                        <h2 className="forgot-title">Set new password</h2>
                        <p className="forgot-desc">
                            Create a strong password for your admin account.
                        </p>

                        <form className="forgot-form" onSubmit={handleResetPassword}>
                            {error && <div className="forgot-error">{error}</div>}

                            <div className="forgot-field">
                                <label htmlFor="new-password">New Password</label>
                                <div className="forgot-input-wrapper">
                                    <input
                                        id="new-password"
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="forgot-toggle-pw"
                                        onClick={() => setShowNew(!showNew)}
                                        tabIndex={-1}
                                    >
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="pw-strength">
                                        <div className="pw-strength-bar">
                                            <div
                                                className="pw-strength-fill"
                                                style={{ width: `${strength.pct}%`, background: strength.color }}
                                            />
                                        </div>
                                        <span className="pw-strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="forgot-field">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <div className="forgot-input-wrapper">
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="forgot-toggle-pw"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <span className="pw-mismatch">Passwords do not match</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="forgot-submit"
                                disabled={loading || !newPassword || !confirmPassword}
                            >
                                {loading && <Loader2 size={18} className="forgot-spinner" />}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {/* STEP 4: Success */}
                {step === 'done' && (
                    <div className="forgot-success">
                        <div className="forgot-success-icon forgot-success-icon--green">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="forgot-title">Password reset!</h2>
                        <p className="forgot-desc">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>
                        <button
                            className="forgot-submit"
                            onClick={onClose}
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
