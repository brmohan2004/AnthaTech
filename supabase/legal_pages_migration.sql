-- ============================================================
-- Legal Pages Table — run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,      -- 'privacy-policy' | 'terms-conditions' | 'cookies-policy'
  title TEXT NOT NULL,
  last_updated DATE DEFAULT CURRENT_DATE,
  content JSONB DEFAULT '[]'::jsonb, -- Array of {heading: string, body: string}
  meta_description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Public can read, only authenticated admins can write
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legal pages are viewable by everyone"
  ON legal_pages FOR SELECT USING (true);

CREATE POLICY "Legal pages are editable by admins only"
  ON legal_pages FOR ALL USING (auth.role() = 'authenticated');

-- Seed default rows
INSERT INTO legal_pages (slug, title, last_updated, content, meta_description)
VALUES
  (
    'privacy-policy',
    'Privacy Policy',
    CURRENT_DATE,
    '[
      {"heading": "Introduction", "body": "This Privacy Policy describes how Antha Tech collects, uses, and shares your personal information when you visit or interact with our website."},
      {"heading": "Information We Collect", "body": "We collect information you provide directly to us, such as when you contact us via our contact form, including your name and email address."},
      {"heading": "How We Use Your Information", "body": "We use the information we collect to respond to your inquiries, improve our services, and communicate with you."},
      {"heading": "Cookies", "body": "We use cookies and similar tracking technologies to track activity on our website. You can instruct your browser to refuse all cookies."},
      {"heading": "Contact Us", "body": "If you have any questions about this Privacy Policy, please contact us at info@anthatech.com."}
    ]'::jsonb,
    'Read the Antha Tech Privacy Policy to understand how we collect, use, and protect your personal data.'
  ),
  (
    'terms-conditions',
    'Terms & Conditions',
    CURRENT_DATE,
    '[
      {"heading": "Acceptance of Terms", "body": "By accessing and using Antha Tech website, you agree to be bound by these Terms and Conditions."},
      {"heading": "Use of Website", "body": "You may use this website for lawful purposes only. You agree not to use our website for any unlawful or prohibited activities."},
      {"heading": "Intellectual Property", "body": "All content on this website, including text, graphics, logos, and images, is the property of Antha Tech and is protected by applicable intellectual property laws."},
      {"heading": "Limitation of Liability", "body": "Antha Tech shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of this website."},
      {"heading": "Changes to Terms", "body": "We reserve the right to modify these Terms at any time. Continued use of the website after changes constitutes acceptance."}
    ]'::jsonb,
    'Read the Antha Tech Terms and Conditions for the rules governing your use of our website and services.'
  ),
  (
    'cookies-policy',
    'Cookies Policy',
    CURRENT_DATE,
    '[
      {"heading": "What Are Cookies", "body": "Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences and understand how you use the site."},
      {"heading": "Types of Cookies We Use", "body": "We use essential cookies (required for the website to function), analytical cookies (to understand how visitors interact with our website), and preference cookies (to remember your settings)."},
      {"heading": "Managing Cookies", "body": "You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience."},
      {"heading": "Third-Party Cookies", "body": "Some cookies are set by third-party services that appear on our pages. We do not control these cookies."},
      {"heading": "Updates to This Policy", "body": "We may update this Cookies Policy from time to time. Any changes will be posted on this page with an updated date."}
    ]'::jsonb,
    'Learn how Antha Tech uses cookies on our website and how you can manage your cookie preferences.'
  )
ON CONFLICT (slug) DO NOTHING;
