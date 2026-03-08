import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { signIn, listMFAFactors, verifyMFA } from '../../api/auth';
import ForgotPassword from './ForgotPassword';
import './Login.css';
import logo from '../../assets/logo.png';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 600;

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState(null);

    // MFA state
    const [mfaStep, setMfaStep] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [showForgot, setShowForgot] = useState(false);

    const isLocked = lockedUntil && Date.now() < lockedUntil;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked || loading) return;

        setError('');
        setLoading(true);

        try {
            const { session } = await signIn(email, password);

            // Check if MFA is required
            const { totp } = await listMFAFactors();
            const verifiedFactors = totp?.filter(f => f.status === 'verified') || [];

            if (verifiedFactors.length > 0) {
                setMfaFactorId(verifiedFactors[0].id);
                setMfaStep(true);
                setLoading(false);
                return;
            }

            // No MFA — login complete, AuthContext will pick up the session
            navigate('/admin/dashboard');
        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000);
                setError('');
            } else {
                setError(err.message || 'Invalid email or password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            await verifyMFA(mfaFactorId, code);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const lockMinutes = lockedUntil
        ? Math.ceil((lockedUntil - Date.now()) / 60000)
        : 0;

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <img src={logo} alt="Antha Tech" />
                    <div><span className="login-badge">Admin Panel</span></div>
                </div>

                {!mfaStep ? (
                    <>
                        <p className="login-subtitle">Sign in to manage your website</p>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && (
                                <div className="login-error">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {isLocked && (
                                <div className="login-lockout">
                                    Account locked. Try again in {lockMinutes} minute{lockMinutes !== 1 ? 's' : ''}.
                                </div>
                            )}

                            <div className="login-field">
                                <label htmlFor="login-email">Email</label>
                                <div className="login-input-wrapper">
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@anthatech.com"
                                        required
                                        disabled={isLocked}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="login-field">
                                <label htmlFor="login-password">Password</label>
                                <div className="login-input-wrapper">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        disabled={isLocked}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="login-toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="login-options">
                                <label className="login-remember">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    Remember me
                                </label>
                                <button type="button" className="login-forgot" onClick={() => setShowForgot(true)}>
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="login-submit"
                                disabled={isLocked || loading || !email || !password}
                            >
                                {loading ? (
                                    <Loader2 size={18} className="login-spinner" />
                                ) : null}
                                {loading ? 'Signing in...' : 'Sign In to Admin'}
                            </button>
                        </form>
                    </>
                ) : (
                    <form className="login-mfa" onSubmit={handleVerifyOtp}>
                        <ShieldCheck size={36} style={{ color: 'var(--accent-blue)' }} />
                        <h3 className="login-mfa-title">Two-Factor Authentication</h3>
                        <p className="login-mfa-desc">
                            Enter the 6-digit code from your authenticator app.
                        </p>

                        <div className="login-otp-inputs">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (otpRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/, ''))}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading || otp.join('').length !== 6}
                        >
                            {loading ? (
                                <Loader2 size={18} className="login-spinner" />
                            ) : null}
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button
                            type="button"
                            className="login-mfa-back"
                            onClick={() => { setMfaStep(false); setOtp(['', '', '', '', '', '']); }}
                        >
                            ← Back to login
                        </button>
                    </form>
                )}
            </div>

            <ForgotPassword isOpen={showForgot} onClose={() => setShowForgot(false)} />
        </div>
    );
};

export default Login;