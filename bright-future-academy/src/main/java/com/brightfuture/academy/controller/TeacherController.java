package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.TeacherCreateRequest;
import com.brightfuture.academy.dto.response.TeacherResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.TeacherService;
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
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
@Tag(name = "Teachers", description = "Teacher management operations")
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create Teacher", description = "Register a new teacher. Admin only.")
    public ResponseEntity<ApiResponse<TeacherResponse>> createTeacher(
            @Valid @RequestBody TeacherCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        TeacherResponse response = teacherService.createTeacher(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Teacher created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "List Teachers", description = "Get paginated list of teachers with search and filter support.")
    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAllTeachers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TeacherResponse> teacherPage = teacherService.getAllTeachers(search, status, pageable);

        ApiResponse<List<TeacherResponse>> response = ApiResponse.<List<TeacherResponse>>builder()
                .success(true)
                .message("Teachers retrieved successfully")
                .data(teacherPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(teacherPage.getNumber())
                        .size(teacherPage.getSize())
                        .totalElements(teacherPage.getTotalElements())
                        .totalPages(teacherPage.getTotalPages())
                        .last(teacherPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Teacher", description = "Get teacher details by ID.")
    public ResponseEntity<ApiResponse<TeacherResponse>> getTeacher(@PathVariable Long id) {
        TeacherResponse response = teacherService.getTeacherById(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Teacher", description = "Update teacher profile. Admin only.")
    public ResponseEntity<ApiResponse<TeacherResponse>> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody TeacherCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        TeacherResponse response = teacherService.updateTeacher(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Teacher updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Teacher Status", description = "Activate or deactivate a teacher.")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @CurrentUser UserPrincipal currentUser) {
        teacherService.updateTeacherStatus(id, status.toUpperCase(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Teacher status updated to " + status));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get My Teacher Profile", description = "Teacher endpoint to get own profile details.")
    public ResponseEntity<ApiResponse<TeacherResponse>> getMyProfile(
            @CurrentUser UserPrincipal currentUser) {
        TeacherResponse response = teacherService.getMyProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Teacher profile retrieved successfully", response));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Update My Teacher Profile", description = "Teacher endpoint to safely update permitted profile details.")
    public ResponseEntity<ApiResponse<TeacherResponse>> updateMyProfile(
            @Valid @RequestBody com.brightfuture.academy.dto.request.TeacherProfileUpdateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        TeacherResponse response = teacherService.updateMyProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping(value = "/me/profile-photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Upload Profile Photo", description = "Teacher endpoint to upload and set profile photo.")
    public ResponseEntity<ApiResponse<TeacherResponse>> uploadProfilePhoto(
            @RequestParam("photo") org.springframework.web.multipart.MultipartFile photo,
            @CurrentUser UserPrincipal currentUser) {
        TeacherResponse response = teacherService.updateProfilePhoto(currentUser.getId(), photo);
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated successfully", response));
    }

    @DeleteMapping("/me/profile-photo")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Delete Profile Photo", description = "Teacher endpoint to remove profile photo.")
    public ResponseEntity<ApiResponse<TeacherResponse>> deleteProfilePhoto(
            @CurrentUser UserPrincipal currentUser) {
        TeacherResponse response = teacherService.deleteProfilePhoto(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile photo removed successfully", response));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMINISTRATOR', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get Teachers For Student", description = "Get assigned instructors teaching a specific student with IDOR verification.")
    public ResponseEntity<ApiResponse<List<com.brightfuture.academy.dto.response.StudentTeacherResponse>>> getTeachersForStudent(
            @PathVariable Long studentId,
            @CurrentUser UserPrincipal currentUser) {
        List<com.brightfuture.academy.dto.response.StudentTeacherResponse> responses =
                teacherService.getTeachersForStudent(studentId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Student teachers retrieved successfully", responses));
    }
}
