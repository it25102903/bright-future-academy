import React from 'react';
import {
  Users,
  Radio,
  CalendarDays,
  CreditCard,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Users,
      color: 'var(--primary-400)',
      title: 'Lifecycle Student & Staff Records',
      description:
        'Comprehensive enrollment tracking, guardian linkage, document handling, and role-enforced profile access for administrators and educators.',
      tag: 'Core Management',
    },
    {
      icon: Radio,
      color: 'var(--accent-cyan)',
      title: 'Hardware-Integrated NFC Attendance',
      description:
        'Sub-second contact card taps with duplicate-tap prevention, instant arrival verification, session timestamps, and automated absence warnings.',
      tag: 'Hardware-Ready',
    },
    {
      icon: CalendarDays,
      color: '#10b981',
      title: 'Timetable & Conflict Engine',
      description:
        'Intelligent multi-room classroom allocation, teacher workload distribution, and scheduled session mapping without overlapping conflicts.',
      tag: 'Scheduling',
    },
    {
      icon: CreditCard,
      color: '#f59e0b',
      title: 'Fee Structure & Direct Billing',
      description:
        'Custom fee assignment per student, partial/full receipt generation, outstanding balance audits, and recorded financial ledger tracking.',
      tag: 'Finance',
    },
    {
      icon: Bell,
      color: '#ec4899',
      title: 'Targeted Institutional Broadcasts',
      description:
        'Publish priority-tiered notifications filtered by audience (All Academy, Teachers, Parents, or Specific Classes) with instant acknowledgment.',
      tag: 'Communication',
    },
    {
      icon: ShieldCheck,
      color: '#6366f1',
      title: 'Granular Spring Security Authorization',
      description:
        'Backend-governed JWT tokens, BCrypt credential security, stateless sessions, and strict zero-trust boundary verification across all 5 roles.',
      tag: 'Enterprise Security',
    },
  ];

  return (
    <section
      id="features"
      style={{
        padding: '3.5rem 2rem 6rem',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          className="badge badge-info"
          style={{ marginBottom: '1rem', textTransform: 'uppercase' }}
        >
          Engineered for Institutional Scale
        </div>
        <h2
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}
        >
          Comprehensive Platform Capabilities
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Every module is strictly bound to real backend business logic, verified database
          transactions, and role-authorized access controls.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="glass-card glass-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                minHeight: '280px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: f.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.925rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {f.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                  fontSize: '0.825rem',
                  color: 'var(--primary-400)',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} />
                <span>Active Backend API Endpoint</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
