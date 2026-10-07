import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  Award,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Lock,
  Loader2,
  Camera,
  Trash2,
  Save,
  X,
  RefreshCw,
  Hash,
  UploadCloud,
} from 'lucide-react';
import { teacherApi } from '../../api/services';
import { TeacherResponse, TeacherProfileUpdateRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TeacherAvatar } from '../common/TeacherAvatar';

export const TeacherProfileView: React.FC = () => {
  const { user, refreshProfile: refreshAuthUser } = useAuth();
  const { success, error: toastError, warning } = useToast();

  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<TeacherProfileUpdateRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    qualification: '',
    specialization: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getMyProfile();
      if (res.data) {
        setTeacher(res.data);
        populateForm(res.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load teacher profile details.');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: TeacherResponse) => {
    setFormData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      qualification: data.qualification || '',
      specialization: data.specialization || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || '',
      district: data.district || '',
      postalCode: data.postalCode || '',
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (teacher) {
      populateForm(teacher);
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toastError('First name and last name are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await teacherApi.updateMyProfile(formData);
      if (res.data) {
        setTeacher(res.data);
        populateForm(res.data);
        success('Faculty profile updated successfully!');
        setIsEditing(false);
        // Refresh AuthContext so updated full name reflects across navbar
        refreshAuthUser();
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Photo Upload Handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toastError('Please choose a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('Image file size must be less than 5MB.');
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setUploadingPhoto(true);

    try {
      const res = await teacherApi.uploadProfilePhoto(file);
      if (res.data) {
        setTeacher(res.data);
        setPhotoPreview(null);
        success('Profile photo updated successfully!');
        refreshAuthUser();
      }
    } catch (err: any) {
      setPhotoPreview(null);
      toastError(err?.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!teacher?.profileImagePath) return;
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    setUploadingPhoto(true);
    try {
      const res = await teacherApi.deleteProfilePhoto();
      if (res.data) {
        setTeacher(res.data);
        setPhotoPreview(null);
        success('Profile photo removed.');
        refreshAuthUser();
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-500)" />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Loading your faculty profile...
        </span>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <AlertCircle size={44} color="var(--danger-text)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Faculty Profile Not Found
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Unable to locate a teacher profile associated with your user account.
        </p>
        <button onClick={loadProfile} className="btn btn-secondary btn-sm" style={{ gap: '0.5rem' }}>
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const currentPhoto = photoPreview || teacher.profileImagePath;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Profile Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2.25rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--primary-500), var(--accent-cyan))',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            {/* Profile Avatar & Upload trigger */}
            <div style={{ position: 'relative' }}>
              <TeacherAvatar
                photoUrl={currentPhoto}
                name={teacher.fullName}
                size="2xl"
              />

              {uploadingPhoto && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                  }}
                >
                  <Loader2 size={24} className="animate-spin" color="var(--primary-400)" />
                  <span>Uploading</span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="btn btn-primary"
                title="Upload new profile photo"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                }}
              >
                <Camera size={18} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {teacher.fullName}
                </h1>
                <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Hash size={12} />
                  <span>{teacher.employeeId}</span>
                </span>
                <span className={`badge ${teacher.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                  {teacher.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  <Award size={15} />
                  <span>{teacher.specialization || 'General Faculty'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={15} color="var(--text-muted)" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} color="var(--text-muted)" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo Management Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.45rem' }}
            >
              <UploadCloud size={15} />
              <span>Change Photo</span>
            </button>

            {teacher.profileImagePath && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger-text)', gap: '0.45rem' }}
              >
                <Trash2 size={15} />
                <span>Remove</span>
              </button>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.45rem' }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.45rem' }}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Content: Edit Form + Read Only System Details */}
      <form onSubmit={handleSaveProfile}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {/* Section 1: Permitted Personal & Academic Info (Editable) */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personal & Faculty Details</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: isEditing ? 'var(--primary-400)' : 'var(--text-muted)' }}>
                {isEditing ? 'Editing Enabled' : 'View Mode'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  disabled={!isEditing}
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  disabled={!isEditing}
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                type="text"
                name="phone"
                disabled={!isEditing}
                className="form-input"
                placeholder="+94771234567"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructional Specialization</label>
              <input
                type="text"
                name="specialization"
                disabled={!isEditing}
                className="form-input"
                placeholder="e.g. Mathematics, ICT, English"
                value={formData.specialization}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Qualifications</label>
              <input
                type="text"
                name="qualification"
                disabled={!isEditing}
                className="form-input"
                placeholder="e.g. B.Sc. in Mathematics, PGDE"
                value={formData.qualification}
                onChange={handleInputChange}
              />
            </div>

            {/* Address fields */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <MapPin size={15} color="var(--accent-cyan)" />
                <span>Residential Address</span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  disabled={!isEditing}
                  className="form-input"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  disabled={!isEditing}
                  className="form-input"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>City</label>
                  <input
                    type="text"
                    name="city"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>District</label>
                  <input
                    type="text"
                    name="district"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Save / Cancel action buttons when editing */}
            {isEditing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '0.5rem' }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn btn-secondary"
                  style={{ gap: '0.4rem' }}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Protected Institutional & System Details (Read-Only) */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="var(--text-muted)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>System & Institutional Credentials</h3>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                System Protected
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Institutional Employee ID
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                  {teacher.employeeId}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Authentication Email (Login ID)
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {teacher.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Managed by institutional IT administrator
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Access Role
                  </div>
                  <span className="badge badge-primary">TEACHER</span>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Employment Status
                  </div>
                  <span className="badge badge-neutral">{teacher.employmentStatus || 'FULL_TIME'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Appointment Date
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {teacher.hireDate || '2020-01-15'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    National ID (NIC)
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {teacher.nicNumber || '198561500123'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Date of Birth
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {teacher.dateOfBirth || '1985-06-15'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Gender
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {teacher.gender || 'FEMALE'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>Verified Faculty Member</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  Academic workload, timetable period assignments, and campus attendance credentials are authenticated against the Bright Future Academy database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
