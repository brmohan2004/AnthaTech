import React, { useState, useEffect, useMemo } from "react";
import "./AuditLog.css";
import {
  Search, Filter, Download, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Shield, FileText, Settings, Key, MapPin,
  Monitor, Eye, X, Clock, User, Globe, Info, Calendar, FileJson
} from "lucide-react";
import { getAuditLog } from '../../../api/content';

const TYPE_META = {
  Auth:     { color: "badge-auth",     icon: <Key     size={11} /> },
  auth:     { color: "badge-auth",     icon: <Key     size={11} /> },
  Content:  { color: "badge-content",  icon: <FileText size={11} /> },
  content:  { color: "badge-content",  icon: <FileText size={11} /> },
  Security: { color: "badge-security", icon: <Shield   size={11} /> },
  security: { color: "badge-security", icon: <Shield   size={11} /> },
  Settings: { color: "badge-settings", icon: <Settings size={11} /> },
  settings: { color: "badge-settings", icon: <Settings size={11} /> },
  Media:    { color: "badge-media",    icon: <Monitor  size={11} /> },
  media:    { color: "badge-media",    icon: <Monitor  size={11} /> },
  system:   { color: "badge-settings", icon: <Settings size={11} /> },
};

const PAGE_SIZES = [10, 25, 50];

// ── Component ──────────────────────────────────────────────────────────────
export default function AuditLog() {
  const [allLogs, setAllLogs]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [resultFilter, setResultFilter] = useState("All");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [pageSize, setPageSize]     = useState(10);
  const [page, setPage]             = useState(1);
  const [detailRow, setDetailRow]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAuditLog();
        const mapped = data.map(row => {
          const d = new Date(row.created_at);
          const ts = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:true })}`;
          const evType = (row.event_type || 'system').charAt(0).toUpperCase() + (row.event_type || 'system').slice(1);
          return {
            id: row.id,
            ts,
            _date: d,
            admin: { name: row.admin_id ? 'Admin' : 'Unknown', initials: row.admin_id ? 'AD' : '??' },
            type: evType,
            description: row.description || '—',
            target: row.target_table || '—',
            ip: row.ip_address || '—',
            ua: row.user_agent || '—',
            result: row.result === 'failure' ? 'failed' : 'success',
          };
        });
        setAllLogs(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load audit log. Check your Supabase connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const admins    = useMemo(() => ["All", ...new Set(allLogs.map(l => l.admin.name))], [allLogs]);
  const types     = ["All", "Auth", "Content", "Security", "Settings", "Media", "System"];

  const filtered  = useMemo(() => {
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate   = dateTo   ? new Date(dateTo + "T23:59:59") : null;

    return allLogs.filter(row => {
      const q = search.toLowerCase();
      const matchSearch = !q || row.description.toLowerCase().includes(q)
        || row.target.toLowerCase().includes(q)
        || row.ip.includes(q)
        || row.admin.name.toLowerCase().includes(q);
      const matchType   = typeFilter   === "All" || row.type.toLowerCase() === typeFilter.toLowerCase();
      const matchUser   = userFilter   === "All" || row.admin.name === userFilter;
      const rowDate     = row._date;
      const matchFrom   = !fromDate || rowDate >= fromDate;
      const matchTo     = !toDate   || rowDate <= toDate;
      const matchResult = resultFilter === "All" || row.result === resultFilter;
      return matchSearch && matchType && matchUser && matchResult && matchFrom && matchTo;
    });
  }, [allLogs, search, typeFilter, userFilter, resultFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const startRow  = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRow    = Math.min(safePage * pageSize, filtered.length);

  const handleFilter = (setter) => (val) => { setter(val); setPage(1); };

  const handleExportCSV = () => {
    const header = ["Timestamp","Admin","Type","Description","Target","IP","User Agent","Result"];
    const rows   = filtered.map(r =>
      [r.ts, r.admin.name, r.type, r.description, r.target, r.ip, r.ua, r.result]
        .map(v => `"${v}"`).join(",")
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = filtered.map(r => ({
      id: r.id, timestamp: r.ts, admin: r.admin.name,
      type: r.type, description: r.description, target: r.target,
      ip: r.ip, userAgent: r.ua, result: r.result,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Pagination helpers ────────────────────────────────────────────────────
  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="al-page">
      {/* ── Header ── */}
      <header className="al-header">
        <div>
          <p className="al-breadcrumb">Security <span>› Audit Log</span></p>
          <h1 className="al-title">Audit Log</h1>
          <p className="al-subtitle">Forensic-grade trail of every admin action — {allLogs.length} total events.</p>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(240,90,99,0.08)', border: '1px solid rgba(240,90,99,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#F05A63', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="al-stats-row">
        {[
          { label: "Total Events",   value: allLogs.length,                           color: "blue"   },
          { label: "Today",          value: allLogs.filter(l => { const d = l._date; const t = new Date(); return d.toDateString() === t.toDateString(); }).length, color: "teal"   },
          { label: "Failed Attempts",value: allLogs.filter(l => l.result === "failed").length, color: "red"    },
          { label: "Admins Active",  value: new Set(allLogs.filter(l => l.admin.name !== "Unknown").map(l => l.admin.name)).size, color: "purple" },
        ].map(s => (
          <div className={`al-stat-card accent-${s.color}`} key={s.label}>
            <span className="al-stat-value">{s.value}</span>
            <span className="al-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="al-toolbar">
        <div className="al-search-wrap">
          <Search size={15} className="al-search-icon" />
          <input
            className="al-search"
            placeholder="Search by description, target, IP, or admin…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="al-search-clear" onClick={() => { setSearch(""); setPage(1); }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="al-filters">
          <SelectPill label="Type"   value={typeFilter}   options={types}   onChange={handleFilter(setTypeFilter)} />
          <SelectPill label="Admin"  value={userFilter}   options={admins}  onChange={handleFilter(setUserFilter)} />
          <SelectPill label="Result" value={resultFilter} options={["All","success","failed"]} onChange={handleFilter(setResultFilter)} capitalizeOptions />
        </div>

        <div className="al-date-range">
          <Calendar size={13} className="al-date-icon" />
          <input
            className="al-date-input"
            type="date"
            title="From date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          />
          <span className="al-date-sep">–</span>
          <input
            className="al-date-input"
            type="date"
            title="To date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
          />
          {(dateFrom || dateTo) && (
            <button
              className="al-date-clear"
              onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
              title="Clear date range"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="al-export-group">
          <button className="btn-export" onClick={handleExportCSV}>
            <Download size={15} />
            CSV
          </button>
          <button className="btn-export" onClick={handleExportJSON}>
            <FileJson size={15} />
            JSON
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Type</th>
              <th>Description</th>
              <th>Target</th>
              <th>IP Address</th>
              <th>Result</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="al-empty">
                  <Search size={28} className="empty-icon" />
                  <p>No events match your filters.</p>
                </td>
              </tr>
            ) : pageRows.map(row => (
              <tr
                key={row.id}
                className={`al-row ${row.result === "failed" ? "row-failed" : ""}`}
                onClick={() => setDetailRow(row)}
              >
                <td className="td-ts">
                  <Clock size={12} className="td-icon-muted" />
                  {row.ts}
                </td>
                <td className="td-admin">
                  <span className={`admin-badge ${row.admin.name === "Unknown" ? "admin-unknown" : ""}`}>
                    {row.admin.initials}
                  </span>
                  <span className="admin-name">{row.admin.name}</span>
                </td>
                <td>
                  <span className={`type-badge ${TYPE_META[row.type]?.color}`}>
                    {TYPE_META[row.type]?.icon}
                    {row.type}
                  </span>
                </td>
                <td className="td-desc">{row.description}</td>
                <td className="td-target">{row.target}</td>
                <td className="td-ip">
                  <Globe size={12} className="td-icon-muted" />
                  {row.ip}
                </td>
                <td>
                  {row.result === "success"
                    ? <span className="result-ok"><CheckCircle size={15} /> Success</span>
                    : <span className="result-fail"><XCircle   size={15} /> Failed</span>
                  }
                </td>
                <td>
                  <button
                    className="btn-row-detail"
                    onClick={e => { e.stopPropagation(); setDetailRow(row); }}
                    title="View details"
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="al-pagination">
        <div className="al-page-info">
          Showing <strong>{startRow}–{endRow}</strong> of <strong>{filtered.length}</strong> events
          &nbsp;
          <select
            className="al-page-size"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>

        <div className="al-page-nav">
          <button
            className="btn-page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            <ChevronLeft size={15} />
          </button>

          {pageNumbers().map((p, i) =>
            p === "…"
              ? <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
              : <button
                  key={p}
                  className={`btn-page ${safePage === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
          )}

          <button
            className="btn-page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {detailRow && (
        <>
          <div className="al-drawer-overlay" onClick={() => setDetailRow(null)} />
          <aside className="al-drawer">
            <div className="drawer-header">
              <h2>Event Detail</h2>
              <button className="drawer-close" onClick={() => setDetailRow(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Result pill */}
              <div className="drawer-result">
                {detailRow.result === "success"
                  ? <span className="result-ok lg"><CheckCircle size={18} /> Success</span>
                  : <span className="result-fail lg"><XCircle   size={18} /> Failed</span>
                }
                <span className={`type-badge ${TYPE_META[detailRow.type]?.color}`}>
                  {TYPE_META[detailRow.type]?.icon}
                  {detailRow.type}
                </span>
              </div>

              <h3 className="drawer-desc">{detailRow.description}</h3>

              <div className="drawer-fields">
                <DrawerField icon={<Clock size={14}/>}  label="Timestamp"  value={detailRow.ts} />
                <DrawerField icon={<User  size={14}/>}  label="Admin User" value={`${detailRow.admin.name} (${detailRow.admin.initials})`} />
                <DrawerField icon={<FileText size={14}/>} label="Target"   value={detailRow.target} />
                <DrawerField icon={<Globe size={14}/>}  label="IP Address" value={detailRow.ip} mono />
                <DrawerField icon={<Monitor size={14}/>} label="User Agent" value={detailRow.ua} />
              </div>

              <div className="drawer-note">
                <Info size={13} />
                <span>This event is permanently recorded and cannot be modified or deleted.</span>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SelectPill({ label, value, options, onChange, capitalizeOptions }) {
  return (
    <div className="select-pill-wrap">
      <Filter size={12} className="pill-icon" />
      <select
        className="select-pill"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o} value={o}>
            {label !== "All" && o === "All" ? `All ${label}s` : capitalizeOptions ? (o.charAt(0).toUpperCase() + o.slice(1)) : o}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="pill-caret" />
    </div>
  );
}

function DrawerField({ icon, label, value, mono }) {
  return (
    <div className="drawer-field">
      <span className="drawer-field-icon">{icon}</span>
      <div>
        <p className="drawer-field-label">{label}</p>
        <p className={`drawer-field-value ${mono ? "mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}