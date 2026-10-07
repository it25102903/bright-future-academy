package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.ClassCreateRequest;
import com.brightfuture.academy.dto.response.ClassResponse;
import com.brightfuture.academy.dto.response.StudentResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.ClassService;
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
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@Tag(name = "Classes", description = "Class management operations")
public class ClassController {

    private final ClassService classService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create Class", description = "Create a new class. Admin only.")
    public ResponseEntity<ApiResponse<ClassResponse>> createClass(
            @Valid @RequestBody ClassCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ClassResponse response = classService.createClass(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Class created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List Classes", description = "Get paginated list of classes with search and filter support.")
    public ResponseEntity<ApiResponse<List<ClassResponse>>> getAllClasses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ClassResponse> classPage = classService.getAllClasses(search, status, academicYear, pageable);

        ApiResponse<List<ClassResponse>> response = ApiResponse.<List<ClassResponse>>builder()
                .success(true)
                .message("Classes retrieved successfully")
                .data(classPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(classPage.getNumber())
                        .size(classPage.getSize())
                        .totalElements(classPage.getTotalElements())
                        .totalPages(classPage.getTotalPages())
                        .last(classPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Class", description = "Get class details by ID.")
    public ResponseEntity<ApiResponse<ClassResponse>> getClass(@PathVariable Long id) {
        ClassResponse response = classService.getClassById(id);
        return ResponseEntity.ok(ApiResponse.success("Class retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Class", description = "Update class details. Admin only.")
    public ResponseEntity<ApiResponse<ClassResponse>> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody ClassCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ClassResponse response = classService.updateClass(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Class updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Delete Class", description = "Soft-delete a class (set to INACTIVE). Admin only.")
    public ResponseEntity<ApiResponse<Void>> deleteClass(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        classService.deleteClass(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Class deleted successfully"));
    }
}
