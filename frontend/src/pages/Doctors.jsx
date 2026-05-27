import { useState, useEffect } from 'react';
import { Plus, X, Stethoscope, Search, AlertCircle, Mail } from 'lucide-react';
import api from '../api';

/* Color palette for doctor avatars */
const AVATAR_COLORS = [
  ['#6366F1', 'rgba(99,102,241,0.15)'],
  ['#10B981', 'rgba(16,185,129,0.15)'],
  ['#F59E0B', 'rgba(245,158,11,0.15)'],
  ['#EF4444', 'rgba(239,68,68,0.15)'],
  ['#8B5CF6', 'rgba(139,92,246,0.15)'],
  ['#06B6D4', 'rgba(6,182,212,0.15)'],
];

function getAvatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

/* Skeleton row */
function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div className="skeleton skeleton-circle" style={{ width: 34, height: 34 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton skeleton-text" style={{ width: '45%' }} />
        <div className="skeleton skeleton-text" style={{ width: '30%', height: 10 }} />
      </div>
      <div className="skeleton skeleton-text" style={{ width: 90 }} />
      <div className="skeleton skeleton-text" style={{ width: 130 }} />
    </div>
  );
}

export default function Doctors() {
  const [doctors,     setDoctors]     = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState({ doctorName: '', specialization: '', email: '' });

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');

  const role = localStorage.getItem('role') || '';

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors');
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching doctors data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.doctorName.trim())     { setFormError('Doctor name cannot be blank.');        return; }
    if (!form.specialization.trim()) { setFormError('Specialization cannot be blank.');     return; }
    if (!isValidEmail(form.email))   { setFormError('Please enter a valid email address.'); return; }

    setSaving(true);
    try {
      await api.post('/doctors', form);
      setForm({ doctorName: '', specialization: '', email: '' });
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving doctor.');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setFormError(''); };

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.doctorName.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors Directory</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${doctors.length} registered doctor${doctors.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              id="doctors-search"
              type="text"
              className="search-input"
              placeholder="Search name, specialization…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                style={{ background: 'none', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {role === 'ADMIN' && (
            <button
              id="register-doctor-btn"
              className="btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              Add Doctor
            </button>
          )}
        </div>
      </div>

      {/* ── Table / States ── */}
      {loading ? (
        <div className="data-table-container">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Stethoscope size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="empty-title">
              {searchQuery ? 'No results found' : 'No doctors yet'}
            </div>
            <div className="empty-subtitle">
              {searchQuery
                ? `No doctors match "${searchQuery}". Try a different keyword.`
                : 'Add the first doctor to the system using the button above.'}
            </div>
            {role === 'ADMIN' && !searchQuery && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add First Doctor
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Contact Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc) => {
                const [color, bg] = getAvatarColor(doc.id);
                const initials = doc.doctorName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <tr key={doc.id}>
                    <td>
                      <span className="row-id">#{doc.id}</span>
                    </td>
                    <td>
                      <div className="cell-avatar">
                        <div
                          className="cell-avatar-icon"
                          style={{ background: bg, color }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="cell-name">{doc.doctorName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{doc.specialization}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Mail size={13} />
                        {doc.email}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer count */}
          <div style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            background: 'var(--surface-2)',
          }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{filteredDoctors.length}</strong> of{' '}
            <strong style={{ color: 'var(--text-main)' }}>{doctors.length}</strong> doctors
          </div>
        </div>
      )}

      {/* ── Register Doctor Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register New Doctor</h2>
              <button id="close-doctor-modal" className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form id="doctor-form" onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-error">
                    <AlertCircle size={15} />
                    {formError}
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="doctorName">Doctor's Full Name</label>
                  <input
                    id="doctorName"
                    type="text"
                    className="input-control"
                    placeholder="e.g. Dr. Rahul Sharma"
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="specialization">Medical Specialization</label>
                  <input
                    id="specialization"
                    type="text"
                    className="input-control"
                    placeholder="e.g. Cardiologist"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="doctorEmail">Email Address</label>
                  <input
                    id="doctorEmail"
                    type="email"
                    className="input-control"
                    placeholder="e.g. rahul@clinic.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" id="cancel-doctor-btn" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" id="save-doctor-btn" className="btn-primary" disabled={saving}>
                  {saving ? 'Registering…' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
