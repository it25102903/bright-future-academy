package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.ParentProfileUpdateRequest;
import com.brightfuture.academy.dto.response.ParentProfileResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.ParentProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parents/profile")
@RequiredArgsConstructor
@Tag(name = "Parent Profile", description = "Parent profile management and personal detail updates")
public class ParentProfileController {

    private final ParentProfileService parentProfileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Get My Profile", description = "Get profile information for the authenticated parent.")
    public ResponseEntity<ApiResponse<ParentProfileResponse>> getMyProfile(
            @CurrentUser UserPrincipal currentUser) {
        ParentProfileResponse response = parentProfileService.getParentProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Parent profile retrieved", response));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Update My Profile", description = "Update permitted personal contact and address details for the authenticated parent.")
    public ResponseEntity<ApiResponse<ParentProfileResponse>> updateMyProfile(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ParentProfileUpdateRequest request) {
        ParentProfileResponse response = parentProfileService.updateParentProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
