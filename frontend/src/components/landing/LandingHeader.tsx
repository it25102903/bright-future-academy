import React from 'react';
import { GraduationCap, Sun, Moon, LogIn, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const LandingHeader: React.FC<{
  onLoginClick: () => void;
  onNavigateSection: (id: string) => void;
  onDashboardClick: () => void;
}> = ({ onLoginClick, onNavigateSection, onDashboardClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'var(--topbar-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Brand Logo */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
          }}
        >
          <GraduationCap size={24} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}
          >
            BRIGHT FUTURE
          </div>
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--primary-400)',
            }}
          >
            ACADEMY
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}
        className="hide-mobile"
      >
        <button
          onClick={() => onNavigateSection('features')}
          className="btn-ghost"
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          System Features
        </button>
        <button
          onClick={() => onNavigateSection('roles')}
          className="btn-ghost"
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Role Ecosystem
        </button>
        <button
          onClick={() => onNavigateSection('nfc')}
          className="btn-ghost"
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          NFC Attendance
        </button>
        <button
          onClick={() => onNavigateSection('credentials')}
          className="btn-ghost"
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Demo Accounts
        </button>
      </nav>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="btn btn-ghost"
          style={{
            padding: '0.55rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="var(--warning-text)" />
          ) : (
            <Moon size={18} color="var(--primary-600)" />
          )}
        </button>

        {isAuthenticated ? (
          <button
            onClick={onDashboardClick}
            className="btn btn-primary"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              gap: '0.5rem',
            }}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard ({user?.firstName})</span>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="btn btn-primary"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              gap: '0.5rem',
            }}
          >
            <LogIn size={17} />
            <span>Portal Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
