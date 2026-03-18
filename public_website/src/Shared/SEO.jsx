import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ config }) => {
    const location = useLocation();
    const { seo } = config || {};

    if (!seo) {
        console.warn('SEO config missing, using defaults.');
        return (
            <Helmet>
                <title>ANTHA Tech — Digital Agency</title>
                <meta name="description" content="Transforming ideas into digital reality." />
            </Helmet>
        );
    }

    console.log('Applying SEO Config:', seo);

    // Find per-page meta if it exists
    const currentPath = location.pathname;
    const pageMeta = seo.perPage?.find(p => {
        const pageName = (p.page || '').toLowerCase().trim();
        const routePath = currentPath.toLowerCase().trim();
        
        // Exact match
        if (pageName === routePath) return true;
        
        // Special case for root
        if (pageName === 'home' && routePath === '/') return true;
        
        // Prefix match, e.g. "/services/web-dev" matches "/services"
        if (pageName !== '' && pageName !== '/' && routePath.startsWith(pageName)) return true;
        
        return false;
    });

    const title = pageMeta?.title || seo.defaultTitle || seo.siteName;
    const description = pageMeta?.desc || seo.defaultDesc;
    const ogImage = pageMeta?.ogImage || seo.ogImage;
    const siteName = seo.siteName;

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            
            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            {ogImage && <meta property="og:image" content={ogImage} />}
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
        </Helmet>
    );
};

export default SEO;
