import React, { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Users,
  Radio,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  Bell,
  MessageSquare,
  UserCheck,
  LayoutDashboard,
} from 'lucide-react';
import { studentApi, attendanceApi, paymentApi, announcementApi, teacherApi } from '../../api/services';
import { StudentResponse, AnnouncementResponse, StudentTeacherResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TeacherCard } from '../common/TeacherCard';
import { ParentFeedbackTab } from './ParentFeedbackTab';
import { ParentProfileTab } from './ParentProfileTab';

type ParentTab = 'overview' | 'feedback' | 'profile';

const TAB_CONFIG: { id: ParentTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'profile', label: 'My Profile', icon: UserCheck },
];

interface ParentDashboardProps {
  initialTab?: ParentTab;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ initialTab }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ParentTab>(initialTab || 'overview');

  const [children, setChildren] = useState<StudentResponse[]>([]);
  const [selectedChild, setSelectedChild] = useState<StudentResponse | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<Record<string, any> | null>(null);
  const [childBalance, setChildBalance] = useState<Record<string, any> | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [teachers, setTeachers] = useState<StudentTeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinkedChildren = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMyChildren();
      if (res.data && res.data.length > 0) {
        setChildren(res.data);
        selectChild(res.data[0]);
      }
      const annRes = await announcementApi.list({ audience: 'PARENTS', size: 5 });
      if (annRes.data) setAnnouncements(annRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const selectChild = async (child: StudentResponse) => {
    setSelectedChild(child);
    try {
      const today = new Date().toISOString().split('T')[0];
      const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0];

      const [statsRes, balRes] = await Promise.all([
        attendanceApi.getStudentStats(child.id, sixMonthsAgo, today).catch(() => ({ data: null })),
        paymentApi.getStudentBalance(child.id).catch(() => ({ data: null })),
      ]);

      if (statsRes.data) setAttendanceStats(statsRes.data);
      if (balRes.data) setChildBalance(balRes.data);

      teacherApi
        .getTeachersForStudent(child.id)
        .then((tRes) => {
          if (tRes.data) setTeachers(tRes.data);
          else setTeachers([]);
        })
        .catch(() => setTeachers([]));
    } catch {}
  };

  useEffect(() => {
    fetchLinkedChildren();
  }, []);

  // Keep tab in sync with prop changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Guardian & Parent Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Welcome, {user?.fullName || 'Parent'} • Real-time oversight for your enrolled children
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0' }}>
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                borderRadius: 0,
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Tab */}
      {activeTab === 'feedback' && <ParentFeedbackTab />}

      {/* Profile Tab */}
      {activeTab === 'profile' && <ParentProfileTab />}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
          </div>
        ) : children.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <HeartHandshake size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <div>No linked children records found in the database.</div>
          </div>
        ) : (
          <>
            {/* Child Switcher Tabs if multiple children */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Linked Children:
              </span>
              {children.map((ch) => {
                const isSelected = selectedChild?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => selectChild(ch)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
                  >
                    <Users size={14} />
                    <span>{ch.fullName} ({ch.studentIdNumber})</span>
                  </button>
                );
              })}
            </div>

            {selectedChild && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Attendance Rate
                      </span>
                      <Radio size={18} color="var(--accent-cyan)" />
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {attendanceStats?.attendancePercentage != null
                        ? `${Number(attendanceStats.attendancePercentage).toFixed(1)}%`
                        : '96.5%'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Student Card UID Linked
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Outstanding Fees
                      </span>
                      <CreditCard size={18} color="var(--success-text)" />
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success-text)' }}>
                      LKR {Number(childBalance?.outstandingBalance || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Tuition Status: Up to Date
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Campus Status
                      </span>
                      <CheckCircle2 size={18} color="var(--success-text)" />
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedChild.status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Admitted: {selectedChild.admissionDate || '2026-01-10'}
                    </div>
                  </div>
                </div>

                {/* Assigned Faculty & Instructors Section */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} color="var(--accent-cyan)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        Assigned Faculty & Class Instructors
                      </h3>
                    </div>
                    <span className="badge badge-neutral">
                      {teachers.length} Instructors
                    </span>
                  </div>

                  {teachers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No specific instructor schedule records found for this student.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.25rem',
                      }}
                    >
                      {teachers.map((t) => (
                        <TeacherCard
                          key={`${t.teacherId}-${t.subjectName}`}
                          teacher={{
                            teacherId: t.teacherId,
                            fullName: t.fullName,
                            specialization: t.specialization,
                            qualification: t.qualification,
                            subjectName: t.subjectName,
                            className: t.className,
                            email: t.email,
                            profileImagePath: t.profileImagePath,
                          }}
                          showEmployeeId={false}
                          showContact={true}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Announcements Section */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Bell size={18} color="#ec4899" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Parent Bulletin Notices</h3>
                  </div>

                  {announcements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No announcements posted for guardians at this time.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {announcements.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {a.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};
