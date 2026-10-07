import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  Loader2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { examApi } from '../../api/services';
import {
  ExamStudentResponse,
  ExamTakeResponse,
  ExamResultResponse,
} from '../../types';

export const StudentExamPortal: React.FC<{ onNavigateView?: (view: string) => void }> = () => {
  const [exams, setExams] = useState<ExamStudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'UPCOMING' | 'COMPLETED'>('AVAILABLE');

  // Active taking session state
  const [activeSession, setActiveSession] = useState<ExamTakeResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // questionId -> 'A'|'B'|'C'|'D'
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Result review state
  const [activeResult, setActiveResult] = useState<ExamResultResponse | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const timerRef = useRef<any>(null);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await examApi.getStudentExams();
      if (res.data) {
        setExams(res.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!activeSession) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  // Start / Resume Exam
  const handleStartExam = async (examId: number) => {
    setLoading(true);
    try {
      const res = await examApi.startExam(examId);
      if (res.data) {
        setActiveSession(res.data);
        setCurrentQIndex(0);
        setRemainingSeconds(res.data.remainingSeconds || res.data.durationMinutes * 60);

        // Pre-fill any previously saved answers
        const initialAnswers: Record<number, string> = {};
        res.data.questions.forEach((q) => {
          if (q.savedAnswer) {
            initialAnswers[q.id] = q.savedAnswer;
          }
        });
        setAnswers(initialAnswers);
      }
    } catch (err: any) {
      alert(err?.message || 'Unable to start examination.');
    } finally {
      setLoading(false);
    }
  };

  // Select Answer
  const handleSelectAnswer = (questionId: number, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Submit Exam
  const handleSubmitExam = async () => {
    if (!activeSession) return;
    setSubmitting(true);

    const payload = {
      answers: Object.entries(answers).map(([qId, opt]) => ({
        questionId: Number(qId),
        selectedOption: opt,
      })),
    };

    try {
      const res = await examApi.submitExam(activeSession.examId, payload);
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveSession(null);
      setIsSubmitModalOpen(false);
      if (res.data) {
        setActiveResult(res.data);
      }
      loadExams();
    } catch (err: any) {
      alert(err?.message || 'Failed to submit examination.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Your exam will now be submitted automatically.');
    handleSubmitExam();
  };

  // View Past Result
  const handleViewResult = async (examId: number) => {
    setLoadingResult(true);
    try {
      const res = await examApi.getMyResult(examId);
      if (res.data) {
        setActiveResult(res.data);
      }
    } catch (err: any) {
      alert(err?.message || 'Unable to load exam result.');
    } finally {
      setLoadingResult(false);
    }
  };

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter exams by tab
  const availableExams = exams.filter(
    (e) => e.studentExamStatus === 'AVAILABLE' || e.studentExamStatus === 'IN_PROGRESS'
  );
  const upcomingExams = exams.filter((e) => e.studentExamStatus === 'UPCOMING');
  const completedExams = exams.filter(
    (e) => e.studentExamStatus === 'COMPLETED' || e.studentExamStatus === 'MISSED'
  );

  // =========================================================================
  // VIEW 1: ACTIVE DISTRACTION-FREE EXAM SESSION
  // =========================================================================
  if (activeSession) {
    const totalQ = activeSession.questions.length;
    const currentQ = activeSession.questions[currentQIndex];
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = Math.max(0, totalQ - answeredCount);
    const isTimerWarning = remainingSeconds < 300; // Under 5 minutes

    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Session Header */}
        <div
          className="dash-glass-card"
          style={{
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              {activeSession.subjectName}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0 0' }}>
              {activeSession.title}
            </h2>
          </div>

          {/* Live Countdown Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              background: isTimerWarning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${isTimerWarning ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              color: isTimerWarning ? 'var(--danger-text)' : '#10b981',
              boxShadow: isTimerWarning ? '0 0 15px rgba(239, 68, 68, 0.3)' : '0 0 15px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Clock size={18} />
            <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {formatTimer(remainingSeconds)}
            </span>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>
              remaining
            </span>
          </div>
        </div>

        {/* Question Progress & Navigator Bar */}
        <div
          className="dash-glass-card"
          style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Question <strong style={{ color: 'var(--text-primary)' }}>{currentQIndex + 1}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalQ}</strong>
            <span style={{ marginLeft: '1rem', color: '#10b981' }}>
              • {answeredCount} Answered
            </span>
            {unansweredCount > 0 && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                ({unansweredCount} remaining)
              </span>
            )}
          </div>

          {/* Numbered Navigator Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {activeSession.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentQIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCurrent
                      ? '#10b981'
                      : isAnswered
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isCurrent ? '#ffffff' : isAnswered ? '#10b981' : 'var(--text-secondary)',
                    border: isCurrent
                      ? '1px solid #10b981'
                      : isAnswered
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Question Box */}
        {currentQ && (
          <div className="dash-glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                Question {currentQIndex + 1}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Worth {currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '1.75rem' }}>
              {currentQ.questionText}
            </h3>

            {/* 4 Choices Radio Group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const text =
                  letter === 'A' ? currentQ.optionA : letter === 'B' ? currentQ.optionB : letter === 'C' ? currentQ.optionC : currentQ.optionD;
                const isSelected = answers[currentQ.id] === letter;

                return (
                  <div
                    key={letter}
                    onClick={() => handleSelectAnswer(currentQ.id, letter)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #10b981' : '2px solid var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isSelected ? '#10b981' : 'var(--text-muted)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        flexShrink: 0,
                      }}
                    >
                      {letter}
                    </div>
                    <span style={{ fontSize: '0.95rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '2.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="btn btn-secondary"
                style={{ gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {currentQIndex < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
                  >
                    <span>Next Question</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <Send size={16} />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsSubmitModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: '#10b981',
                }}
              >
                <Send size={26} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Submit Examination Attempt?
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have answered <strong style={{ color: '#10b981' }}>{answeredCount}</strong> of{' '}
                <strong>{totalQ}</strong> questions.
                {unansweredCount > 0 && (
                  <span style={{ display: 'block', color: '#f59e0b', marginTop: '0.35rem' }}>
                    ⚠️ {unansweredCount} question{unansweredCount > 1 ? 's are' : ' is'} unanswered!
                  </span>
                )}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Return to Questions
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  <span>Confirm Submission</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: EXAM RESULTS BREAKDOWN REVIEW
  // =========================================================================
  if (activeResult) {
    return (
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <button
          onClick={() => setActiveResult(null)}
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: 'flex-start', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Exams</span>
        </button>

        {/* Result Score Banner */}
        <div className="dash-glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: activeResult.passed !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: activeResult.passed !== false ? '#10b981' : 'var(--danger-text)',
            }}
          >
            <Award size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {activeResult.examTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            {activeResult.subjectName} • Submitted by {activeResult.studentName}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem',
              marginTop: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {activeResult.score} / {activeResult.totalMarks}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Percentage</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '0.15rem' }}>
                {activeResult.percentage}%
              </div>
            </div>

            {activeResult.passed !== null && activeResult.passed !== undefined && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Result Status</div>
                <span
                  className="badge"
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.4rem 1rem',
                    marginTop: '0.35rem',
                    background: activeResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: activeResult.passed ? '#10b981' : 'var(--danger-text)',
                  }}
                >
                  {activeResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Question Review & Answers ({activeResult.answers?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeResult.answers?.map((ans, idx) => (
              <div
                key={ans.questionId}
                className="dash-glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: `4px solid ${ans.isCorrect ? '#10b981' : 'var(--danger-text)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: ans.isCorrect ? '#10b981' : 'var(--danger-text)' }}>
                    Q{idx + 1}. {ans.isCorrect ? 'Correct (+ ' + ans.marksAwarded + ' marks)' : 'Incorrect (0 marks)'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Max: {ans.maxMarks}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
                  {ans.questionText}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem' }}>
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                    const text = letter === 'A' ? ans.optionA : letter === 'B' ? ans.optionB : letter === 'C' ? ans.optionC : ans.optionD;
                    const isSelected = ans.selectedOption === letter;
                    const isCorrectChoice = ans.correctOption === letter;

                    return (
                      <div
                        key={letter}
                        style={{
                          padding: '0.45rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isCorrectChoice
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isSelected
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(255, 255, 255, 0.02)',
                          color: isCorrectChoice ? '#10b981' : isSelected ? 'var(--danger-text)' : 'var(--text-secondary)',
                          border: isCorrectChoice
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : isSelected
                            ? '1px solid var(--danger-border)'
                            : '1px solid var(--border-subtle)',
                        }}
                      >
                        <strong>{letter}.</strong> {text} {isCorrectChoice && '✓ (Correct Key)'} {isSelected && !isCorrectChoice && '✗ (Your Choice)'}
                      </div>
                    );
                  })}
                </div>

                {ans.explanation && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                    💡 Explanation: {ans.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: MAIN STUDENT EXAM DISCOVERY LIST
  // =========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <FileText size={26} color="#10b981" />
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Student Examination Portal
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          View assigned tests, take timed examinations, and review your grading performance
        </p>
      </div>

      {/* Tab Controls */}
      <div
        className="dash-glass-card"
        style={{
          padding: '0.65rem',
          display: 'flex',
          gap: '0.5rem',
          maxWidth: '520px',
        }}
      >
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className="btn btn-sm"
          style={{
            flex: 1,
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'AVAILABLE' ? '#10b981' : 'transparent',
            color: activeTab === 'AVAILABLE' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'AVAILABLE' ? '1px solid #10b981' : '1px solid transparent',
            fontWeight: activeTab === 'AVAILABLE' ? 700 : 500,
          }}
        >
          Available Exams ({availableExams.length})
        </button>
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className="btn btn-sm"
          style={{
            flex: 1,
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'UPCOMING' ? '#10b981' : 'transparent',
            color: activeTab === 'UPCOMING' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'UPCOMING' ? '1px solid #10b981' : '1px solid transparent',
            fontWeight: activeTab === 'UPCOMING' ? 700 : 500,
          }}
        >
          Upcoming ({upcomingExams.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className="btn btn-sm"
          style={{
            flex: 1,
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'COMPLETED' ? '#10b981' : 'transparent',
            color: activeTab === 'COMPLETED' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'COMPLETED' ? '1px solid #10b981' : '1px solid transparent',
            fontWeight: activeTab === 'COMPLETED' ? 700 : 500,
          }}
        >
          Completed ({completedExams.length})
        </button>
      </div>

      {/* Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Loader2 size={36} className="animate-spin" color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--text-secondary)' }}>Retrieving your assigned examinations...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {(activeTab === 'AVAILABLE'
            ? availableExams
            : activeTab === 'UPCOMING'
            ? upcomingExams
            : completedExams
          ).map((exam) => (
            <div
              key={exam.id}
              className="dash-glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    {exam.subjectName}
                  </span>
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.65rem',
                      background:
                        exam.studentExamStatus === 'AVAILABLE'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : exam.studentExamStatus === 'IN_PROGRESS'
                          ? 'rgba(6, 182, 212, 0.15)'
                          : exam.studentExamStatus === 'COMPLETED'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(148, 163, 184, 0.15)',
                      color:
                        exam.studentExamStatus === 'AVAILABLE'
                          ? '#10b981'
                          : exam.studentExamStatus === 'IN_PROGRESS'
                          ? 'var(--accent-cyan)'
                          : exam.studentExamStatus === 'COMPLETED'
                          ? 'var(--primary-400)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {exam.studentExamStatus}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {exam.title}
                </h3>
                {exam.description && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                    {exam.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={13} color="#10b981" />
                    <span>Duration: {exam.durationMinutes} Minutes • Total Marks: {exam.totalMarks}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={13} color="var(--primary-400)" />
                    <span>Available: {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <HelpCircle size={13} color="#8b5cf6" />
                    <span>Instructor: {exam.teacherName}</span>
                  </div>
                  {exam.externalResourceUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <ExternalLink size={13} color="var(--accent-cyan)" />
                      <a
                        href={exam.externalResourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}
                      >
                        External Exam Resource Link
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {exam.studentExamStatus === 'AVAILABLE' && (
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
                  >
                    <span>Start Exam</span>
                    <ArrowRight size={15} />
                  </button>
                )}

                {exam.studentExamStatus === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', gap: '0.5rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
                  >
                    <span>Resume Exam in Progress</span>
                    <ArrowRight size={15} />
                  </button>
                )}

                {exam.studentExamStatus === 'UPCOMING' && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Opens on {new Date(exam.startTime).toLocaleString()}
                  </div>
                )}

                {exam.studentExamStatus === 'COMPLETED' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Your Score</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                        {exam.score} / {exam.totalMarks} ({exam.percentage}%)
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewResult(exam.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', borderRadius: 'var(--radius-full)' }}
                    >
                      <span>Review Answers</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
