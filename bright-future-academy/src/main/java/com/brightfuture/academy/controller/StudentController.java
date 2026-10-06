package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.StudentCreateRequest;
import com.brightfuture.academy.dto.request.StudentProfileUpdateRequest;
import com.brightfuture.academy.dto.response.StudentResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management operations")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create Student", description = "Register a new student. Admin only.")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody StudentCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        StudentResponse response = studentService.createStudent(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER', 'FINANCE_OFFICER')")
    @Operation(summary = "List Students", description = "Get paginated list of students with search and filter support.")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<StudentResponse> studentPage = studentService.getAllStudents(search, status, pageable);

        ApiResponse<List<StudentResponse>> response = ApiResponse.<List<StudentResponse>>builder()
                .success(true)
                .message("Students retrieved successfully")
                .data(studentPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(studentPage.getNumber())
                        .size(studentPage.getSize())
                        .totalElements(studentPage.getTotalElements())
                        .totalPages(studentPage.getTotalPages())
                        .last(studentPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get My Student Profile", description = "Student endpoint to get own student profile.")
    public ResponseEntity<ApiResponse<StudentResponse>> getMyProfile(
            @CurrentUser UserPrincipal currentUser) {
        StudentResponse response = studentService.getStudentByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update My Student Profile", description = "Student endpoint to safely update permitted profile details.")
    public ResponseEntity<ApiResponse<StudentResponse>> updateMyProfile(
            @Valid @RequestBody StudentProfileUpdateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        StudentResponse response = studentService.updateStudentProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STUDENT')")
    @Operation(summary = "Update Student Profile By ID", description = "Update student profile details with IDOR check.")
    public ResponseEntity<ApiResponse<StudentResponse>> updateProfileWithId(
            @PathVariable Long id,
            @Valid @RequestBody StudentProfileUpdateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        StudentResponse existing = studentService.getStudentById(id, currentUser);
        StudentResponse response = studentService.updateStudentProfile(existing.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT', 'FINANCE_OFFICER')")
    @Operation(summary = "Get Student", description = "Get student details by ID. Access controlled by role.")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudent(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        StudentResponse response = studentService.getStudentById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Student", description = "Update student profile. Admin only.")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        StudentResponse response = studentService.updateStudent(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Student Status", description = "Activate, deactivate, suspend, or archive a student.")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @CurrentUser UserPrincipal currentUser) {
        studentService.updateStudentStatus(id, status.toUpperCase(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Student status updated to " + status));
    }

    @PostMapping("/{id}/enrollments")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Enroll Student", description = "Enroll a student into a class.")
    public ResponseEntity<ApiResponse<Void>> enrollStudent(
            @PathVariable Long id,
            @RequestParam Long classId,
            @RequestParam(required = false) Integer academicYear,
            @CurrentUser UserPrincipal currentUser) {
        studentService.enrollStudent(id, classId, academicYear, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student enrolled successfully"));
    }

    @GetMapping("/my-children")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Get My Children", description = "Parent endpoint to get linked children.")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getMyChildren(
            @CurrentUser UserPrincipal currentUser) {
        List<StudentResponse> children = studentService.getLinkedChildren(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Children retrieved successfully", children));
    }
}
