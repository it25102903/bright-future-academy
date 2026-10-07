package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.TimetableCreateRequest;
import com.brightfuture.academy.dto.response.TimetableResponse;
import com.brightfuture.academy.entity.Student;
import com.brightfuture.academy.entity.Timetable;
import com.brightfuture.academy.exception.ForbiddenException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.StudentRepository;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.TimetableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timetables")
@RequiredArgsConstructor
@Tag(name = "Timetables", description = "Timetable management operations")
public class TimetableController {

    private final TimetableService timetableService;
    private final StudentRepository studentRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create Timetable Entry", description = "Create a new timetable entry with conflict detection.")
    public ResponseEntity<ApiResponse<TimetableResponse>> createTimetable(
            @Valid @RequestBody TimetableCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        Timetable timetable = timetableService.createTimetable(
                request.getClassId(), request.getSubjectId(), request.getTeacherId(),
                request.getClassroomId(), request.getDayOfWeek(), request.getStartTime(),
                request.getEndTime(), request.getAcademicYear(), currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Timetable entry created successfully", mapToResponse(timetable)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get My Timetable", description = "Get timetable entries for current authenticated student.")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> getMyTimetable(
            @CurrentUser UserPrincipal currentUser) {
        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
        List<Timetable> timetables = timetableService.getStudentTimetable(student.getId());
        List<TimetableResponse> responses = timetables.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Student timetable retrieved successfully", responses));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get Student Timetable", description = "Get timetable entries for a student with IDOR protection.")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> getStudentTimetable(
            @PathVariable Long studentId,
            @CurrentUser UserPrincipal currentUser) {
        if (currentUser.hasRole("STUDENT")) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
            if (!student.getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You are not authorized to view another student's timetable");
            }
        } else if (currentUser.hasRole("PARENT")) {
            List<Student> linkedStudents = studentRepository.findByParentUserId(currentUser.getId());
            boolean isLinked = linkedStudents.stream().anyMatch(s -> s.getId().equals(studentId));
            if (!isLinked) {
                throw new ForbiddenException("You are not authorized to view this student's timetable");
            }
        }
        List<Timetable> timetables = timetableService.getStudentTimetable(studentId);
        List<TimetableResponse> responses = timetables.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Student timetable retrieved successfully", responses));
    }

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get Class Timetable", description = "Get all active timetable entries for a class.")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> getClassTimetable(@PathVariable Long classId) {
        List<Timetable> timetables = timetableService.getClassTimetable(classId);
        List<TimetableResponse> responses = timetables.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Class timetable retrieved successfully", responses));
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "Get Teacher Timetable", description = "Get all active timetable entries for a teacher.")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> getTeacherTimetable(@PathVariable Long teacherId) {
        List<Timetable> timetables = timetableService.getTeacherTimetable(teacherId);
        List<TimetableResponse> responses = timetables.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Teacher timetable retrieved successfully", responses));
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get Classroom Timetable", description = "Get all active timetable entries for a classroom.")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> getClassroomTimetable(@PathVariable Long classroomId) {
        List<Timetable> timetables = timetableService.getClassroomTimetable(classroomId);
        List<TimetableResponse> responses = timetables.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Classroom timetable retrieved successfully", responses));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Cancel Timetable Entry", description = "Cancel a timetable entry. Admin only.")
    public ResponseEntity<ApiResponse<Void>> deleteTimetable(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        timetableService.deleteTimetable(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Timetable entry cancelled successfully"));
    }

    private TimetableResponse mapToResponse(Timetable t) {
        return TimetableResponse.builder()
                .id(t.getId())
                .classId(t.getClassEntity().getId())
                .className(t.getClassEntity().getClassName())
                .subjectId(t.getSubject().getId())
                .subjectName(t.getSubject().getName())
                .teacherId(t.getTeacher().getId())
                .teacherName(t.getTeacher().getUser().getFullName())
                .classroomId(t.getClassroom().getId())
                .classroomName(t.getClassroom().getRoomNumber() +
                        (t.getClassroom().getName() != null ? " - " + t.getClassroom().getName() : ""))
                .dayOfWeek(t.getDayOfWeek())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .academicYear(t.getAcademicYear())
                .semester(t.getSemester())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
