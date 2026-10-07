package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.AttendanceMarkRequest;
import com.brightfuture.academy.dto.request.AttendanceSessionCreateRequest;
import com.brightfuture.academy.dto.request.BulkAttendanceRequest;
import com.brightfuture.academy.dto.response.AttendanceRecordResponse;
import com.brightfuture.academy.dto.response.AttendanceSessionResponse;
import com.brightfuture.academy.entity.AttendanceRecord;
import com.brightfuture.academy.entity.AttendanceSession;
import com.brightfuture.academy.entity.Student;
import com.brightfuture.academy.exception.ForbiddenException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.StudentRepository;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance management operations")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StudentRepository studentRepository;

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Create Session", description = "Create a new attendance session.")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> createSession(
            @Valid @RequestBody AttendanceSessionCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        AttendanceSession session = attendanceService.createSession(
                request.getClassId(), request.getSubjectId(), request.getTeacherId(),
                request.getDate(), request.getStartTime(), request.getEndTime(), currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance session created successfully", mapSessionResponse(session)));
    }

    @PostMapping("/sessions/{sessionId}/mark")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Mark Attendance", description = "Mark attendance for a single student.")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> markAttendance(
            @PathVariable Long sessionId,
            @Valid @RequestBody AttendanceMarkRequest request,
            @CurrentUser UserPrincipal currentUser) {
        AttendanceRecord record = attendanceService.markAttendance(
                sessionId, request.getStudentId(), request.getStatus(), request.getRemarks(), currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance marked successfully", mapRecordResponse(record)));
    }

    @PostMapping("/sessions/{sessionId}/bulk-mark")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Bulk Mark Attendance", description = "Mark attendance for multiple students at once.")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> bulkMarkAttendance(
            @PathVariable Long sessionId,
            @Valid @RequestBody BulkAttendanceRequest request,
            @CurrentUser UserPrincipal currentUser) {
        List<AttendanceRecord> records = attendanceService.bulkMarkAttendance(
                sessionId, request.getStudentStatuses(), currentUser);
        List<AttendanceRecordResponse> responses = records.stream()
                .map(this::mapRecordResponse).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk attendance marked for " + responses.size() + " students", responses));
    }

    @PostMapping("/sessions/{sessionId}/close")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Close Session", description = "Close an attendance session.")
    public ResponseEntity<ApiResponse<Void>> closeSession(
            @PathVariable Long sessionId,
            @CurrentUser UserPrincipal currentUser) {
        attendanceService.closeSession(sessionId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Attendance session closed successfully"));
    }

    @GetMapping("/sessions")
    @Operation(summary = "List Sessions", description = "Get paginated list of attendance sessions with filters.")
    public ResponseEntity<ApiResponse<List<AttendanceSessionResponse>>> getSessions(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AttendanceSession> sessionPage = attendanceService.getSessions(classId, teacherId, dateFrom, dateTo, pageable);

        List<AttendanceSessionResponse> responses = sessionPage.getContent().stream()
                .map(this::mapSessionResponse).collect(Collectors.toList());

        ApiResponse<List<AttendanceSessionResponse>> response = ApiResponse.<List<AttendanceSessionResponse>>builder()
                .success(true)
                .message("Attendance sessions retrieved successfully")
                .data(responses)
                .pagination(ApiResponse.PageInfo.builder()
                        .page(sessionPage.getNumber())
                        .size(sessionPage.getSize())
                        .totalElements(sessionPage.getTotalElements())
                        .totalPages(sessionPage.getTotalPages())
                        .last(sessionPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{sessionId}/records")
    @Operation(summary = "Get Session Records", description = "Get all attendance records for a session.")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getSessionRecords(@PathVariable Long sessionId) {
        List<AttendanceRecord> records = attendanceService.getSessionRecords(sessionId);
        List<AttendanceRecordResponse> responses = records.stream()
                .map(this::mapRecordResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", responses));
    }

    private void verifyStudentAccess(Long studentId, UserPrincipal currentUser) {
        if (currentUser.hasRole("STUDENT")) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
            if (!student.getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You are not authorized to view another student's attendance");
            }
        } else if (currentUser.hasRole("PARENT")) {
            List<Student> linkedStudents = studentRepository.findByParentUserId(currentUser.getId());
            boolean isLinked = linkedStudents.stream().anyMatch(s -> s.getId().equals(studentId));
            if (!isLinked) {
                throw new ForbiddenException("You are not authorized to view this student's attendance");
            }
        }
    }

    @GetMapping("/my-records")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get My Attendance Records", description = "Student endpoint to get own attendance history.")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getMyRecords(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @CurrentUser UserPrincipal currentUser) {
        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
        List<AttendanceRecord> records = attendanceService.getStudentAttendanceRecords(student.getId(), dateFrom, dateTo);
        List<AttendanceRecordResponse> responses = records.stream()
                .map(this::mapRecordResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", responses));
    }

    @GetMapping("/my-stats")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get My Attendance Stats", description = "Student endpoint to get own attendance statistics.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @CurrentUser UserPrincipal currentUser) {
        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
        LocalDate start = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(6);
        LocalDate end = dateTo != null ? dateTo : LocalDate.now();
        Map<String, Object> stats = attendanceService.getStudentAttendanceStats(student.getId(), start, end);
        return ResponseEntity.ok(ApiResponse.success("Attendance statistics retrieved", stats));
    }

    @GetMapping("/students/{studentId}/records")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get Student Attendance Records", description = "Get attendance history for a student with IDOR protection.")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getStudentRecords(
            @PathVariable Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @CurrentUser UserPrincipal currentUser) {
        verifyStudentAccess(studentId, currentUser);
        List<AttendanceRecord> records = attendanceService.getStudentAttendanceRecords(studentId, dateFrom, dateTo);
        List<AttendanceRecordResponse> responses = records.stream()
                .map(this::mapRecordResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", responses));
    }

    @GetMapping("/students/{studentId}/stats")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get Student Stats", description = "Get attendance statistics for a student.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentStats(
            @PathVariable Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @CurrentUser UserPrincipal currentUser) {
        verifyStudentAccess(studentId, currentUser);
        LocalDate start = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(6);
        LocalDate end = dateTo != null ? dateTo : LocalDate.now();
        Map<String, Object> stats = attendanceService.getStudentAttendanceStats(studentId, start, end);
        return ResponseEntity.ok(ApiResponse.success("Attendance statistics retrieved", stats));
    }

    private AttendanceSessionResponse mapSessionResponse(AttendanceSession session) {
        return AttendanceSessionResponse.builder()
                .id(session.getId())
                .classId(session.getClassEntity().getId())
                .className(session.getClassEntity().getClassName())
                .subjectId(session.getSubject().getId())
                .subjectName(session.getSubject().getName())
                .teacherId(session.getTeacher().getId())
                .teacherName(session.getTeacher().getUser().getFullName())
                .sessionDate(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .sessionType(session.getSessionType())
                .status(session.getStatus())
                .notes(session.getNotes())
                .closedAt(session.getClosedAt())
                .createdAt(session.getCreatedAt())
                .build();
    }

    private AttendanceRecordResponse mapRecordResponse(AttendanceRecord record) {
        AttendanceRecordResponse.AttendanceRecordResponseBuilder builder = AttendanceRecordResponse.builder()
                .id(record.getId())
                .sessionId(record.getAttendanceSession() != null ? record.getAttendanceSession().getId() : null)
                .studentId(record.getStudent().getId())
                .studentName(record.getStudent().getUser().getFullName())
                .studentIdNumber(record.getStudent().getStudentIdNumber())
                .status(record.getStatus().name())
                .checkInTime(record.getCheckInTime())
                .markingMethod(record.getMarkingMethod())
                .remarks(record.getRemarks())
                .markedByName(record.getMarkedBy() != null ? record.getMarkedBy().getFullName() : null);

        if (record.getAttendanceSession() != null) {
            builder.sessionDate(record.getAttendanceSession().getSessionDate());
            if (record.getAttendanceSession().getClassEntity() != null) {
                builder.className(record.getAttendanceSession().getClassEntity().getClassName());
            }
            if (record.getAttendanceSession().getSubject() != null) {
                builder.subjectName(record.getAttendanceSession().getSubject().getName());
            }
            if (record.getAttendanceSession().getTeacher() != null && record.getAttendanceSession().getTeacher().getUser() != null) {
                builder.teacherName(record.getAttendanceSession().getTeacher().getUser().getFullName());
            }
        }

        return builder.build();
    }
}
