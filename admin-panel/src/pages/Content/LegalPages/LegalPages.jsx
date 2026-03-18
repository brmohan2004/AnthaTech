import React, { useState, useEffect } from 'react';
import './LegalPages.css';
import { FileText, Plus, Trash2, Save, ChevronDown, ChevronUp, Globe, Shield, Cookie, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getLegalPage, upsertLegalPage, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { useAuth } from '../../../contexts/AuthContext';

const PAGES = [
  { slug: 'privacy-policy',    label: 'Privacy Policy',      icon: Shield },
  { slug: 'terms-conditions',  label: 'Terms & Conditions',  icon: Globe },
  { slug: 'cookies-policy',    label: 'Cookies Policy',      icon: Cookie },
];

const emptySection = () => ({ heading: '', body: '' });

export default function LegalPages() {
  const { canEdit, role } = useAuth();
  const isSuperAdmin = role === 'super_admin';
  const hasEditAccess = isSuperAdmin || canEdit('content-legal');
  const isReadOnly = !hasEditAccess;

  const [activeSlug, setActiveSlug] = useState(PAGES[0].slug);
  const [pages, setPages] = useState({}); // { slug: { title, last_updated, content, meta_description } }
  const [savedPages, setSavedPages] = useState({}); // for Revert
  const [loadingSlug, setLoadingSlug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(0);

  /* ── Load page ── */
  useEffect(() => {
    if (pages[activeSlug] !== undefined) return;
    setLoadingSlug(activeSlug);
    getLegalPage(activeSlug)
      .then((data) => {
        const pageData = data ? {
          title: data.title || '',
          last_updated: data.last_updated || new Date().toISOString().slice(0, 10),
          content: Array.isArray(data.content) ? data.content : [emptySection()],
          meta_description: data.meta_description || '',
        } : {
          title: PAGES.find(p => p.slug === activeSlug)?.label || '',
          last_updated: new Date().toISOString().slice(0, 10),
          content: [emptySection()],
          meta_description: '',
        };
        setPages(prev => ({ ...prev, [activeSlug]: pageData }));
        setSavedPages(prev => ({ ...prev, [activeSlug]: JSON.parse(JSON.stringify(pageData)) }));
      })
      .catch(() => setToast({ type: 'error', message: 'Failed to load content.' }))
      .finally(() => setLoadingSlug(null));
  }, [activeSlug]); // eslint-disable-line

  const page = pages[activeSlug];
  const isDirty = page && savedPages[activeSlug] && JSON.stringify(page) !== JSON.stringify(savedPages[activeSlug]);

  /* ── Field helpers ── */
  const setField = (field, value) =>
    setPages(prev => ({ ...prev, [activeSlug]: { ...prev[activeSlug], [field]: value } }));

  const setSectionField = (idx, field, value) =>
    setPages(prev => {
      const sections = [...prev[activeSlug].content];
      sections[idx] = { ...sections[idx], [field]: value };
      return { ...prev, [activeSlug]: { ...prev[activeSlug], content: sections } };
    });

  const addSection = () => {
    setPages(prev => {
      const sections = [...(prev[activeSlug]?.content || []), emptySection()];
      return { ...prev, [activeSlug]: { ...prev[activeSlug], content: sections } };
    });
    setExpandedIdx(page?.content?.length || 0);
  };

  const removeSection = (idx) =>
    setPages(prev => {
      const sections = prev[activeSlug].content.filter((_, i) => i !== idx);
      return { ...prev, [activeSlug]: { ...prev[activeSlug], content: sections } };
    });

  const moveSection = (idx, dir) => {
    setPages(prev => {
      const sections = [...prev[activeSlug].content];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sections.length) return prev;
      [sections[idx], sections[swapIdx]] = [sections[swapIdx], sections[idx]];
      return { ...prev, [activeSlug]: { ...prev[activeSlug], content: sections } };
    });
  };

  const handleRevert = () => {
    setPages(prev => ({ ...prev, [activeSlug]: JSON.parse(JSON.stringify(savedPages[activeSlug])) }));
    setToast({ type: 'warning', message: 'Changes reverted.' });
  };

  const handleSave = async () => {
    if (isReadOnly) {
      setToast({ type: 'warning', message: 'You cannot modify it.' });
      return;
    }
    if (!page) return;
    setSaving(true);
    try {
      await upsertLegalPage(activeSlug, {
        title: page.title,
        last_updated: page.last_updated,
        content: page.content,
        meta_description: page.meta_description,
      });
      setSavedPages(prev => ({ ...prev, [activeSlug]: JSON.parse(JSON.stringify(page)) }));
      setToast({ type: 'success', message: `${page.title} saved successfully.` });
      try {
        const user = await getCurrentUser();
        await insertAuditLog({
          admin_id: user?.id,
          event_type: 'content',
          description: `Updated Legal Page: "${page.title}"`,
          result: 'success',
        });
      } catch (_) { }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const activePageMeta = PAGES.find(p => p.slug === activeSlug);

  return (
    <div className="legal-manager">
      <header className="page-header">
        <div className="header-breadcrumbs">
          Content &gt; <span>Legal Pages</span> &gt; <span>{activePageMeta?.label}</span>
        </div>
        <div className="header-actions">
          <Button
            variant="ghost"
            icon={<RefreshCw size={14} />}
            onClick={handleRevert}
            disabled={!isDirty || isReadOnly}
          >
            Revert
          </Button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            disabled={!isDirty || isReadOnly || saving || loadingSlug === activeSlug}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="settings-tabs">
        {PAGES.map(({ slug, label }) => (
          <button
            key={slug}
            className={`tab ${activeSlug === slug ? 'active' : ''}`}
            onClick={() => setActiveSlug(slug)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="legal-content-area">
        {loadingSlug === activeSlug ? (
          <div className="legal-loading">
            <div className="shimmer-title" />
            <div className="shimmer-card" />
          </div>
        ) : page ? (
          <div className="tab-content">
            <div className="legal-meta-section">
              <div className="form-group">
                <label>Page Title</label>
                <input
                  className="form-input"
                  value={page.title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="e.g. Privacy Policy"
                  disabled={isReadOnly}
                />
              </div>
              <div className="form-group">
                <label>Last Updated</label>
                <input
                  type="date"
                  className="form-input"
                  value={page.last_updated || ''}
                  onChange={e => setField('last_updated', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="form-group full-width">
                <label>Meta Description (SEO)</label>
                <textarea
                  className="form-input"
                  value={page.meta_description || ''}
                  onChange={e => setField('meta_description', e.target.value)}
                  placeholder="Short description for search engines…"
                  rows={2}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="form-section-divider">Content Sections</div>

            <div className="legal-sections-grid">
              {page.content.map((section, idx) => {
                const isExpanded = expandedIdx === idx;
                return (
                  <div key={idx} className={`legal-section-item ${isExpanded ? 'expanded' : ''}`}>
                    <div className="section-handle" onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                      <div className="section-info">
                        <span className="section-index">#{idx + 1}</span>
                        <span className="section-title">{section.heading || 'Untitled Section'}</span>
                      </div>
                      <div className="section-actions">
                        <button
                          onClick={e => { e.stopPropagation(); moveSection(idx, -1); }}
                          disabled={idx === 0 || isReadOnly}
                        ><ChevronUp size={14} /></button>
                        <button
                          onClick={e => { e.stopPropagation(); moveSection(idx, 1); }}
                          disabled={idx === page.content.length - 1 || isReadOnly}
                        ><ChevronDown size={14} /></button>
                        {!isReadOnly && (
                          <button
                            className="danger"
                            onClick={e => { e.stopPropagation(); removeSection(idx); }}
                          ><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="section-edit-body">
                        <div className="form-group">
                          <label>Heading</label>
                          <input
                            className="form-input"
                            value={section.heading}
                            onChange={e => setSectionField(idx, 'heading', e.target.value)}
                            placeholder="Section Heading"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="form-group">
                          <label>Body Content</label>
                          <textarea
                            className="form-input"
                            value={section.body}
                            onChange={e => setSectionField(idx, 'body', e.target.value)}
                            placeholder="Write content here..."
                            rows={8}
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {!isReadOnly && (
                <button className="add-legal-section" onClick={addSection}>
                  <Plus size={16} /> Add New Section
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {isReadOnly && (
        <div className="legal-readonly-hint">
          <AlertTriangle size={14} /> You have view-only access to legal pages.
        </div>
      )}

      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
