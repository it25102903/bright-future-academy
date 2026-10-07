package com.brightfuture.academy.service;

import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.enums.AttendanceStatus;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import com.brightfuture.academy.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public AttendanceSession createSession(Long classId, Long subjectId, Long teacherId,
                                            LocalDate date, LocalTime startTime, LocalTime endTime,
                                            UserPrincipal currentUser) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        User createdBy = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        AttendanceSession session = AttendanceSession.builder()
                .classEntity(classEntity)
                .subject(subject)
                .teacher(teacher)
                .sessionDate(date != null ? date : LocalDate.now())
                .startTime(startTime)
                .endTime(endTime)
                .sessionType("REGULAR")
                .status("OPEN")
                .createdBy(createdBy)
                .build();

        session = sessionRepository.save(session);
        auditLogService.log(currentUser.getId(), "CREATE_ATTENDANCE", "ATTENDANCE_SESSION",
                session.getId(), "Created attendance session for " + classEntity.getClassName());
        return session;
    }

    @Transactional
    public AttendanceRecord markAttendance(Long sessionId, Long studentId, AttendanceStatus status,
                                            String remarks, UserPrincipal currentUser) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", "id", sessionId));

        if (!"OPEN".equals(session.getStatus())) {
            throw new BusinessRuleException("Attendance session is closed and cannot be modified");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        // Check duplicate
        if (recordRepository.existsByAttendanceSessionIdAndStudentId(sessionId, studentId)) {
            throw new ConflictException("Attendance already marked for this student in this session");
        }

        // Verify student is enrolled in the class
        boolean enrolled = enrollmentRepository.existsByStudentIdAndClassEntityIdAndStatus(
                studentId, session.getClassEntity().getId(), "ACTIVE");
        if (!enrolled) {
            throw new BusinessRuleException("Student is not enrolled in this class");
        }

        User markedBy = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        AttendanceRecord record = AttendanceRecord.builder()
                .attendanceSession(session)
                .student(student)
                .status(status)
                .checkInTime(LocalDateTime.now())
                .markedBy(markedBy)
                .markingMethod("MANUAL")
                .remarks(remarks)
                .build();

        record = recordRepository.save(record);
        return record;
    }

    @Transactional
    public List<AttendanceRecord> bulkMarkAttendance(Long sessionId, Map<Long, AttendanceStatus> studentStatuses,
                                                      UserPrincipal currentUser) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", "id", sessionId));

        if (!"OPEN".equals(session.getStatus())) {
            throw new BusinessRuleException("Attendance session is closed");
        }

        User markedBy = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        List<AttendanceRecord> records = new ArrayList<>();
        for (Map.Entry<Long, AttendanceStatus> entry : studentStatuses.entrySet()) {
            Long studentId = entry.getKey();
            AttendanceStatus status = entry.getValue();

            if (recordRepository.existsByAttendanceSessionIdAndStudentId(sessionId, studentId)) {
                continue; // Skip duplicates in bulk
            }

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

            AttendanceRecord record = AttendanceRecord.builder()
                    .attendanceSession(session)
                    .student(student)
                    .status(status)
                    .checkInTime(LocalDateTime.now())
                    .markedBy(markedBy)
                    .markingMethod("BULK")
                    .build();
            records.add(recordRepository.save(record));
        }

        auditLogService.log(currentUser.getId(), "CREATE_ATTENDANCE", "ATTENDANCE_SESSION",
                sessionId, "Bulk marked attendance for " + records.size() + " students");
        return records;
    }

    @Transactional(readOnly = true)
    public Page<AttendanceSession> getSessions(Long classId, Long teacherId,
                                                LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        return sessionRepository.findWithFilters(classId, teacherId, dateFrom, dateTo, pageable);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getSessionRecords(Long sessionId) {
        return recordRepository.findByAttendanceSessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getStudentAttendanceRecords(Long studentId, LocalDate dateFrom, LocalDate dateTo) {
        LocalDate start = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(6);
        LocalDate end = dateTo != null ? dateTo : LocalDate.now();
        return recordRepository.findByStudentAndDateRange(studentId, start, end);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAttendanceStats(Long studentId, LocalDate dateFrom, LocalDate dateTo) {
        long total = recordRepository.countByStudentAndDateRange(studentId, dateFrom, dateTo);
        long present = recordRepository.countByStudentStatusAndDateRange(studentId, AttendanceStatus.PRESENT, dateFrom, dateTo);
        long absent = recordRepository.countByStudentStatusAndDateRange(studentId, AttendanceStatus.ABSENT, dateFrom, dateTo);
        long late = recordRepository.countByStudentStatusAndDateRange(studentId, AttendanceStatus.LATE, dateFrom, dateTo);
        long excused = recordRepository.countByStudentStatusAndDateRange(studentId, AttendanceStatus.EXCUSED, dateFrom, dateTo);

        double percentage = total > 0 ? Math.round(((present + late) * 100.0 / total) * 100.0) / 100.0 : 0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("studentId", studentId);
        stats.put("dateFrom", dateFrom);
        stats.put("dateTo", dateTo);
        stats.put("totalSessions", total);
        stats.put("present", present);
        stats.put("absent", absent);
        stats.put("late", late);
        stats.put("excused", excused);
        stats.put("attendancePercentage", percentage);
        return stats;
    }

    @Transactional
    public void closeSession(Long sessionId, Long userId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", "id", sessionId));
        session.setStatus("CLOSED");
        session.setClosedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}
