import { api } from './client';
import {
  AuthResponse,
  UserResponse,
  DashboardResponse,
  StudentResponse,
  StudentCreateRequest,
  StudentProfileUpdateRequest,
  TeacherResponse,
  TeacherCreateRequest,
  TeacherProfileUpdateRequest,
  StudentTeacherResponse,
  ClassResponse,
  ClassCreateRequest,
  ClassroomResponse,
  ClassroomCreateRequest,
  SubjectResponse,
  SubjectCreateRequest,
  TimetableResponse,
  TimetableCreateRequest,
  AttendanceSessionResponse,
  AttendanceSessionCreateRequest,
  AttendanceRecordResponse,
  AttendanceStatus,
  PaymentResponse,
  PaymentCreateRequest,
  FeeStructureResponse,
  FeeStructureCreateRequest,
  AnnouncementResponse,
  AnnouncementCreateRequest,
  NotificationResponse,
  ParentFeedbackRequest,
  ParentFeedbackResponse,
  ParentProfileResponse,
  ParentProfileUpdateRequest,
  ParentResponse,
  ParentCreateRequest,
  ParentUpdateRequest,
  StudentFeedbackRequest,
  StudentFeedbackResponse,
  StudentFeeAssignmentResponse,
  ExamCreateRequest,
  ExamQuestionRequest,
  ExamAssignRequest,
  ExamSubmitRequest,
  ExamResponse,
  ExamQuestionResponse,
  ExamStudentResponse,
  ExamTakeResponse,
  ExamResultResponse,
  ExamAnalyticsResponse,
} from '../types';


// ==========================================
// AUTHENTICATION
// ==========================================
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),
  logout: () => api.post<void>('/auth/logout'),
  getCurrentUser: () => api.get<UserResponse>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<void>('/auth/change-password', data),
  forgotPassword: (email: string) => api.post<void>('/auth/forgot-password', { email }),
};

// ==========================================
// DASHBOARD
// ==========================================
export const dashboardApi = {
  getStats: () => api.get<DashboardResponse>('/dashboard'),
};

// ==========================================
// STUDENTS
// ==========================================
export const studentApi = {
  list: (params?: { search?: string; status?: string; page?: number; size?: number; sortBy?: string; sortDir?: string }) =>
    api.get<StudentResponse[]>('/students', params),
  getById: (id: number) => api.get<StudentResponse>(`/students/${id}`),
  create: (data: StudentCreateRequest) => api.post<StudentResponse>('/students', data),
  update: (id: number, data: StudentCreateRequest) => api.put<StudentResponse>(`/students/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch<void>(`/students/${id}/status`, { status }),
  enroll: (id: number, classId: number, academicYear?: number) =>
    api.post<void>(`/students/${id}/enrollments?classId=${classId}${academicYear ? `&academicYear=${academicYear}` : ''}`),
  getMyChildren: () => api.get<StudentResponse[]>('/students/my-children'),
  getMyProfile: () => api.get<StudentResponse>('/students/me'),
  updateMyProfile: (data: StudentProfileUpdateRequest) => api.put<StudentResponse>('/students/profile', data),
  updateProfileWithId: (id: number, data: StudentProfileUpdateRequest) => api.put<StudentResponse>(`/students/${id}/profile`, data),
};

// ==========================================
// TEACHERS
// ==========================================
export const teacherApi = {
  list: (params?: { search?: string; status?: string; page?: number; size?: number; sortBy?: string; sortDir?: string }) =>
    api.get<TeacherResponse[]>('/teachers', params),
  getById: (id: number) => api.get<TeacherResponse>(`/teachers/${id}`),
  create: (data: TeacherCreateRequest) => api.post<TeacherResponse>('/teachers', data),
  update: (id: number, data: TeacherCreateRequest) => api.put<TeacherResponse>(`/teachers/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch<void>(`/teachers/${id}/status`, { status }),
  getMyProfile: () => api.get<TeacherResponse>('/teachers/me'),
  updateMyProfile: (data: TeacherProfileUpdateRequest) => api.put<TeacherResponse>('/teachers/me/profile', data),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.upload<TeacherResponse>('/teachers/me/profile-photo', formData);
  },
  deleteProfilePhoto: () => api.delete<TeacherResponse>('/teachers/me/profile-photo'),
  getTeachersForStudent: (studentId: number) =>
    api.get<StudentTeacherResponse[]>(`/teachers/student/${studentId}`),
};

// ==========================================
// ACADEMIC (Classes, Classrooms, Subjects, Timetables)
// ==========================================
export const academicApi = {
  // Classes
  listClasses: (params?: { search?: string; status?: string; academicYear?: number; page?: number; size?: number }) =>
    api.get<ClassResponse[]>('/classes', params),
  getClassById: (id: number) => api.get<ClassResponse>(`/classes/${id}`),
  createClass: (data: ClassCreateRequest) => api.post<ClassResponse>('/classes', data),
  updateClass: (id: number, data: ClassCreateRequest) => api.put<ClassResponse>(`/classes/${id}`, data),
  deleteClass: (id: number) => api.delete<void>(`/classes/${id}`),

  // Classrooms
  listClassrooms: (params?: { search?: string; status?: string; page?: number; size?: number }) =>
    api.get<ClassroomResponse[]>('/classrooms', params),
  getClassroomById: (id: number) => api.get<ClassroomResponse>(`/classrooms/${id}`),
  createClassroom: (data: ClassroomCreateRequest) => api.post<ClassroomResponse>('/classrooms', data),
  updateClassroom: (id: number, data: ClassroomCreateRequest) => api.put<ClassroomResponse>(`/classrooms/${id}`, data),
  deleteClassroom: (id: number) => api.delete<void>(`/classrooms/${id}`),

  // Subjects
  listSubjects: (params?: { search?: string; status?: string; page?: number; size?: number }) =>
    api.get<SubjectResponse[]>('/subjects', params),
  getSubjectById: (id: number) => api.get<SubjectResponse>(`/subjects/${id}`),
  createSubject: (data: SubjectCreateRequest) => api.post<SubjectResponse>('/subjects', data),
  updateSubject: (id: number, data: SubjectCreateRequest) => api.put<SubjectResponse>(`/subjects/${id}`, data),
  deleteSubject: (id: number) => api.delete<void>(`/subjects/${id}`),

  // Timetables
  createTimetable: (data: TimetableCreateRequest) => api.post<TimetableResponse>('/timetables', data),
  getClassTimetable: (classId: number) => api.get<TimetableResponse[]>(`/timetables/class/${classId}`),
  getTeacherTimetable: (teacherId: number) => api.get<TimetableResponse[]>(`/timetables/teacher/${teacherId}`),
  getClassroomTimetable: (classroomId: number) => api.get<TimetableResponse[]>(`/timetables/classroom/${classroomId}`),
  deleteTimetable: (id: number) => api.delete<void>(`/timetables/${id}`),
  getMyTimetable: () => api.get<TimetableResponse[]>('/timetables/my'),
  getStudentTimetable: (studentId: number) => api.get<TimetableResponse[]>(`/timetables/student/${studentId}`),
};

// ==========================================
// ATTENDANCE
// ==========================================
export const attendanceApi = {
  createSession: (data: AttendanceSessionCreateRequest) =>
    api.post<AttendanceSessionResponse>('/attendance/sessions', data),
  markSingle: (sessionId: number, studentId: number, status: AttendanceStatus, remarks?: string) =>
    api.post<AttendanceRecordResponse>(`/attendance/sessions/${sessionId}/mark`, { studentId, status, remarks }),
  bulkMark: (sessionId: number, studentStatuses: Record<number, AttendanceStatus>) =>
    api.post<AttendanceRecordResponse[]>(`/attendance/sessions/${sessionId}/bulk-mark`, { studentStatuses }),
  closeSession: (sessionId: number) => api.post<void>(`/attendance/sessions/${sessionId}/close`),
  listSessions: (params?: { classId?: number; teacherId?: number; dateFrom?: string; dateTo?: string; page?: number; size?: number }) =>
    api.get<AttendanceSessionResponse[]>('/attendance/sessions', params),
  getSessionRecords: (sessionId: number) =>
    api.get<AttendanceRecordResponse[]>(`/attendance/sessions/${sessionId}/records`),
  getStudentStats: (studentId: number, dateFrom?: string, dateTo?: string) =>
    api.get<Record<string, any>>(`/attendance/students/${studentId}/stats`, { dateFrom, dateTo }),
  getStudentRecords: (studentId: number, params?: { dateFrom?: string; dateTo?: string }) =>
    api.get<AttendanceRecordResponse[]>(`/attendance/students/${studentId}/records`, params),
  getMyRecords: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get<AttendanceRecordResponse[]>('/attendance/my-records', params),
  getMyStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get<Record<string, any>>('/attendance/my-stats', params),
};

// ==========================================
// PAYMENTS & FINANCE
// ==========================================
export const paymentApi = {
  recordPayment: (data: PaymentCreateRequest) => api.post<PaymentResponse>('/payments', data),
  listPayments: (params?: { studentId?: number; status?: string; dateFrom?: string; dateTo?: string; page?: number; size?: number }) =>
    api.get<PaymentResponse[]>('/payments', params),
  listFeeAssignments: (params?: { studentId?: number; status?: string; search?: string }) =>
    api.get<StudentFeeAssignmentResponse[]>('/payments/fee-assignments', params),
  getPaymentById: (id: number) => api.get<PaymentResponse>(`/payments/${id}`),
  getReceipt: (id: number) => api.get<PaymentResponse>(`/payments/${id}/receipt`),
  getStudentBalance: (studentId: number) => api.get<Record<string, any>>(`/payments/students/${studentId}/balance`),

  // Fee Structures
  listFeeStructures: () => api.get<FeeStructureResponse[]>('/fee-structures'),
  getFeeStructureById: (id: number) => api.get<FeeStructureResponse>(`/fee-structures/${id}`),
  createFeeStructure: (data: FeeStructureCreateRequest) => api.post<FeeStructureResponse>('/fee-structures', data),
  updateFeeStructure: (id: number, data: FeeStructureCreateRequest) => api.put<FeeStructureResponse>(`/fee-structures/${id}`, data),
  deleteFeeStructure: (id: number) => api.delete<void>(`/fee-structures/${id}`),
  assignFeeToStudent: (feeStructureId: number, data: { studentId: number; discountAmount?: number; discountReason?: string; dueDate?: string; notes?: string }) =>
    api.post<void>(`/fee-structures/${feeStructureId}/assign`, data),
};


// ==========================================
// ANNOUNCEMENTS
// ==========================================
export const announcementApi = {
  list: (params?: { audience?: string; classId?: number; page?: number; size?: number }) =>
    api.get<AnnouncementResponse[]>('/announcements', params),
  getById: (id: number) => api.get<AnnouncementResponse>(`/announcements/${id}`),
  create: (data: AnnouncementCreateRequest) => api.post<AnnouncementResponse>('/announcements', data),
  update: (id: number, data: AnnouncementCreateRequest) => api.put<AnnouncementResponse>(`/announcements/${id}`, data),
  publish: (id: number) => api.patch<AnnouncementResponse>(`/announcements/${id}/publish`),
  archive: (id: number) => api.delete<void>(`/announcements/${id}`),
};

// ==========================================
// NOTIFICATIONS
// ==========================================
export const notificationApi = {
  list: (params?: { unreadOnly?: boolean; page?: number; size?: number }) =>
    api.get<NotificationResponse[]>('/notifications', params),
  getUnreadCount: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => api.patch<NotificationResponse>(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch<void>('/notifications/read-all'),
};

// ==========================================
// PARENT FEEDBACK
// ==========================================
export const parentFeedbackApi = {
  create: (data: ParentFeedbackRequest) => api.post<ParentFeedbackResponse>('/feedback', data),
  getMyFeedbacks: () => api.get<ParentFeedbackResponse[]>('/feedback/my'),
  deleteFeedback: (id: number) => api.delete<void>(`/feedback/${id}`),
  getTeacherFeedbacks: () => api.get<ParentFeedbackResponse[]>('/feedback/teacher'),
  getAdminFeedbacks: () => api.get<ParentFeedbackResponse[]>('/feedback/admin'),
};

// ==========================================
// PARENT PROFILE
// ==========================================
export const parentProfileApi = {
  getMyProfile: () => api.get<ParentProfileResponse>('/parents/profile/me'),
  updateMyProfile: (data: ParentProfileUpdateRequest) => api.put<ParentProfileResponse>('/parents/profile/me', data),
};

// ==========================================
// PARENT MANAGEMENT (ADMIN)
// ==========================================
export const parentApi = {
  list: (params?: { search?: string; status?: string; page?: number; size?: number; sortBy?: string; sortDir?: string }) =>
    api.get<ParentResponse[]>('/parents', params),
  getById: (id: number) => api.get<ParentResponse>(`/parents/${id}`),
  create: (data: ParentCreateRequest) => api.post<ParentResponse>('/parents', data),
  update: (id: number, data: ParentUpdateRequest) => api.put<ParentResponse>(`/parents/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch<void>(`/parents/${id}/status`, { status }),
  linkChild: (parentId: number, studentId: number) => api.post<ParentResponse>(`/parents/${parentId}/children/${studentId}`),
  unlinkChild: (parentId: number, studentId: number) => api.delete<ParentResponse>(`/parents/${parentId}/children/${studentId}`),
};

// ==========================================
// STUDENT FEEDBACK
// ==========================================
export const studentFeedbackApi = {
  create: (data: StudentFeedbackRequest) => api.post<StudentFeedbackResponse>('/student-feedback', data),
  getMyFeedbacks: () => api.get<StudentFeedbackResponse[]>('/student-feedback/my'),
  deleteFeedback: (id: number) => api.delete<void>(`/student-feedback/${id}`),
  getTeacherFeedbacks: () => api.get<StudentFeedbackResponse[]>('/student-feedback/teacher'),
};

// ==========================================
// EXAMS & QUIZZES
// ==========================================
export const examApi = {
  // Teacher endpoints
  create: (data: ExamCreateRequest) => api.post<ExamResponse>('/exams', data),
  getTeacherExams: (params?: { status?: string; search?: string }) =>
    api.get<ExamResponse[]>('/exams/teacher', params),
  getById: (id: number) => api.get<ExamResponse>(`/exams/${id}`),
  update: (id: number, data: ExamCreateRequest) => api.put<ExamResponse>(`/exams/${id}`, data),
  delete: (id: number) => api.delete<void>(`/exams/${id}`),
  addQuestion: (examId: number, data: ExamQuestionRequest) =>
    api.post<ExamQuestionResponse>(`/exams/${examId}/questions`, data),
  updateQuestion: (examId: number, questionId: number, data: ExamQuestionRequest) =>
    api.put<ExamQuestionResponse>(`/exams/${examId}/questions/${questionId}`, data),
  deleteQuestion: (examId: number, questionId: number) =>
    api.delete<void>(`/exams/${examId}/questions/${questionId}`),
  assign: (examId: number, data: ExamAssignRequest) =>
    api.post<ExamResponse>(`/exams/${examId}/assign`, data),
  publish: (id: number) => api.patch<ExamResponse>(`/exams/${id}/publish`),
  close: (id: number) => api.patch<ExamResponse>(`/exams/${id}/close`),
  getResults: (id: number) => api.get<ExamAnalyticsResponse>(`/exams/${id}/results`),

  // Student endpoints
  getStudentExams: () => api.get<ExamStudentResponse[]>('/exams/student'),
  startExam: (id: number) => api.post<ExamTakeResponse>(`/exams/${id}/start`),
  submitExam: (id: number, data: ExamSubmitRequest) =>
    api.post<ExamResultResponse>(`/exams/${id}/submit`, data),
  getMyResult: (id: number) => api.get<ExamResultResponse>(`/exams/${id}/my-result`),
};

