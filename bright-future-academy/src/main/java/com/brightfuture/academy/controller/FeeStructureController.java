package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.FeeAssignRequest;
import com.brightfuture.academy.dto.request.FeeStructureCreateRequest;
import com.brightfuture.academy.dto.response.FeeStructureResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.FeeStructureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fee-structures")
@RequiredArgsConstructor
@Tag(name = "Fee Structures", description = "Fee structure management operations")
public class FeeStructureController {

    private final FeeStructureService feeStructureService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "Create Fee Structure", description = "Create a new fee structure.")
    public ResponseEntity<ApiResponse<FeeStructureResponse>> createFeeStructure(
            @Valid @RequestBody FeeStructureCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        FeeStructureResponse response = feeStructureService.createFeeStructure(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fee structure created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "List Fee Structures", description = "Get all fee structures.")
    public ResponseEntity<ApiResponse<List<FeeStructureResponse>>> getAllFeeStructures() {
        List<FeeStructureResponse> responses = feeStructureService.getAllFeeStructures();
        return ResponseEntity.ok(ApiResponse.success("Fee structures retrieved successfully", responses));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "Get Fee Structure", description = "Get fee structure by ID.")
    public ResponseEntity<ApiResponse<FeeStructureResponse>> getFeeStructure(@PathVariable Long id) {
        FeeStructureResponse response = feeStructureService.getFeeStructureById(id);
        return ResponseEntity.ok(ApiResponse.success("Fee structure retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "Update Fee Structure", description = "Update fee structure details.")
    public ResponseEntity<ApiResponse<FeeStructureResponse>> updateFeeStructure(
            @PathVariable Long id,
            @Valid @RequestBody FeeStructureCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        FeeStructureResponse response = feeStructureService.updateFeeStructure(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Fee structure updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "Delete Fee Structure", description = "Soft-delete a fee structure.")
    public ResponseEntity<ApiResponse<Void>> deleteFeeStructure(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        feeStructureService.deleteFeeStructure(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Fee structure deleted successfully"));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "Assign Fee to Student", description = "Assign a fee structure to a student.")
    public ResponseEntity<ApiResponse<Void>> assignFeeToStudent(
            @PathVariable Long id,
            @Valid @RequestBody FeeAssignRequest request,
            @CurrentUser UserPrincipal currentUser) {
        feeStructureService.assignFeeToStudent(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Fee assigned to student successfully"));
    }
}
