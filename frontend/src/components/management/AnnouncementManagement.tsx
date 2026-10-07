import React, { useEffect, useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  X,
  Radio,
} from 'lucide-react';
import { announcementApi, academicApi } from '../../api/services';
import { AnnouncementResponse, AnnouncementCreateRequest, ClassResponse } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const AnnouncementManagement: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { success, error: toastError } = useToast();

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isAdmin = hasRole('ADMINISTRATOR');
  const isTeacher = hasRole('TEACHER');
  const canCreate = isAdmin || isTeacher;

  const [formData, setFormData] = useState<AnnouncementCreateRequest>({
    title: '',
    content: '',
    targetAudience: 'ALL',
    priority: 'NORMAL',
    publishImmediately: true,
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementApi.list({ size: 50 });
      if (res.data) setAnnouncements(res.data);
    } catch (err: any) {
      toastError(err?.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    academicApi.listClasses({ size: 100 }).then((res) => {
      if (res.data) setClasses(res.data);
    }).catch(() => {});
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await announcementApi.create({
        ...formData,
        publishImmediately: true,
      });
      success('Announcement published successfully!');
      setIsCreateOpen(false);
      setFormData({
        title: '',
        content: '',
        targetAudience: 'ALL',
        priority: 'NORMAL',
        publishImmediately: true,
      });
      fetchAnnouncements();
    } catch (err: any) {
      toastError(err?.message || 'Failed to broadcast announcement.');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await announcementApi.archive(id);
      success('Announcement archived.');
      fetchAnnouncements();
    } catch (err: any) {
      toastError(err?.message || 'Failed to archive.');
    }
  };

  const canArchiveNotice = (a: AnnouncementResponse) => {
    if (isAdmin) return true;
    if (isTeacher && user && (a.createdById === user.id || a.createdByName === user.fullName)) {
      return true;
    }
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Academy Bulletin & Announcements
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Campus notices, urgent alerts, and institutional broadcasts
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-md)', gap: '0.5rem' }}
          >
            <Plus size={18} />
            <span>Create Announcement</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <div>No official announcements published yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map((a) => (
            <div
              key={a.id}
              className="glass-card"
              style={{
                padding: '1.75rem',
                borderLeft: `4px solid ${
                  a.priority === 'URGENT'
                    ? 'var(--danger-text)'
                    : a.priority === 'HIGH'
                    ? 'var(--warning-text)'
                    : 'var(--primary-500)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    className={`badge ${
                      a.priority === 'URGENT'
                        ? 'badge-danger'
                        : a.priority === 'HIGH'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                  >
                    {a.priority}
                  </span>
                  <span className="badge badge-neutral">Audience: {a.targetAudience}</span>
                  {a.targetAudience === 'SPECIFIC_CLASS' && (a.targetClassName || a.className) && (
                    <span className="badge badge-neutral">Class: {a.targetClassName || a.className}</span>
                  )}
                  <span className="badge badge-neutral">{a.status}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {(a.createdByName || a.authorName) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={13} />
                      <span>{a.createdByName || a.authorName}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} />
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  {canArchiveNotice(a) && (
                    <button
                      onClick={() => handleArchive(a.id)}
                      title="Archive notice"
                      className="btn-ghost"
                      style={{ padding: '4px', color: 'var(--danger-text)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {a.title}
              </h3>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {a.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Broadcast Announcement</h3>
              <button onClick={() => setIsCreateOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term Examination Schedule Released"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  >
                    <option value="ALL">ALL (Entire Academy)</option>
                    <option value="TEACHERS">TEACHERS ONLY</option>
                    <option value="STUDENTS">STUDENTS ONLY</option>
                    <option value="PARENTS">PARENTS ONLY</option>
                    <option value="SPECIFIC_CLASS">SPECIFIC CLASS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Tier</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              {formData.targetAudience === 'SPECIFIC_CLASS' && (
                <div className="form-group">
                  <label className="form-label">Select Target Class *</label>
                  <select
                    required
                    className="form-select"
                    value={formData.targetClassId || formData.classId || ''}
                    onChange={(e) => {
                      const cid = Number(e.target.value);
                      setFormData({ ...formData, targetClassId: cid, classId: cid });
                    }}
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className} (Grade {cls.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
