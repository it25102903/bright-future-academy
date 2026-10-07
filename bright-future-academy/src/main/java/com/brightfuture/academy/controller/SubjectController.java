package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.SubjectCreateRequest;
import com.brightfuture.academy.dto.response.SubjectResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.SubjectService;
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
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects", description = "Subject management operations")
public class SubjectController {

    private final SubjectService subjectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create Subject", description = "Create a new subject. Admin only.")
    public ResponseEntity<ApiResponse<SubjectResponse>> createSubject(
            @Valid @RequestBody SubjectCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        SubjectResponse response = subjectService.createSubject(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List Subjects", description = "Get paginated list of subjects.")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getAllSubjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<SubjectResponse> subjectPage = subjectService.getAllSubjects(search, status, pageable);

        ApiResponse<List<SubjectResponse>> response = ApiResponse.<List<SubjectResponse>>builder()
                .success(true)
                .message("Subjects retrieved successfully")
                .data(subjectPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(subjectPage.getNumber())
                        .size(subjectPage.getSize())
                        .totalElements(subjectPage.getTotalElements())
                        .totalPages(subjectPage.getTotalPages())
                        .last(subjectPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Subject", description = "Get subject details by ID.")
    public ResponseEntity<ApiResponse<SubjectResponse>> getSubject(@PathVariable Long id) {
        SubjectResponse response = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Subject", description = "Update subject details. Admin only.")
    public ResponseEntity<ApiResponse<SubjectResponse>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        SubjectResponse response = subjectService.updateSubject(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Delete Subject", description = "Soft-delete a subject. Admin only.")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        subjectService.deleteSubject(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully"));
    }
}
