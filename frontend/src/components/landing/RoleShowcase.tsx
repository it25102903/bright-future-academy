import React, { useState } from 'react';
import {
  Shield,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  BadgePercent,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const RoleShowcase: React.FC<{ onSelectRoleDemo?: (email: string) => void }> = ({
  onSelectRoleDemo,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const roles = [
    {
      role: 'ADMINISTRATOR',
      title: 'Administrator',
      icon: Shield,
      badge: 'Full Executive Scope',
      email: 'admin@brightfutureacademy.lk',
      description:
        'Complete governance of the academy: create and manage students, assign teachers, configure academic classes, manage fee structures, broadcast urgent announcements, and monitor campus-wide metrics.',
      capabilities: [
        'Live institutional dashboard & revenue audit',
        'Student enrollment & status lifecycle management',
        'Teacher hiring records & workload assignments',
        'Classroom facility & weekly timetable conflict engine',
        'System audit trail & emergency broadcasts',
      ],
    },
    {
      role: 'TEACHER',
      title: 'Educator & Teacher',
      icon: BookOpen,
      badge: 'Instructional Command',
      email: 'teacher@brightfutureacademy.lk',
      description:
        'Streamlined classroom tools: launch attendance sessions for assigned classes, take single or bulk attendance marks, inspect student performance, and view weekly lecture schedules.',
      capabilities: [
        'Direct attendance session creator for scheduled periods',
        'One-click bulk attendance mark with late/excused tags',
        'Student class roster & contact lookups',
        'Weekly teaching timetable schedule grid',
        'Targeted classroom announcement views',
      ],
    },
    {
      role: 'STUDENT',
      title: 'Student Scholar',
      icon: GraduationCap,
      badge: 'Self-Service Academic Hub',
      email: 'student@brightfutureacademy.lk',
      description:
        'Personalized student experience: review personal attendance statistics, check enrolled classes, view outstanding fee balances, and receive timely academy updates.',
      capabilities: [
        'Personal attendance calculation (% present/absent)',
        'Class enrollments & assigned subject list',
        'Transparent fee balance status check',
        'Academy announcement bulletin access',
        'Profile credential & contact management',
      ],
    },
    {
      role: 'PARENT',
      title: 'Guardian & Parent',
      icon: HeartHandshake,
      badge: 'Parental Transparency',
      email: 'parent@brightfutureacademy.lk',
      description:
        'Real-time transparency into your child’s educational journey: access linked children profiles via backend guardian relations, monitor attendance arrival times, and track payment receipts.',
      capabilities: [
        'Linked children multi-child switcher (/api/students/my-children)',
        'Child attendance log with NFC arrival timestamps',
        'Fee payment status & outstanding balance summary',
        'Official academy notices & exam schedules',
        'Direct emergency contact synchronization',
      ],
    },
    {
      role: 'FINANCE_OFFICER',
      title: 'Finance Officer',
      icon: BadgePercent,
      badge: 'Fiscal Operations',
      email: 'finance@brightfutureacademy.lk',
      description:
        'Precision financial control: configure tuition and exam fee structures, record student payments across cash, card, and bank transfers, generate receipts, and review collected revenue.',
      capabilities: [
        'Create & edit annual and term fee structures',
        'Student fee assignment with custom discounts',
        'Record payments with reference number & method tracking',
        'Printable receipt generation & payment history',
        'Student-by-student outstanding balance reconciliation',
      ],
    },
  ];

  const current = roles[activeTab];
  const Icon = current.icon;

  return (
    <section
      id="roles"
      style={{
        padding: '6rem 2rem',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          className="badge badge-info"
          style={{ marginBottom: '1rem', textTransform: 'uppercase' }}
        >
          Dedicated Role Portals
        </div>
        <h2
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}
        >
          Unified Platform, Tailored Experiences
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
          Five purpose-built roles engineered with zero-trust access boundaries.
          Select a role to inspect its operational scope and test live.
        </p>
      </div>

      {/* Role Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '3rem',
        }}
      >
        {roles.map((r, idx) => {
          const TabIcon = r.icon;
          const isActive = activeTab === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className="btn"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.65rem 1.4rem',
                background: isActive
                  ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)'
                  : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'transparent' : 'var(--border-subtle)'}`,
                boxShadow: isActive ? '0 4px 15px rgba(79, 70, 229, 0.35)' : 'none',
                gap: '0.5rem',
              }}
            >
              <TabIcon size={17} />
              <span>{r.title}</span>
            </button>
          );
        })}
      </div>

      {/* Role Detail Card */}
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(2rem, 4vw, 3.5rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary-400)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Icon size={16} />
            <span>{current.badge}</span>
          </div>

          <h3
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {current.title} Portal
          </h3>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2rem',
            }}
          >
            {current.description}
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '2.5rem',
            }}
          >
            {current.capabilities.map((cap, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.925rem',
                  color: 'var(--text-primary)',
                }}
              >
                <CheckCircle size={18} color="var(--success-text)" />
                <span>{cap}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => onSelectRoleDemo && onSelectRoleDemo(current.email)}
              className="btn btn-primary"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.75rem 1.5rem',
                gap: '0.5rem',
              }}
            >
              <span>Test as {current.title}</span>
              <ArrowRight size={16} />
            </button>
            <span
              style={{
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {current.email}
            </span>
          </div>
        </div>

        {/* Visual Mockup Preview for the Role */}
        <div
          className="glass-card"
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-400)',
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Portal View</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active Authority: {current.role}
                </div>
              </div>
            </div>
            <span className="badge badge-success">API Online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Default Landing Route
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                /{current.role.toLowerCase().replace('_', '')}/*
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Primary Backend Endpoints
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {current.role === 'ADMINISTRATOR' && '/api/dashboard, /api/students, /api/classes, /api/timetables'}
                {current.role === 'TEACHER' && '/api/attendance/sessions, /api/students, /api/timetables/teacher'}
                {current.role === 'STUDENT' && '/api/attendance/students/{id}/stats, /api/payments/{id}/balance'}
                {current.role === 'PARENT' && '/api/students/my-children, /api/attendance/students/{childId}/stats'}
                {current.role === 'FINANCE_OFFICER' && '/api/payments, /api/fee-structures, /api/dashboard'}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <span style={{ fontSize: '0.825rem', color: 'var(--success-text)', fontWeight: 600 }}>
                Seed Account Ready
              </span>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                abcd123
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
