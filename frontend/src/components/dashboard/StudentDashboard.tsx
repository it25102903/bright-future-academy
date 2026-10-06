import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Radio,
  Bell,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  Building,
  ArrowRight,
  Loader2,
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { StudentFeedbackTab } from './StudentFeedbackTab';
import { attendanceApi, announcementApi, studentApi } from '../../api/services';
import { AnnouncementResponse, StudentResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';

export interface StudentDashboardProps {
  onNavigateView: (viewId: string) => void;
  initialTab?: 'overview' | 'feedback';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateView,
  initialTab = 'overview',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback'>(initialTab);

  const [studentProfile, setStudentProfile] = useState<StudentResponse | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<Record<string, any> | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0];

        const [profileRes, statsRes, annRes] = await Promise.all([
          studentApi.getMyProfile().catch(() => ({ data: null })),
          attendanceApi.getMyStats({ dateFrom: sixMonthsAgo, dateTo: today }).catch(() => ({ data: null })),
          announcementApi.list({ audience: 'STUDENTS', size: 5 }).catch(() => ({ data: [] })),
        ]);

        if (profileRes.data) setStudentProfile(profileRes.data);
        if (statsRes.data) setAttendanceStats(statsRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const hasAttendanceSessions = (attendanceStats?.totalSessions ?? 0) > 0;
  const attendancePercentage =
    attendanceStats?.attendancePercentage != null && hasAttendanceSessions
      ? Number(attendanceStats.attendancePercentage)
      : 0.0;

  const activeClassName =
    studentProfile?.enrollments && studentProfile.enrollments.length > 0
      ? studentProfile.enrollments.map((e) => e.className).join(', ')
      : 'Not enrolled in classes yet';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Student Academic Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Welcome, {user?.fullName || studentProfile?.fullName || 'Student'} • Academic Year 2026
          </p>
        </div>

        {studentProfile?.studentIdNumber && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--accent-cyan)',
            }}
          >
            ID: {studentProfile.studentIdNumber}
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
        >
          <LayoutDashboard size={16} />
          <span>Academic Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
        >
          <MessageSquare size={16} />
          <span>Send Feedback</span>
        </button>
        <button
          onClick={() => onNavigateView('student-exams')}
          className="btn btn-primary"
          style={{
            gap: '0.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
            marginLeft: 'auto',
          }}
        >
          <FileCheck size={16} />
          <span>Exams & Quizzes</span>
        </button>
      </div>

      {activeTab === 'feedback' ? (
        <StudentFeedbackTab />
      ) : (
        <>

      {/* Metrics Row (Fee balance removed) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Attendance Rate */}
        <div
          className="glass-card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => onNavigateView('student-attendance')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Attendance Punctuality
            </span>
            <Radio size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {hasAttendanceSessions ? `${attendancePercentage.toFixed(1)}%` : '0.0%'}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {hasAttendanceSessions
              ? `${attendanceStats?.present ?? 0} of ${attendanceStats?.totalSessions ?? 0} sessions verified`
              : 'No attendance records logged yet'}
          </div>
        </div>

        {/* Enrolled Curriculum */}
        <div
          className="glass-card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => onNavigateView('student-subjects')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Enrolled Curriculum
            </span>
            <GraduationCap size={18} color="var(--primary-400)" />
          </div>
          <div style={{ fontSize: studentProfile?.enrollments?.length ? '1.85rem' : '1.15rem', fontWeight: 800, color: studentProfile?.enrollments?.length ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {activeClassName}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {studentProfile?.enrollments?.length
              ? `Status: ${studentProfile?.status || 'ACTIVE'} • Academic Year 2026`
              : 'Contact administration to enroll in active class cohorts'}
          </div>
        </div>

        {/* Student Profile Info */}
        <div
          className="glass-card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => onNavigateView('student-profile')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Academic Profile
            </span>
            <User size={18} color="var(--success-text)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Verified
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Click to view and edit personal contact info
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Quick Academic Services
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div
            className="glass-card"
            onClick={() => onNavigateView('student-timetable')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="var(--primary-400)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Class Timetable
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekly lecture hours</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div
            className="glass-card"
            onClick={() => onNavigateView('student-attendance')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Radio size={20} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Attendance Log
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read-only history</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div
            className="glass-card"
            onClick={() => onNavigateView('student-subjects')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={20} color="#ec4899" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Curriculum Subjects
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Courses & instructors</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div
            className="glass-card"
            onClick={() => onNavigateView('student-classrooms')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building size={20} color="var(--warning-text)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Campus Classrooms
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rooms & lab facilities</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Attendance Breakdown Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Attendance Breakdown</h3>
            </div>
            <button
              onClick={() => onNavigateView('student-attendance')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-400)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View History &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.875rem' }}>Present Sessions</span>
              <span style={{ fontWeight: 700, color: 'var(--success-text)' }}>
                {attendanceStats?.present != null ? `${attendanceStats.present} Sessions` : 'Loading...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.875rem' }}>Late Arrivals</span>
              <span style={{ fontWeight: 700, color: 'var(--warning-text)' }}>
                {attendanceStats?.late != null ? `${attendanceStats.late} Sessions` : 'Loading...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.875rem' }}>Excused / Absent</span>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                {attendanceStats != null
                  ? `${(attendanceStats.absent || 0) + (attendanceStats.excused || 0)} Sessions`
                  : 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Notices */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Bell size={18} color="#ec4899" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Notices</h3>
          </div>

          {announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No active student notices.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {a.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
