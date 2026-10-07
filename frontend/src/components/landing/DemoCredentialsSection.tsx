import React from 'react';
import { KeyRound, Shield, BookOpen, GraduationCap, HeartHandshake, BadgePercent, ArrowRight } from 'lucide-react';

export const DemoCredentialsSection: React.FC<{
  onSelectAccount: (email: string, password: string) => void;
}> = ({ onSelectAccount }) => {
  const accounts = [
    {
      role: 'Administrator',
      email: 'admin@brightfutureacademy.lk',
      name: 'Saman Perera',
      icon: Shield,
      color: 'var(--primary-400)',
      scope: 'Full administrative authority',
    },
    {
      role: 'Teacher',
      email: 'teacher@brightfutureacademy.lk',
      name: 'Kumari Silva',
      icon: BookOpen,
      color: 'var(--accent-cyan)',
      scope: 'Classroom & session grading',
    },
    {
      role: 'Student',
      email: 'student@brightfutureacademy.lk',
      name: 'Kamal Bandara',
      icon: GraduationCap,
      color: '#10b981',
      scope: 'Personal attendance & fees',
    },
    {
      role: 'Parent',
      email: 'parent@brightfutureacademy.lk',
      name: 'Sunil Bandara',
      icon: HeartHandshake,
      color: '#f59e0b',
      scope: 'Linked children monitoring',
    },
    {
      role: 'Finance Officer',
      email: 'finance@brightfutureacademy.lk',
      name: 'Chaminda Rathnayake',
      icon: BadgePercent,
      color: '#ec4899',
      scope: 'Fee setup & payment receipts',
    },
  ];

  return (
    <section
      id="credentials"
      style={{
        padding: '5rem 2rem 7rem',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          className="badge badge-info"
          style={{ marginBottom: '1rem', textTransform: 'uppercase' }}
        >
          Instant Evaluation Access
        </div>
        <h2
          style={{
            fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}
        >
          Seed Demonstration Accounts
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '650px',
            margin: '0 auto',
          }}
        >
          Click any role below to pre-fill the secure login portal and test real
          backend API authentication against the running Spring Boot instance.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {accounts.map((acc, i) => {
          const Icon = acc.icon;
          return (
            <div
              key={i}
              className="glass-card glass-card-interactive"
              onClick={() => onSelectAccount(acc.email, 'abcd123')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: acc.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {acc.role}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {acc.name}
                </div>
                <div
                  style={{
                    fontSize: '0.775rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '0.2rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {acc.email}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.75rem',
                  }}
                >
                  {acc.scope}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-400)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <KeyRound size={12} />
                  <span>abcd123</span>
                </span>
                <ArrowRight size={14} color="var(--primary-400)" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
