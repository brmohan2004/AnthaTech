import React, { useState } from 'react';
import {
  X, Clock, RotateCcw, Eye, AlertTriangle, ChevronDown,
  ChevronRight, CheckCircle2,
} from 'lucide-react';
import './VersionHistoryDrawer.css';

// ── Restore confirmation modal ────────────────────────────────────────────────
function RestoreModal({ version, onConfirm, onCancel, nextVersionNum }) {
  return (
    <div className="vh-modal-overlay" onClick={onCancel}>
      <div className="vh-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vh-modal-icon">
          <AlertTriangle size={26} />
        </div>
        <h3 className="vh-modal-title">Restore Version {version.versionNum}?</h3>
        <p className="vh-modal-body">
          This will overwrite the current content with the state from{' '}
          <strong>v{version.versionNum}</strong>.
          <br />
          Your current state will be auto-saved as{' '}
          <strong>v{nextVersionNum}</strong> before restoring.
        </p>
        <div className="vh-modal-actions">
          <button className="vh-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="vh-btn-restore" onClick={() => onConfirm(version)}>
            <RotateCcw size={14} /> Restore Version {version.versionNum}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ version, contentType, onClose }) {
  return (
    <div className="vh-modal-overlay" onClick={onClose}>
      <div className="vh-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vh-preview-header">
          <div className="vh-preview-title-row">
            <Eye size={16} />
            <span>Version {version.versionNum} Preview</span>
            <span className="vh-preview-ts">{version.timestamp}</span>
          </div>
          <button className="vh-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="vh-preview-body">
          <div className="vh-preview-label">Saved by {version.adminName}</div>
          {version.summary && (
            <div className="vh-preview-summary-badge">
              <Clock size={12} /> {version.summary}
            </div>
          )}
          <div className="vh-preview-content">
            {version.preview ? (
              Object.entries(version.preview).map(([key, val]) => (
                <div className="vh-preview-field" key={key}>
                  <span className="vh-preview-key">{key}</span>
                  <span className="vh-preview-val">{val}</span>
                </div>
              ))
            ) : (
              <p className="vh-preview-placeholder">
                No field-level diff available for this version.
              </p>
            )}
          </div>
        </div>
        <div className="vh-preview-footer">
          <span className="vh-preview-note">Read-only — this is how the {contentType} looked at this point.</span>
        </div>
      </div>
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  contentTitle  = 'Untitled',
  contentType   = 'Content',
  versions      = [],
  visibleCount  = 5,
  onRestore,
}) {
  const [previewVersion,  setPreviewVersion]  = useState(null);
  const [restoreVersion,  setRestoreVersion]  = useState(null);
  const [shownCount,      setShownCount]      = useState(visibleCount);
  const [restoredVersion, setRestoredVersion] = useState(null);

  const displayedVersions = versions.slice(0, shownCount);
  const currentVersion    = versions[0];
  const nextVersionNum    = currentVersion ? currentVersion.versionNum + 1 : 1;

  const handleRestore = (version) => {
    setRestoreVersion(null);
    setRestoredVersion(version.versionNum);
    onRestore && onRestore(version);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dim backdrop */}
      <div className="vh-backdrop" onClick={onClose} />

      {/* Drawer panel */}
      <aside className="vh-drawer">
        {/* Drawer header */}
        <div className="vh-drawer-header">
          <div className="vh-drawer-title-block">
            <Clock size={18} className="vh-header-icon" />
            <div>
              <h2 className="vh-drawer-title">Version History</h2>
              <p className="vh-drawer-sub">
                {contentType}: <strong>{contentTitle}</strong>
              </p>
            </div>
          </div>
          <button className="vh-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Restored success banner */}
        {restoredVersion && (
          <div className="vh-restored-banner">
            <CheckCircle2 size={14} />
            Version {restoredVersion} restored — saved as v{nextVersionNum}
          </div>
        )}

        {/* Version list */}
        <div className="vh-version-list">
          {displayedVersions.length === 0 && (
            <div className="vh-empty">No version history yet.</div>
          )}

          {displayedVersions.map((v, idx) => (
            <div
              key={v.versionNum}
              className={`vh-version-item ${v.isCurrent ? 'vh-version-current' : ''}`}
            >
              {/* Version line */}
              <div className="vh-version-row">
                <span className="vh-version-num">
                  v{v.versionNum}
                  {v.isCurrent && <span className="vh-current-tag">Current</span>}
                </span>
                {v.isCurrent && <span className="vh-now-marker">← now</span>}
              </div>

              {/* Meta */}
              <div className="vh-version-meta">
                <span className="vh-admin-badge">{v.adminInitials}</span>
                <span className="vh-admin-name">{v.adminName}</span>
                <span className="vh-dot">·</span>
                <span className="vh-timestamp">{v.timestamp}</span>
              </div>

              {/* Summary */}
              {v.summary && (
                <p className="vh-summary">"{v.summary}"</p>
              )}

              {/* Actions */}
              <div className="vh-version-actions">
                <button
                  className="vh-btn-preview"
                  onClick={() => setPreviewVersion(v)}
                >
                  <Eye size={13} /> Preview
                </button>
                {!v.isCurrent && (
                  <button
                    className="vh-btn-restore-inline"
                    onClick={() => setRestoreVersion(v)}
                  >
                    <RotateCcw size={13} /> Restore This
                  </button>
                )}
              </div>

              {/* Divider (not on last item) */}
              {idx < displayedVersions.length - 1 && (
                <div className="vh-divider" />
              )}
            </div>
          ))}
        </div>

        {/* Load more */}
        {shownCount < versions.length && (
          <div className="vh-load-more-wrap">
            <span className="vh-load-more-count">
              {shownCount} of {versions.length} saved
            </span>
            <button
              className="vh-load-more-btn"
              onClick={() => setShownCount(c => c + 5)}
            >
              <ChevronDown size={14} /> Load More
            </button>
          </div>
        )}

        {shownCount >= versions.length && versions.length > 0 && (
          <div className="vh-load-more-wrap">
            <span className="vh-load-more-count">
              All {versions.length} versions shown
            </span>
          </div>
        )}
      </aside>

      {/* Preview modal */}
      {previewVersion && (
        <PreviewModal
          version={previewVersion}
          contentType={contentType}
          onClose={() => setPreviewVersion(null)}
        />
      )}

      {/* Restore confirmation modal */}
      {restoreVersion && (
        <RestoreModal
          version={restoreVersion}
          nextVersionNum={nextVersionNum}
          onConfirm={handleRestore}
          onCancel={() => setRestoreVersion(null)}
        />
      )}
    </>
  );
}
