import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, Users, Activity, ShieldCheck,
  ArrowRight, Zap, CalendarDays, TrendingUp
} from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role') || 'ADMIN';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [docRes, patRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/patients'),
        ]);
        setDoctorCount(Array.isArray(docRes.data) ? docRes.data.length : 0);
        setPatientCount(Array.isArray(patRes.data) ? patRes.data.length : 0);
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  /* ── Stat cards ── */
  const stats = [
    {
      id: 'doctors',
      label: 'Total Doctors',
      value: loading ? null : doctorCount,
      icon: <Stethoscope size={22} />,
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.12)',
      path: '/doctors',
    },
    {
      id: 'patients',
      label: 'Total Patients',
      value: loading ? null : patientCount,
      icon: <Users size={22} />,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      path: '/patients',
    },
    {
      id: 'role',
      label: 'Access Role',
      value: role,
      icon: <ShieldCheck size={22} />,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.12)',
      path: null,
      isText: true,
    },
    {
      id: 'api',
      label: 'API Status',
      value: 'Online',
      icon: <Activity size={22} />,
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.12)',
      path: null,
      isText: true,
    },
  ];

  /* ── Quick actions ── */
  const quickActions = [
    {
      id: 'go-doctors',
      label: 'View Doctors Directory',
      icon: <Stethoscope size={16} />,
      iconBg: 'rgba(99, 102, 241, 0.12)',
      iconColor: '#6366F1',
      path: '/doctors',
    },
    {
      id: 'go-patients',
      label: 'View Patients Directory',
      icon: <Users size={16} />,
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#10B981',
      path: '/patients',
    },
  ];

  /* ── Skeleton value ── */
  const SkeletonVal = () => (
    <div
      className="skeleton"
      style={{ width: 48, height: 28, borderRadius: 6, marginTop: 4 }}
    />
  );

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Dashboard</h1>
          <p className="page-subtitle">System overview and quick controls</p>
        </div>
        <div className="info-bar">
          <span className="status-dot" />
          Connected to Spring Boot API
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard-grid stagger">
        {stats.map((stat) => (
          <div
            key={stat.id}
            id={`stat-card-${stat.id}`}
            className={`stat-card animate-scale-in ${stat.path ? 'clickable' : ''}`}
            onClick={() => stat.path && navigate(stat.path)}
            style={{ color: stat.color }}
          >
            <div
              className="stat-icon"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.icon}
            </div>

            <div className="stat-body">
              <div className="stat-label">{stat.label}</div>
              {loading && !stat.isText ? (
                <SkeletonVal />
              ) : (
                <div className={`stat-value ${stat.isText ? 'text' : ''}`}
                  style={{ color: 'var(--text-main)' }}>
                  {stat.value}
                </div>
              )}
            </div>

            {stat.path && (
              <ArrowRight size={16} className="stat-arrow" />
            )}

            {/* Online dot for API card */}
            {stat.id === 'api' && (
              <span className="status-dot" style={{ position: 'absolute', top: 14, right: 14 }} />
            )}
          </div>
        ))}
      </div>

      {/* Bottom grid: quick actions + info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flexWrap: 'wrap' }}>

        {/* Quick actions */}
        <div className="quick-actions-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="quick-actions-title">
            <Zap size={16} style={{ color: 'var(--primary)' }} />
            Quick Navigation
          </div>
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              id={qa.id}
              className="quick-action-btn"
              onClick={() => navigate(qa.path)}
            >
              <div
                className="quick-action-icon"
                style={{ background: qa.iconBg, color: qa.iconColor }}
              >
                {qa.icon}
              </div>
              {qa.label}
              <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>

        {/* System info */}
        <div className="quick-actions-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="quick-actions-title">
            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
            System Summary
          </div>

          {[
            { label: 'Active Role', value: role, icon: <ShieldCheck size={14} />, badge: 'badge-purple' },
            { label: 'Doctors', value: loading ? '…' : `${doctorCount} registered`, icon: <Stethoscope size={14} />, badge: 'badge-blue' },
            { label: 'Patients', value: loading ? '…' : `${patientCount} registered`, icon: <Users size={14} />, badge: 'badge-green' },
            { label: 'Session', value: 'Active', icon: <CalendarDays size={14} />, badge: 'badge-cyan' },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.6rem 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 500
              }}>
                {row.icon}
                {row.label}
              </div>
              <span className={`badge ${row.badge}`}>{row.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
