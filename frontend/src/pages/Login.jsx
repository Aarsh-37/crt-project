import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Heart, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* ── Left decorative panel ── */}
      <div className="auth-panel">
        {/* BG circles */}
        <div className="auth-panel-bg-circle c1" />
        <div className="auth-panel-bg-circle c2" />
        <div className="auth-panel-bg-circle c3" />

        {/* Logo */}
        <div className="auth-panel-logo">
          <div className="auth-panel-logo-icon"><Heart size={20} /></div>
          <span className="auth-panel-logo-name">DPMS Clinic</span>
        </div>

        {/* Content */}
        <div className="auth-panel-content">
          <h2 className="auth-panel-title">
            Doctor &amp; Patient<br />Management Portal
          </h2>
          <p className="auth-panel-desc">
            A secure, role-based system to manage doctors, patients and clinic operations — all in one place.
          </p>
          <ul className="auth-feature-list">
            <li><span className="auth-feature-dot" /> JWT-secured authentication</li>
            <li><span className="auth-feature-dot" /> Role-based access control</li>
            <li><span className="auth-feature-dot" /> Real-time Spring Boot API</li>
            <li><span className="auth-feature-dot" /> Complete clinic records</li>
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card animate-scale-in">

          {/* Mobile brand */}
          <div className="auth-logo-mobile">
            <div className="auth-logo-mobile-icon"><Heart size={18} /></div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              DPMS Clinic
            </span>
          </div>

          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue managing the clinic.</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="alert-error">
              <ShieldCheck size={15} />
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-password-wrap">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
