export type RoleName =
  | 'ADMINISTRATOR'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'FINANCE_OFFICER';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PageInfo;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  roles: string[];
  passwordChangeRequired?: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  status: string;
  emailVerified: boolean;
  profileImagePath?: string;
  lastLoginAt?: string;
  roles: string[];
  passwordChangeRequired?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardResponse {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  overallAttendancePercentage: number;
  totalRevenue: number;
  outstandingBalance: number;
  unreadNotifications: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  userName: string;
  entityType: string;
  entityId: number;
  timestamp: string;
}

export interface StudentResponse {
  id: number;
  userId: number;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nicNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  admissionDate?: string;
  status: string;
  profileImagePath?: string;
  enrollments?: StudentEnrollmentSummary[];
}

export interface StudentProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodGroup?: string;
  medicalNotes?: string;
}

export interface StudentEnrollmentSummary {
  id: number;
  classId: number;
  className: string;
  academicYear: number;
  status: string;
  enrollmentDate?: string;
  enrolledAt?: string;
}

export interface StudentCreateRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  studentIdNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  admissionDate?: string;
}

export interface TeacherResponse {
  id: number;
  userId: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImagePath?: string;
  dateOfBirth?: string;
  gender?: string;
  nicNumber?: string;
  qualification?: string;
  specialization?: string;
  hireDate?: string;
  employmentStatus?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  status: string;
}

export interface TeacherProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface StudentTeacherResponse {
  teacherId: number;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  qualification?: string;
  subjectName: string;
  className: string;
  profileImagePath?: string;
}

export interface TeacherCreateRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  qualification?: string;
  specialization?: string;
  hireDate?: string;
  employmentStatus?: string;
  dateOfBirth?: string;
  gender?: string;
  nicNumber?: string;
}

export interface ClassResponse {
  id: number;
  className: string;
  gradeLevel: string;
  section?: string;
  academicYear: number;
  classTeacherId?: number;
  classTeacherName?: string;
  classroomId?: number;
  classroomName?: string;
  maxCapacity?: number;
  currentEnrollment?: number;
  capacity?: number;
  enrolledCount?: number;
  description?: string;
  status: string;
}

export interface ClassCreateRequest {
  className: string;
  gradeLevel: string;
  section?: string;
  academicYear: number;
  classTeacherId?: number;
  classroomId?: number;
  maxCapacity?: number;
}

export interface ClassroomResponse {
  id: number;
  roomNumber: string;
  name?: string;
  building?: string;
  floor?: number;
  capacity: number;
  roomType: string;
  hasProjector?: boolean;
  hasAirConditioning?: boolean;
  status: string;
}

export interface ClassroomCreateRequest {
  roomNumber: string;
  name?: string;
  building?: string;
  floor?: number;
  capacity: number;
  roomType?: string;
  hasProjector?: boolean;
  hasAirConditioning?: boolean;
}

export interface SubjectResponse {
  id: number;
  subjectCode: string;
  name: string;
  description?: string;
  credits?: number;
  status: string;
}

export interface SubjectCreateRequest {
  subjectCode: string;
  name: string;
  description?: string;
  credits?: number;
}

export interface TimetableResponse {
  id: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  classroomId: number;
  classroomName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  academicYear?: number;
  semester?: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TimetableCreateRequest {
  classId: number;
  subjectId: number;
  teacherId: number;
  classroomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  academicYear?: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceSessionResponse {
  id: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  sessionType: string;
  status: string; // OPEN or CLOSED
  notes?: string;
  closedAt?: string;
  createdAt: string;
}

export interface AttendanceSessionCreateRequest {
  classId: number;
  subjectId: number;
  teacherId: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface AttendanceRecordResponse {
  id: number;
  sessionId: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  status: AttendanceStatus;
  checkInTime?: string;
  markingMethod: string;
  remarks?: string;
  markedByName?: string;
  sessionDate?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
}

export interface PaymentResponse {
  id: number;
  paymentReference: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentReferenceNumber?: string;
  recordedByName?: string;
  notes?: string;
  status: string;
  receiptNumber: string;
  createdAt: string;
}

export interface PaymentCreateRequest {
  studentId: number;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'ONLINE' | 'CHEQUE';
  referenceNumber?: string;
  feeAssignmentId?: number;
  notes?: string;
}

export interface FeeStructureResponse {
  id: number;
  name?: string;
  feeName?: string;
  feeType: string;
  amount: number;
  frequency?: string;
  academicYear: number;
  classId?: number;
  className?: string;
  dueDate?: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeStructureCreateRequest {
  name?: string;
  feeName?: string;
  feeType: string;
  amount: number;
  frequency?: string;
  academicYear: number;
  classId?: number;
  dueDate?: string;
  description?: string;
}

export interface StudentFeeAssignmentResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  className?: string;
  feeStructureId?: number;
  feeStructureName: string;
  feeType: string;
  assignedAmount: number;
  discountAmount: number;
  discountReason?: string;
  totalPaid: number;
  outstandingBalance: number;
  dueDate: string;
  feeStatus: string;
  notes?: string;
  createdAt?: string;
}


export interface AnnouncementResponse {
  id: number;
  title: string;
  content: string;
  authorName?: string;
  createdById?: number;
  createdByName?: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS' | 'SPECIFIC_CLASS';
  classId?: number;
  targetClassId?: number;
  className?: string;
  targetClassName?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
}

export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS' | 'SPECIFIC_CLASS';
  classId?: number;
  targetClassId?: number;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  publishImmediately?: boolean;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}

export type FeedbackAudience = 'TEACHERS' | 'ADMINISTRATORS' | 'TEACHERS_AND_ADMINISTRATORS';

export interface ParentFeedbackRequest {
  subject: string;
  message: string;
  targetAudience: FeedbackAudience;
}

export interface ParentFeedbackResponse {
  id: number;
  parentUserId: number;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  subject: string;
  message: string;
  targetAudience: FeedbackAudience;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ParentProfileResponse {
  guardianId?: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  relationship: string;
  phone?: string;
  nicNumber?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  status: string;
  linkedChildrenCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ParentProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  nicNumber?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface LinkedChildSummary {
  id: number;
  userId?: number;
  studentIdNumber: string;
  fullName: string;
  email: string;
  currentClass?: string;
  isPrimary: boolean;
}

export interface ParentResponse {
  id: number;
  userId?: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  relationship: string;
  phone: string;
  nicNumber?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  status: string;
  linkedChildrenCount: number;
  linkedChildren?: LinkedChildSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ParentCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship?: string;
  password?: string;
  nicNumber?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  studentIds?: number[];
}

export interface ParentUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  relationship?: string;
  nicNumber?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  studentIds?: number[];
}

export interface StudentFeedbackRequest {
  teacherUserId?: number;
  subject: string;
  message: string;
}

export interface StudentFeedbackResponse {
  id: number;
  studentUserId: number;
  studentName: string;
  studentEmail?: string;
  teacherUserId?: number;
  teacherName: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// EXAMS & QUIZZES
// ==========================================
export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export interface ExamCreateRequest {
  title: string;
  description?: string;
  subjectId: number;
  classId?: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  passingMarks?: number;
  instructions?: string;
  externalResourceUrl?: string;
}

export interface ExamQuestionRequest {
  questionText: string;
  questionOrder?: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
  explanation?: string;
}

export interface ExamAssignRequest {
  classId?: number;
  studentIds?: number[];
}

export interface ExamSubmitRequest {
  answers: {
    questionId: number;
    selectedOption?: string | null;
  }[];
}

export interface ExamQuestionResponse {
  id: number;
  examId: number;
  questionText: string;
  questionOrder: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
  explanation?: string;
  createdAt?: string;
}

export interface ExamResponse {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  teacherId: number;
  teacherName: string;
  classId?: number;
  className?: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: ExamStatus;
  totalMarks: number;
  passingMarks?: number;
  instructions?: string;
  externalResourceUrl?: string;
  questionCount: number;
  assignedCount: number;
  submissionCount: number;
  questions?: ExamQuestionResponse[];
  assignedStudentIds?: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface ExamStudentResponse {
  id: number;
  title: string;
  description?: string;
  subjectName: string;
  teacherName: string;
  className?: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks?: number;
  questionCount: number;
  instructions?: string;
  externalResourceUrl?: string;
  studentExamStatus: 'AVAILABLE' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  attemptId?: number;
  attemptStatus?: string;
  score?: number;
  percentage?: number;
  passed?: boolean;
  submittedAt?: string;
}

export interface ExamTakeQuestionItem {
  id: number;
  questionOrder: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
  savedAnswer?: string;
}

export interface ExamTakeResponse {
  attemptId: number;
  examId: number;
  title: string;
  description?: string;
  subjectName: string;
  teacherName: string;
  durationMinutes: number;
  remainingSeconds: number;
  startTime: string;
  endTime: string;
  totalMarks: number;
  questionCount: number;
  instructions?: string;
  externalResourceUrl?: string;
  questions: ExamTakeQuestionItem[];
}

export interface ExamResultResponse {
  attemptId: number;
  examId: number;
  examTitle: string;
  subjectName: string;
  studentName: string;
  studentIdNumber: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed?: boolean;
  passingMarks?: number;
  startTime: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  answers: {
    questionId: number;
    questionOrder: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    selectedOption?: string;
    correctOption: string;
    isCorrect: boolean;
    marksAwarded: number;
    maxMarks: number;
    explanation?: string;
  }[];
}

export interface ExamAnalyticsResponse {
  examId: number;
  examTitle: string;
  totalAssigned: number;
  totalAttempted: number;
  totalSubmitted: number;
  totalNotAttempted: number;
  completionRate: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  totalMarks: number;
  passingMarks?: number;
  passedCount: number;
  failedCount: number;
  submissions: {
    attemptId?: number;
    studentId: number;
    studentName: string;
    studentIdNumber: string;
    className: string;
    score?: number;
    totalMarks: number;
    percentage?: number;
    passed?: boolean;
    status: string;
    submittedAt?: string;
  }[];
  questionAnalytics: {
    questionId: number;
    questionOrder: number;
    questionText: string;
    correctOption: string;
    totalResponses: number;
    correctResponses: number;
    accuracyPercentage: number;
  }[];
}

