import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Users, LogOut, Heart, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const role     = localStorage.getItem('role') || 'ADMIN';
  const username = role === 'ADMIN' ? 'Admin User' : 'Doctor User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Heart size={18} />
        </div>
        <div>
          <div className="sidebar-title">DPMS Clinic</div>
          <div className="sidebar-subtitle">Management System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-item-icon"><LayoutDashboard size={18} /></span>
          Dashboard
        </NavLink>

        <NavLink
          to="/doctors"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-item-icon"><Stethoscope size={18} /></span>
          Doctors
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-item-icon"><Users size={18} /></span>
          Patients
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title="Toggle UI Theme"
        >
          {theme === 'light' ? (
            <><Moon size={15} /> Dark Mode</>
          ) : (
            <><Sun size={15} /> Light Mode</>
          )}
        </button>

        {/* User profile */}
        <div className="user-profile">
          <div className="avatar">{username.charAt(0)}</div>
          <div className="user-info">
            <div className="user-name">{username}</div>
            <div className="user-role">{role.toLowerCase()} panel</div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="logout-btn"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
