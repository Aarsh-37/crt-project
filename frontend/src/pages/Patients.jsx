import { useState, useEffect } from 'react';
import { Plus, X, Users, Search, AlertCircle } from 'lucide-react';
import api from '../api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientName: '', age: '', disease: '' });

  // Status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const role = localStorage.getItem('role') || '';

  // Load patients list from backend
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients');
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching patients data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Field checks
    if (!form.patientName.trim()) {
      setFormError('Patient name cannot be blank.');
      return;
    }

    const patientAge = parseInt(form.age);
    if (isNaN(patientAge) || patientAge < 0 || patientAge > 125) {
      setFormError('Please enter a valid age (between 0 and 125).');
      return;
    }

    if (!form.disease.trim()) {
      setFormError('Disease/Diagnosis info cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/patients', {
        ...form,
        age: patientAge
      });
      // Clear forms
      setForm({ patientName: '', age: '', disease: '' });
      setShowModal(false);
      fetchPatients(); // Reload list
    } catch (err) {
      console.error('API Error saving patient:', err);
      setFormError(err.response?.data?.message || 'Error occurred while saving patient.');
    } finally {
      setSaving(false);
    }
  };

  // Client-side search filters
  const filteredPatients = patients.filter((pat) => {
    const query = searchQuery.toLowerCase();
    return (
      pat.patientName.toLowerCase().includes(query) ||
      pat.disease.toLowerCase().includes(query) ||
      pat.age.toString().includes(query)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            List of registered clinic patients and diagnosed conditions
          </p>
        </div>

        <div className="header-actions">
          {/* Client-side filter input */}
          <div className="search-container">
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {role === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Register Patient
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading records from API...</p>
      ) : filteredPatients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {searchQuery ? 'No matching patients found.' : 'No patients registered yet.'}
          </p>
          {role === 'ADMIN' && !searchQuery && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
              <Plus size={18} /> Add First Patient
            </button>
          )}
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Diagnosed Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((pat) => (
                <tr key={pat.id}>
                  <td>#{pat.id}</td>
                  <td style={{ fontWeight: 500 }}>{pat.patientName}</td>
                  <td>{pat.age} years</td>
                  <td>
                    <span className="badge badge-blue">{pat.disease}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Patient Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setFormError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register New Patient</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setFormError(''); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--danger)', borderRadius: '0.5rem', marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="patientName">Patient Name</label>
                  <input
                    id="patientName"
                    type="text"
                    className="input-control"
                    placeholder="e.g. Amit Patel"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="age">Age (Years)</label>
                  <input
                    id="age"
                    type="number"
                    className="input-control"
                    placeholder="e.g. 35"
                    min="0"
                    max="125"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="disease">Diagnosed Condition</label>
                  <input
                    id="disease"
                    type="text"
                    className="input-control"
                    placeholder="e.g. Chronic Fever / Asthma"
                    value={form.disease}
                    onChange={(e) => setForm({ ...form, disease: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setFormError(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
