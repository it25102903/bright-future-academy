import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  HeartHandshake,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { parentProfileApi } from '../../api/services';
import { ParentProfileResponse, ParentProfileUpdateRequest } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ParentProfileTab: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [profile, setProfile] = useState<ParentProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ParentProfileUpdateRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    nicNumber: '',
    occupation: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await parentProfileApi.getMyProfile();
      if (res.data) {
        setProfile(res.data);
        populateForm(res.data);
      }
    } catch (err: any) {
      toastError('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: ParentProfileResponse) => {
    setFormData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      nicNumber: data.nicNumber || '',
      occupation: data.occupation || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || '',
      district: data.district || '',
      postalCode: data.postalCode || '',
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      toastError('First name, last name, and phone are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await parentProfileApi.updateMyProfile(formData);
      if (res.data) {
        setProfile(res.data);
        populateForm(res.data);
        setIsEditing(false);
        success('Profile updated successfully!');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) populateForm(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Unable to load parent profile.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Guardian / Parent Profile
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage your personal contact info and view linked account details.
          </p>
        </div>

        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCancel} className="btn btn-secondary" disabled={isSaving}>
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button onClick={handleSave} className="btn btn-primary" disabled={isSaving} style={{ gap: '0.4rem' }}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Main Card */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Identity Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.5rem',
              }}
            >
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {profile.fullName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{profile.relationship}</span>
                <span className="badge badge-success">{profile.status}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {profile.linkedChildrenCount} Linked {profile.linkedChildrenCount === 1 ? 'Child' : 'Children'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* First Name */}
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? formData.firstName : profile.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? formData.lastName : profile.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Email (Read Only) */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Email Address</span>
                <span title="System Protected Field"><ShieldAlert size={12} color="var(--text-muted)" /></span>
              </label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-surface)' }}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? formData.phone : profile.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            {/* NIC Number */}
            <div className="form-group">
              <label className="form-label">NIC / National Identity Card</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? formData.nicNumber : profile.nicNumber || ''}
                onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g. 198512345678"
              />
            </div>

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label">Occupation / Profession</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? formData.occupation : profile.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>

          {/* Address Section */}
          <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="var(--primary-400)" />
              <span>Residential Address Details</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Address Line 1</label>
                <input
                  type="text"
                  className="form-input"
                  value={isEditing ? formData.addressLine1 : profile.addressLine1 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Street / House No."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 2</label>
                <input
                  type="text"
                  className="form-input"
                  value={isEditing ? formData.addressLine2 : profile.addressLine2 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Apartment / Locality"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={isEditing ? formData.city : profile.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g. Colombo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  className="form-input"
                  value={isEditing ? formData.district : profile.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g. Colombo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={isEditing ? formData.postalCode : profile.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g. 00500"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
