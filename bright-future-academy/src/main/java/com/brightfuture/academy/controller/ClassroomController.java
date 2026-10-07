package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.ClassroomCreateRequest;
import com.brightfuture.academy.dto.response.ClassroomResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.ClassroomService;
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
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
@Tag(name = "Classrooms", description = "Classroom management operations")
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create Classroom", description = "Create a new classroom. Admin only.")
    public ResponseEntity<ApiResponse<ClassroomResponse>> createClassroom(
            @Valid @RequestBody ClassroomCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ClassroomResponse response = classroomService.createClassroom(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Classroom created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List Classrooms", description = "Get paginated list of classrooms.")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getAllClassrooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ClassroomResponse> classroomPage = classroomService.getAllClassrooms(search, status, pageable);

        ApiResponse<List<ClassroomResponse>> response = ApiResponse.<List<ClassroomResponse>>builder()
                .success(true)
                .message("Classrooms retrieved successfully")
                .data(classroomPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(classroomPage.getNumber())
                        .size(classroomPage.getSize())
                        .totalElements(classroomPage.getTotalElements())
                        .totalPages(classroomPage.getTotalPages())
                        .last(classroomPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Classroom", description = "Get classroom details by ID.")
    public ResponseEntity<ApiResponse<ClassroomResponse>> getClassroom(@PathVariable Long id) {
        ClassroomResponse response = classroomService.getClassroomById(id);
        return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update Classroom", description = "Update classroom details. Admin only.")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroom(
            @PathVariable Long id,
            @Valid @RequestBody ClassroomCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ClassroomResponse response = classroomService.updateClassroom(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Classroom updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Delete Classroom", description = "Mark classroom as unavailable. Admin only.")
    public ResponseEntity<ApiResponse<Void>> deleteClassroom(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        classroomService.deleteClassroom(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Classroom deleted successfully"));
    }
}
