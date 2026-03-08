import React, { useState, useEffect, useMemo } from 'react';
import './PasswordPolicy.css';
import {
  Lock, ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  Save, RotateCcw, Info, ChevronDown, Eye, EyeOff,
  Clock, RefreshCw, Hash, Type, Asterisk, Ruler
} from 'lucide-react';
import { getSiteConfig, updateSiteConfig } from '../../../api/content';

const DEFAULT_POLICY = {
  minLength:      12,
  requireUpper:   true,
  requireNumber:  true,
  requireSpecial: false,
  expiry:         90,
  preventReuse:   5,
  lockThreshold:  5,
  lockDuration:   10,
};

const LENGTH_OPTIONS   = [8, 12, 16];
const EXPIRY_OPTIONS   = [
  { value: 0,  label: 'Never' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];
const REUSE_OPTIONS    = [0, 3, 5, 10];
const LOCK_THRESHOLDS  = [3, 5, 10];
const LOCK_DURATIONS   = [
  { value: 10,  label: '10 minutes' },
  { value: 30,  label: '30 minutes' },
  { value: 60,  label: '1 hour' },
  { value: -1,  label: 'Until manually unlocked' },
];

// Compute strength score 0–5 from a policy object
function policyStrength(p) {
  let score = 0;
  if (p.minLength >= 16)       score += 2;
  else if (p.minLength >= 12)  score += 1;
  if (p.requireUpper)          score += 1;
  if (p.requireNumber)         score += 1;
  if (p.requireSpecial)        score += 1;
  if (p.expiry > 0 && p.expiry <= 60) score += 1;
  if (p.preventReuse >= 5)     score += 1;
  return Math.min(score, 5);
}

const STRENGTH_MAP = [
  { label: 'Very Weak',  color: '#f43f5e', bg: '#fff1f2', pct: 12 },
  { label: 'Weak',       color: '#f97316', bg: '#fff7ed', pct: 28 },
  { label: 'Fair',       color: '#eab308', bg: '#fefce8', pct: 52 },
  { label: 'Good',       color: '#22c55e', bg: '#f0fdf4', pct: 72 },
  { label: 'Strong',     color: '#16a34a', bg: '#f0fdf4', pct: 90 },
  { label: 'Excellent',  color: '#0d9488', bg: '#f0fdfa', pct: 100 },
];

// ── Live password preview ────────────────────────────────────────────────
function checkPassword(pw, policy) {
  return [
    { key: 'len',     pass: pw.length >= policy.minLength,                    label: `At least ${policy.minLength} characters` },
    { key: 'upper',   pass: !policy.requireUpper   || /[A-Z]/.test(pw),       label: 'One uppercase letter' },
    { key: 'number',  pass: !policy.requireNumber  || /[0-9]/.test(pw),       label: 'One number' },
    { key: 'special', pass: !policy.requireSpecial || /[^A-Za-z0-9]/.test(pw), label: 'One special character' },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PasswordPolicy() {
  const [policy, setPolicy] = useState({ ...DEFAULT_POLICY });
  const [saved,  setSaved]  = useState({ ...DEFAULT_POLICY });
  const [toast,  setToast]  = useState(null);   // { type, msg }
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // password preview
  const [previewPw, setPreviewPw]   = useState('');
  const [showPw,    setShowPw]      = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const config = await getSiteConfig();
        if (config.password_policy) {
          const p = typeof config.password_policy === 'string' ? JSON.parse(config.password_policy) : config.password_policy;
          setPolicy(p);
          setSaved(p);
        }
      } catch (err) {
        console.error('Failed to load password policy:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // dirty state
  const isDirty = useMemo(() =>
    JSON.stringify(policy) !== JSON.stringify(saved)
  , [policy, saved]);

  const strength = useMemo(() => policyStrength(policy), [policy]);
  const strengthInfo = STRENGTH_MAP[strength];

  const checks = useMemo(() => checkPassword(previewPw, policy), [previewPw, policy]);

  const set = (key, val) => setPolicy(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteConfig('password_policy', JSON.stringify(policy));
      setSaved({ ...policy });
      showToast('success', 'Password policy saved. Affected admins will be prompted to update their password on next login.');
    } catch (err) {
      showToast('error', 'Failed to save password policy.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setPolicy({ ...saved });
    showToast('info', 'Changes reverted to last saved policy.');
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  return (
    <div className="pp-page">
      {/* ── Header ── */}
      <header className="pp-header">
        <div>
          <p className="pp-breadcrumb">Security <span>› Password Policy</span></p>
          <h1 className="pp-title">Password Policy Manager</h1>
          <p className="pp-subtitle">Define the rules all admin accounts must meet. Changes force a password update on next login.</p>
        </div>
        <div className="pp-header-actions">
          {isDirty && (
            <button className="btn-revert" onClick={handleRevert}>
              <RotateCcw size={14} /> Revert
            </button>
          )}
          <button
            className={`btn-save ${saving ? 'saving' : ''}`}
            disabled={!isDirty || saving}
            onClick={handleSave}
          >
            {saving
              ? <><span className="pp-spinner" /> Saving…</>
              : <><Save size={14} /> Save Policy</>
            }
          </button>
        </div>
      </header>

      {/* ── Policy Strength Card ── */}
      <div className="pp-strength-card" style={{ borderLeftColor: strengthInfo.color }}>
        <div className="psc-left">
          <ShieldCheck size={22} style={{ color: strengthInfo.color }} />
          <div>
            <p className="psc-label">Policy Strength</p>
            <p className="psc-value" style={{ color: strengthInfo.color }}>{strengthInfo.label}</p>
          </div>
        </div>
        <div className="psc-bar-wrap">
          <div className="psc-bar-track">
            <div
              className="psc-bar-fill"
              style={{ width: `${strengthInfo.pct}%`, background: strengthInfo.color }}
            />
          </div>
          <span className="psc-pct">{strengthInfo.pct}%</span>
        </div>
        {strength < 3 && (
          <p className="psc-tip">
            <AlertTriangle size={12} /> Enable more requirements or increase minimum length to improve security.
          </p>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="pp-grid">

        {/* ── LEFT: Settings ── */}
        <div className="pp-col">

          {/* ─── Section: Complexity ─── */}
          <section className="pp-section">
            <div className="pp-section-head">
              <Ruler size={15} className="section-icon" />
              <h2 className="pp-section-title">Complexity Requirements</h2>
            </div>

            {/* Min Length */}
            <div className="pp-field">
              <div className="pp-field-label-row">
                <label className="pp-label">Minimum password length</label>
              </div>
              <div className="length-btn-group">
                {LENGTH_OPTIONS.map(n => (
                  <button
                    key={n}
                    className={`length-btn ${policy.minLength === n ? 'active' : ''}`}
                    onClick={() => set('minLength', n)}
                  >
                    {n} chars
                  </button>
                ))}
                <div className="length-custom-wrap">
                  <input
                    type="number"
                    className="length-custom"
                    min={8}
                    max={64}
                    value={LENGTH_OPTIONS.includes(policy.minLength) ? '' : policy.minLength}
                    placeholder="Custom"
                    onChange={e => {
                      const v = Math.max(8, Math.min(64, Number(e.target.value)));
                      if (!isNaN(v) && e.target.value !== '') set('minLength', v);
                    }}
                  />
                </div>
              </div>
              <p className="pp-field-hint">Current: <strong>{policy.minLength} characters minimum</strong></p>
            </div>

            {/* Toggles */}
            <div className="pp-toggle-list">
              <ToggleRow
                icon={<Type size={14}/>}
                label="Require uppercase letter"
                desc="At least one A–Z character"
                checked={policy.requireUpper}
                onChange={v => set('requireUpper', v)}
              />
              <ToggleRow
                icon={<Hash size={14}/>}
                label="Require number"
                desc="At least one 0–9 digit"
                checked={policy.requireNumber}
                onChange={v => set('requireNumber', v)}
              />
              <ToggleRow
                icon={<Asterisk size={14}/>}
                label="Require special character"
                desc="At least one !@#$%^ etc."
                checked={policy.requireSpecial}
                onChange={v => set('requireSpecial', v)}
              />
            </div>
          </section>

          {/* ─── Section: Expiry & Reuse ─── */}
          <section className="pp-section">
            <div className="pp-section-head">
              <Clock size={15} className="section-icon" />
              <h2 className="pp-section-title">Expiry & Reuse</h2>
            </div>

            <div className="pp-field">
              <label className="pp-label">Password expiry</label>
              <div className="option-btn-group">
                {EXPIRY_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    className={`option-btn ${policy.expiry === o.value ? 'active' : ''}`}
                    onClick={() => set('expiry', o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {policy.expiry > 0 && (
                <p className="pp-field-hint">
                  <Info size={11}/> Admins will be required to update their password every <strong>{policy.expiry} days</strong>.
                </p>
              )}
            </div>

            <div className="pp-field">
              <label className="pp-label">Prevent reuse of last N passwords</label>
              <div className="option-btn-group">
                {REUSE_OPTIONS.map(n => (
                  <button
                    key={n}
                    className={`option-btn ${policy.preventReuse === n ? 'active' : ''}`}
                    onClick={() => set('preventReuse', n)}
                  >
                    {n === 0 ? 'Off' : `Last ${n}`}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Section: Lockout ─── */}
          <section className="pp-section">
            <div className="pp-section-head">
              <Lock size={15} className="section-icon" />
              <h2 className="pp-section-title">Account Lockout</h2>
            </div>

            <div className="pp-field">
              <label className="pp-label">Lock after N failed attempts</label>
              <div className="option-btn-group">
                {LOCK_THRESHOLDS.map(n => (
                  <button
                    key={n}
                    className={`option-btn ${policy.lockThreshold === n ? 'active' : ''}`}
                    onClick={() => set('lockThreshold', n)}
                  >
                    {n} attempts
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-field">
              <label className="pp-label">Lock duration</label>
              <div className="pp-select-wrap">
                <select
                  className="pp-select"
                  value={policy.lockDuration}
                  onChange={e => set('lockDuration', Number(e.target.value))}
                >
                  {LOCK_DURATIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pp-select-caret" />
              </div>
            </div>

            <div className="pp-info-note">
              <Info size={13}/>
              <span>After <strong>{policy.lockThreshold} failed attempts</strong>, the account will be locked for{' '}
                <strong>{policy.lockDuration === -1 ? 'an indefinite period (manual unlock required)' : `${LOCK_DURATIONS.find(d => d.value === policy.lockDuration)?.label}`}</strong>.
              </span>
            </div>
          </section>

        </div>{/* end left col */}

        {/* ── RIGHT: Live Preview ── */}
        <div className="pp-col">
          <section className="pp-section preview-section">
            <div className="pp-section-head">
              <Eye size={15} className="section-icon" />
              <h2 className="pp-section-title">Live Policy Preview</h2>
            </div>
            <p className="preview-desc">Type a password below to test it against the current policy in real time.</p>

            {/* Password input */}
            <div className="preview-input-wrap">
              <input
                className="preview-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter a test password…"
                value={previewPw}
                onChange={e => setPreviewPw(e.target.value)}
              />
              <button className="preview-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>

            {/* Checks */}
            <ul className="check-list">
              {checks.map(c => (
                <li key={c.key} className={`check-item ${c.pass ? 'pass' : 'fail'}`}>
                  {c.pass
                    ? <CheckCircle size={14} className="ci-icon pass"/>
                    : <XCircle    size={14} className="ci-icon fail"/>
                  }
                  {c.label}
                </li>
              ))}
            </ul>

            {/* Verdict */}
            {previewPw.length > 0 && (
              <div className={`verdict ${checks.every(c => c.pass) ? 'verdict-pass' : 'verdict-fail'}`}>
                {checks.every(c => c.pass)
                  ? <><CheckCircle size={15}/> Password meets all requirements</>  
                  : <><XCircle    size={15}/> Password does not meet all requirements</>
                }
              </div>
            )}
          </section>

          {/* ── Policy Summary Card ── */}
          <section className="pp-section">
            <div className="pp-section-head">
              <ShieldCheck size={15} className="section-icon" />
              <h2 className="pp-section-title">Current Policy Summary</h2>
            </div>
            <ul className="summary-list">
              <SummaryItem label="Min length"          value={`${policy.minLength} characters`} />
              <SummaryItem label="Uppercase required"  value={policy.requireUpper   ? 'Yes' : 'No'} ok={policy.requireUpper} />
              <SummaryItem label="Number required"     value={policy.requireNumber  ? 'Yes' : 'No'} ok={policy.requireNumber} />
              <SummaryItem label="Special char"        value={policy.requireSpecial ? 'Yes' : 'No'} ok={policy.requireSpecial} />
              <SummaryItem label="Expiry"              value={policy.expiry === 0 ? 'Never' : `Every ${policy.expiry} days`} ok={policy.expiry > 0} />
              <SummaryItem label="Reuse prevention"   value={policy.preventReuse === 0 ? 'Off' : `Last ${policy.preventReuse} passwords`} ok={policy.preventReuse > 0} />
              <SummaryItem label="Lockout threshold"  value={`${policy.lockThreshold} failed attempts`} />
              <SummaryItem label="Lock duration"      value={LOCK_DURATIONS.find(d => d.value === policy.lockDuration)?.label} />
            </ul>
          </section>

          {/* ── Super Admin note ── */}
          <div className="pp-admin-note">
            <AlertTriangle size={13} className="note-icon" />
            <div>
              <p className="note-title">Super Admin Only</p>
              <p className="note-body">Saving a new policy will force all admin accounts to update their password at next login. This action is logged in the Audit Trail.</p>
            </div>
          </div>
        </div>{/* end right col */}

      </div>{/* end grid */}

      {/* ── Toast ── */}
      {toast && (
        <div className={`pp-toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={15}/> : <Info size={15}/>}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ToggleRow({ icon, label, desc, checked, onChange }) {
  return (
    <div className="toggle-row" onClick={() => onChange(!checked)}>
      <span className="toggle-icon">{icon}</span>
      <div className="toggle-text">
        <p className="toggle-label">{label}</p>
        <p className="toggle-desc">{desc}</p>
      </div>
      <button
        className={`pp-toggle ${checked ? 'on' : 'off'}`}
        onClick={e => { e.stopPropagation(); onChange(!checked); }}
        role="switch"
        aria-checked={checked}
      >
        <span className="pp-toggle-thumb" />
      </button>
    </div>
  );
}

function SummaryItem({ label, value, ok }) {
  const isBoolean = ok !== undefined;
  return (
    <li className="summary-item">
      <span className="summary-label">{label}</span>
      <span className={`summary-value ${isBoolean ? (ok ? 'sv-ok' : 'sv-off') : ''}`}>{value}</span>
    </li>
  );
}

