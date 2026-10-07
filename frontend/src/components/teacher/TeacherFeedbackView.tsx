import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Clock, Loader2, Mail, Phone, HeartHandshake, UserCheck } from 'lucide-react';
import { parentFeedbackApi, studentFeedbackApi } from '../../api/services';
import { ParentFeedbackResponse, StudentFeedbackResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

export const TeacherFeedbackView: React.FC = () => {
  const { error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'parent' | 'student'>('parent');
  const [parentFeedbacks, setParentFeedbacks] = useState<ParentFeedbackResponse[]>([]);
  const [studentFeedbacks, setStudentFeedbacks] = useState<StudentFeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const [parentRes, studentRes] = await Promise.all([
        parentFeedbackApi.getTeacherFeedbacks().catch(() => ({ data: [] })),
        studentFeedbackApi.getTeacherFeedbacks().catch(() => ({ data: [] })),
      ]);
      if (parentRes.data) setParentFeedbacks(parentRes.data);
      if (studentRes.data) setStudentFeedbacks(studentRes.data);
    } catch (err: any) {
      toastError('Failed to load feedback entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Communications & Feedback Center
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Inspect feedback, notes, and inquiries submitted by parents and students.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('parent')}
          className={`btn ${activeTab === 'parent' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
        >
          <HeartHandshake size={16} />
          <span>Parent Communications ({parentFeedbacks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
        >
          <UserCheck size={16} />
          <span>Student Feedback ({studentFeedbacks.length})</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
        </div>
      ) : activeTab === 'parent' ? (
        parentFeedbacks.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div>No parent feedback entries found addressed to faculty.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {parentFeedbacks.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {item.subject}
                    </h3>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {item.targetAudience === 'TEACHERS' ? 'Teachers Only' : 'Teachers + Admins'}
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
        )
      ) : (
        studentFeedbacks.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div>No student feedback entries found addressed to faculty.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {studentFeedbacks.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {item.subject}
                    </h3>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      {item.teacherName}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
                    {item.message}
                  </p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} color="var(--accent-cyan)" />
                    <span>Student: {item.studentName}</span>
                  </div>
                  {item.studentEmail && (
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={12} />
                      <span>{item.studentEmail}</span>
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
        )
      )}
    </div>
  );
};
