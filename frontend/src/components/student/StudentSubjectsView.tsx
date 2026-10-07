import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  User,
  Building,
  Calendar,
  Layers,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { academicApi, studentApi } from '../../api/services';
import { StudentResponse, TimetableResponse, SubjectResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

interface EnrolledSubjectDetail {
  id: number;
  subjectName: string;
  subjectCode: string;
  className: string;
  teacherName: string;
  classroomName: string;
  scheduleSummary: string;
  credits?: number;
  description?: string;
}

export const StudentSubjectsView: React.FC = () => {
  const { error: toastError } = useToast();

  const [subjects, setSubjects] = useState<EnrolledSubjectDetail[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, timetablesRes, allSubjectsRes] = await Promise.all([
        studentApi.getMyProfile(),
        academicApi.getMyTimetable(),
        academicApi.listSubjects({ size: 100 }),
      ]);

      if (profileRes.data?.enrollments) {
        setEnrollments(profileRes.data.enrollments);
      }

      const timetableList: TimetableResponse[] = timetablesRes.data || [];
      const catalogSubjects: SubjectResponse[] = allSubjectsRes.data || [];

      // Group timetable entries by subject to form enrolled subjects
      const subjectMap = new Map<string, EnrolledSubjectDetail>();

      timetableList.forEach((t) => {
        const key = `${t.subjectName}-${t.className}`;
        const existing = subjectMap.get(key);
        const scheduleSlot = `${t.dayOfWeek.slice(0, 3)} ${t.startTime.slice(0, 5)}-${t.endTime.slice(0, 5)}`;

        if (!existing) {
          const match = catalogSubjects.find(
            (s) => s.id === t.subjectId || s.name.toLowerCase() === t.subjectName.toLowerCase()
          );

          subjectMap.set(key, {
            id: t.subjectId,
            subjectName: t.subjectName,
            subjectCode: match?.subjectCode || `SUB-${t.subjectId}`,
            className: t.className,
            teacherName: t.teacherName,
            classroomName: t.classroomName,
            scheduleSummary: scheduleSlot,
            credits: match?.credits || 3,
            description: match?.description || 'Curriculum academic course module.',
          });
        } else {
          existing.scheduleSummary += `, ${scheduleSlot}`;
        }
      });


      setSubjects(Array.from(subjectMap.values()));
    } catch (err: any) {
      toastError(err?.message || 'Failed to load enrolled subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <BookOpen size={24} color="var(--primary-400)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Enrolled Curriculum & Classes
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Academic subjects, course syllabus modules, and instructors for your enrolled division.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh Modules
        </button>
      </div>

      {/* Active Enrollment Summary Banner */}
      {enrollments.length > 0 && (
        <div
          className="glass-card"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08))',
            borderColor: 'var(--border-highlight)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {enrollments.map((e) => e.className).join(', ')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Academic Year {enrollments[0]?.academicYear || 2026} • Status: {enrollments[0]?.status || 'ACTIVE'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Modules</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                {subjects.length} Subjects
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Credits</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {subjects.reduce((sum, s) => sum + (s.credits || 0), 0)} Credits
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary-400)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>Loading curriculum subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            No Enrolled Subjects Found
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            Your student account is not currently assigned to any active academic subjects.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {subjects.map((sub) => (
            <div
              key={`${sub.id}-${sub.subjectCode}`}
              className="glass-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                position: 'relative',
              }}
            >
              <div>
                {/* Subject Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary-400)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    {sub.subjectCode}
                  </span>

                  {sub.credits && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      <Award size={13} /> {sub.credits} Credits
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {sub.subjectName}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {sub.description}
                </p>
              </div>

              {/* Subject Details List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={14} /> Teacher
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.teacherName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building size={14} /> Classroom
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.classroomName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} /> Schedule
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-400)', textAlign: 'right' }}>
                    {sub.scheduleSummary}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
