import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Radio,
  Calendar,
  Users,
  Bell,
  ArrowRight,
  Clock,
  Loader2,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { academicApi, attendanceApi, announcementApi } from '../../api/services';
import { ClassResponse, TimetableResponse, AnnouncementResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TeacherAvatar } from '../common/TeacherAvatar';

export const TeacherDashboard: React.FC<{ onNavigateView: (viewId: string) => void }> = ({
  onNavigateView,
}) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [timetables, setTimetables] = useState<TimetableResponse[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cRes, aRes] = await Promise.all([
          academicApi.listClasses({ size: 10 }),
          announcementApi.list({ audience: 'TEACHERS', size: 5 }),
        ]);
        if (cRes.data) {
          setClasses(cRes.data);
          if (cRes.data.length > 0) {
            const tRes = await academicApi.getClassTimetable(cRes.data[0].id);
            if (tRes.data) setTimetables(tRes.data);
          }
        }
        if (aRes.data) setAnnouncements(aRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TeacherAvatar
            photoUrl={user?.profileImagePath}
            name={user?.fullName || ''}
            size="lg"
          />
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Welcome, {user?.fullName || 'Instructor'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Faculty Workspace — Manage your classes, record attendance sessions, and review schedules
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateView('teacher-exams')}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', gap: '0.5rem', background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))' }}
          >
            <FileCheck size={16} />
            <span>Exams & Quizzes</span>
          </button>

          <button
            onClick={() => onNavigateView('teacher-profile')}
            className="btn btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', gap: '0.5rem' }}
          >
            <UserCheck size={16} color="var(--accent-cyan)" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => onNavigateView('attendance')}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', gap: '0.5rem' }}
          >
            <Radio size={16} />
            <span>Launch Attendance Session</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Classes Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Assigned Classes</h3>
              </div>
              <span className="badge badge-neutral">{classes.length} Classes</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={20} className="animate-spin" color="var(--primary-500)" />
              </div>
            ) : classes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                No classes assigned currently.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {classes.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.className}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Grade {c.gradeLevel} • {c.classroomName || 'Assigned Room'}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.685rem' }}>
                      {c.currentEnrollment || 0} Students
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateView('students')}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1.5rem', width: '100%', gap: '0.4rem' }}
          >
            <span>View Student Roster</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Schedule Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Schedule</h3>
              </div>
              <span className="badge badge-info">Active Timetable</span>
            </div>

            {timetables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No active timetable slots configured yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {timetables.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {t.subjectName} ({t.dayOfWeek})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.classroomName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--primary-400)' }}>
                      <Clock size={12} />
                      <span>{t.startTime} - {t.endTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateView('timetables')}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1.5rem', width: '100%', gap: '0.4rem' }}
          >
            <span>Full Teaching Schedule</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Notices Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="#ec4899" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Faculty Notices</h3>
              </div>
              <span className="badge badge-neutral">Announcements</span>
            </div>

            {announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No faculty announcements currently.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {announcements.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateView('announcements')}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1.5rem', width: '100%', gap: '0.4rem' }}
          >
            <span>All Announcements</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
