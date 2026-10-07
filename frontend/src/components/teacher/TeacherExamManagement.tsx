import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  Send,
  Lock,
  BarChart3,
  HelpCircle,
  X,
  FileCheck,
  Check,
  Percent,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { examApi, academicApi, studentApi } from '../../api/services';
import {
  ExamResponse,
  ExamCreateRequest,
  ExamQuestionRequest,
  ExamQuestionResponse,
  ExamAnalyticsResponse,
  SubjectResponse,
  ClassResponse,
  StudentResponse,
} from '../../types';

export const TeacherExamManagement: React.FC = () => {
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED'>('ALL');

  // Modals & Active Exam state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamResponse | null>(null);

  const [activeExamForQuestions, setActiveExamForQuestions] = useState<ExamResponse | null>(null);
  const [activeExamForAssign, setActiveExamForAssign] = useState<ExamResponse | null>(null);
  const [activeExamForResults, setActiveExamForResults] = useState<ExamResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ExamAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Form states for Create/Edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [classId, setClassId] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [passingMarks, setPassingMarks] = useState<number | ''>('');
  const [instructions, setInstructions] = useState('');
  const [externalResourceUrl, setExternalResourceUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Question builder state
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [qMarks, setQMarks] = useState(1);
  const [qExplanation, setQExplanation] = useState('');
  const [qError, setQError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // Assignment modal state
  const [assignMode, setAssignMode] = useState<'CLASS' | 'INDIVIDUAL'>('CLASS');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Load teacher exams and master data
  const loadData = async () => {
    setLoading(true);
    try {
      const [examRes, subjRes, classRes, studRes] = await Promise.all([
        examApi.getTeacherExams(),
        academicApi.listSubjects({ size: 100 }),
        academicApi.listClasses({ size: 100 }),
        studentApi.list({ size: 200 }),
      ]);
      if (examRes.data) setExams(examRes.data);
      if (subjRes.data) setSubjects(subjRes.data);
      if (classRes.data) setClasses(classRes.data);
      if (studRes.data) setAllStudents(studRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Create Exam Modal
  const handleOpenCreate = () => {
    setEditingExam(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setClassId(classes[0]?.id || '');
    setDurationMinutes(30);

    // Default dates: now and 7 days from now
    const now = new Date();
    const future = new Date(Date.now() + 7 * 86400000);
    const toLocalISO = (d: Date) => d.toISOString().slice(0, 16);
    setStartTime(toLocalISO(now));
    setEndTime(toLocalISO(future));

    setPassingMarks('');
    setInstructions('Please read all questions carefully and select the best answer.');
    setExternalResourceUrl('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Exam Modal
  const handleOpenEdit = (exam: ExamResponse) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setSubjectId(exam.subjectId);
    setClassId(exam.classId || '');
    setDurationMinutes(exam.durationMinutes);
    setStartTime(exam.startTime ? exam.startTime.slice(0, 16) : '');
    setEndTime(exam.endTime ? exam.endTime.slice(0, 16) : '');
    setPassingMarks(exam.passingMarks !== undefined ? exam.passingMarks : '');
    setInstructions(exam.instructions || '');
    setExternalResourceUrl(exam.externalResourceUrl || '');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Save Exam (Create or Edit)
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Exam title is required.');
      return;
    }
    if (!subjectId) {
      setFormError('Please select a subject.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Start and end date/times are required.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setFormError('End time must be after the start time.');
      return;
    }

    const payload: ExamCreateRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      subjectId: Number(subjectId),
      classId: classId ? Number(classId) : undefined,
      durationMinutes: Number(durationMinutes),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      passingMarks: passingMarks !== '' ? Number(passingMarks) : undefined,
      instructions: instructions.trim() || undefined,
      externalResourceUrl: externalResourceUrl.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (editingExam) {
        await examApi.update(editingExam.id, payload);
      } else {
        await examApi.create(payload);
      }
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save exam.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (exam: ExamResponse) => {
    if (!window.confirm(`Are you sure you want to delete exam "${exam.title}"?`)) return;
    try {
      await examApi.delete(exam.id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Cannot delete exam.');
    }
  };

  // Open Question Builder
  const handleOpenQuestions = async (exam: ExamResponse) => {
    try {
      const res = await examApi.getById(exam.id);
      if (res.data) {
        setActiveExamForQuestions(res.data);
      } else {
        setActiveExamForQuestions(exam);
      }
    } catch {
      setActiveExamForQuestions(exam);
    }
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOpt('A');
    setQMarks(1);
    setQExplanation('');
    setQError(null);
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExamForQuestions) return;
    setQError(null);

    if (!qText.trim()) {
      setQError('Question text cannot be blank.');
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setQError('All 4 answer options (A, B, C, D) are required.');
      return;
    }

    const payload: ExamQuestionRequest = {
      questionText: qText.trim(),
      optionA: optA.trim(),
      optionB: optB.trim(),
      optionC: optC.trim(),
      optionD: optD.trim(),
      correctOption: correctOpt,
      marks: Number(qMarks) > 0 ? Number(qMarks) : 1,
      explanation: qExplanation.trim() || undefined,
    };

    try {
      if (editingQuestionId) {
        await examApi.updateQuestion(activeExamForQuestions.id, editingQuestionId, payload);
      } else {
        await examApi.addQuestion(activeExamForQuestions.id, payload);
      }
      // Refresh questions
      const refreshed = await examApi.getById(activeExamForQuestions.id);
      if (refreshed.data) setActiveExamForQuestions(refreshed.data);
      resetQuestionForm();
      loadData();
    } catch (err: any) {
      setQError(err?.message || 'Failed to save question.');
    }
  };

  const handleEditQuestion = (q: ExamQuestionResponse) => {
    setEditingQuestionId(q.id);
    setQText(q.questionText);
    setOptA(q.optionA);
    setOptB(q.optionB);
    setOptC(q.optionC);
    setOptD(q.optionD);
    setCorrectOpt(q.correctOption as any);
    setQMarks(q.marks);
    setQExplanation(q.explanation || '');
    setQError(null);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!activeExamForQuestions) return;
    if (!window.confirm('Delete this question from the exam?')) return;
    try {
      await examApi.deleteQuestion(activeExamForQuestions.id, questionId);
      const refreshed = await examApi.getById(activeExamForQuestions.id);
      if (refreshed.data) setActiveExamForQuestions(refreshed.data);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete question.');
    }
  };

  // Open Assignment Modal
  const handleOpenAssign = (exam: ExamResponse) => {
    setActiveExamForAssign(exam);
    setSelectedClassId(exam.classId || '');
    setSelectedStudentIds(exam.assignedStudentIds || []);
    setAssignMode(exam.classId ? 'CLASS' : 'INDIVIDUAL');
  };

  const handleSaveAssign = async () => {
    if (!activeExamForAssign) return;
    try {
      await examApi.assign(activeExamForAssign.id, {
        classId: assignMode === 'CLASS' && selectedClassId ? Number(selectedClassId) : undefined,
        studentIds: assignMode === 'INDIVIDUAL' ? selectedStudentIds : undefined,
      });
      setActiveExamForAssign(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to assign students.');
    }
  };

  // Publish Exam
  const handlePublishExam = async (exam: ExamResponse) => {
    try {
      await examApi.publish(exam.id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Cannot publish exam.');
    }
  };

  // Close Exam
  const handleCloseExam = async (exam: ExamResponse) => {
    try {
      await examApi.close(exam.id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Cannot close exam.');
    }
  };

  // Open Results View
  const handleOpenResults = async (exam: ExamResponse) => {
    setActiveExamForResults(exam);
    setLoadingAnalytics(true);
    try {
      const res = await examApi.getResults(exam.id);
      if (res.data) setAnalyticsData(res.data);
    } catch (err: any) {
      alert(err?.message || 'Unable to retrieve exam results.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Filter exams
  const filteredExams = exams.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileCheck size={26} color="#10b981" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Exams & Quizzes
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Author MCQ tests, manage questions, assign student cohorts, and review live scoring
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-full)', gap: '0.5rem' }}
        >
          <Plus size={18} />
          <span>Create New Exam</span>
        </button>
      </div>

      {/* =========================================================================
          FILTER & SEARCH BAR
          ========================================================================= */}
      <div
        className="dash-glass-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Status Pill Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['ALL', 'DRAFT', 'PUBLISHED', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                background: statusFilter === st ? '#10b981' : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                border: statusFilter === st ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                fontWeight: statusFilter === st ? 700 : 500,
              }}
            >
              {st === 'ALL' ? 'All Exams' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            minWidth: '260px',
          }}
        >
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search exams or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* =========================================================================
          EXAMS LIST
          ========================================================================= */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Loader2 size={36} className="animate-spin" color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--text-secondary)' }}>Loading examinations...</div>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="dash-glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3, color: '#10b981' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No examinations found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            {statusFilter !== 'ALL' || search ? 'Try clearing your filters or search terms.' : 'Create your first MCQ quiz to get started.'}
          </p>
          {statusFilter === 'ALL' && !search && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '1.25rem', borderRadius: 'var(--radius-full)' }}
            >
              <Plus size={15} />
              <span>Create Exam</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredExams.map((exam) => {
            const isDraft = exam.status === 'DRAFT';
            const isPublished = exam.status === 'PUBLISHED';
            const isClosed = exam.status === 'CLOSED';

            return (
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
                {/* Card Top: Subject & Status Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {exam.subjectName}
                    </span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.675rem',
                        background: isPublished
                          ? 'rgba(16, 185, 129, 0.15)'
                          : isDraft
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(148, 163, 184, 0.15)',
                        color: isPublished ? '#10b981' : isDraft ? '#f59e0b' : 'var(--text-muted)',
                        border: `1px solid ${isPublished ? '#10b98140' : isDraft ? '#f59e0b40' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {exam.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      {exam.description}
                    </p>
                  )}

                  {/* Cohort & Timing Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '1rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Clock size={13} color="#10b981" />
                      <span>{exam.durationMinutes} Minutes • Total Marks: {exam.totalMarks}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Calendar size={13} color="var(--primary-400)" />
                      <span>{new Date(exam.startTime).toLocaleDateString()} - {new Date(exam.endTime).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Layers size={13} color="#8b5cf6" />
                      <span>{exam.className || 'Assigned to Students'} ({exam.assignedCount} students)</span>
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
                          External Resource Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Metrics & Action Buttons */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {exam.questionCount} Questions Added
                    </span>
                    <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#10b981' }}>
                      {exam.submissionCount} Submissions
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Questions Builder Button */}
                    <button
                      onClick={() => handleOpenQuestions(exam)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, gap: '0.35rem', fontSize: '0.75rem' }}
                    >
                      <HelpCircle size={14} color="#10b981" />
                      <span>Questions ({exam.questionCount})</span>
                    </button>

                    {/* Assign Button */}
                    <button
                      onClick={() => handleOpenAssign(exam)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                    >
                      <Users size={14} />
                      <span>Assign</span>
                    </button>

                    {/* Results / Analytics Button */}
                    {(isPublished || isClosed) && (
                      <button
                        onClick={() => handleOpenResults(exam)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.35rem', fontSize: '0.75rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                      >
                        <BarChart3 size={14} />
                        <span>Results</span>
                      </button>
                    )}

                    {/* Publish / Close / Edit Dropdown buttons */}
                    {isDraft && (
                      <>
                        <button
                          onClick={() => handlePublishExam(exam)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                        >
                          <Send size={13} />
                          <span>Publish</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(exam)}
                          className="btn btn-ghost btn-sm"
                          title="Edit Settings"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="btn btn-ghost btn-sm"
                          title="Delete Exam"
                          style={{ color: 'var(--danger-text)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}

                    {isPublished && (
                      <button
                        onClick={() => handleCloseExam(exam)}
                        className="btn btn-secondary btn-sm"
                        title="Close Exam"
                        style={{ gap: '0.35rem', fontSize: '0.75rem', color: 'var(--danger-text)' }}
                      >
                        <Lock size={13} />
                        <span>Close</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CREATE / EDIT EXAM
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingExam ? 'Edit Examination Settings' : 'Create Examination Draft'}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Exam Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Database Systems Midterm Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Brief overview of the examination syllabus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Curriculum Subject *</label>
                  <select
                    className="form-select"
                    value={subjectId}
                    onChange={(e) => setSubjectId(Number(e.target.value))}
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cohort Class (Optional)</label>
                  <select
                    className="form-select"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">No specific class cohort</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className} ({cls.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes) *</label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    className="form-input"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Passing Marks (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    placeholder="e.g. 10"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Student Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">External Resource / Reference URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/question-materials"
                  value={externalResourceUrl}
                  onChange={(e) => setExternalResourceUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingExam ? 'Update Exam' : 'Save Draft Exam'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: QUESTION BUILDER (EXACTLY 4 OPTIONS, 1 CORRECT)
          ========================================================================= */}
      {activeExamForQuestions && (
        <div className="modal-backdrop" onClick={() => setActiveExamForQuestions(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '840px', maxHeight: '88vh' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Question Builder: {activeExamForQuestions.title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Marks: {activeExamForQuestions.totalMarks} • {activeExamForQuestions.questions?.length || 0} Questions
                </span>
              </div>
              <button
                onClick={() => setActiveExamForQuestions(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Questions List */}
            <div style={{ marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!activeExamForQuestions.questions || activeExamForQuestions.questions.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No questions added yet. Use the form below to add your first 4-option multiple-choice question.
                </div>
              ) : (
                activeExamForQuestions.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#10b981' }}>
                          Q{idx + 1}.
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {q.questionText}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </div>
                      {/* Options Preview */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.775rem', marginTop: '0.45rem' }}>
                        {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                          const text = letter === 'A' ? q.optionA : letter === 'B' ? q.optionB : letter === 'C' ? q.optionC : q.optionD;
                          const isCorrect = q.correctOption === letter;
                          return (
                            <div
                              key={letter}
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                color: isCorrect ? '#10b981' : 'var(--text-secondary)',
                                fontWeight: isCorrect ? 700 : 400,
                              }}
                            >
                              <strong>{letter}.</strong> {text} {isCorrect && '✓'}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question Actions */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleEditQuestion(q)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Question"
                        style={{ padding: '0.3rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete Question"
                        style={{ padding: '0.3rem', color: 'var(--danger-text)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form: Add / Edit MCQ */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#10b981' }}>
                {editingQuestionId ? 'Edit Question' : 'Add Multiple Choice Question (4 Options)'}
              </h3>

              {qError && (
                <div style={{ color: 'var(--danger-text)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  {qError}
                </div>
              )}

              <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Question Text *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. What does SQL stand for?"
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Marks *</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={qMarks}
                      onChange={(e) => setQMarks(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* 4 Choices Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Option A *</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: correctOpt === 'A' ? '#10b981' : 'inherit' }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctOpt === 'A'}
                          onChange={() => setCorrectOpt('A')}
                        />
                        <span style={{ fontSize: '0.75rem' }}>Correct</span>
                      </label>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Structured Query Language"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Option B *</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: correctOpt === 'B' ? '#10b981' : 'inherit' }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctOpt === 'B'}
                          onChange={() => setCorrectOpt('B')}
                        />
                        <span style={{ fontSize: '0.75rem' }}>Correct</span>
                      </label>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Simple Question Language"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Option C *</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: correctOpt === 'C' ? '#10b981' : 'inherit' }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctOpt === 'C'}
                          onChange={() => setCorrectOpt('C')}
                        />
                        <span style={{ fontSize: '0.75rem' }}>Correct</span>
                      </label>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="System Query Logic"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Option D *</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: correctOpt === 'D' ? '#10b981' : 'inherit' }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctOpt === 'D'}
                          onChange={() => setCorrectOpt('D')}
                        />
                        <span style={{ fontSize: '0.75rem' }}>Correct</span>
                      </label>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Structured Question Logic"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {editingQuestionId && (
                    <button type="button" onClick={resetQuestionForm} className="btn btn-secondary btn-sm">
                      Cancel Edit
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingQuestionId ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ASSIGN STUDENTS / CLASS
          ========================================================================= */}
      {activeExamForAssign && (
        <div className="modal-backdrop" onClick={() => setActiveExamForAssign(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Assign Examination Recipients
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Exam: {activeExamForAssign.title}
                </span>
              </div>
              <button
                onClick={() => setActiveExamForAssign(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setAssignMode('CLASS')}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: assignMode === 'CLASS' ? '#10b981' : 'transparent',
                  color: assignMode === 'CLASS' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Assign by Cohort Class
              </button>
              <button
                type="button"
                onClick={() => setAssignMode('INDIVIDUAL')}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: assignMode === 'INDIVIDUAL' ? '#10b981' : 'transparent',
                  color: assignMode === 'INDIVIDUAL' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Select Individual Students
              </button>
            </div>

            {assignMode === 'CLASS' ? (
              <div className="form-group">
                <label className="form-label">Select Cohort Class *</label>
                <select
                  className="form-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                >
                  <option value="">Select a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.gradeLevel}) • {cls.enrolledCount ?? 0} Enrolled Students
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  All actively enrolled students in this class will automatically be granted exam access.
                </p>
              </div>
            ) : (
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Select Enrolled Students ({selectedStudentIds.length} Selected)
                </label>
                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {allStudents.map((st) => {
                    const isChecked = selectedStudentIds.includes(st.id);
                    return (
                      <label
                        key={st.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.45rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, st.id]);
                            } else {
                              setSelectedStudentIds(selectedStudentIds.filter((id) => id !== st.id));
                            }
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.fullName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ({st.studentIdNumber})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setActiveExamForAssign(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveAssign} className="btn btn-primary">
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: EXAM RESULTS & SUBMISSION ANALYTICS
          ========================================================================= */}
      {activeExamForResults && (
        <div className="modal-backdrop" onClick={() => setActiveExamForResults(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Exam Analytics: {activeExamForResults.title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Author: {activeExamForResults.teacherName} • Total Marks: {activeExamForResults.totalMarks}
                </span>
              </div>
              <button
                onClick={() => setActiveExamForResults(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingAnalytics ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Loader2 size={32} className="animate-spin" color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <div style={{ color: 'var(--text-secondary)' }}>Calculating live exam analytics...</div>
              </div>
            ) : analyticsData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Metric Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div className="dash-glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Assigned</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {analyticsData.totalAssigned}
                    </div>
                  </div>
                  <div className="dash-glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Completed</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                      {analyticsData.totalSubmitted} ({analyticsData.completionRate}%)
                    </div>
                  </div>
                  <div className="dash-glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Average Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                      {analyticsData.averagePercentage}%
                    </div>
                  </div>
                  <div className="dash-glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Highest / Lowest</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                      {analyticsData.highestScore} / {analyticsData.lowestScore}
                    </div>
                  </div>
                </div>

                {/* Submissions Roster */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Student Submissions Roster ({analyticsData.submissions?.length || 0})
                  </h4>
                  <div className="table-container" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Student ID</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Submission Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.submissions?.map((sub) => (
                          <tr key={sub.studentId}>
                            <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{sub.studentIdNumber}</td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  fontSize: '0.675rem',
                                  background: sub.status === 'SUBMITTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                  color: sub.status === 'SUBMITTED' ? '#10b981' : 'var(--text-muted)',
                                }}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>
                              {sub.score !== undefined && sub.score !== null ? `${sub.score} / ${sub.totalMarks}` : '--'}
                            </td>
                            <td>
                              {sub.percentage !== undefined && sub.percentage !== null ? (
                                <span style={{ fontWeight: 700, color: '#10b981' }}>{sub.percentage}%</span>
                              ) : '--'}
                            </td>
                            <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Not submitted yet'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Question Level Accuracy */}
                {analyticsData.questionAnalytics && analyticsData.questionAnalytics.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      Question Performance & Accuracy
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {analyticsData.questionAnalytics.map((qa) => (
                        <div
                          key={qa.questionId}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Q{qa.questionOrder}. {qa.questionText}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Correct Answer: <strong style={{ color: '#10b981' }}>Option {qa.correctOption}</strong> • {qa.correctResponses} of {qa.totalResponses} correct
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${qa.accuracyPercentage}%`,
                                  height: '100%',
                                  background: qa.accuracyPercentage >= 70 ? '#10b981' : qa.accuracyPercentage >= 40 ? '#f59e0b' : '#ef4444',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '42px', textAlign: 'right', color: 'var(--text-primary)' }}>
                              {qa.accuracyPercentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
