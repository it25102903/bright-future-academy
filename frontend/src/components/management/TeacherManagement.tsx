import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { teacherApi } from '../../api/services';
import { TeacherResponse, TeacherCreateRequest } from '../../types';
import { useToast } from '../../context/ToastContext';
import { TeacherAvatar } from '../common/TeacherAvatar';

export const TeacherManagement: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState<TeacherCreateRequest>({
    email: '',
    password: 'Password@123',
    firstName: '',
    lastName: '',
    phone: '',
    employeeId: '',
    qualification: 'B.Sc. in Mathematics',
    specialization: 'Mathematics',
    employmentStatus: 'FULL_TIME',
    gender: 'FEMALE',
    dateOfBirth: '1988-01-01',
    hireDate: new Date().toISOString().split('T')[0],
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.list({ search: search.trim() || undefined, size: 50 });
      if (res.data) setTeachers(res.data);
    } catch (err: any) {
      toastError(err?.message || 'Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleStatusToggle = async (t: TeacherResponse) => {
    const nextStatus = t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await teacherApi.updateStatus(t.id, nextStatus);
      success(`Updated teacher status to ${nextStatus}`);
      fetchTeachers();
    } catch (err: any) {
      toastError(err?.message || 'Status update failed.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teacherApi.create(formData);
      success('Teacher appointed successfully!');
      setIsCreateOpen(false);
      setFormData({
        email: '',
        password: 'Password@123',
        firstName: '',
        lastName: '',
        phone: '',
        employeeId: '',
        qualification: 'B.Sc. in Mathematics',
        specialization: 'Mathematics',
        employmentStatus: 'FULL_TIME',
        gender: 'FEMALE',
        dateOfBirth: '1988-01-01',
        hireDate: new Date().toISOString().split('T')[0],
      });
      fetchTeachers();
    } catch (err: any) {
      toastError(err?.message || 'Teacher appointment failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Faculty & Teachers
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Faculty appointments, academic specializations, and departmental assignments
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-md)', gap: '0.5rem' }}
        >
          <Plus size={18} />
          <span>Appoint New Teacher</span>
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
          </div>
        ) : teachers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No teachers found in the registry.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Instructor Name</th>
                <th>Email & Phone</th>
                <th>Specialization & Qualification</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-400)' }}>
                    {t.employeeId || `TCH-${t.id}`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <TeacherAvatar
                        photoUrl={t.profileImagePath}
                        name={t.fullName}
                        size="md"
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {t.employmentStatus}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{t.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.phone || '—'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.specialization}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.qualification}</div>
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleStatusToggle(t)}
                      className="btn btn-secondary btn-sm"
                      title={t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    >
                      {t.status === 'ACTIVE' ? (
                        <XCircle size={14} color="var(--danger-text)" />
                      ) : (
                        <CheckCircle2 size={14} color="var(--success-text)" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Appoint New Faculty Member</h3>
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
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID (TCH-...)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Auto-assigned if empty"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialization Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Qualification</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hire Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Employment Status</label>
                  <select
                    className="form-select"
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  >
                    <option value="FULL_TIME">FULL_TIME</option>
                    <option value="PART_TIME">PART_TIME</option>
                    <option value="VISITING">VISITING</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
