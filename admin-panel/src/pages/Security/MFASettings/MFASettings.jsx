import React, { useState, useEffect } from "react";
import "./MFASettings.css";
import {
  Shield, ShieldCheck, ShieldOff, AlertTriangle, Smartphone,
  QrCode, CheckCircle, Key, RefreshCw, Eye, EyeOff, Lock,
  Copy, Download, Users, ChevronRight, Info
} from "lucide-react";
import { enrollMFA, verifyMFA, listMFAFactors, unenrollMFA, getVerifiedTotpFactors, updateAdminProfile, getCurrentUser, getAdminProfile } from '../../../api/auth';

export default function MFASettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [enforceAll, setEnforceAll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [qrUri, setQrUri] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const factorsData = await listMFAFactors();
        const verifiedFactors = getVerifiedTotpFactors(factorsData);
        if (verifiedFactors.length > 0) {
          setMfaEnabled(true);
          const activeFactor = verifiedFactors[0];
          setFactorId(activeFactor.id);
        }
        
        const user = await getCurrentUser();
        if (user) {
          console.log('Loading profile for MFA info - User ID:', user.id);
          const profile = await getAdminProfile(user.id);
          console.log('Admin profile loaded:', profile);
          if (profile?.mfa_backup_codes) {
            setBackupCodes(profile.mfa_backup_codes);
          } else {
            console.log('No backup codes found in profile.');
          }
        }
      } catch (err) { 
        console.error('Error loading MFA info - Detailed log:', err);
      }
    })();
  }, []);

  const handleDisable = async () => {
    if (!window.confirm("Disabling MFA reduces your account security. Are you sure you want to continue?")) return;
    try {
      setOtpError("");
      // List factors again to make sure we have all of them
      const factorsData = await listMFAFactors();
      const verifiedFactors = getVerifiedTotpFactors(factorsData);
      
      if (verifiedFactors.length > 0) {
        for (const factor of verifiedFactors) {
           await unenrollMFA(factor.id);
        }
      }
      
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          await updateAdminProfile(user.id, { 
            mfa_enabled: false,
            mfa_backup_codes: [] // Clear backup codes too
          });
        }
      } catch (profileErr) {
        console.warn('Failed to update profile but MFA is unenrolled:', profileErr);
      }
      
      setMfaEnabled(false);
      setShowSetup(false);
      setFactorId(null);
      setOtp("");
      
      // Success - reload to refresh all context/state
      window.location.reload();
    } catch (err) {
      console.error('Failed to disable MFA:', err);
      setOtpError('Failed to disable MFA: ' + (err.message || 'Unknown error'));
      // Show error in alert too in case it is hidden
      alert('Failed to disable MFA: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSetup = async () => {
    try {
      setOtpError("");
      const enrollment = await enrollMFA();
      console.log('MFA Enrollment started:', enrollment);
      
      const factor_id = enrollment.id;
      setFactorId(factor_id);
      
      const qr_code = enrollment.totp?.qr_code || '';
      const secret = enrollment.totp?.secret || '';
      
      setQrUri(qr_code);
      setManualKey(secret);
      setShowSetup(true);
      setOtp("");
    } catch (err) {
      console.error('MFA Enrollment failed:', err);
      setOtpError('Failed to start MFA enrollment: ' + (err.message || 'Unknown error'));
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    try {
      setOtpError("");
      console.log('Verifying MFA for factor:', factorId);
      await verifyMFA(factorId, otp);
      
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          // Generate 10 simple backup codes
          const codes = Array.from({ length: 10 }, () => 
            Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
            Math.random().toString(36).substring(2, 6).toUpperCase()
          );
          
          await updateAdminProfile(user.id, { 
            mfa_enabled: true,
            mfa_backup_codes: codes
          });
          // Update local state if needed
        }
      } catch (profileErr) {
        console.warn('Failed to update profile but MFA is verified:', profileErr);
      }
      
      setMfaEnabled(true);
      setShowSetup(false);
      setOtp("");
      setOtpError("");
      window.location.reload(); // Refresh to ensure everything is synced
    } catch (err) {
      console.error('MFA Verification failed:', err);
      setOtpError('Invalid code. Please try again.');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(manualKey.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
        const user = await getCurrentUser();
        if (user?.id) {
          // Create 10 backup codes
          const codes = Array.from({ length: 10 }, () => 
            Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
            Math.random().toString(36).substring(2, 6).toUpperCase()
          );
          
          await updateAdminProfile(user.id, { 
              mfa_backup_codes: codes,
              mfa_enabled: mfaEnabled 
          });
          setBackupCodes(codes);
          setCodesRevealed(true);
        }
    } catch (err) {
        console.error('Failed to regenerate codes:', err);
    } finally {
        setRegenerating(false);
    }
  };

  const setupVisible = showSetup;

  return (
    <div className="mfa-page">
      {/* ── Header ── */}
      <header className="mfa-page-header">
        <div>
          <p className="mfa-breadcrumb">Security <span>› MFA Settings</span></p>
          <h1 className="mfa-page-title">Multi-Factor Authentication</h1>
          <p className="mfa-page-sub">Protect your account with a second verification step using an authenticator app.</p>
        </div>
      </header>

      {otpError && !setupVisible && (
        <div className="mfa-error-banner">
          <AlertTriangle size={18} />
          <span>{otpError}</span>
          <button onClick={() => setOtpError("")}>✕</button>
        </div>
      )}

      {/* ── Status Hero ── */}
      <div className={`mfa-status-hero ${mfaEnabled ? "is-on" : "is-off"}`}>
        <div className="mfa-hero-left">
          <div className={`mfa-hero-icon ${mfaEnabled ? "on" : "off"}`}>
            {mfaEnabled ? <ShieldCheck size={28} /> : <ShieldOff size={28} />}
          </div>
          <div>
            <div className={`mfa-status-pill ${mfaEnabled ? "on" : "off"}`}>
              {mfaEnabled ? "● MFA ENABLED" : "● MFA DISABLED"}
            </div>
            <p className="mfa-hero-desc">
              {mfaEnabled
                ? "Your account is protected with two-step verification. Every login requires your authenticator app."
                : "Your account relies on password only. Enable MFA to significantly improve security."}
            </p>
          </div>
        </div>
        <div className="mfa-hero-actions">
          {mfaEnabled ? (
            <>
              <button className="btn-reconfigure" onClick={handleSetup}>
                <Smartphone size={16} /> Reconfigure
              </button>
              <button className="btn-disable-mfa" onClick={handleDisable}>
                <ShieldOff size={16} /> Disable MFA
              </button>
            </>
          ) : (
            <button className="btn-enable-mfa" onClick={handleSetup}>
              <ShieldCheck size={16} /> Set Up MFA
            </button>
          )}
        </div>
      </div>

      {/* ── Setup Wizard ── */}
      {setupVisible && (
        <div className="mfa-card setup-wizard-card">
          <div className="mfa-card-header">
            <Smartphone size={20} className="mfa-card-icon" />
            <h2>{mfaEnabled ? "Re-configure Authenticator App" : "Connect Your Authenticator App"}</h2>
          </div>

          <div className="wizard-two-col">
            {/* Step 1 */}
            <div className="wizard-step">
              <div className="wizard-step-num">
                <span>01</span>
              </div>
              <div className="wizard-step-body">
                <h3>Scan QR Code</h3>
                <p>Open Google Authenticator, Authy, or any TOTP app and scan the code below.</p>

                <div className="qr-block">
                   <div className="qr-frame">
                    <div className="qr-corner tl" /><div className="qr-corner tr" />
                    <div className="qr-corner bl" /><div className="qr-corner br" />
                    {qrUri ? (
                        <img src={qrUri} alt="QR Code" width={136} height={136} className="qr-image" />
                    ) : (
                        <div className="qr-fallback">
                            <QrCode size={136} strokeWidth={1.2} className="qr-icon" />
                            <p className="qr-error-msg">Fail</p>
                        </div>
                    )}
                  </div>
                  
                  <div className="qr-manual-row">
                    <span className="qr-manual-label">Manual key</span>
                    <code className="qr-manual-key">{manualKey}</code>
                    <button className="btn-copy-key" onClick={handleCopyKey} title="Copy key">
                      {copied ? <CheckCircle size={14} className="copied" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="wizard-divider" />

            {/* Step 2 */}
            <div className="wizard-step">
              <div className="wizard-step-num">
                <span>02</span>
              </div>
              <div className="wizard-step-body">
                <h3>Verify &amp; Activate</h3>
                <p>Enter the 6-digit one-time code generated by your app to complete setup.</p>

                <div className="otp-block">
                  <div className={`otp-input-wrap ${otpError ? "has-error" : ""}`}>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0 0 0  0 0 0"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ""));
                        if (otpError) setOtpError("");
                      }}
                      className="otp-input"
                      autoComplete="one-time-code"
                    />
                  </div>
                  {otpError && (
                    <p className="otp-error"><AlertTriangle size={13} /> {otpError}</p>
                  )}
                  <button
                    className="btn-verify-activate"
                    onClick={handleVerify}
                    disabled={otp.length !== 6}
                  >
                    <CheckCircle size={17} />
                    Verify &amp; Activate
                  </button>
                  <p className="otp-hint">
                    <Info size={13} /> The code refreshes every 30 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Backup Codes ── */}
      {mfaEnabled && (
        <div className="mfa-card backup-card">
          <div className="mfa-card-header">
            <Key size={20} className="mfa-card-icon" />
            <h2>Backup Recovery Codes</h2>
            <div className="backup-header-actions">
              <button className="btn-icon-sm" title="Download codes" onClick={() => {}}>
                <Download size={15} />
              </button>
            </div>
          </div>

          <div className="backup-alert">
            <AlertTriangle size={15} className="alert-icon" />
            <p>
              Each code can only be used <strong>once</strong>. Store them in a secure password manager.
              These are shown here for emergency access only.
            </p>
          </div>

          <div className={`codes-grid ${codesRevealed ? "revealed" : "masked"}`}>
            {backupCodes.map((code, i) => (
              <div className="code-cell" key={i}>
                <Key size={11} className="code-key-icon" />
                <span className="code-value">{codesRevealed ? code : "••••-••••"}</span>
                {codesRevealed && (
                  <button
                    className="btn-copy-code"
                    onClick={() => handleCopyCode(code)}
                    title="Copy"
                  >
                    {copiedCode === code ? <CheckCircle size={12} className="copied" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="backup-footer">
            <button className="btn-reveal" onClick={() => setCodesRevealed(!codesRevealed)}>
              {codesRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
              {codesRevealed ? "Hide Codes" : "Reveal Codes"}
            </button>
            <button
              className={`btn-regen ${regenerating ? "spinning" : ""}`}
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw size={15} />
              {regenerating ? "Regenerating..." : "Regenerate Codes"}
            </button>
            <p className="backup-count">
              {backupCodes.length} codes remaining
            </p>
          </div>
        </div>
      )}

      {/* ── Admin Policy ── */}
      <div className="mfa-card policy-card">
        <div className="mfa-card-header">
          <Users size={20} className="mfa-card-icon" />
          <h2>Administrative Policy</h2>
        </div>

        <div className="policy-row">
          <div className="policy-info">
            <h3>Enforce MFA for All Admins</h3>
            <p>Require every admin account to have MFA active before accessing this dashboard. Admins without MFA will be locked out until they set it up.</p>
          </div>
          <label className="mfa-switch">
            <input
              type="checkbox"
              checked={enforceAll}
              onChange={(e) => setEnforceAll(e.target.checked)}
            />
            <span className="mfa-slider" />
          </label>
        </div>

        <div className="policy-note">
          <ShieldCheck size={14} className="note-icon" />
          <span>Only Super Admins can modify this policy. Changing it will immediately affect all existing admin accounts.</span>
        </div>
      </div>
    </div>
  );
}