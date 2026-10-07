import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Users,
  Shield,
  Layers,
  Clock,
  X,
  CheckCircle2,
} from 'lucide-react';
import { parentFeedbackApi } from '../../api/services';
import { ParentFeedbackResponse, FeedbackAudience } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ParentFeedbackTab: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [feedbacks, setFeedbacks] = useState<ParentFeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // New feedback modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<FeedbackAudience>('TEACHERS_AND_ADMINISTRATORS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await parentFeedbackApi.getMyFeedbacks();
      if (res.data) {
        setFeedbacks(res.data);
      }
    } catch (err: any) {
      toastError('Failed to load feedback records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFormError('Please provide both subject and message.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await parentFeedbackApi.create({
        subject: subject.trim(),
        message: message.trim(),
        targetAudience,
      });
      success('Feedback submitted successfully!');
      setIsCreateOpen(false);
      setSubject('');
      setMessage('');
      setTargetAudience('TEACHERS_AND_ADMINISTRATORS');
      fetchFeedbacks();
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit feedback';
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await parentFeedbackApi.deleteFeedback(deletingId);
      success('Feedback deleted successfully');
      setDeletingId(null);
      fetchFeedbacks();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderAudienceBadge = (audience: FeedbackAudience) => {
    switch (audience) {
      case 'TEACHERS':
        return (
          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={12} />
            <span>Teachers Only</span>
          </span>
        );
      case 'ADMINISTRATORS':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={12} />
            <span>Administrators Only</span>
          </span>
        );
      case 'TEACHERS_AND_ADMINISTRATORS':
      default:
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={12} />
            <span>Teachers + Administrators</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Parent Feedback & Suggestions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Share your feedback, inquiries, or suggestions directly with school staff and leadership.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateOpen(true);
          }}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>New Feedback</span>
        </button>
      </div>

      {/* Main Content List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={38} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Feedback Submitted Yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            You haven't submitted any feedback records. Create your first suggestion or query above.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ margin: '0 auto' }}
          >
            Submit Feedback
          </button>
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
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {item.subject}
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {item.status}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {item.message}
                </p>
              </div>

              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>{renderAudienceBadge(item.targetAudience)}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setDeletingId(item.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger-text)', padding: '0.35rem 0.6rem', gap: '0.3rem' }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MessageSquare size={20} color="var(--primary-400)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Submit Parent Feedback</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="btn-ghost" style={{ padding: '0.3rem', border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  Subject / Title
                </label>
                <input
                  id="subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Inquiry regarding Grade 10 Math schedule"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Feedback Message
                </label>
                <textarea
                  id="message"
                  className="form-input"
                  rows={4}
                  placeholder="Type your message or suggestion here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label" style={{ marginBottom: '0.65rem' }}>
                  Who should be able to see this?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: targetAudience === 'TEACHERS' ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value="TEACHERS"
                      checked={targetAudience === 'TEACHERS'}
                      onChange={() => setTargetAudience('TEACHERS')}
                    />
                    <Users size={16} color="var(--accent-cyan)" />
                    <span>Teachers Only</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: targetAudience === 'ADMINISTRATORS' ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value="ADMINISTRATORS"
                      checked={targetAudience === 'ADMINISTRATORS'}
                      onChange={() => setTargetAudience('ADMINISTRATORS')}
                    />
                    <Shield size={16} color="#f59e0b" />
                    <span>Administrators Only</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: targetAudience === 'TEACHERS_AND_ADMINISTRATORS' ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value="TEACHERS_AND_ADMINISTRATORS"
                      checked={targetAudience === 'TEACHERS_AND_ADMINISTRATORS'}
                      onChange={() => setTargetAudience('TEACHERS_AND_ADMINISTRATORS')}
                    />
                    <Layers size={16} color="#10b981" />
                    <span>Teachers + Administrators</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem' }}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Feedback</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="modal-backdrop" onClick={() => setDeletingId(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '1.75rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--danger-text)' }}>
              <AlertCircle size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Delete Feedback?</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this feedback? This operation cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingId(null)}
                className="btn btn-secondary btn-sm"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-danger btn-sm"
                disabled={isDeleting}
                style={{ gap: '0.4rem' }}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
