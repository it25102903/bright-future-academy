import React, { useEffect, useState } from 'react';
import {
  Layers,
  Building,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  Clock,
} from 'lucide-react';
import { academicApi, teacherApi } from '../../api/services';
import {
  ClassResponse,
  ClassroomResponse,
  SubjectResponse,
  TimetableResponse,
  TeacherResponse,
  ClassCreateRequest,
  ClassroomCreateRequest,
  SubjectCreateRequest,
  TimetableCreateRequest,
} from '../../types';
import { useToast } from '../../context/ToastContext';

export const AcademicManagement: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'classes' | 'classrooms' | 'subjects' | 'timetables'>('classes');

  // Data states
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [timetables, setTimetables] = useState<TimetableResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected class for timetables
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

  // Form states
  const [classForm, setClassForm] = useState<ClassCreateRequest>({
    className: '',
    gradeLevel: '10',
    section: 'A',
    academicYear: 2026,
    maxCapacity: 35,
  });

  const [roomForm, setRoomForm] = useState<ClassroomCreateRequest>({
    roomNumber: '',
    name: '',
    building: 'Main Hall',
    floor: 1,
    capacity: 40,
    roomType: 'CLASSROOM',
    hasProjector: true,
    hasAirConditioning: true,
  });

  const [subjectForm, setSubjectForm] = useState<SubjectCreateRequest>({
    subjectCode: '',
    name: '',
    description: '',
    credits: 3,
  });

  const [timetableForm, setTimetableForm] = useState<TimetableCreateRequest>({
    classId: 0,
    subjectId: 0,
    teacherId: 0,
    classroomId: 0,
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '09:30',
    academicYear: 2026,
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cls, rms, sbj, tch] = await Promise.all([
        academicApi.listClasses({ size: 100 }),
        academicApi.listClassrooms({ size: 100 }),
        academicApi.listSubjects({ size: 100 }),
        teacherApi.list({ size: 100 }),
      ]);
      if (cls.data) {
        setClasses(cls.data);
        if (!selectedClassId && cls.data.length > 0) {
          setSelectedClassId(cls.data[0].id);
          loadClassTimetable(cls.data[0].id);
        }
      }
      if (rms.data) setClassrooms(rms.data);
      if (sbj.data) setSubjects(sbj.data);
      if (tch.data) setTeachers(tch.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadClassTimetable = async (classId: number) => {
    try {
      const res = await academicApi.getClassTimetable(classId);
      if (res.data) setTimetables(res.data);
    } catch {
      setTimetables([]);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await academicApi.createClass(classForm);
      success('Class created successfully!');
      setIsClassModalOpen(false);
      loadAll();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create class.');
    }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await academicApi.createClassroom(roomForm);
      success('Classroom added!');
      setIsRoomModalOpen(false);
      loadAll();
    } catch (err: any) {
      toastError(err?.message || 'Failed to add classroom.');
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await academicApi.createSubject(subjectForm);
      success('Subject curriculum added!');
      setIsSubjectModalOpen(false);
      loadAll();
    } catch (err: any) {
      toastError(err?.message || 'Failed to add subject.');
    }
  };

  const handleTimetableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await academicApi.createTimetable({
        ...timetableForm,
        classId: Number(timetableForm.classId || selectedClassId),
      });
      success('Timetable entry scheduled!');
      setIsTimetableModalOpen(false);
      if (selectedClassId) loadClassTimetable(Number(selectedClassId));
    } catch (err: any) {
      toastError(err?.message || 'Schedule conflict or timetable creation error.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Academic Architecture
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Classes, campus room facilities, curriculum subjects, and weekly timetable engine
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('classes')}
            className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Layers size={14} />
            <span>Classes</span>
          </button>
          <button
            onClick={() => setActiveTab('classrooms')}
            className={`btn ${activeTab === 'classrooms' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Building size={14} />
            <span>Rooms</span>
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <BookOpen size={14} />
            <span>Subjects</span>
          </button>
          <button
            onClick={() => setActiveTab('timetables')}
            className={`btn ${activeTab === 'timetables' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Calendar size={14} />
            <span>Timetable</span>
          </button>
        </div>
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === 'classes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setIsClassModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Plus size={16} />
              <span>Create New Class</span>
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Grade Level & Section</th>
                  <th>Academic Year</th>
                  <th>Classroom</th>
                  <th>Enrolled / Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.className}</td>
                    <td>Grade {c.gradeLevel} - Section {c.section || 'General'}</td>
                    <td>{c.academicYear}</td>
                    <td>{c.classroomName || 'Assigned Room'}</td>
                    <td>{c.currentEnrollment || 0} / {c.maxCapacity || 40}</td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'classrooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setIsRoomModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Plus size={16} />
              <span>Add Classroom</span>
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Facility Name</th>
                  <th>Building & Floor</th>
                  <th>Capacity</th>
                  <th>Amenities</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((rm) => (
                  <tr key={rm.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-400)' }}>
                      {rm.roomNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{rm.name || 'Lecture Room'}</td>
                    <td>{rm.building} - Floor {rm.floor || 1}</td>
                    <td>{rm.capacity} Desks</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {rm.hasProjector && '• Projector '}
                      {rm.hasAirConditioning && '• A/C'}
                    </td>
                    <td>
                      <span className={`badge ${rm.status === 'AVAILABLE' ? 'badge-success' : 'badge-neutral'}`}>
                        {rm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Plus size={16} />
              <span>Add Subject</span>
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Title</th>
                  <th>Description</th>
                  <th>Credits</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sb) => (
                  <tr key={sb.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {sb.subjectCode}
                    </td>
                    <td style={{ fontWeight: 600 }}>{sb.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sb.description || '—'}</td>
                    <td>{sb.credits || 3} Credits</td>
                    <td>
                      <span className="badge badge-success">{sb.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timetables' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>View Schedule For Class:</label>
              <select
                className="form-select"
                style={{ width: '220px' }}
                value={selectedClassId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedClassId(id);
                  loadClassTimetable(id);
                }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} (Grade {c.gradeLevel})
                  </option>
                ))}
              </select>
            </div>

            <button onClick={() => setIsTimetableModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
              <Plus size={16} />
              <span>Schedule Timetable Slot</span>
            </button>
          </div>

          <div className="table-container">
            {timetables.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active timetable slots scheduled for this class yet.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day of Week</th>
                    <th>Time Slot</th>
                    <th>Subject</th>
                    <th>Assigned Teacher</th>
                    <th>Assigned Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timetables.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{t.dayOfWeek}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Clock size={13} color="var(--text-muted)" />
                          <span>{t.startTime} – {t.endTime}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.subjectName}</td>
                      <td>{t.teacherName}</td>
                      <td>{t.classroomName}</td>
                      <td>
                        <span className="badge badge-success">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsClassModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Class</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleClassSubmit}>
              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10 - Science A"
                  className="form-input"
                  value={classForm.className}
                  onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Grade Level</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={classForm.gradeLevel}
                    onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Max Student Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  value={classForm.maxCapacity}
                  onChange={(e) => setClassForm({ ...classForm, maxCapacity: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classroom Modal */}
      {isRoomModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsRoomModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add Campus Classroom</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRoomSubmit}>
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAB-01 or 204"
                  className="form-input"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Computer Lab"
                  className="form-input"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Building</label>
                  <input
                    type="text"
                    className="form-input"
                    value={roomForm.building}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Desk Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsRoomModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSubjectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add Curriculum Subject</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubjectSubmit}>
              <div className="form-group">
                <label className="form-label">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAT-101"
                  className="form-input"
                  value={subjectForm.subjectCode}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Mathematics"
                  className="form-input"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Credits</label>
                <input
                  type="number"
                  className="form-input"
                  value={subjectForm.credits}
                  onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timetable Slot Modal */}
      {isTimetableModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTimetableModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Schedule Timetable Slot</h3>
              <button onClick={() => setIsTimetableModalOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleTimetableSubmit}>
              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  required
                  className="form-select"
                  value={timetableForm.classId || selectedClassId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, classId: Number(e.target.value) })}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  required
                  className="form-select"
                  value={timetableForm.subjectId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, subjectId: Number(e.target.value) })}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Teacher</label>
                <select
                  required
                  className="form-select"
                  value={timetableForm.teacherId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, teacherId: Number(e.target.value) })}
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Classroom</label>
                <select
                  required
                  className="form-select"
                  value={timetableForm.classroomId}
                  onChange={(e) => setTimetableForm({ ...timetableForm, classroomId: Number(e.target.value) })}
                >
                  <option value="">-- Select Classroom --</option>
                  {classrooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.roomNumber} ({rm.name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Day</label>
                  <select
                    className="form-select"
                    value={timetableForm.dayOfWeek}
                    onChange={(e) => setTimetableForm({ ...timetableForm, dayOfWeek: e.target.value })}
                  >
                    <option value="MONDAY">MONDAY</option>
                    <option value="TUESDAY">TUESDAY</option>
                    <option value="WEDNESDAY">WEDNESDAY</option>
                    <option value="THURSDAY">THURSDAY</option>
                    <option value="FRIDAY">FRIDAY</option>
                    <option value="SATURDAY">SATURDAY</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start</label>
                  <input
                    type="time"
                    className="form-input"
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End</label>
                  <input
                    type="time"
                    className="form-input"
                    value={timetableForm.endTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsTimetableModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
