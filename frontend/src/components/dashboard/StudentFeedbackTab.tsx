import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Clock,
  UserCheck,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { studentFeedbackApi, teacherApi } from '../../api/services';
import { StudentFeedbackResponse, TeacherResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

export const StudentFeedbackTab: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [feedbacks, setFeedbacks] = useState<StudentFeedbackResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [selectedTeacherUserId, setSelectedTeacherUserId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await studentFeedbackApi.getMyFeedbacks();
      if (res.data) setFeedbacks(res.data);
    } catch (err: any) {
      toastError('Failed to load your feedback submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await teacherApi.list({ size: 100 });
      if (res.data) setTeachers(res.data);
    } catch {
      // Ignore if teacher list is restricted
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchTeachers();
  }, []);

  const handleOpenCompose = () => {
    setSelectedTeacherUserId('');
    setSubject('');
    setMessage('');
    setIsComposeOpen(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toastError('Subject and message are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        teacherUserId: selectedTeacherUserId ? Number(selectedTeacherUserId) : undefined,
        subject: subject.trim(),
        message: message.trim(),
      };
      const res = await studentFeedbackApi.create(payload);
      if (res.data) {
        setFeedbacks((prev) => [res.data, ...prev]);
        setIsComposeOpen(false);
        success('Your feedback has been sent to your teacher successfully!');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await studentFeedbackApi.deleteFeedback(deleteTargetId);
      setFeedbacks((prev) => prev.filter((f) => f.id !== deleteTargetId));
      setDeleteTargetId(null);
      success('Feedback entry deleted.');
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Student Feedback & Communications
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Send questions, suggestions, or feedback directly to your teachers or faculty.
          </p>
        </div>

        <button onClick={handleOpenCompose} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          <span>Send Feedback</span>
        </button>
      </div>

      {/* Feedbacks Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            No feedback entries submitted yet
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            Click "Send Feedback" above to write a note or question to your teacher.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word' }}>
                    {item.subject}
                  </h3>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                    {item.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.85rem' }}>
                  <UserCheck size={14} />
                  <span>To: {item.teacherName}</span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
                  {item.message}
                </p>
              </div>

              <div
                style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setDeleteTargetId(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--danger-400)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.75rem',
                  }}
                  title="Delete feedback entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composition Modal */}
      {isComposeOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{ width: '100%', maxWidth: '540px', padding: '2rem', borderRadius: 'var(--radius-lg)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Send size={20} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Send Feedback to Teacher
                </h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Teacher Selector */}
              <div className="form-group">
                <label className="form-label">Recipient Teacher (Optional)</label>
                <select
                  className="form-input"
                  value={selectedTeacherUserId}
                  onChange={(e) => setSelectedTeacherUserId(e.target.value)}
                >
                  <option value="">All Faculty & Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.userId || ''}>
                      {t.fullName} ({t.specialization || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label">Subject / Topic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Question about Mathematics Homework / Grade 10"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Write your note, question, or suggestion to your teacher..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ gap: '0.4rem' }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{ width: '100%', maxWidth: '420px', padding: '1.75rem', textAlign: 'center' }}
          >
            <AlertCircle size={40} color="var(--danger-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Delete Feedback Entry?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Are you sure you want to remove this feedback submission? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteTargetId(null)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFeedback}
                className="btn btn-danger"
                disabled={isDeleting}
                style={{ gap: '0.4rem' }}
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
