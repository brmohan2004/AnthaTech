import React, { useEffect, useState } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';
import Header from '../Shared/Header/Header';
import Footer from '../Shared/footer/Footer';
import SEO from '../Shared/SEO';
import { fetchLegalPage } from '../api/content';
import './LegalPage.css';

const PAGES = [
  { slug: 'privacy-policy',   title: 'Privacy Policy',      icon: '🔒' },
  { slug: 'terms-conditions', title: 'Terms & Conditions',  icon: '📋' },
  { slug: 'cookies-policy',   title: 'Cookies Policy',      icon: '🍪' },
];

const LegalPage = () => {
  const location = useLocation();
  // Derive slug from current pathname: "/privacy-policy" → "privacy-policy"
  const slug = location.pathname.replace(/^\//, '').split('?')[0] || 'privacy-policy';
  const displaySlug = slug === 'conditions' ? 'terms-conditions' : slug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch the real data from Supabase using the derived slug
    fetchLegalPage(displaySlug)
      .then(data => {
        if (data) {
          setPage(data);
        } else {
          setError('Page content not found.');
        }
      })
      .catch(err => {
        console.error('Error fetching legal page:', err);
        setError('Failed to load page content.');
      })
      .finally(() => setLoading(false));

    window.scrollTo(0, 0);
  }, [displaySlug]);

  const activePageInfo = PAGES.find(p => p.slug === displaySlug) || PAGES[0];

  return (
    <div className="legal-page-container">
      <Header />
      {page && (
        <SEO 
          title={`${page.title} | ANTHA Tech`}
          description={page.meta_description}
        />
      )}

      <div className="legal-layout">
        {/* Sidebar Navigation (20%) */}
        <aside className="legal-sidebar">
          <span className="sidebar-title">Legal Documents</span>
          <nav className="sidebar-nav-list">
            {PAGES.map(p => (
              <NavLink 
                key={p.slug} 
                to={`/${p.slug}`} 
                className={({ isActive }) => `sidebar-link ${isActive || (p.slug === 'terms-conditions' && slug === 'conditions') ? 'active' : ''}`}
              >
                <span>{p.icon}</span>
                {p.title}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area (80%) */}
        <main className="legal-main-content">
          {/* Inline Hero Section - Now part of the 80% column */}
          <section className="legal-hero-inline">
            <div className="hero-content">
              {loading ? (
                <div className="skeleton skeleton-title"></div>
              ) : (
                <>
                  <div className="hero-badge">{activePageInfo.icon} Legal</div>
                  <h1>{page?.title || activePageInfo.title}</h1>
                  <div className="last-updated">
                    Last Updated: {page?.last_updated ? new Date(page.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'March 18, 2026'}
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="content-separator"></div>

          {loading ? (
            <div className="skeleton-loader">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-section" style={{ marginBottom: '40px' }}>
                  <div className="skeleton skeleton-heading" style={{ marginBottom: '20px' }}></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="legal-error">
              <p>{error}</p>
              <Link to="/" className="back-home">Return Home</Link>
            </div>
          ) : (
            <div className="legal-content">
              {page?.content && Array.isArray(page.content) ? (
                page.content.map((section, idx) => (
                  <section key={idx} className="legal-section">
                    <h2>{section.heading}</h2>
                    <p>{section.body}</p>
                  </section>
                ))
              ) : (
                <p>No content sections available.</p>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default LegalPage;
