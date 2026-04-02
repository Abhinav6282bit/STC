import React, { useEffect } from 'react';

function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ paddingTop: '180px', minHeight: '80vh', color: 'var(--text-main)', padding: '0 5%' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="section-title">Privacy Policy</h1>
        <div style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            At Seung Taekwondo Club (STC), we respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>1. Data Collection</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            We may collect your name, email address, and phone number when you submit an inquiry through our contact form. 
            This information is used solely to respond to your request.
          </p>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>2. Cookies</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Our website does not use tracking cookies for marketing purposes. We use only essential cookies required 
            for the proper functioning of our administrative dashboard.
          </p>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>3. Third-Parties</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            We do not sell or share your data with third-party organizations. Your information is stored securely on 
            our private database.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
