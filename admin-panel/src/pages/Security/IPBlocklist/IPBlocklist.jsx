import React, { useState, useEffect, useMemo } from "react";
import "./IPBlocklist.css";
import {
  ShieldAlert, ShieldCheck, Plus, X, Search, Filter,
  ChevronDown, Clock, Trash2, RefreshCw, Check, AlertTriangle,
  Globe, Lock, Unlock, Info, User, Calendar
} from "lucide-react";
import { getIPBlocklist, blockIP as apiBlockIP, unblockIP as apiUnblockIP } from '../../../api/content';



const EXPIRY_OPTIONS = [
  { value: "10min", label: "10 minutes" },
  { value: "30min", label: "30 minutes" },
  { value: "60min", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "permanent", label: "Permanent" },
];

function isValidIP(ip) {
  // IPv4 or basic IPv6 check
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  const ipv6 = /^[0-9a-fA-F:]{3,39}$/.test(ip);
  return ipv4 || ipv6;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IPBlocklist() {
  const [whitelist, setWhitelist] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // whitelist add form
  const [wlIP, setWlIP] = useState("");
  const [wlLabel, setWlLabel] = useState("");
  const [wlError, setWlError] = useState("");

  // block modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockIP, setBlockIP] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockExpiry, setBlockExpiry] = useState("permanent");
  const [blockErrors, setBlockErrors] = useState({});

  // unblock confirm modal
  const [unblockTarget, setUnblockTarget] = useState(null);

  // table filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("active");

  const loadData = async () => {
    try {
      const data = await getIPBlocklist();
      const wl = data.filter(r => r.is_whitelisted).map(r => ({
        id: r.id, ip: r.ip_address, label: r.reason || '—',
        addedAt: new Date(r.blocked_at).toLocaleDateString('en-GB'),
      }));
      const bl = data.filter(r => !r.is_whitelisted).map(r => {
        const expired = r.expires_at && new Date(r.expires_at) < new Date();
        const d = new Date(r.blocked_at);
        const ts = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return {
          id: r.id, ip: r.ip_address, reason: r.reason || '—',
          blockedAt: ts,
          expiry: r.expires_at ? 'timed' : 'permanent',
          expiryLabel: r.expires_at ? new Date(r.expires_at).toLocaleString() : 'Permanent',
          type: 'manual',
          status: expired ? 'expired' : 'active',
        };
      });
      setWhitelist(wl);
      setBlocked(bl);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load IP blocklist. Check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredBlocked = useMemo(() => {
    const q = search.toLowerCase();
    return blocked.filter(row => {
      const matchQ = !q || row.ip.includes(q) || row.reason.toLowerCase().includes(q);
      const matchType = typeFilter === "All" || row.type === typeFilter;
      const matchStatus = statusFilter === "All" || row.status === statusFilter;
      return matchQ && matchType && matchStatus;
    });
  }, [blocked, search, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: blocked.filter(b => b.status === "active").length,
    auto: blocked.filter(b => b.type === "auto" && b.status === "active").length,
    permanent: blocked.filter(b => b.expiry === "permanent" && b.status === "active").length,
    whitelisted: whitelist.length,
  }), [blocked, whitelist]);

  // ── Whitelist actions ──────────────────────────────────────────────────────
  const handleAddWhitelist = async () => {
    if (!wlIP.trim()) { setWlError("IP address is required."); return; }
    if (!isValidIP(wlIP.trim())) { setWlError("Enter a valid IP address."); return; }
    if (whitelist.some(w => w.ip === wlIP.trim())) { setWlError("This IP is already whitelisted."); return; }
    try {
      await apiBlockIP({ ip_address: wlIP.trim(), reason: wlLabel.trim() || null, is_whitelisted: true });
      setWlIP(""); setWlLabel(""); setWlError("");
      loadData();
    } catch (err) {
      setWlError('Failed to add to whitelist.');
    }
  };

  const handleRemoveWhitelist = async (id) => {
    try {
      await apiUnblockIP(id);
      loadData();
    } catch (err) {
      console.error('Failed to remove whitelist entry:', err);
    }
  };

  // ── Block modal actions ────────────────────────────────────────────────────
  const openBlockModal = () => { setBlockIP(""); setBlockReason(""); setBlockExpiry("permanent"); setBlockErrors({}); setShowBlockModal(true); };
  const closeBlockModal = () => setShowBlockModal(false);

  const handleBlock = async () => {
    const errs = {};
    if (!blockIP.trim()) errs.ip = "IP address is required.";
    else if (!isValidIP(blockIP.trim())) errs.ip = "Enter a valid IP address.";
    if (blocked.some(b => b.ip === blockIP.trim() && b.status === "active")) errs.ip = "This IP is already blocked.";
    if (!blockReason.trim()) errs.reason = "Reason is required.";
    if (Object.keys(errs).length) { setBlockErrors(errs); return; }

    const expiresAt = blockExpiry === 'permanent' ? null : (() => {
      const map = { '10min': 10, '30min': 30, '60min': 60, '24h': 1440, '7d': 10080 };
      const mins = map[blockExpiry] || 0;
      return mins ? new Date(Date.now() + mins * 60000).toISOString() : null;
    })();

    try {
      await apiBlockIP({ ip_address: blockIP.trim(), reason: blockReason.trim(), is_whitelisted: false, expires_at: expiresAt });
      setShowBlockModal(false);
      loadData();
    } catch (err) {
      setBlockErrors({ ip: 'Failed to block IP.' });
    }
  };

  // ── Unblock ────────────────────────────────────────────────────────────────
  const confirmUnblock = (row) => setUnblockTarget(row);
  const handleUnblock = async () => {
    try {
      await apiUnblockIP(unblockTarget.id);
      setUnblockTarget(null);
      loadData();
    } catch (err) {
      console.error('Failed to unblock IP:', err);
      setUnblockTarget(null);
    }
  };

  // ── Extend (toggle to permanent) ───────────────────────────────────────────
  const handleExtend = (id) => {
    setBlocked(prev => prev.map(b =>
      b.id === id ? { ...b, expiry: "permanent", expiryLabel: "Permanent" } : b
    ));
  };

  return (
    <div className="ipb-page">
      {/* ── Header ── */}
      <header className="ipb-header">
        <div>
          <p className="ipb-breadcrumb">Security <span>› IP Blocklist</span></p>
          <h1 className="ipb-title">IP Blocklist</h1>
          <p className="ipb-subtitle">Block malicious IPs and whitelist trusted ones to control access to the admin panel.</p>
        </div>
        <button className="btn-block-ip" onClick={openBlockModal}>
          <Plus size={15} />
          Block IP
        </button>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="ipb-stats-row">
        {[
          { label: "Active Blocks", value: stats.total, color: "red", icon: <ShieldAlert size={18} /> },
          { label: "Auto-blocked", value: stats.auto, color: "orange", icon: <Lock size={18} /> },
          { label: "Permanent Blocks", value: stats.permanent, color: "purple", icon: <AlertTriangle size={18} /> },
          { label: "Whitelisted IPs", value: stats.whitelisted, color: "green", icon: <ShieldCheck size={18} /> },
        ].map(s => (
          <div className={`ipb-stat-card accent-${s.color}`} key={s.label}>
            <span className={`ipb-stat-icon icon-${s.color}`}>{s.icon}</span>
            <div>
              <span className="ipb-stat-value">{s.value}</span>
              <span className="ipb-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Whitelist Section ── */}
      <section className="ipb-section">
        <div className="ipb-section-header">
          <div className="ipb-section-title-row">
            <ShieldCheck size={16} className="section-icon green" />
            <h2 className="ipb-section-title">Whitelisted IPs</h2>
            <span className="ipb-section-badge">{whitelist.length}</span>
          </div>
          <p className="ipb-section-desc">These IPs bypass login rate-limiting and are never auto-blocked (e.g. your office static IP).</p>
        </div>

        <div className="ipb-whitelist-body">
          {/* Existing entries */}
          {whitelist.length === 0 ? (
            <p className="ipb-empty-msg">No whitelisted IPs yet.</p>
          ) : (
            <ul className="ipb-wl-list">
              {whitelist.map(w => (
                <li key={w.id} className="ipb-wl-item">
                  <Globe size={14} className="wl-globe" />
                  <span className="wl-ip">{w.ip}</span>
                  <span className="wl-sep">—</span>
                  <span className="wl-label">{w.label}</span>
                  <span className="wl-badge">Active</span>
                  <span className="wl-added">Added {w.addedAt}</span>
                  <button className="btn-wl-remove" onClick={() => handleRemoveWhitelist(w.id)} title="Remove from whitelist">
                    <X size={13} /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add form */}
          <div className="ipb-wl-add-row">
            <div className="ipb-wl-inputs">
              <div className="input-wrap">
                <input
                  className={`ipb-input ${wlError ? "input-error" : ""}`}
                  placeholder="Enter IP address (e.g. 203.0.113.5)"
                  value={wlIP}
                  onChange={e => { setWlIP(e.target.value); setWlError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleAddWhitelist()}
                />
                {wlError && <span className="field-error">{wlError}</span>}
              </div>
              <input
                className="ipb-input"
                placeholder="Label (optional, e.g. Office Network)"
                value={wlLabel}
                onChange={e => setWlLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddWhitelist()}
              />
            </div>
            <button className="btn-wl-add" onClick={handleAddWhitelist}>
              <Plus size={14} />
              Add to Whitelist
            </button>
          </div>
        </div>
      </section>

      {/* ── Blocked IPs Section ── */}
      <section className="ipb-section">
        <div className="ipb-section-header">
          <div className="ipb-section-title-row">
            <ShieldAlert size={16} className="section-icon red" />
            <h2 className="ipb-section-title">Blocked IPs</h2>
            <span className="ipb-section-badge red">{stats.total}</span>
          </div>
          <p className="ipb-section-desc">IPs blocked manually or automatically after repeated failed login attempts.</p>
        </div>

        {/* Toolbar */}
        <div className="ipb-toolbar">
          <div className="ipb-search-wrap">
            <Search size={14} className="ipb-search-icon" />
            <input
              className="ipb-search"
              placeholder="Search by IP or reason…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ipb-search-clear" onClick={() => setSearch("")}><X size={12} /></button>
            )}
          </div>
          <div className="ipb-filters">
            <FilterPill label="Type" value={typeFilter} options={["All", "auto", "manual"]} onChange={v => setTypeFilter(v)} capitalize />
            <FilterPill label="Status" value={statusFilter} options={["All", "active", "expired", "unblocked"]} onChange={v => setStatusFilter(v)} capitalize />
          </div>
        </div>

        {/* Table */}
        <div className="ipb-table-wrap">
          <table className="ipb-table">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Blocked At</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlocked.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ipb-empty-cell">
                    <ShieldAlert size={26} className="empty-icon" />
                    <p>No blocked IPs match your filters.</p>
                  </td>
                </tr>
              ) : filteredBlocked.map(row => (
                <tr key={row.id} className={`ipb-row status-${row.status}`}>
                  <td className="td-ip">
                    <Globe size={13} className="td-globe" />
                    <span className="ip-text">{row.ip}</span>
                  </td>
                  <td>
                    <span className={`type-badge type-${row.type}`}>
                      {row.type === "auto" ? <RefreshCw size={10} /> : <User size={10} />}
                      {row.type === "auto" ? "Auto" : "Manual"}
                    </span>
                  </td>
                  <td className="td-reason">{row.reason}</td>
                  <td className="td-ts">
                    <Clock size={12} className="td-clock" />
                    {row.blockedAt}
                  </td>
                  <td className="td-expiry">{row.expiryLabel}</td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <td className="td-actions">
                    {row.status === "active" && (
                      <>
                        <button className="btn-unblock" onClick={() => confirmUnblock(row)}>
                          <Unlock size={13} /> Unblock
                        </button>
                        {row.expiry !== "permanent" && (
                          <button className="btn-extend" onClick={() => handleExtend(row.id)}>
                            <Clock size={13} /> Extend
                          </button>
                        )}
                      </>
                    )}
                    {row.status !== "active" && (
                      <span className="action-na">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="ipb-table-count">
          Showing <strong>{filteredBlocked.length}</strong> of <strong>{blocked.length}</strong> entries
        </p>
      </section>

      {/* ── Block IP Modal ── */}
      {showBlockModal && (
        <>
          <div className="ipb-overlay" onClick={closeBlockModal} />
          <div className="ipb-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div className="modal-title-row">
                <ShieldAlert size={18} className="modal-icon" />
                <h2 id="modal-title" className="modal-title">Block IP Address</h2>
              </div>
              <button className="modal-close" onClick={closeBlockModal}><X size={17} /></button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">IP Address <span className="required">*</span></label>
                <input
                  className={`ipb-input lg ${blockErrors.ip ? "input-error" : ""}`}
                  placeholder="e.g. 182.98.65.43"
                  value={blockIP}
                  onChange={e => { setBlockIP(e.target.value); setBlockErrors(p => ({ ...p, ip: "" })); }}
                />
                {blockErrors.ip && <span className="field-error">{blockErrors.ip}</span>}
              </div>

              <div className="modal-field">
                <label className="modal-label">Reason <span className="required">*</span></label>
                <input
                  className={`ipb-input lg ${blockErrors.reason ? "input-error" : ""}`}
                  placeholder="e.g. Brute-force attack, Manual security block"
                  value={blockReason}
                  onChange={e => { setBlockReason(e.target.value); setBlockErrors(p => ({ ...p, reason: "" })); }}
                />
                {blockErrors.reason && <span className="field-error">{blockErrors.reason}</span>}
              </div>

              <div className="modal-field">
                <label className="modal-label">Block Duration</label>
                <div className="expiry-grid">
                  {EXPIRY_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`expiry-btn ${blockExpiry === o.value ? "selected" : ""}`}
                      onClick={() => setBlockExpiry(o.value)}
                    >
                      {blockExpiry === o.value && <Check size={11} />}
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-note">
                <Info size={13} />
                <span>The IP will be immediately blocked. This action is logged in the Audit Trail.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={closeBlockModal}>Cancel</button>
              <button className="btn-modal-block" onClick={handleBlock}>
                <ShieldAlert size={14} />
                Block IP
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Unblock Confirm Modal ── */}
      {unblockTarget && (
        <>
          <div className="ipb-overlay" onClick={() => setUnblockTarget(null)} />
          <div className="ipb-modal confirm-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div className="modal-title-row">
                <Unlock size={18} className="modal-icon green" />
                <h2 className="modal-title">Unblock IP?</h2>
              </div>
              <button className="modal-close" onClick={() => setUnblockTarget(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to unblock <strong className="mono">{unblockTarget.ip}</strong>?
                This IP will immediately regain access to the admin login.
              </p>
              <div className="confirm-detail">
                <span className="confirm-label">Reason on record:</span>
                <span>{unblockTarget.reason}</span>
              </div>
              <div className="modal-note warning">
                <AlertTriangle size={13} />
                <span>This action will be logged in the Audit Trail.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setUnblockTarget(null)}>Cancel</button>
              <button className="btn-modal-unblock" onClick={handleUnblock}>
                <Unlock size={14} />
                Confirm Unblock
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function FilterPill({ label, value, options, onChange, capitalize }) {
  return (
    <div className="filter-pill-wrap">
      <Filter size={12} className="filter-pill-icon" />
      <select
        className="filter-pill"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o} value={o}>
            {o === "All" ? `All ${label}s` : capitalize ? (o.charAt(0).toUpperCase() + o.slice(1)) : o}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="filter-pill-caret" />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active: { cls: "pill-active", label: "Active" },
    expired: { cls: "pill-expired", label: "Expired" },
    unblocked: { cls: "pill-unblocked", label: "Unblocked" },
  };
  const { cls, label } = map[status] ?? { cls: "", label: status };
  return <span className={`status-pill ${cls}`}>{label}</span>;
}
