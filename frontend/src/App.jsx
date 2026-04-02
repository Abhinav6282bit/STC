import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Logo from './assets/Logo.png';
import Home from './pages/Home';
import Instructors from './pages/Instructors';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial loading simulation and scroll listener
  useEffect(() => {
    // Stage 1: Loading 4.0s (Allows for staggered entry: Spinner -> Logo -> Text)
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Stage 2: Fade Out 0.8s
      setTimeout(() => setLoading(false), 800);
    }, 4000);
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Close mobile menu on resize if screen becomes desktop
    const handleResize = () => { if (window.innerWidth > 768) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) {
    return (
      <div className={`preloader ${fadeOut ? 'fade-out' : ''}`}>
        <div className="loader-content">
          <h1 className="loader-name-main">SEUNG</h1>
          <div className="loader-text-wrapper">
             <span className="loader-text-subtitle">TAEKWONDO CLUB</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Navigation */}
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <Link to="/" className="logo">
            <img src={Logo} alt="STC Logo" className="logo-img" />
            <span>Seung Taekwondo Club</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links desktop-only">
            <Link to="/">Home</Link>
            <a href="/#programs">Our Programs</a>
            <a href="/#vision">Our Vision</a>
            <a href="/#mission">Our Mission</a>
            <Link to="/faq">FAQ</Link>
            <a href="/#contact">Contact Us</a>
          </div>

          {/* Hamburger Icon */}
          <div 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <img src={Logo} alt="STC Logo" className="logo-img" />
              <span>STC</span>
            </div>
            <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
          </div>
          
          <div className="sidebar-links">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
            <a href="/#programs" onClick={() => setIsMobileMenuOpen(false)}>OUR PROGRAMS</a>
            <a href="/#vision" onClick={() => setIsMobileMenuOpen(false)}>OUR VISION</a>
            <a href="/#mission" onClick={() => setIsMobileMenuOpen(false)}>OUR MISSION</a>
            <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
            <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>CONTACT US</a>
          </div>

          <div className="sidebar-footer">
            <h3>Contact Info</h3>
            <p>Seung Taekwondo Club (STC)</p>
            <p>Phone: +91 7510164000</p>
            <p>Email: admin@seungtaekwondo.com</p>
          </div>
        </div>

        {/* Global Router that swaps the center page out */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </div>

        {/* Redesigned 4-Column Footer */}
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-col">
              <img src={Logo} alt="Logo" className="footer-logo-img" />
              <p>
                Join Seung Taekwondo Club (STC). Transform your mind, body, and spirit through elite traditional training and master the art of discipline.
              </p>
              <div className="footer-social-row">
                <a href="https://wa.me/916282348375" target="_blank" rel="noopener noreferrer" className="footer-icon whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.508 0-9.987 4.479-9.987 9.987 0 1.763.462 3.421 1.267 4.861L2 22l5.316-1.393c1.39.758 2.973 1.189 4.696 1.189 5.508 0 9.987-4.479 9.987-9.987 0-5.508-4.479-9.987-9.987-9.987zm.012 18.251c-1.51 0-2.987-.406-4.277-1.173l-.306-.182-3.181.835.849-3.102-.2-.319c-.841-1.339-1.285-2.893-1.285-4.492 0-4.549 3.702-8.251 8.251-8.251 4.549 0 8.251 3.702 8.251 8.251 0 4.549-3.702 8.251-8.251 8.251zM16.83 14.15c-.264-.132-1.564-.772-1.806-.859-.243-.088-.419-.132-.596.132-.176.264-.683.859-.837 1.036-.154.176-.308.198-.573.066-.264-.132-1.116-.411-2.126-1.312-.787-.701-1.318-1.567-1.472-1.831-.154-.264-.016-.407.116-.539.119-.119.264-.308.396-.462.132-.154.177-.264.264-.44.088-.176.044-.331-.022-.463-.066-.132-.596-1.432-.816-1.961-.214-.516-.431-.446-.596-.454-.153-.008-.331-.009-.508-.009-.176 0-.463.066-.705.331-.242.265-.926.904-.926 2.203 0 1.299.947 2.555 1.079 2.731.132.176 1.864 2.846 4.515 3.991.631.272 1.123.435 1.508.557.633.201 1.21.172 1.666.104.508-.076 1.564-.638 1.785-1.255.221-.617.221-1.146.154-1.255-.066-.109-.242-.176-.507-.308z"/></svg>
                </a>
                <a href="https://www.instagram.com/seung_taekwondo_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="footer-icon instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="tel:+916282348375" className="footer-icon phone">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li>Taekwondo</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Location</h4>
              <p>SEUNG TAEKWONDO CLUB</p>
              <p>Chullimanoor P O, Nedumangad,</p>
              <p>Trivandrum, Kerala - 695541</p>
            </div>

            <div className="footer-col">
              <h4>Working Hours</h4>
              <p>We are closed Monday through Friday. Join us every Saturday and Sunday from 3:30 pm to 6:30 pm.</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>Copyright © {new Date().getFullYear()} SEUNG TAEKWONDO CLUB All Rights Reserved</p>
            <Link to="/privacy" className="privacy-link">Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
