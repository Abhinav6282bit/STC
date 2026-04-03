import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inquiries');
  const [contacts, setContacts] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [events, setEvents] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  // Form & UI States
  const [newInst, setNewInst] = useState({ name: '', role: 'Coach', belt: '', bio: '', phone: '', image: null });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', image: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track ID of instructor being edited
  const [editingEventId, setEditingEventId] = useState(null); // Track ID of event being edited

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, iRes, sRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/contacts`),
        fetch(`${API_URL}/api/instructors`),
        fetch(`${API_URL}/api/content`),
        fetch(`${API_URL}/api/events`)
      ]);
      const cData = await cRes.json();
      const iData = await iRes.json();
      const sData = await sRes.json();
      const eData = await eRes.json();
      
      setContacts(cData);
      setEvents(eData);
      
      // Sort: "Coach" first, then by Adding Order (createdAt)
      const sortedInstructors = iData.sort((a, b) => {
        if (a.role === 'Coach' && b.role !== 'Coach') return -1;
        if (a.role !== 'Coach' && b.role === 'Coach') return 1;
        // Secondary sort: Adding order (Oldest first)
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setInstructors(sortedInstructors);
      
      const contentMap = {};
      sData.forEach(item => contentMap[item.sectionKey] = item.content);
      setSiteContent(contentMap);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Instructor Management
  const handleEditClick = (inst) => {
    setEditingId(inst._id);
    setNewInst({
      name: inst.name,
      role: inst.role || 'Coach',
      belt: inst.belt,
      bio: inst.bio,
      phone: inst.phone || '',
      image: null // We don't pre-fill the file input
    });
    // Scroll to form for better UX
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewInst({ name: '', role: 'Coach', belt: '', bio: '', phone: '', image: null });
  };

  const handleSubmitInstructor = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newInst.name);
    formData.append('role', newInst.role);
    formData.append('belt', newInst.belt);
    formData.append('bio', newInst.bio);
    formData.append('phone', newInst.phone);
    if (newInst.image) formData.append('image', newInst.image);

    try {
      const url = editingId 
        ? `${API_URL}/api/instructors/${editingId}`
        : `${API_URL}/api/instructors`;
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: formData
      });

      if (res.ok) {
        setMsg({ 
          text: editingId ? 'Instructor updated successfully!' : 'Instructor added successfully!', 
          type: 'success' 
        });
        handleCancelEdit();
        fetchData();
      }
    } catch (err) {
      setMsg({ text: editingId ? 'Failed to update instructor' : 'Failed to add instructor', type: 'error' });
    }
  };

  const handleDeleteInstructor = async (id) => {
    setMsg({ text: 'Processing removal...', type: 'info' });
    try {
      const res = await fetch(`${API_URL}/api/instructors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ text: 'Staff member removed successfully.', type: 'success' });
        setInstructors(prev => prev.filter(inst => inst._id !== id));
        setConfirmDelete(null); // Reset confirmation
      } else {
        setMsg({ text: 'Permission denied or record not found.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Network error during removal.', type: 'error' });
    }
  };

  // Event Management
  const handleEditEventClick = (event) => {
    setEditingEventId(event._id);
    setNewEvent({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
      image: null
    });
    // Scroll to form
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEventEdit = () => {
    setEditingEventId(null);
    setNewEvent({ title: '', description: '', eventDate: '', image: null });
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newEvent.title);
    formData.append('description', newEvent.description);
    formData.append('eventDate', newEvent.eventDate);
    if (newEvent.image) formData.append('image', newEvent.image);

    const url = editingEventId 
      ? `${API_URL}/api/events/${editingEventId}`
      : `${API_URL}/api/events`;
    
    const method = editingEventId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        body: formData
      });
      if (res.ok) {
        setMsg({ text: editingEventId ? 'Event updated!' : 'Event posted successfully!', type: 'success' });
        setNewEvent({ title: '', description: '', eventDate: '', image: null });
        setEditingEventId(null);
        fetchData();
      }
    } catch (err) {
      setMsg({ text: editingEventId ? 'Failed to update event' : 'Failed to post event', type: 'error' });
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ text: 'Event removed.', type: 'success' });
        setEvents(prev => prev.filter(e => e._id !== id));
        setConfirmDeleteEvent(null);
      }
    } catch (err) {
      setMsg({ text: 'Error removing event', type: 'error' });
    }
  };

  // Content Management
  const handleUpdateContent = async (key, val) => {
    try {
      const res = await fetch(`${API_URL}/api/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: val })
      });
      if (res.ok) setMsg({ text: 'Content updated!', type: 'success' });
    } catch (err) {
      setMsg({ text: 'Update failed', type: 'error' });
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', padding: '100px 5% 50px', background: 'radial-gradient(circle at top right, rgba(198, 19, 19, 0.05), transparent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Elite <span style={{color: 'var(--accent-gold)'}}>Management</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, Administrator. System is operational.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.7rem 2rem', borderRadius: '12px' }}>Secure Logout</button>
      </div>

      {msg.text && (
        <div className="animate-on-scroll visible" style={{ 
          padding: '1.2rem', 
          borderRadius: '12px', 
          marginBottom: '2.5rem', 
          backgroundColor: msg.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(198, 19, 19, 0.1)',
          color: msg.type === 'success' ? '#2ecc71' : 'var(--primary)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(198, 19, 19, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {msg.type === 'success' ? '✓' : '⚠️'} {msg.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
        {[
          { id: 'inquiries', label: 'Inquiries', icon: '📩' },
          { id: 'coaches', label: 'Coaches', icon: '🥋' },
          { id: 'events', label: 'Events & Updates', icon: '📅' },
          { id: 'site', label: 'Website Content', icon: '🌐' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              borderRadius: '12px', 
              padding: '0.8rem 1.5rem', 
              fontSize: '0.95rem',
              border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === tab.id ? '' : 'transparent'
            }}
          >
            <span style={{ marginRight: '8px' }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="glass gold-border" style={{ padding: '3rem', borderRadius: '24px', minHeight: '600px', position: 'relative', overflow: 'hidden' }}>
        
        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="animate-on-scroll visible">
            <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Member Inquiries</h3>
            <div style={{ overflowX: 'auto', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1.2rem', color: 'var(--accent-gold)', fontWeight: '700' }}>Date</th>
                    <th style={{ padding: '1.2rem', color: 'var(--accent-gold)', fontWeight: '700' }}>Sender</th>
                    <th style={{ padding: '1.2rem', color: 'var(--accent-gold)', fontWeight: '700' }}>Contact Info</th>
                    <th style={{ padding: '1.2rem', color: 'var(--accent-gold)', fontWeight: '700' }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.2rem', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1.2rem', fontWeight: '700' }}>{c.name}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>{c.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{c.phone}</div>
                      </td>
                      <td style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px' }}>{c.message}</td>
                    </tr>
                  ))}
                  {contacts.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No inquiries found yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COACHES TAB */}
        {activeTab === 'coaches' && (
          <div className="animate-on-scroll visible" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '4rem' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>{editingId ? 'Edit Coach Details' : 'Add New Elite Coach'}</h3>
              <form onSubmit={handleSubmitInstructor} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                  <input type="text" className="form-control" placeholder="Name" value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Professional Role</label>
                  <select className="form-control" value={newInst.role} onChange={e => setNewInst({...newInst, role: e.target.value})} required>
                    <option value="Coach">Coach</option>
                    <option value="Instructor">Instructor</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Belt Level</label>
                    <input type="text" className="form-control" value={newInst.belt} onChange={e => setNewInst({...newInst, belt: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</label>
                    <input type="text" className="form-control" value={newInst.phone} onChange={e => setNewInst({...newInst, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Biography</label>
                  <textarea className="form-control" value={newInst.bio} onChange={e => setNewInst({...newInst, bio: e.target.value})} required style={{minHeight:'100px'}}></textarea>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Profile Image {editingId && <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>(Optional - leave blank to keep current)</span>}</label>
                  <input type="file" accept="image/*" className="form-control" onChange={e => setNewInst({...newInst, image: e.target.files[0]})} style={{ paddingTop: '0.8rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '55px' }}>
                    {editingId ? 'Update Instructor' : 'Register Instructor'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ flex: 1, height: '55px' }}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Active Roster</h3>
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                {instructors.map(inst => (
                  <div key={inst._id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--accent-gold)', background: 'rgba(255,255,255,0.05)' }}>
                        {inst.imageUrl ? (
                          <img src={inst.imageUrl.startsWith('http') ? inst.imageUrl : `${API_URL}${inst.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>🥋</div>}
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>{inst.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: '600', margin: 0, textTransform: 'uppercase' }}>{inst.role}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{inst.belt}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      {confirmDelete === inst._id ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleDeleteInstructor(inst._id)} 
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                          >Confirm</button>
                          <button 
                            onClick={() => setConfirmDelete(null)} 
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                          >Cancel</button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditClick(inst)} 
                            style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'var(--accent-gold)', padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >EDIT</button>
                          <button 
                            onClick={() => setConfirmDelete(inst._id)} 
                            style={{ background: 'rgba(198, 19, 19, 0.1)', border: '1px solid rgba(198, 19, 19, 0.2)', color: 'var(--primary)', padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >REMOVE</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="animate-on-scroll visible" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '4rem' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>{editingEventId ? 'Edit Event' : 'Post New Event'}</h3>
              <form onSubmit={handleSubmitEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Event Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Belt Grading Ceremony" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required tags="events-title"/>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Event Date (Occurrence Date)</label>
                  <input type="date" className="form-control" value={newEvent.eventDate} onChange={e => setNewEvent({...newEvent, eventDate: e.target.value})} required tags="events-date" style={{ color: '#fff' }}/>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                  <textarea className="form-control" placeholder="Details about the event..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required style={{minHeight:'150px'}} tags="events-description"></textarea>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Event Photo {editingEventId && '(Leave blank to keep current)'}</label>
                  <input type="file" accept="image/*" className="form-control" onChange={e => setNewEvent({...newEvent, image: e.target.files[0]})} style={{ paddingTop: '0.8rem' }} tags="events-image"/>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '55px' }}>
                    {editingEventId ? 'Update Event Details' : 'Publish Event Update'}
                  </button>
                  {editingEventId && (
                    <button type="button" onClick={handleCancelEventEdit} className="btn btn-outline" style={{ flex: 1, height: '55px' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Current Events</h3>
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                {events.map(event => (
                  <div key={event._id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--primary)', background: 'rgba(255,255,255,0.05)' }}>
                        {event.imageUrl ? (
                          <img src={event.imageUrl.startsWith('http') ? event.imageUrl : `${API_URL}${event.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>📷</div>}
                      </div>
                      <div style={{ maxWidth: '300px' }}>
                        <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: '0 0 5px 0' }}>{event.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', margin: '0 0 5px 0' }}>📂 {new Date(event.eventDate || event.createdAt).toLocaleDateString()}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{event.description}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      {confirmDeleteEvent === event._id ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleDeleteEvent(event._id)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm</button>
                          <button onClick={() => setConfirmDeleteEvent(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => handleEditEventClick(event)} style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>EDIT</button>
                          <button onClick={() => setConfirmDeleteEvent(event._id)} style={{ background: 'rgba(198, 19, 19, 0.1)', border: '1px solid rgba(198, 19, 19, 0.2)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>REMOVE</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No events published yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* SITE CONTENT TAB */}
        {activeTab === 'site' && (
          <div className="animate-on-scroll visible" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Global Website Content</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              {['vision_text', 'mission_text', 'about_text'].map(key => (
                <div key={key} className="glass" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--accent-gold)', letterSpacing: '2px', fontSize: '0.9rem' }}>{key.replace('_', ' ')}</h4>
                  <textarea 
                    className="form-control" 
                    style={{ minHeight: '180px', width: '100%', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6' }}
                    value={siteContent[key] || ''}
                    onChange={e => setSiteContent({...siteContent, [key]: e.target.value})}
                  ></textarea>
                  <button 
                    onClick={() => handleUpdateContent(key, siteContent[key])} 
                    className="btn btn-primary" 
                    style={{ width: '100%', borderRadius: '12px' }}
                  >Update {key.split('_')[0]} Content</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
