import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Instructors() {
  const [coaches, setCoaches] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // Intersection Observer for Scroll Animations
  useEffect(() => {
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

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, coaches, events]);

  useEffect(() => {
    window.scrollTo(0, 0); 
    fetchCoaches();
    fetchEvents();
  }, []);

  const fetchCoaches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/instructors`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => {
          if (a.role === 'Coach' && b.role !== 'Coach') return -1;
          if (a.role !== 'Coach' && b.role === 'Coach') return 1;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setCoaches(sorted);
        setError(null);
      } else {
        setError(data.error || 'Failed to retrieve instructors.');
      }
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const SkeletonCard = () => (
    <div className="instructor-card glass" style={{ opacity: 0.6 }}>
      <div className="instructor-avatar" style={{ background: 'rgba(255,255,255,0.05)', border: 'none' }}></div>
      <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', width: '60%', margin: '0 auto 10px', borderRadius: '4px' }}></div>
      <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', width: '40%', margin: '0 auto 20px', borderRadius: '4px' }}></div>
      <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', width: '80%', margin: '0 auto 5px', borderRadius: '4px' }}></div>
      <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', width: '70%', margin: '0 auto', borderRadius: '4px' }}></div>
    </div>
  );

  return (
    <div style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <section id="instructors" className="section" style={{ paddingTop: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary))' }}></div>
            <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}>OUR TEAM</p>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
          </div>
          <h1 className="section-title animate-on-scroll" style={{ fontSize: '4rem', marginBottom: '1rem' }}>The Faces Behind <span className="highlight">Excellence</span></h1>
          <p className="animate-on-scroll" style={{ color: 'var(--text-muted)', fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8' }}>Instructors dedicated to shaping the next generation of martial artists.</p>
        </div>
        
        <div className="instructors-grid">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(198, 19, 19, 0.05)', borderRadius: '20px', border: '1px solid rgba(198, 19, 19, 0.2)' }}>
              <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>🥋 {error}</p>
              <button onClick={fetchCoaches} className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)', border: 'none' }}>Try Again</button>
            </div>
          ) : (
            coaches.map((coach, index) => (
              <div key={coach._id} className="instructor-card glass animate-on-scroll" 
                onClick={index === 0 ? () => {
                  tapCount.current += 1;
                  clearTimeout(tapTimer.current);
                  tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
                  if (tapCount.current >= 5) {
                    tapCount.current = 0;
                    navigate('/login');
                  }
                } : undefined}
              >
                <div className="instructor-avatar">
                  {coach.imageUrl ? (
                    <img 
                      src={`${API_URL}${coach.imageUrl}`} 
                      alt={coach.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : <div style={{ fontSize: '3rem', marginTop: '10px' }}>🥋</div>}
                </div>
                <h3>{coach.name}</h3>
                <p className="role">{coach.role}</p>
                <p className="belt">{coach.belt}</p>
                <p className="bio">{coach.bio}</p>
              </div>
            ))
          )}
        </div>

        {/* Events & Updates Section */}
        <div style={{ marginTop: '6rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6rem 5% 4rem', borderRadius: '40px 40px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary))' }}></div>
              <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}>EVENTS & UPDATES</p>
              <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
            </div>
            <h2 className="section-title animate-on-scroll" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Stay <span className="highlight-gradient">Updated</span></h2>
          </div>

          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {events.length > 0 ? (
              events.map((event, i) => (
                <div key={i} className="review-card-premium glass animate-on-scroll" style={{ padding: '0', overflow: 'hidden', minHeight: 'auto', borderRadius: '24px' }}>
                  <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                    {event.imageUrl ? (
                      <img 
                        src={`${API_URL}${event.imageUrl}`} 
                        alt={event.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '3rem' }}>📷</div>}
                  </div>
                  <div style={{ padding: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: '800', marginBottom: '1.2rem' }}>{event.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: '5.1rem' }}>
                      {event.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div 
                        onClick={() => setSelectedEvent(event)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s' }}
                        className="read-more-btn"
                      >
                        VIEW DETAILS <span style={{ fontSize: '1.3rem' }}>→</span>
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '700', opacity: 0.8, letterSpacing: '0.5px' }}>
                        Updated: {new Date(event.eventDate || event.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '4rem' }}>No events or updates at this time. Check back later!</p>
            )}
          </div>
        </div>

        {/* Read More Modal */}
        {selectedEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'grid', placeItems: 'center', padding: '2rem' }} onClick={() => setSelectedEvent(null)}>
            <div 
              className="glass animate-on-scroll visible" 
              style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, fontSize: '1.2rem' }}
              >✕</button>
              
              <div style={{ width: '100%', height: '400px' }}>
                {selectedEvent.imageUrl ? (
                  <img src={`${API_URL}${selectedEvent.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '5rem' }}>📷</div>}
              </div>
              
              <div style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>{selectedEvent.title}</h2>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      📅 Event Date: {new Date(selectedEvent.eventDate || selectedEvent.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--primary), transparent)', marginBottom: '2rem' }}></div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {selectedEvent.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Instructors;
