import React, { useState, useEffect, useMemo } from 'react';
import './SeoSettings.css';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import { getSiteConfig, updateSiteConfigBatch } from '../../../api/content';
import { Globe, Code2, Map, Bot, ArrowRightLeft } from 'lucide-react';

// Tab Components
import MetaTagsTab from './tabs/MetaTagsTab';
import SchemaTab from './tabs/SchemaTab';
import SitemapTab from './tabs/SitemapTab';
import RobotsTab from './tabs/RobotsTab';
import RedirectsTab from './tabs/RedirectsTab';

// ═══════════════════════════════════════════════════════════════
// Constants & Defaults
// ═══════════════════════════════════════════════════════════════
const TABS = [
    { id: 'meta', label: 'Meta Tags', icon: Globe },
    { id: 'schema', label: 'Schema', icon: Code2 },
    { id: 'sitemap', label: 'Sitemap', icon: Map },
    { id: 'robots', label: 'Robots.txt', icon: Bot },
    { id: 'redirects', label: 'Redirects', icon: ArrowRightLeft },
];

const SITEMAP_PAGES = [
    { page: 'Home', url: '/' },
    { page: 'About', url: '/about' },
    { page: 'Services', url: '/services' },
    { page: 'Projects', url: '/projects' },
    { page: 'Blog', url: '/blog' },
    { page: 'Contact', url: '/contact' },
    { page: 'Community', url: '/community' },
];

const DEFAULT_META = {
    siteName: '', defaultTitle: '', defaultDesc: '', ogImage: '',
    keywords: '', canonicalBase: '', robotsMeta: 'index, follow',
    language: 'en_US', author: '', themeColor: '#3b82f6',
    perPage: [],
};

const DEFAULT_SCHEMA = {
    activeType: 'organization',
    orgName: '', orgUrl: '', orgLogo: '', orgDesc: '',
    orgPhone: '', orgEmail: '', orgAddress: '',
    orgCity: 'Chennai', orgRegion: 'Tamil Nadu', orgCountry: 'IN',
    orgPostalCode: '', orgFoundingDate: '',
    socialUrls: '',
    customJson: '',
};

const DEFAULT_SITEMAP = {
    pages: SITEMAP_PAGES.map(p => ({
        ...p, included: true,
        priority: p.url === '/' ? '1.0' : '0.8',
        frequency: p.url === '/' ? 'daily' : 'weekly',
    })),
};

const DEFAULT_ROBOTS = {
    userAgent: '*',
    allowPaths: ['/'],
    disallowPaths: ['/admin', '/login', '/api'],
    crawlDelay: '10',
    customRules: [],
    predefined: {
        blockAdmin: true, blockLogin: true,
        blockSearch: false, blockApi: true,
        blockPrint: false, blockThankYou: false,
    },
};

const DEFAULT_REDIRECTS = {
    rules: [],
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
const SeoSettings = () => {
    const [activeTab, setActiveTab] = useState('meta');
    const [meta, setMeta] = useState(DEFAULT_META);
    const [schema, setSchema] = useState(DEFAULT_SCHEMA);
    const [sitemap, setSitemap] = useState(DEFAULT_SITEMAP);
    const [robots, setRobots] = useState(DEFAULT_ROBOTS);
    const [redirects, setRedirects] = useState(DEFAULT_REDIRECTS);

    const [savedState, setSavedState] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [copiedSchema, setCopiedSchema] = useState(false);

    // New redirect form
    const [newRedirect, setNewRedirect] = useState({ from: '', to: '', type: '301' });
    // New robots rule form
    const [newRule, setNewRule] = useState({ type: 'Disallow', path: '' });

    // ─── Load Data ──────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const cfg = await getSiteConfig();
                const parse = (key, def) => {
                    if (!cfg[key]) return def;
                    try { return typeof cfg[key] === 'string' ? JSON.parse(cfg[key]) : cfg[key]; }
                    catch { return def; }
                };
                const m = parse('seo', DEFAULT_META);
                const sc = parse('seo_schema', DEFAULT_SCHEMA);
                const sm = parse('seo_sitemap', DEFAULT_SITEMAP);
                const rb = parse('seo_robots', DEFAULT_ROBOTS);
                const rd = parse('seo_redirects', DEFAULT_REDIRECTS);
                setMeta({ ...DEFAULT_META, ...m });
                setSchema({ ...DEFAULT_SCHEMA, ...sc });
                setSitemap({ ...DEFAULT_SITEMAP, ...sm });
                setRobots({ ...DEFAULT_ROBOTS, ...rb, predefined: { ...DEFAULT_ROBOTS.predefined, ...(rb.predefined || {}) } });
                setRedirects({ ...DEFAULT_REDIRECTS, ...rd });
                setSavedState({
                    meta: JSON.stringify({ ...DEFAULT_META, ...m }),
                    schema: JSON.stringify({ ...DEFAULT_SCHEMA, ...sc }),
                    sitemap: JSON.stringify({ ...DEFAULT_SITEMAP, ...sm }),
                    robots: JSON.stringify({ ...DEFAULT_ROBOTS, ...rb, predefined: { ...DEFAULT_ROBOTS.predefined, ...(rb.predefined || {}) } }),
                    redirects: JSON.stringify({ ...DEFAULT_REDIRECTS, ...rd }),
                });
            } catch {
                setToast({ type: 'error', message: 'Failed to load SEO settings.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ─── Dirty check ────────────────────────────────────────────
    const isDirty = useMemo(() => {
        if (!savedState.meta) return false;
        return (
            JSON.stringify(meta) !== savedState.meta ||
            JSON.stringify(schema) !== savedState.schema ||
            JSON.stringify(sitemap) !== savedState.sitemap ||
            JSON.stringify(robots) !== savedState.robots ||
            JSON.stringify(redirects) !== savedState.redirects
        );
    }, [meta, schema, sitemap, robots, redirects, savedState]);

    // ─── Save ───────────────────────────────────────────────────
    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSiteConfigBatch([
                { key: 'seo', value: JSON.stringify(meta) },
                { key: 'seo_schema', value: JSON.stringify(schema) },
                { key: 'seo_sitemap', value: JSON.stringify(sitemap) },
                { key: 'seo_robots', value: JSON.stringify(robots) },
                { key: 'seo_redirects', value: JSON.stringify(redirects) },
            ]);
            setSavedState({
                meta: JSON.stringify(meta),
                schema: JSON.stringify(schema),
                sitemap: JSON.stringify(sitemap),
                robots: JSON.stringify(robots),
                redirects: JSON.stringify(redirects),
            });
            setToast({ type: 'success', message: 'All SEO settings saved successfully!' });
        } catch {
            setToast({ type: 'error', message: 'Failed to save SEO settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleRevert = () => {
        if (!savedState.meta) return;
        setMeta(JSON.parse(savedState.meta));
        setSchema(JSON.parse(savedState.schema));
        setSitemap(JSON.parse(savedState.sitemap));
        setRobots(JSON.parse(savedState.robots));
        setRedirects(JSON.parse(savedState.redirects));
        setToast({ type: 'warning', message: 'All changes reverted.' });
    };

    // ─── Helpers: Meta ──────────────────────────────────────────
    const charStatus = (val, min, max) => {
        const len = (val || '').length;
        if (len === 0) return 'bad';
        if (len >= min && len <= max) return 'good';
        return 'warning';
    };

    const addPerPage = () => {
        setMeta(p => ({ ...p, perPage: [...(p.perPage || []), { page: '', title: '', desc: '', ogImage: '', canonicalUrl: '', robotsMeta: 'index, follow' }] }));
    };

    const updatePerPage = (idx, field, value) => {
        setMeta(p => {
            const arr = [...p.perPage];
            arr[idx] = { ...arr[idx], [field]: value };
            return { ...p, perPage: arr };
        });
    };

    const removePerPage = (idx) => {
        setMeta(p => ({ ...p, perPage: p.perPage.filter((_, i) => i !== idx) }));
    };

    // ─── Helpers: Schema ────────────────────────────────────────
    const generatedSchema = useMemo(() => {
        const s = schema;
        if (s.customJson) {
            try { JSON.parse(s.customJson); return s.customJson; }
            catch { return '// Invalid JSON'; }
        }
        const base = {
            organization: {
                "@context": "https://schema.org", "@type": "Organization",
                "name": s.orgName || meta.siteName || '', "url": s.orgUrl || '',
                "logo": s.orgLogo || '', "description": s.orgDesc || meta.defaultDesc || '',
                "foundingDate": s.orgFoundingDate || '',
                "contactPoint": { "@type": "ContactPoint", "telephone": s.orgPhone || '', "contactType": "customer service", "email": s.orgEmail || '' },
                "address": { "@type": "PostalAddress", "streetAddress": s.orgAddress || '', "addressLocality": s.orgCity || '', "addressRegion": s.orgRegion || '', "postalCode": s.orgPostalCode || '', "addressCountry": s.orgCountry || '' },
                "sameAs": s.socialUrls ? s.socialUrls.split(',').map(u => u.trim()).filter(Boolean) : []
            },
            localBusiness: {
                "@context": "https://schema.org", "@type": "ProfessionalService",
                "name": s.orgName || meta.siteName || '', "url": s.orgUrl || '', "telephone": s.orgPhone || '',
                "description": s.orgDesc || meta.defaultDesc || '',
                "address": { "@type": "PostalAddress", "streetAddress": s.orgAddress || '', "addressLocality": s.orgCity || '', "addressRegion": s.orgRegion || '', "addressCountry": s.orgCountry || '' },
                "areaServed": { "@type": "City", "name": s.orgCity || 'Chennai' }
            },
            website: { "@context": "https://schema.org", "@type": "WebSite", "name": s.orgName || meta.siteName || '', "url": s.orgUrl || '' },
            service: { "@context": "https://schema.org", "@type": "Service", "provider": { "@type": "Organization", "name": s.orgName || meta.siteName || '' }, "areaServed": { "@type": "City", "name": s.orgCity || 'Chennai' } },
            faqPage: { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [] },
            breadcrumb: { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": s.orgUrl || '' }] },
            article: { "@context": "https://schema.org", "@type": "BlogPosting", "headline": "", "author": { "@type": "Person", "name": meta.author || '' }, "publisher": { "@type": "Organization", "name": s.orgName || meta.siteName || '' } },
            review: { "@context": "https://schema.org", "@type": "Review", "itemReviewed": { "@type": "Organization", "name": s.orgName || meta.siteName || '' } },
        };
        return JSON.stringify(base[s.activeType] || base.organization, null, 2);
    }, [schema, meta.siteName, meta.defaultDesc, meta.author]);

    const copySchema = () => {
        navigator.clipboard.writeText(generatedSchema);
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 2000);
    };

    // ─── Helpers: Robots ────────────────────────────────────────
    const robotsPreview = useMemo(() => {
        const lines = [];
        lines.push(`User-agent: ${robots.userAgent || '*'}`);
        (robots.allowPaths || []).forEach(p => lines.push(`Allow: ${p}`));
        (robots.disallowPaths || []).forEach(p => lines.push(`Disallow: ${p}`));
        if (robots.crawlDelay) lines.push(`Crawl-delay: ${robots.crawlDelay}`);
        lines.push('');
        lines.push(`Sitemap: ${schema.orgUrl || 'https://your-domain.com'}/sitemap.xml`);
        return lines.join('\n');
    }, [robots, schema.orgUrl]);

    const addRobotsRule = () => {
        if (!newRule.path.trim()) return;
        const field = newRule.type === 'Allow' ? 'allowPaths' : 'disallowPaths';
        setRobots(p => ({ ...p, [field]: [...(p[field] || []), newRule.path.trim()] }));
        setNewRule({ type: 'Disallow', path: '' });
    };

    const removeRobotsRule = (type, idx) => {
        const field = type === 'Allow' ? 'allowPaths' : 'disallowPaths';
        setRobots(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
    };

    // ─── Helpers: Redirects ─────────────────────────────────────
    const addRedirect = () => {
        if (!newRedirect.from.trim() || !newRedirect.to.trim()) return;
        setRedirects(p => ({
            ...p,
            rules: [...p.rules, { ...newRedirect, status: 'Active', hits: 0, id: Date.now() }]
        }));
        setNewRedirect({ from: '', to: '', type: '301' });
    };

    const removeRedirect = (id) => {
        setRedirects(p => ({ ...p, rules: p.rules.filter(r => r.id !== id) }));
    };

    // ─── Render ─────────────────────────────────────────────────
    if (loading) return <div className="seo-loading">Loading SEO settings...</div>;

    return (
        <div className="seo-settings">
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Settings &gt; <span>SEO Command Center</span>
                </div>
                <div className="header-actions">
                    <Button variant="ghost" onClick={handleRevert} disabled={!isDirty || saving}>Revert</Button>
                    <Button variant="primary" onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
            </header>

            <div className="seo-tabs">
                {TABS.map(tab => (
                    <button key={tab.id} className={`seo-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        <span className="tab-icon"><tab.icon size={15} /></span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="seo-content-card">
                {activeTab === 'meta' && <MetaTagsTab meta={meta} setMeta={setMeta} charStatus={charStatus} addPerPage={addPerPage} updatePerPage={updatePerPage} removePerPage={removePerPage} />}
                {activeTab === 'schema' && <SchemaTab schema={schema} setSchema={setSchema} generatedSchema={generatedSchema} copySchema={copySchema} copiedSchema={copiedSchema} />}
                {activeTab === 'sitemap' && <SitemapTab sitemap={sitemap} setSitemap={setSitemap} />}
                {activeTab === 'robots' && <RobotsTab robots={robots} setRobots={setRobots} robotsPreview={robotsPreview} newRule={newRule} setNewRule={setNewRule} addRobotsRule={addRobotsRule} removeRobotsRule={removeRobotsRule} />}
                {activeTab === 'redirects' && <RedirectsTab redirects={redirects} newRedirect={newRedirect} setNewRedirect={setNewRedirect} addRedirect={addRedirect} removeRedirect={removeRedirect} />}
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SeoSettings;
