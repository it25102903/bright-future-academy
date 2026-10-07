import React, { useState, useEffect } from 'react';
import { MessageSquare, Shield, Clock, Loader2, Mail, Phone, Users } from 'lucide-react';
import { parentFeedbackApi } from '../../api/services';
import { ParentFeedbackResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminFeedbackView: React.FC = () => {
  const { error: toastError } = useToast();
  const [feedbacks, setFeedbacks] = useState<ParentFeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await parentFeedbackApi.getAdminFeedbacks();
      if (res.data) setFeedbacks(res.data);
    } catch (err: any) {
      toastError('Failed to load parent feedback entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminFeedbacks();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Parent Feedback — Administration
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Feedback and suggestions submitted by guardians directed to the school administration.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <div>No parent feedback entries found addressed to administration.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {feedbacks.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {item.subject}
                  </h3>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    {item.targetAudience === 'ADMINISTRATORS' ? 'Admin Only' : 'Teachers + Admins'}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
                  {item.message}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={14} color="var(--accent-cyan)" />
                  <span>Submitted by: {item.parentName}</span>
                </div>
                {item.parentEmail && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={12} />
                    <span>{item.parentEmail}</span>
                  </div>
                )}
                {item.parentPhone && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={12} />
                    <span>{item.parentPhone}</span>
                  </div>
                )}
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
