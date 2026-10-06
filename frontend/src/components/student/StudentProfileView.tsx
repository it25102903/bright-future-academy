import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Lock,
  Loader2,
  GraduationCap,
  Users,
  X,
  Save,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { studentApi, authApi } from '../../api/services';
import { StudentResponse, StudentProfileUpdateRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const StudentProfileView: React.FC = () => {
  const { user, refreshProfile: refreshAuthUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toastError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      toastError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match.');
      return;
    }
    if (newPassword === oldPassword) {
      toastError('New password must be different from current password.');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: oldPassword, newPassword });
      success('Password changed successfully! Stored securely in database.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshAuthUser();
    } catch (err: any) {
      toastError(err?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState<StudentProfileUpdateRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    bloodGroup: '',
    medicalNotes: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMyProfile();
      if (res.data) {
        setStudent(res.data);
        populateForm(res.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: StudentResponse) => {
    setFormData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || '',
      district: data.district || '',
      postalCode: data.postalCode || '',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      emergencyContactRelationship: data.emergencyContactRelationship || '',
      bloodGroup: data.bloodGroup || '',
      medicalNotes: data.medicalNotes || '',
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toastError('First name and Last name are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await studentApi.updateMyProfile(formData);
      if (res.data) {
        setStudent(res.data);
        populateForm(res.data);
        await refreshAuthUser();
        success('Profile updated successfully and saved to MySQL!');
        setIsEditing(false);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-400)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--danger-text)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Profile Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Could not retrieve your student record. Please verify your connection.
        </p>
        <button className="btn-primary" onClick={loadProfile}>
          <RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              My Student Profile
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--success-bg)',
                color: 'var(--success-text)',
                border: '1px solid var(--success-border)',
              }}
            >
              <CheckCircle2 size={13} /> {student.status}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            View your verified student records and manage your editable personal contact information.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            populateForm(student);
            setIsEditing(true);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Edit3 size={16} /> Edit Personal Information
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Personal & Account Information */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-400)',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Identity & Contact
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Personal credentials & location
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Legal Name</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.fullName || `${student.firstName} ${student.lastName}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.email}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Contact Phone</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.phone || 'Not provided'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Date of Birth</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.dateOfBirth || 'Not provided'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Gender</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.gender || 'Not specified'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Residential Address</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>
                {[student.addressLine1, student.addressLine2, student.city, student.district, student.postalCode]
                  .filter(Boolean)
                  .join(', ') || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic & Protected Status */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Academic Enrollment
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                System-controlled credentials
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} color="var(--text-muted)" /> Official Student ID
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.2rem 0.6rem',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--accent-cyan)',
                }}
              >
                {student.studentIdNumber}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} color="var(--text-muted)" /> User Role
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                STUDENT
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} color="var(--text-muted)" /> Admission Date
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.admissionDate || 'Not specified'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} color="var(--text-muted)" /> Active Classes
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.enrollments && student.enrollments.length > 0
                  ? student.enrollments.map((e) => e.className).join(', ')
                  : 'Not enrolled'}
              </span>
            </div>

            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <Shield size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Academic records, student ID, and enrollment status are managed exclusively by the Academy Registrar.
            </div>
          </div>
        </div>

        {/* Emergency Contact & Health Notes */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ec4899',
              }}
            >
              <Heart size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Emergency & Health Notes
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Crucial contact & medical details
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Emergency Contact Name</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.emergencyContactName || 'Not provided'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Emergency Phone</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.emergencyContactPhone || 'Not provided'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Relationship</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.emergencyContactRelationship || 'Not provided'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Blood Group</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.bloodGroup || 'Not provided'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Medical Notes / Allergies:
              </span>
              <p
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {student.medicalNotes || 'No known allergies or medical restrictions recorded.'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Security & Password */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Security & Password
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Manage account login credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                New Password (min 8 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new permanent password"
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={changingPassword}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                padding: '0.65rem 1rem',
              }}
            >
              {changingPassword ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating Password...
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Edit Personal Profile
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Update your contact, location, and emergency information. Changes persist directly to MySQL.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="+94771234567"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Address Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1 || ''}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2 || ''}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    placeholder="Colombo"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleInputChange}
                    placeholder="Colombo"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode || ''}
                    onChange={handleInputChange}
                    placeholder="00100"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Emergency Contact & Health */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship || ''}
                    onChange={handleInputChange}
                    placeholder="Father / Mother"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Medical Notes / Special Requirements
                </label>
                <textarea
                  name="medicalNotes"
                  value={formData.medicalNotes || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Record any allergies, dietary requirements, or medications..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Profile Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
