import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { studentApi, academicApi } from '../../api/services';
import { StudentResponse, StudentCreateRequest, ClassResponse } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const StudentManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const { success, error: toastError } = useToast();

  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [enrollClassId, setEnrollClassId] = useState<number | ''>('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    email: string;
    studentIdNumber: string;
    temporaryPassword: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<StudentCreateRequest>({
    email: '',
    password: 'Password@123',
    firstName: '',
    lastName: '',
    phone: '',
    studentIdNumber: '',
    dateOfBirth: '2008-01-01',
    gender: 'MALE',
    city: 'Colombo',
    district: 'Colombo',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: 'Father',
  });

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.list({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setStudents(res.data);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalElements(res.pagination.totalElements || 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve students from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchStudents();
  };

  const handleStatusToggle = async (student: StudentResponse) => {
    const nextStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await studentApi.updateStatus(student.id, nextStatus);
      success(`Updated status of ${student.fullName} to ${nextStatus}`);
      fetchStudents();
    } catch (err: any) {
      toastError(err?.message || 'Status update failed.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await studentApi.create(formData);
      const studentData = res.data;
      success('Student account created successfully in MySQL!');
      setIsCreateOpen(false);
      setCreatedCredentials({
        fullName: studentData?.fullName || `${formData.firstName} ${formData.lastName}`,
        email: studentData?.email || formData.email,
        studentIdNumber: studentData?.studentIdNumber || 'Generated',
        temporaryPassword: formData.password || 'Password@123',
      });
      setFormData({
        email: '',
        password: 'Password@123',
        firstName: '',
        lastName: '',
        phone: '',
        studentIdNumber: '',
        dateOfBirth: '2008-01-01',
        gender: 'MALE',
        city: 'Colombo',
        district: 'Colombo',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: 'Father',
      });
      fetchStudents();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create student.');
    }
  };

  const openEnrollModal = async (student: StudentResponse) => {
    setSelectedStudent(student);
    try {
      const res = await academicApi.listClasses({ size: 50 });
      if (res.data) {
        setClasses(res.data);
      }
    } catch {}
    setIsEnrollOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !enrollClassId) return;
    try {
      await studentApi.enroll(selectedStudent.id, Number(enrollClassId), 2026);
      success(`Enrolled ${selectedStudent.fullName} successfully!`);
      setIsEnrollOpen(false);
      fetchStudents();
    } catch (err: any) {
      toastError(err?.message || 'Class enrollment failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Student Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage student registrations, personal demographics, and class enrollments
          </p>
        </div>

        {hasRole('ADMINISTRATOR') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-md)', gap: '0.5rem' }}
          >
            <Plus size={18} />
            <span>Register New Student</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or Student ID..."
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem' }}>
            <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
            <span style={{ color: 'var(--text-secondary)' }}>Loading students from database...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger-text)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
            <div>{error}</div>
            <button onClick={fetchStudents} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <div style={{ fontWeight: 600 }}>No students found matching your criteria.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Gender</th>
                <th>Emergency Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-400)' }}>
                      {student.studentIdNumber || `BFA-${student.id}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.city}</div>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.gender || '—'}</td>
                  <td>
                    <div style={{ fontSize: '0.825rem' }}>{student.emergencyContactName || '—'}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {student.emergencyContactPhone}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEnrollModal(student)}
                        className="btn btn-secondary btn-sm"
                        title="Enroll into Class"
                        style={{ padding: '0.35rem 0.65rem', gap: '0.3rem' }}
                      >
                        <BookOpen size={13} />
                        <span>Enroll</span>
                      </button>
                      <button
                        onClick={() => handleStatusToggle(student)}
                        className={`btn ${student.status === 'ACTIVE' ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
                        title={student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        {student.status === 'ACTIVE' ? (
                          <XCircle size={14} color="var(--danger-text)" />
                        ) : (
                          <CheckCircle2 size={14} color="var(--success-text)" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Showing page {page + 1} of {totalPages} ({totalElements} total students)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn btn-secondary btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Register New Student</h3>
              <button onClick={() => setIsCreateOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address (Login Username) *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Initial Password *</span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--accent-cyan)' }}>Min 8 chars</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      className="form-input"
                      placeholder="e.g. Password@123"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                    >
                      {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Enrollment Modal */}
      {isEnrollOpen && selectedStudent && (
        <div className="modal-backdrop" onClick={() => setIsEnrollOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Class Enrollment</h3>
              <button onClick={() => setIsEnrollOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Enroll <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.fullName}</strong> ({selectedStudent.studentIdNumber}) into an active class cohort:
            </p>

            <form onSubmit={handleEnrollSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Class *</label>
                <select
                  required
                  className="form-select"
                  value={enrollClassId}
                  onChange={(e) => setEnrollClassId(Number(e.target.value))}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} (Grade {c.gradeLevel} - {c.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsEnrollOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Credentials Summary Modal */}
      {createdCredentials && (
        <div className="modal-backdrop" onClick={() => setCreatedCredentials(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '2rem' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #10b981 0%, var(--accent-cyan) 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  marginBottom: '1rem',
                }}
              >
                <KeyRound size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Student User Account Created
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                A dedicated system user account has been registered and persisted in MySQL.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Student Name
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {createdCredentials.fullName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Student ID Number
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {createdCredentials.studentIdNumber}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Login Email
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {createdCredentials.email}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Initial Temporary Password
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.35rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-block',
                  }}
                >
                  {createdCredentials.temporaryPassword}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              ℹ️ The student must use these credentials to sign in. Upon first login, they will be required to set their permanent password.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, gap: '0.5rem' }}
                onClick={() => {
                  const text = `Bright Future Academy Student Portal\nStudent: ${createdCredentials.fullName}\nID: ${createdCredentials.studentIdNumber}\nLogin Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}`;
                  navigator.clipboard.writeText(text);
                  setCopiedCredentials(true);
                  setTimeout(() => setCopiedCredentials(false), 2500);
                }}
              >
                {copiedCredentials ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{copiedCredentials ? 'Copied to Clipboard' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setCreatedCredentials(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
