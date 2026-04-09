import React, { useEffect } from 'react';

function FAQ() {
  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll to top upon navigating here
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
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

  return (
    <div style={{ paddingTop: '160px', minHeight: '80vh' }}>
      <section id="faq" className="section">
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="badge">Knowledge Base</span>
            <h1 className="section-title animate-on-scroll">Frequently Asked Questions about Taekwondo in Nedumangad</h1>
          </div>
          <div className="faq-list animate-on-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div className="faq-item" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>Where is the best place to learn Taekwondo in Nedumangad?</h4>
              <p style={{ color: 'var(--text-muted)' }}>Seung Taekwondo Club is the premier choice for martial arts in Nedumangad, offering professional coaching with certified instructors who have over 20 years of experience and national-level achievements.</p>
            </div>

            <div className="faq-item" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>Are there Taekwondo classes near Chullimanoor for kids?</h4>
              <p style={{ color: 'var(--text-muted)' }}>Yes! We have specialized kids' programs at our Chullimanoor location designed for children aged 5 and above. Our training builds confidence, discipline, and physical fitness in a safe and fun environment.</p>
            </div>

            <div className="faq-item" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>Do I need prior martial arts experience?</h4>
              <p style={{ color: 'var(--text-muted)' }}>Not at all! Our beginner classes are designed specifically for students starting from scratch. We tailor our training to fit your current fitness and skill levels.</p>
            </div>

            <div className="faq-item" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>What is the best age for children to start?</h4>
              <p style={{ color: 'var(--text-muted)' }}>We accept students as young as 5 years old. Our Kids Taekwondo program focuses heavily on focus, discipline, and motor skill development in a highly engaging way.</p>
            </div>

            <div className="faq-item" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>What should I wear to my first class?</h4>
              <p style={{ color: 'var(--text-muted)' }}>For your trial, comfortable athletic wear (like a t-shirt and sweatpants) is perfect. Once you take admission, we will provide you with an official STC uniform.</p>
            </div>

            <div className="faq-item glass" style={{ padding: '2rem', borderRadius: '15px' }}>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>How often should I train?</h4>
              <p style={{ color: 'var(--text-muted)' }}>We recommend attending classes 2 to 3 times per week to see consistent progress and muscle memory retention, but we offer flexible scheduling options to fit your lifestyle.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
