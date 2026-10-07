package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.AnnouncementCreateRequest;
import com.brightfuture.academy.dto.response.AnnouncementResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.AnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcements", description = "Announcement management operations")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Create Announcement", description = "Create a new announcement. Admin and Teachers.")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        AnnouncementResponse response = announcementService.createAnnouncement(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Announcement created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List Announcements", description = "Get published announcements for authenticated users, or all announcements for admins.")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAnnouncements(
            @RequestParam(required = false) String audience,
            @RequestParam(required = false) Long classId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUser UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AnnouncementResponse> announcementPage;

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        boolean isTeacher = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        if (isAdmin) {
            if (audience != null && !audience.isBlank()) {
                announcementPage = announcementService.getPublishedAnnouncements(audience, classId, pageable);
            } else {
                announcementPage = announcementService.getAllAnnouncements(pageable);
            }
        } else if (isTeacher) {
            if (audience != null && !audience.isBlank()) {
                announcementPage = announcementService.getPublishedAnnouncements(audience, classId, pageable);
            } else {
                announcementPage = announcementService.getAnnouncementsForTeacher(currentUser.getId(), pageable);
            }
        } else {
            String targetAudience = audience;
            if (targetAudience == null || targetAudience.isBlank()) {
                boolean isStudent = currentUser.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
                boolean isParent = currentUser.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_PARENT"));
                if (isStudent) {
                    targetAudience = "STUDENTS";
                } else if (isParent) {
                    targetAudience = "PARENTS";
                } else {
                    targetAudience = "ALL";
                }
            }
            announcementPage = announcementService.getPublishedAnnouncements(targetAudience, classId, pageable);
        }

        ApiResponse<List<AnnouncementResponse>> response = ApiResponse.<List<AnnouncementResponse>>builder()
                .success(true)
                .message("Announcements retrieved successfully")
                .data(announcementPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(announcementPage.getNumber())
                        .size(announcementPage.getSize())
                        .totalElements(announcementPage.getTotalElements())
                        .totalPages(announcementPage.getTotalPages())
                        .last(announcementPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Announcement", description = "Get announcement by ID.")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncement(@PathVariable Long id) {
        AnnouncementResponse response = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Update Announcement", description = "Update announcement. Admin or author.")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        AnnouncementResponse response = announcementService.updateAnnouncement(id, request, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully", response));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Publish Announcement", description = "Publish a draft announcement. Admin or author.")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> publishAnnouncement(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        AnnouncementResponse response = announcementService.publishAnnouncement(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Announcement published successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'TEACHER')")
    @Operation(summary = "Archive Announcement", description = "Archive an announcement. Admin or author.")
    public ResponseEntity<ApiResponse<Void>> archiveAnnouncement(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        announcementService.archiveAnnouncement(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Announcement archived successfully"));
    }
}
