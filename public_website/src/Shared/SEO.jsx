import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ config }) => {
    const location = useLocation();
    const { seo, seo_schema, seo_redirects } = config || {};

    const currentPath = location.pathname;

    // --- Route-specific defaults from Audit Report ---
    const routeDefaults = {
        '/': {
            title: "Antha Tech | Top Digital Agency | Web & Mobile Solutions",
            desc: "Antha Tech is the premier digital agency in Chennai. We build intuitive web & mobile apps, UI/UX designs, and AI solutions that fuel brand success. Get a free consultation today!",
            name: "Home"
        },
        '/about': {
            title: "About Us | Antha Tech",
            desc: "Discover Antha Tech - a digital design studio founded by tech enthusiasts in Chennai. We blend technical precision with creative vision to deliver exceptional digital experiences.",
            name: "About"
        },
        '/services': {
            title: "Our Services | Antha Tech",
            desc: "Expert web development, mobile engineering, UI/UX design, and AI integration services. Antha Tech delivers scalable digital solutions for modern businesses worldwide.",
            name: "Services"
        },
        '/projects': {
            title: "Our Projects | Portfolio | Antha Tech",
            desc: "Explore our portfolio of successful digital products. We build modern, high-performance web and mobile applications with exceptional user experience.",
            name: "Projects"
        },
        '/community': {
            title: "Community | Antha Tech",
            desc: "Join the Antha Tech community in Chennai. Connect with creative professionals, share knowledge, and grow together in the ever-evolving digital world.",
            name: "Community"
        },
        '/insights': {
            title: "Insights & Blog | Antha Tech",
            desc: "Stay updated with the latest trends in digital design and development. Expert insights from the Antha Tech team on web, mobile, and AI technologies.",
            name: "Insights"
        }
    };

    const currentRouteDefault = routeDefaults[currentPath] || routeDefaults['/'];

    // --- Redirect Logic ---
    if (seo_redirects && Array.isArray(seo_redirects.rules)) {
        const rule = seo_redirects.rules.find(r => r.from === currentPath && r.status === 'Active');
        if (rule && rule.to) {
            window.location.replace(rule.to);
            return null; // Stop rendering if redirecting
        }
    }

    if (!seo) {
        console.warn('SEO config missing, using hardcoded defaults.');
        return (
            <Helmet>
                <title>{currentRouteDefault.title}</title>
                <meta name="description" content={currentRouteDefault.desc} />
                <meta property="og:title" content={currentRouteDefault.title} />
                <meta property="og:description" content={currentRouteDefault.desc} />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={`https://anthatech.me${currentPath}`} />
            </Helmet>
        );
    }

    // --- Page Match Logic ---
    const pageMeta = seo.perPage?.find(p => {
        const pageName = (p.page || '').toLowerCase().trim();
        const routePath = currentPath.toLowerCase().trim();

        if (pageName === routePath) return true;
        if (pageName === 'home' && routePath === '/') return true;
        if (pageName !== '' && pageName !== '/' && routePath.startsWith(pageName)) return true;

        return false;
    });

    const title = pageMeta?.title || currentRouteDefault.title || seo.defaultTitle || seo.siteName;
    const description = pageMeta?.desc || currentRouteDefault.desc || seo.defaultDesc;
    const ogImage = pageMeta?.ogImage || seo.ogImage;
    const siteName = seo.siteName || "Antha Tech";
    const robotsMeta = pageMeta?.robotsMeta || seo.robotsMeta || 'index, follow';
    const canonicalUrl = pageMeta?.canonicalUrl || (seo.canonicalBase ? `${seo.canonicalBase.replace(/\/$/, '')}${currentPath}` : `https://anthatech.me${currentPath}`);

    // --- Schema Generation ---
    const generatedSchema = useMemo(() => {
        if (!seo_schema) return null;
        const s = seo_schema;
        if (s.customJson) {
            try { JSON.parse(s.customJson); return s.customJson; } catch { return null; }
        }

        const orgUrl = s.orgUrl || "https://anthatech.me";

        const baseSchema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": `${orgUrl}/#organization`,
                    "name": s.orgName || siteName || "Antha Tech",
                    "url": orgUrl,
                    "logo": s.orgLogo || "https://anthatech.me/logo.png",
                    "description": s.orgDesc || description || '',
                    "foundingDate": s.orgFoundingDate || '2024',
                    "contactPoint": { "@type": "ContactPoint", "telephone": s.orgPhone || '', "contactType": "customer service", "email": s.orgEmail || 'info.anthatech@gmail.com' },
                    "address": { "@type": "PostalAddress", "streetAddress": s.orgAddress || '', "addressLocality": s.orgCity || 'Chennai', "addressRegion": s.orgRegion || 'Tamil Nadu', "postalCode": s.orgPostalCode || '600001', "addressCountry": "IN" },
                    "sameAs": s.socialUrls ? s.socialUrls.split(',').map(u => u.trim()).filter(Boolean) : [
                        "https://linkedin.com/company/antha-tech",
                        "https://twitter.com/anthatech",
                        "https://instagram.com/anthatech"
                    ]
                },
                {
                    "@type": "WebSite",
                    "@id": `${orgUrl}/#website`,
                    "url": orgUrl,
                    "name": s.orgName || siteName || "Antha Tech",
                    "publisher": { "@id": `${orgUrl}/#organization` },
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": `${orgUrl}/search?q={search_term_string}`,
                        "query-input": "required name=search_term_string"
                    }
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": `${orgUrl}${currentPath}/#breadcrumb`,
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": orgUrl },
                        currentPath !== '/' && { "@type": "ListItem", "position": 2, "name": currentRouteDefault.name || currentPath.substring(1), "item": `${orgUrl}${currentPath}` }
                    ].filter(Boolean)
                }
            ]
        };

        // Add SiteNavigationElement for Homepage to help with sitelinks
        if (currentPath === '/') {
            baseSchema["@graph"].push({
                "@type": "SiteNavigationElement",
                "@id": `${orgUrl}/#navigation`,
                "name": ["About", "Services", "Projects", "Community", "Insights"],
                "url": [
                    `${orgUrl}/about`,
                    `${orgUrl}/services`,
                    `${orgUrl}/projects`,
                    `${orgUrl}/community`,
                    `${orgUrl}/insights`
                ]
            });
        }

        // Add specific type if active
        if (s.activeType === 'localBusiness') {
            baseSchema["@graph"].push({
                "@type": "ProfessionalService",
                "name": s.orgName || siteName || "Antha Tech",
                "url": orgUrl,
                "telephone": s.orgPhone || '',
                "address": { "@type": "PostalAddress", "streetAddress": s.orgAddress || '', "addressLocality": s.orgCity || 'Chennai', "addressRegion": s.orgRegion || 'Tamil Nadu', "addressCountry": "IN" }
            });
        }

        return JSON.stringify(baseSchema);
    }, [seo_schema, siteName, description, currentPath, currentRouteDefault.name, title]);

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={robotsMeta} />
            <meta name="author" content={seo.author || "Antha Tech Team"} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Structured Schema JSON-LD */}
            {generatedSchema && (
                <script type="application/ld+json">
                    {generatedSchema}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
