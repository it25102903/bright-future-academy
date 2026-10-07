import React from 'react';
import { GraduationCap, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '4.5rem 2rem 2.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem',
        }}
      >
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                BRIGHT FUTURE
              </div>
              <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--primary-400)', letterSpacing: '0.1em' }}>
                ACADEMY
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '280px' }}>
            Enterprise-grade web educational management system with real-time hardware NFC attendance,
            role authorization, and unified academic portals.
          </p>
        </div>

        {/* Col 2: System Architecture */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Backend Technology
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li>Java 17+ / Spring Boot 3.x</li>
            <li>Spring Security with JWT Auth</li>
            <li>Spring Data JPA & Hibernate</li>
            <li>Flyway Migrations (V1 to V14)</li>
            <li>OpenAPI 3 / Swagger Specifications</li>
          </ul>
        </div>

        {/* Col 3: Role Portals */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Authorized Portals
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li>Administrator Portal</li>
            <li>Educator / Teacher Workspace</li>
            <li>Student Self-Service Terminal</li>
            <li>Parent & Guardian Transparency</li>
            <li>Finance Officer Billing Hub</li>
          </ul>
        </div>

        {/* Col 4: Contact & Academy Details */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Campus Administration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--primary-400)" />
              <span>Colombo 03, Western Province, Sri Lanka</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="var(--accent-cyan)" />
              <span>admin@brightfutureacademy.lk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--success-text)" />
              <span>Certified Educational Standards</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} Bright Future Academy. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Compliance</span>
        </div>
      </div>
    </footer>
  );
};
