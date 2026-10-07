import React, { useEffect, useState } from 'react';
import {
  Radio,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Users,
  Check,
  Loader2,
  Calendar,
  X,
  Zap,
} from 'lucide-react';
import { attendanceApi, academicApi, teacherApi, studentApi } from '../../api/services';
import {
  AttendanceSessionResponse,
  AttendanceRecordResponse,
  ClassResponse,
  TeacherResponse,
  SubjectResponse,
  StudentResponse,
  AttendanceStatus,
} from '../../types';
import { useToast } from '../../context/ToastContext';

export const AttendanceManagement: React.FC = () => {
  const { success, error: toastError, warning } = useToast();

  const [sessions, setSessions] = useState<AttendanceSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected session for viewing / marking
  const [activeSession, setActiveSession] = useState<AttendanceSessionResponse | null>(null);
  const [records, setRecords] = useState<AttendanceRecordResponse[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Create session modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);

  const [newClassId, setNewClassId] = useState<number | ''>('');
  const [newTeacherId, setNewTeacherId] = useState<number | ''>('');
  const [newSubjectId, setNewSubjectId] = useState<number | ''>('');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('09:30');

  // NFC Terminal Mode
  const [nfcInput, setNfcInput] = useState('');
  const [nfcFeedback, setNfcFeedback] = useState<{ status: string; message: string } | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.listSessions({ size: 20 });
      if (res.data) {
        setSessions(res.data);
        if (!activeSession && res.data.length > 0) {
          selectSession(res.data[0]);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: AttendanceSessionResponse) => {
    setActiveSession(session);
    setLoadingRecords(true);
    try {
      const res = await attendanceApi.getSessionRecords(session.id);
      if (res.data) {
        setRecords(res.data);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    academicApi.listClasses({ size: 50 }).then((r) => r.data && setClasses(r.data));
    teacherApi.list({ size: 50 }).then((r) => r.data && setTeachers(r.data));
    academicApi.listSubjects({ size: 50 }).then((r) => r.data && setSubjects(r.data));
    studentApi.list({ size: 100 }).then((r) => r.data && setStudents(r.data));
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassId || !newTeacherId || !newSubjectId) {
      toastError('Please select Class, Teacher, and Subject.');
      return;
    }

    try {
      const res = await attendanceApi.createSession({
        classId: Number(newClassId),
        teacherId: Number(newTeacherId),
        subjectId: Number(newSubjectId),
        startTime: newStartTime,
        endTime: newEndTime,
      });
      success('Attendance session opened successfully!');
      setIsCreateOpen(false);
      fetchSessions();
      if (res.data) {
        selectSession(res.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to create attendance session.');
    }
  };

  const handleMarkSingle = async (studentId: number, status: AttendanceStatus) => {
    if (!activeSession) return;
    try {
      await attendanceApi.markSingle(activeSession.id, studentId, status);
      success(`Attendance marked: ${status}`);
      selectSession(activeSession);
    } catch (err: any) {
      toastError(err?.message || 'Unable to mark attendance.');
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await attendanceApi.closeSession(activeSession.id);
      success('Attendance session closed.');
      fetchSessions();
    } catch (err: any) {
      toastError(err?.message || 'Failed to close session.');
    }
  };

  // Handle NFC tap simulation or scanned card UID / studentId
  const handleNfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) {
      warning('Please select an active session first.');
      return;
    }
    if (activeSession.status === 'CLOSED') {
      warning('Selected session is closed.');
      return;
    }

    const query = nfcInput.trim().toUpperCase();
    if (!query) return;

    // Match student by ID number or name
    const matched = students.find(
      (s) =>
        s.studentIdNumber?.toUpperCase() === query ||
        String(s.id) === query ||
        s.fullName?.toUpperCase().includes(query)
    );

    if (!matched) {
      setNfcFeedback({
        status: 'error',
        message: `Unknown NFC card UID or student ID: ${query}`,
      });
      setTimeout(() => setNfcFeedback(null), 3500);
      setNfcInput('');
      return;
    }

    // Check if already marked
    const isAlreadyMarked = records.some((r) => r.studentId === matched.id);
    if (isAlreadyMarked) {
      setNfcFeedback({
        status: 'warning',
        message: `Already marked present: ${matched.fullName} (${matched.studentIdNumber})`,
      });
      setTimeout(() => setNfcFeedback(null), 3500);
      setNfcInput('');
      return;
    }

    try {
      await attendanceApi.markSingle(activeSession.id, matched.id, 'PRESENT', 'NFC Smart Card Reader Tap');
      setNfcFeedback({
        status: 'success',
        message: `NFC Verified: ${matched.fullName} marked PRESENT`,
      });
      success(`NFC Tap: ${matched.fullName} recorded`);
      selectSession(activeSession);
    } catch (err: any) {
      setNfcFeedback({
        status: 'error',
        message: err?.message || 'NFC registration error',
      });
    } finally {
      setNfcInput('');
      setTimeout(() => setNfcFeedback(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Attendance & NFC Terminal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live classroom attendance sessions, instant student marking, and NFC card verification
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-md)', gap: '0.5rem' }}
        >
          <Plus size={18} />
          <span>Launch New Session</span>
        </button>
      </div>

      {/* Main Grid: Left Sessions / Right Live Terminal & Records */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '1.75rem',
        }}
      >
        {/* Left: Sessions List */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Active & Past Sessions</span>
            <span className="badge badge-info">{sessions.length} total</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={20} className="animate-spin" color="var(--primary-500)" />
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No attendance sessions created yet. Click "Launch New Session".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '600px', overflowY: 'auto' }}>
              {sessions.map((s) => {
                const isSelected = activeSession?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s)}
                    className={`glass-card ${isSelected ? 'glass-card-interactive' : ''}`}
                    style={{
                      cursor: 'pointer',
                      padding: '1rem',
                      borderColor: isSelected ? 'var(--primary-500)' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {s.className}
                      </span>
                      <span
                        className={`badge ${s.status === 'OPEN' ? 'badge-success' : 'badge-neutral'}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.subjectName} • {s.teacherName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      <Calendar size={12} />
                      <span>{s.sessionDate}</span>
                      {s.startTime && <span>({s.startTime} - {s.endTime})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Session & NFC Terminal Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeSession ? (
            <>
              {/* Session Overview Card */}
              <div
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      {activeSession.className} — {activeSession.subjectName}
                    </h2>
                    <span className={`badge ${activeSession.status === 'OPEN' ? 'badge-success' : 'badge-neutral'}`}>
                      {activeSession.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Instructor: {activeSession.teacherName} • Date: {activeSession.sessionDate} • Recorded Students: {records.length}
                  </p>
                </div>

                {activeSession.status === 'OPEN' && (
                  <button
                    onClick={handleCloseSession}
                    className="btn btn-danger btn-sm"
                    style={{ borderRadius: 'var(--radius-md)', gap: '0.4rem' }}
                  >
                    <XCircle size={14} />
                    <span>Close Session</span>
                  </button>
                )}
              </div>

              {/* NFC Terminal Fast Tap Bar */}
              {activeSession.status === 'OPEN' && (
                <div
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Radio size={18} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      NFC Contactless Terminal Simulation
                    </span>
                  </div>

                  <form onSubmit={handleNfcSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Scan or enter Student ID (e.g., BFA-2026-0001 or Kamal)..."
                      value={nfcInput}
                      onChange={(e) => setNfcInput(e.target.value)}
                      style={{ flex: 1, minWidth: '260px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
                      <Zap size={16} />
                      <span>Simulate NFC Tap</span>
                    </button>
                  </form>

                  {/* Terminal Notification Banner */}
                  {nfcFeedback && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.65rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background:
                          nfcFeedback.status === 'success'
                            ? 'var(--success-bg)'
                            : nfcFeedback.status === 'warning'
                            ? 'var(--warning-bg)'
                            : 'var(--danger-bg)',
                        color:
                          nfcFeedback.status === 'success'
                            ? 'var(--success-text)'
                            : nfcFeedback.status === 'warning'
                            ? 'var(--warning-text)'
                            : 'var(--danger-text)',
                        border: `1px solid ${
                          nfcFeedback.status === 'success'
                            ? 'var(--success-border)'
                            : nfcFeedback.status === 'warning'
                            ? 'var(--warning-border)'
                            : 'var(--danger-border)'
                        }`,
                      }}
                    >
                      {nfcFeedback.status === 'success' && <CheckCircle2 size={16} />}
                      {nfcFeedback.status === 'warning' && <AlertTriangle size={16} />}
                      {nfcFeedback.status === 'error' && <XCircle size={16} />}
                      <span>{nfcFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Records Table */}
              <div className="table-container">
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Session Attendance Log ({records.length} Marked)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Synced with MySQL backend table: attendance_records
                  </span>
                </div>

                {loadingRecords ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
                  </div>
                ) : records.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students marked in this session yet. Tap an NFC card or mark below.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Check-in Time</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Recorded By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {r.studentIdNumber}
                          </td>
                          <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}
                          </td>
                          <td>
                            <span className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>
                              {r.markingMethod || 'MANUAL'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === 'PRESENT'
                                  ? 'badge-success'
                                  : r.status === 'LATE'
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {r.markedByName || 'System'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select an attendance session on the left or create a new session.
            </div>
          )}
        </div>
      </div>

      {/* Launch Session Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Launch Attendance Session</h3>
              <button onClick={() => setIsCreateOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label className="form-label">Class Cohort *</label>
                <select
                  required
                  className="form-select"
                  value={newClassId}
                  onChange={(e) => setNewClassId(Number(e.target.value))}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} (Grade {c.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select
                  required
                  className="form-select"
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(Number(e.target.value))}
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Instructing Teacher *</label>
                <select
                  required
                  className="form-select"
                  value={newTeacherId}
                  onChange={(e) => setNewTeacherId(Number(e.target.value))}
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Open Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
