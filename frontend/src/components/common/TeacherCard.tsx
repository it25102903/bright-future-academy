import React from 'react';
import { Mail, Phone, BookOpen, Layers, Award, Hash } from 'lucide-react';
import { TeacherAvatar } from './TeacherAvatar';

export interface TeacherCardData {
  teacherId?: number;
  fullName: string;
  employeeId?: string;
  specialization?: string;
  qualification?: string;
  subjectName?: string;
  className?: string;
  email?: string;
  phone?: string;
  profileImagePath?: string | null;
}

interface TeacherCardProps {
  teacher: TeacherCardData;
  showEmployeeId?: boolean;
  showContact?: boolean;
  style?: React.CSSProperties;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  showEmployeeId = false,
  showContact = true,
  style,
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style,
      }}
    >
      {/* Top Banner Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--primary-500, #6366f1), var(--accent-cyan, #06b6d4))',
        }}
      />

      {/* Header with Avatar & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <TeacherAvatar
          photoUrl={teacher.profileImagePath}
          name={teacher.fullName}
          size="lg"
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {teacher.fullName}
          </h4>

          {showEmployeeId && teacher.employeeId && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--primary-400)',
                marginTop: '0.15rem',
              }}
            >
              <Hash size={12} />
              <span>{teacher.employeeId}</span>
            </div>
          )}

          {(teacher.subjectName || teacher.specialization) && (
            <div
              style={{
                fontSize: '0.825rem',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                marginTop: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <BookOpen size={13} />
              <span>{teacher.subjectName || teacher.specialization}</span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Meta Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
        {teacher.className && (
          <span
            className="badge badge-neutral"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem' }}
          >
            <Layers size={11} />
            <span>Class: {teacher.className}</span>
          </span>
        )}

        {teacher.qualification && (
          <span
            className="badge badge-neutral"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem' }}
          >
            <Award size={11} color="var(--primary-400)" />
            <span>{teacher.qualification}</span>
          </span>
        )}
      </div>

      {/* Contact Info if permitted */}
      {showContact && (teacher.email || teacher.phone) && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            paddingTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          {teacher.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <a
                href={`mailto:${teacher.email}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {teacher.email}
              </a>
            </div>
          )}

          {teacher.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span>{teacher.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
