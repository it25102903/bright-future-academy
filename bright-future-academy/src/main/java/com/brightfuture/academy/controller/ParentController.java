package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.ParentCreateRequest;
import com.brightfuture.academy.dto.request.ParentUpdateRequest;
import com.brightfuture.academy.dto.response.ParentResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.ParentService;
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
@RequestMapping("/api/parents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
@Tag(name = "Parents", description = "Parent and Guardian Management operations for Administrators")
public class ParentController {

    private final ParentService parentService;

    @PostMapping
    @Operation(summary = "Create Parent Account", description = "Register a parent user account and link to student children. Admin only.")
    public ResponseEntity<ApiResponse<ParentResponse>> createParent(
            @Valid @RequestBody ParentCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ParentResponse response = parentService.createParent(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Parent account created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List Parents", description = "Get paginated list of parents/guardians with search and status filters.")
    public ResponseEntity<ApiResponse<List<ParentResponse>>> getAllParents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ParentResponse> parentPage = parentService.listParents(search, status, pageable);

        ApiResponse<List<ParentResponse>> response = ApiResponse.<List<ParentResponse>>builder()
                .success(true)
                .message("Parents retrieved successfully")
                .data(parentPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(parentPage.getNumber())
                        .size(parentPage.getSize())
                        .totalElements(parentPage.getTotalElements())
                        .totalPages(parentPage.getTotalPages())
                        .last(parentPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Parent by ID", description = "Retrieve parent/guardian details and linked children.")
    public ResponseEntity<ApiResponse<ParentResponse>> getParent(@PathVariable Long id) {
        ParentResponse response = parentService.getParentById(id);
        return ResponseEntity.ok(ApiResponse.success("Parent retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Parent", description = "Update parent details and linked children.")
    public ResponseEntity<ApiResponse<ParentResponse>> updateParent(
            @PathVariable Long id,
            @Valid @RequestBody ParentUpdateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ParentResponse response = parentService.updateParent(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Parent updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Parent Status", description = "Activate or deactivate a parent account.")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @CurrentUser UserPrincipal currentUser) {
        parentService.updateParentStatus(id, status, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Parent status updated to " + status));
    }

    @PostMapping("/{id}/children/{studentId}")
    @Operation(summary = "Link Child to Parent", description = "Associate a student to a parent account.")
    public ResponseEntity<ApiResponse<ParentResponse>> linkChild(
            @PathVariable Long id,
            @PathVariable Long studentId,
            @CurrentUser UserPrincipal currentUser) {
        ParentResponse response = parentService.linkChild(id, studentId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Child linked to parent successfully", response));
    }

    @DeleteMapping("/{id}/children/{studentId}")
    @Operation(summary = "Unlink Child from Parent", description = "Remove relationship between student and parent without deleting the student.")
    public ResponseEntity<ApiResponse<ParentResponse>> unlinkChild(
            @PathVariable Long id,
            @PathVariable Long studentId,
            @CurrentUser UserPrincipal currentUser) {
        ParentResponse response = parentService.unlinkChild(id, studentId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Child unlinked from parent successfully", response));
    }
}
