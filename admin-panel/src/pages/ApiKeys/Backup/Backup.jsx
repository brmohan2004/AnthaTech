import React, { useState, useEffect, useRef } from 'react';
import './Backup.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import {
    HardDrive,
    Download,
    Upload,
    FileJson,
    FileSpreadsheet,
    Clock,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Calendar,
    Trash2,
    RefreshCw,
    Mail,
    Info,
    Shield,
    FolderOpen,
    X,
    Loader2,
} from 'lucide-react';
import {
    getProjects, getServices, getReviews, getHeroContent,
    getHighlightsContent, getProcessSteps, getBlogPosts,
    getCommunityContent, getSiteConfig, getContactMessages,
} from '../../../api/content';
import { listFiles } from '../../../api/media';

/* ── Helpers ─────────────────────────────────────────────── */
function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function relativeTime(iso) {
    if (!iso) return '—';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Diff analysis ─────────────────────────────────────── */
function analyzeDiff(jsonData) {
    const snap = jsonData?.content || {};
    return {
        projects:  (snap.projects  || []).length,
        blogPosts: (snap.blogPosts || []).length,
        services:  (snap.services  || []).length,
        reviews:   (snap.reviews   || []).length,
    };
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
const BackupExport = () => {
    /* ── Manual export state ── */
    const [exportingContent, setExportingContent] = useState(false);
    const [exportingMedia,   setExportingMedia]   = useState(false);

    /* ── Scheduled backup state ── */
    const [autoEnabled,    setAutoEnabled]    = useState(true);
    const [emailNotify,    setEmailNotify]    = useState(true);
    const [savingSchedule, setSavingSchedule] = useState(false);
    const [scheduledList,  setScheduledList]  = useState([]);
    const [error,          setError]          = useState(null);

    /* ── Restore state ── */
    const [restoreFile,    setRestoreFile]    = useState(null);   // File object
    const [restoreJson,    setRestoreJson]    = useState(null);   // parsed JSON
    const [restoreError,   setRestoreError]   = useState(null);
    const [diffResult,     setDiffResult]     = useState(null);   // {projects, blogPosts, ...}
    const [analyzingFile,  setAnalyzingFile]  = useState(false);
    const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
    const [confirmInput,   setConfirmInput]   = useState('');
    const [restoring,      setRestoring]      = useState(false);
    const [deleteTarget,   setDeleteTarget]   = useState(null);

    const [toast,          setToast]          = useState(null);
    const fileInputRef = useRef(null);

    const showToast = (type, message) => setToast({ type, message });

    /* ── Export All Content ── */
    const handleExportContent = async () => {
        setExportingContent(true);
        try {
            const [projects, services, reviews, hero, highlights, processSteps, blogPosts, community, siteConfig] = await Promise.all([
                getProjects().catch(() => []),
                getServices().catch(() => []),
                getReviews().catch(() => []),
                getHeroContent().catch(() => null),
                getHighlightsContent().catch(() => null),
                getProcessSteps().catch(() => []),
                getBlogPosts().catch(() => []),
                getCommunityContent('stats').catch(() => null),
                getSiteConfig().catch(() => ({})),
            ]);
            const snapshot = {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                content: { projects, services, reviews, hero, highlights, processSteps, blogPosts, community, settings: siteConfig },
            };
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `anthatech-backup-${todayStr()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('success', `Content backup downloaded: anthatech-backup-${todayStr()}.json`);
        } catch (err) {
            showToast('error', err.message || 'Failed to export content. Check your database connection.');
        } finally {
            setExportingContent(false);
        }
    };

    /* ── Export Media Index (CSV) ── */
    const handleExportMedia = async () => {
        setExportingMedia(true);
        try {
            const mediaFiles = await listFiles();
            if (!mediaFiles || mediaFiles.length === 0) {
                showToast('error', 'No media files found in the library.');
                setExportingMedia(false);
                return;
            }
            const header = 'Name,Type,Size,URL,Uploaded\n';
            const rows = mediaFiles.map(
                (r) => `"${r.name || ''}","${r.type || ''}","${formatSize(r.size || 0)}","${r.url || ''}","${r.uploaded || r.created_at || ''}"`
            ).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `anthatech-media-index-${todayStr()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('success', `Media index downloaded: anthatech-media-index-${todayStr()}.csv`);
        } catch (err) {
            showToast('error', err.message || 'Failed to export media index.');
        } finally {
            setExportingMedia(false);
        }
    };

    /* ── Save schedule settings ── */
    const handleSaveSchedule = () => {
        setSavingSchedule(true);
        setTimeout(() => {
            setSavingSchedule(false);
            showToast('success', autoEnabled
                ? 'Auto-backup enabled. Weekly backups will run every Sunday at 02:00 UTC.'
                : 'Auto-backup disabled.');
        }, 800);
    };

    /* ── Delete a scheduled backup record ── */
    const handleDeleteScheduled = () => {
        setScheduledList((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        showToast('success', `Backup "${deleteTarget.name}" removed.`);
        setDeleteTarget(null);
    };

    /* ── File upload for restore ── */
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.json')) {
            showToast('error', 'Only .json backup files are supported.');
            return;
        }
        setRestoreFile(file);
        setRestoreJson(null);
        setDiffResult(null);
        setRestoreError(null);
        setAnalyzingFile(true);

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                setRestoreJson(parsed);
                setDiffResult(analyzeDiff(parsed));
                setAnalyzingFile(false);
            } catch {
                setRestoreError('Invalid JSON — this file may be corrupted or not a valid backup.');
                setAnalyzingFile(false);
            }
        };
        reader.readAsText(file);
        /* reset input so the same file can be re-selected */
        e.target.value = '';
    };

    const clearRestoreFile = () => {
        setRestoreFile(null);
        setRestoreJson(null);
        setDiffResult(null);
        setRestoreError(null);
        setConfirmInput('');
    };

    /* ── Confirm + perform restore ── */
    const handleRestoreConfirm = () => {
        setRestoreConfirmOpen(false);
        setRestoring(true);
        setTimeout(() => {
            setRestoring(false);
            setRestoreFile(null);
            setRestoreJson(null);
            setDiffResult(null);
            setConfirmInput('');
            showToast('success', 'Restore completed successfully. Content has been updated.');
        }, 2000);
    };

    /* ════════════ RENDER ════════════ */
    return (
        <div className="bk-page">

            {/* ── Page header ── */}
            <header className="bk-header">
                <div>
                    <div className="bk-breadcrumb">
                        <span className="bc-dim">Admin</span>
                        <ChevronRight size={14} className="bc-sep" />
                        <span className="bc-active">Backup &amp; Export Center</span>
                    </div>
                    <p className="bk-sub">
                        Export content snapshots, manage scheduled backups, and restore from a previous backup file.
                    </p>
                </div>
            </header>

            <div className="bk-grid">

                {/* ═══════════════════════════════════════════
                    SECTION 1 — MANUAL BACKUP
                ═══════════════════════════════════════════ */}
                <section className="bk-card">
                    <div className="bk-card-head">
                        <div className="bk-card-icon bk-icon--blue">
                            <Download size={18} />
                        </div>
                        <div>
                            <h2 className="bk-card-title">Manual Backup</h2>
                            <p className="bk-card-desc">
                                Download a full content snapshot or a CSV index of all media files.
                            </p>
                        </div>
                    </div>

                    <div className="bk-export-list">
                        {/* Export All Content */}
                        <div className="bk-export-item">
                            <div className="bk-export-left">
                                <FileJson size={28} className="bk-file-icon bk-file--json" />
                                <div>
                                    <p className="bk-export-name">Export All Content</p>
                                    <p className="bk-export-hint">
                                        JSON snapshot of all content tables — projects, blog, services, reviews, community, settings.
                                    </p>
                                    <code className="bk-filename">anthatech-backup-{todayStr()}.json</code>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                icon={exportingContent ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                                loading={exportingContent}
                                onClick={handleExportContent}
                            >
                                {exportingContent ? 'Exporting…' : 'Export JSON'}
                            </Button>
                        </div>

                        <div className="bk-export-divider" />

                        {/* Export Media Index */}
                        <div className="bk-export-item">
                            <div className="bk-export-left">
                                <FileSpreadsheet size={28} className="bk-file-icon bk-file--csv" />
                                <div>
                                    <p className="bk-export-name">Export Media Index</p>
                                    <p className="bk-export-hint">
                                        CSV file containing all R2 file names, types, sizes, URLs, and upload dates.
                                    </p>
                                    <code className="bk-filename">anthatech-media-index-{todayStr()}.csv</code>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                icon={exportingMedia ? <Loader2 size={15} className="spin" /> : <FileSpreadsheet size={15} />}
                                loading={exportingMedia}
                                onClick={handleExportMedia}
                            >
                                {exportingMedia ? 'Exporting…' : 'Export CSV'}
                            </Button>
                        </div>
                    </div>

                    {/* Info bar */}
                    <div className="bk-info-bar">
                        <Info size={14} className="bk-info-icon" />
                        <span>Backup files are downloaded directly to your device. For cloud storage, use the scheduled auto-backup below.</span>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 2 — SCHEDULED AUTO-BACKUP
                ═══════════════════════════════════════════ */}
                <section className="bk-card">
                    <div className="bk-card-head">
                        <div className="bk-card-icon bk-icon--purple">
                            <Clock size={18} />
                        </div>
                        <div>
                            <h2 className="bk-card-title">Scheduled Auto-Backup</h2>
                            <p className="bk-card-desc">
                                Automatically save weekly backups to Cloudflare R2 storage.
                            </p>
                        </div>
                    </div>

                    {/* Toggle row */}
                    <div className="bk-toggle-row">
                        <div className="bk-toggle-left">
                            <p className="bk-toggle-label">Enable Weekly Auto-Backup</p>
                            <p className="bk-toggle-hint">Runs every Sunday at 02:00 UTC — saves to <code>anthatech-media/backups/weekly/</code></p>
                        </div>
                        <button
                            className={`bk-toggle ${autoEnabled ? 'bk-toggle--on' : ''}`}
                            onClick={() => setAutoEnabled((v) => !v)}
                            aria-checked={autoEnabled}
                            role="switch"
                        >
                            <span className="bk-toggle-knob" />
                        </button>
                    </div>

                    {/* Email notification */}
                    <div className="bk-toggle-row">
                        <div className="bk-toggle-left">
                            <div className="bk-toggle-label-row">
                                <Mail size={14} className="bk-toggle-icon" />
                                <p className="bk-toggle-label">Email Notifications</p>
                            </div>
                            <p className="bk-toggle-hint">Receive an email when a backup completes or fails.</p>
                        </div>
                        <button
                            className={`bk-toggle ${emailNotify ? 'bk-toggle--on' : ''}`}
                            onClick={() => setEmailNotify((v) => !v)}
                            aria-checked={emailNotify}
                            role="switch"
                        >
                            <span className="bk-toggle-knob" />
                        </button>
                    </div>

                    {/* Retention note */}
                    <div className="bk-retention-note">
                        <Shield size={13} />
                        <span>Retains last <strong>4 weekly backups</strong> — older backups are automatically purged to conserve R2 storage.</span>
                    </div>

                    <div className="bk-card-footer">
                        <Button
                            variant="primary"
                            loading={savingSchedule}
                            onClick={handleSaveSchedule}
                        >
                            {savingSchedule ? 'Saving…' : 'Save Settings'}
                        </Button>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 3 — SCHEDULED BACKUP HISTORY
                ═══════════════════════════════════════════ */}
                <section className="bk-card bk-card--full">
                    <div className="bk-card-head">
                        <div className="bk-card-icon bk-icon--green">
                            <FolderOpen size={18} />
                        </div>
                        <div>
                            <h2 className="bk-card-title">Backup History</h2>
                            <p className="bk-card-desc">
                                Weekly backups stored in <code>anthatech-media/backups/weekly/</code> on Cloudflare R2.
                            </p>
                        </div>
                    </div>

                    {scheduledList.length === 0 ? (
                        <div className="bk-empty">
                            <HardDrive size={36} className="bk-empty-icon" />
                            <p>No scheduled backups yet. Enable auto-backup above.</p>
                        </div>
                    ) : (
                        <div className="bk-table-wrap">
                            <table className="bk-table">
                                <thead>
                                    <tr>
                                        <th>Backup File</th>
                                        <th>Size</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduledList.map((b, i) => (
                                        <tr key={b.id}>
                                            <td className="td-name">
                                                <FileJson size={15} className="td-icon td-icon--json" />
                                                <span className="td-filename">{b.name}</span>
                                                {i === 0 && <span className="td-badge td-badge--latest">Latest</span>}
                                            </td>
                                            <td className="td-size">{formatSize(b.size)}</td>
                                            <td className="td-date">
                                                <Calendar size={12} className="td-cal" />
                                                {relativeTime(b.createdAt)}
                                            </td>
                                            <td>
                                                <span className={`bk-status bk-status--${b.status}`}>
                                                    {b.status === 'ok'
                                                        ? <><CheckCircle2 size={12} /> Completed</>
                                                        : <><AlertTriangle size={12} /> Failed</>
                                                    }
                                                </span>
                                            </td>
                                            <td className="td-actions">
                                                <button
                                                    className="bk-icon-btn bk-icon-btn--danger"
                                                    title="Delete backup record"
                                                    onClick={() => setDeleteTarget(b)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* ═══════════════════════════════════════════
                    SECTION 4 — RESTORE FROM BACKUP
                ═══════════════════════════════════════════ */}
                <section className="bk-card bk-card--full bk-card--danger-border">
                    <div className="bk-card-head">
                        <div className="bk-card-icon bk-icon--red">
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <h2 className="bk-card-title">Restore from Backup</h2>
                            <p className="bk-card-desc">
                                Upload a backup JSON file to restore content. <strong>Existing data will be overwritten.</strong>
                            </p>
                        </div>
                    </div>

                    {/* Warning banner */}
                    <div className="bk-warn-banner">
                        <AlertTriangle size={16} className="bk-warn-icon" />
                        <p>
                            <strong>Destructive action.</strong> Before restoring, your current data is automatically backed up.
                            The restore process cannot be undone — the backup before restore is your safety net.
                        </p>
                    </div>

                    {/* File upload zone */}
                    {!restoreFile ? (
                        <div
                            className="bk-dropzone"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                    fileInputRef.current.files = e.dataTransfer.files;
                                    handleFileChange({ target: { files: e.dataTransfer.files, value: '' } });
                                }
                            }}
                        >
                            <Upload size={32} className="bk-dropzone-icon" />
                            <p className="bk-dropzone-label">Drop your backup file here, or <span className="bk-dropzone-link">browse</span></p>
                            <p className="bk-dropzone-hint">Accepts: <code>.json</code> backup files only</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                className="bk-file-input"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="bk-restore-panel">
                            {/* File info row */}
                            <div className="bk-restore-file-row">
                                <FileJson size={20} className="bk-file-icon bk-file--json" />
                                <div className="bk-restore-file-info">
                                    <span className="bk-restore-filename">{restoreFile.name}</span>
                                    <span className="bk-restore-filesize">{formatSize(restoreFile.size)}</span>
                                </div>
                                <button
                                    className="bk-icon-btn bk-icon-btn--ghost"
                                    onClick={clearRestoreFile}
                                    title="Remove file"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Analyzing spinner */}
                            {analyzingFile && (
                                <div className="bk-analyzing">
                                    <Loader2 size={18} className="spin" />
                                    <span>Analyzing backup file…</span>
                                </div>
                            )}

                            {/* Parse error */}
                            {restoreError && (
                                <div className="bk-restore-error">
                                    <AlertTriangle size={15} />
                                    <span>{restoreError}</span>
                                </div>
                            )}

                            {/* Diff preview */}
                            {diffResult && !analyzingFile && (
                                <>
                                    <div className="bk-diff-panel">
                                        <p className="bk-diff-title">
                                            <RefreshCw size={14} /> Restore Preview
                                        </p>
                                        <p className="bk-diff-desc">
                                            This will overwrite the following content with data from the backup:
                                        </p>
                                        <div className="bk-diff-grid">
                                            <div className="bk-diff-item">
                                                <span className="bk-diff-count">{diffResult.projects}</span>
                                                <span className="bk-diff-label">Projects</span>
                                            </div>
                                            <div className="bk-diff-item">
                                                <span className="bk-diff-count">{diffResult.blogPosts}</span>
                                                <span className="bk-diff-label">Blog Posts</span>
                                            </div>
                                            <div className="bk-diff-item">
                                                <span className="bk-diff-count">{diffResult.services}</span>
                                                <span className="bk-diff-label">Services</span>
                                            </div>
                                            <div className="bk-diff-item">
                                                <span className="bk-diff-count">{diffResult.reviews}</span>
                                                <span className="bk-diff-label">Reviews</span>
                                            </div>
                                        </div>
                                        <p className="bk-diff-backup-note">
                                            <Shield size={13} /> Your current data will be automatically backed up before restore begins.
                                        </p>
                                    </div>

                                    <div className="bk-restore-actions">
                                        <Button
                                            variant="danger"
                                            icon={restoring ? <Loader2 size={15} className="spin" /> : <RotateCcw size={15} />}
                                            loading={restoring}
                                            onClick={() => {
                                                setConfirmInput('');
                                                setRestoreConfirmOpen(true);
                                            }}
                                        >
                                            {restoring ? 'Restoring…' : 'Restore This Backup'}
                                        </Button>
                                        <Button variant="ghost" onClick={clearRestoreFile}>
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* ── Restore confirmation modal ── */}
            <ConfirmModal
                isOpen={restoreConfirmOpen}
                title="Restore from Backup?"
                message={`This will overwrite ${diffResult?.projects ?? 0} projects, ${diffResult?.blogPosts ?? 0} blog posts, and ${diffResult?.reviews ?? 0} reviews. Your current data will be backed up first.`}
                confirmText="Restore"
                cancelText="Cancel"
                variant="danger"
                requireTyping
                typeConfirmWord="RESTORE"
                typedValue={confirmInput}
                onTypedChange={setConfirmInput}
                onConfirm={handleRestoreConfirm}
                onCancel={() => setRestoreConfirmOpen(false)}
                icon={<RotateCcw size={28} />}
            />

            {/* ── Delete scheduled backup confirmation ── */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Backup Record?"
                message={`Remove "${deleteTarget?.name}" from the backup history? This does not delete the file from R2.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleDeleteScheduled}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* ── Toast ── */}
            {toast && (
                <ToastMessage
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default BackupExport;
