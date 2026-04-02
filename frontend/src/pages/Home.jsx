import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [cmsContent, setCmsContent] = useState({
    vision_text: 'To be the premier martial arts institution globally...',
    mission_text: 'Our mission is to empower students through disciplined instruction...',
    about_text: 'Taekwondo is a traditional Korean martial art...'
  });
  const [cmsError, setCmsError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', stars: 5, text: '' });
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Intersection Observer for Scroll Animations
  useEffect(() => {
    fetchCms();
    fetchReviews();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const fetchCms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/content`);
      if (!res.ok) throw new Error('Failed to fetch content');
      const data = await res.json();
      if (Array.isArray(data)) {
        const contentMap = {};
        data.forEach(item => contentMap[item.sectionKey] = item.content);
        setCmsContent(prev => ({ ...prev, ...contentMap }));
      }
    } catch (err) {
      console.error('Error fetching CMS content:', err);
      setCmsError(true);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewStatus(null);
    try {
      const formData = new FormData();
      formData.append('name', reviewForm.name);
      formData.append('stars', reviewForm.stars);
      formData.append('text', reviewForm.text);
      if (reviewImage) {
        formData.append('image', reviewImage);
      }

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        // Omit Content-Type to let the browser automatically set the multipart boundary
        body: formData
      });
      if (res.ok) {
        setReviewStatus('success');
        setReviewForm({ name: '', stars: 5, text: '' });
        setReviewImage(null);
        fetchReviews(); // Refresh the list
        setTimeout(() => setReviewStatus(null), 3000);
      } else {
        setReviewStatus('error');
      }
    } catch (error) {
      setReviewStatus('error');
    }
    setIsSubmittingReview(false);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {cmsError && (
        <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          ⚠️ Backend Connection Error: Using default site content.
        </div>
      )}
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-slider">
          <div className="slide" style={{backgroundImage: 'url(/hero/slide1.png)'}}></div>
          <div className="slide" style={{backgroundImage: 'url(/hero/slide2.png)'}}></div>
          <div className="slide" style={{backgroundImage: 'url(/hero/slide3.png)'}}></div>
        </div>
        <div className="hero-content">
          <h1 className="animate-on-scroll">Master the Art of <span className="highlight">Discipline</span> <br/>& <span className="highlight">Power</span></h1>
          <p className="animate-on-scroll">Join Seung Taekwondo Club (STC). Transform your mind, body, and spirit through elite traditional training.</p>
          <div className="hero-buttons animate-on-scroll">
            <Link to="/instructors" className="btn btn-primary">Explore Classes</Link>
            <a href="#contact" className="btn btn-outline">Take Admission</a>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="section section-alt">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary))' }}></div>
            <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}>DISCIPLINES</p>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
          </div>
          <h2 className="section-title animate-on-scroll" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Our <span className="highlight-gradient">Programs</span></h2>
        </div>

        <div className="programs-grid-minimal">
          {[
            { icon: '🥋', title: 'Kids Taekwondo', desc: 'Building focus, respect, and confidence for children ages 5-12 through dynamic and fun sessions.' },
            { icon: '🥊', title: 'Adult Classes', desc: 'Self-defense, fitness, and traditional forms tailored to adult learners of all experience levels.' },
            { icon: '🏆', title: 'Competitive Sparring', desc: 'Advanced training for students looking to compete at state and national levels (WTF ruleset).' }
          ].map((prog, i) => (
            <div key={i} className="program-item animate-on-scroll">
              <div className="program-icon-wrap">{prog.icon}</div>
              <h3>{prog.title}</h3>
              <p>{prog.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary))' }}></div>
            <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}>LEGACY</p>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
          </div>
          <h2 className="section-title animate-on-scroll" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>The <span className="highlight-gradient">STC</span> Way</h2>
        </div>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p className="animate-on-scroll" style={{ fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: '1.9' }}>
            {cmsContent.about_text}
          </p>
        </div>
      </section>

      {/* Vision & Mission Split Section */}
      <section id="vision" className="section">
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '5rem', justifyContent: 'center' }}>
          
          <div className="vision-box-minimal animate-on-scroll" style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '3.5rem', margin: '0 0 1.5rem 0', fontWeight: '900' }}>Our <span className="highlight-gradient">Vision</span></h2>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Creating Future Champions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8' }}>
              {cmsContent.vision_text}
            </p>
          </div>

          <div id="mission" className="mission-box-minimal animate-on-scroll" style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '3.5rem', margin: '0 0 1.5rem 0', fontWeight: '900' }}>Our <span className="highlight-gradient">Mission</span></h2>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Empowering Lives</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8' }}>
              {cmsContent.mission_text}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section section-alt">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary))' }}></div>
            <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}>REVIEWS</p>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
          </div>
          <h2 className="section-title animate-on-scroll" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Student <span className="highlight-gradient">Success</span></h2>
        </div>

        <div className="testimonials-grid">
          {reviews.length > 0 ? (
            reviews.map((rev, i) => (
              <div key={i} className="review-card-premium glass">
                <div className="review-rating">
                  {'★'.repeat(rev.stars)}{'☆'.repeat(5 - rev.stars)}
                </div>
                <p className="review-text">"{rev.text}"</p>
                <div className="review-user-info">
                  <div className="review-avatar-wrap">
                    <img src={rev.imageUrl ? `${API_URL}${rev.imageUrl}` : "/student_review_1.png"} alt="Student Avatar" />
                  </div>
                  <div>
                    <h4 className="review-user-name">{rev.name}</h4>
                    <p className="review-user-sub">Verified Student</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>No reviews yet. Be the first to share your experience!</p>
          )}
        </div>

        {/* Leave a Review Form */}
        <div style={{ maxWidth: '900px', margin: '4rem auto 0 auto', padding: '3rem', borderRadius: '24px' }} className="glass gold-border">
          <h3 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2.5rem' }}>Leave a <span className="highlight-gradient">Review</span></h3>
          
          {reviewStatus === 'success' && (
            <div className="submit-message" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              Thank you for your feedback!
            </div>
          )}
          {reviewStatus === 'error' && (
            <div className="submit-message" style={{ marginBottom: '1.5rem', background: 'rgba(198, 19, 19, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)', textAlign: 'center' }}>
              Failed to submit review.
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="review-form-horizontal">
            {/* Left Column: Name, Photo, Rating */}
            <div className="form-col-left">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Name"
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div className="photo-upload-wrap">
                <div className="photo-upload-btn">
                  {reviewImage ? (
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>✓ {reviewImage.name}</span>
                  ) : (
                    <span>+ Upload Photo (Optional)</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="photo-upload-input"
                  onChange={(e) => setReviewImage(e.target.files[0])}
                />
              </div>

              <div className="form-group" style={{ textAlign: 'center', marginTop: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Rating</label>
                <div style={{ fontSize: '2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <span 
                      key={num} 
                      style={{ color: num <= reviewForm.stars ? '#ffcc00' : '#444' }}
                      onClick={() => setReviewForm({ ...reviewForm, stars: num })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Text and Submit */}
            <div className="form-col-right">
              <div className="form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <textarea
                  className="form-control"
                  placeholder="Share your experience..."
                  required
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', height: '100%', minHeight: '200px', resize: 'none' }}
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }} disabled={isSubmittingReview}>
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary))' }}></div>
            <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}>JOIN US</p>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
          </div>
          <h2 className="section-title animate-on-scroll" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Begin Your <span className="highlight-gradient">Journey</span></h2>
        </div>
        <div className="contact-container glass gold-border animate-on-scroll">
          {submitStatus === 'success' && (
            <div className="submit-message" style={{ marginBottom: '2rem' }}>
              Message sent successfully! We will contact you shortly.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="submit-message" style={{ marginBottom: '2rem', background: 'rgba(198, 19, 19, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Oops! Something went wrong. Please check your data.
            </div>
          )}
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Phone"
                required
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                className="form-control"
                placeholder="How can we help?"
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '55px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Home;
