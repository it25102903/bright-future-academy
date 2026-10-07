package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.ParentFeedbackRequest;
import com.brightfuture.academy.dto.response.ParentFeedbackResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.ParentFeedbackService;
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
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Tag(name = "Parent Feedback", description = "Parent feedback submission, ownership control, and role-scoped retrieval")
public class ParentFeedbackController {

    private final ParentFeedbackService parentFeedbackService;

    @PostMapping
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Submit Feedback", description = "Parent submits feedback specifying target audience (Teachers, Administrators, or Both).")
    public ResponseEntity<ApiResponse<ParentFeedbackResponse>> createFeedback(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ParentFeedbackRequest request) {
        ParentFeedbackResponse response = parentFeedbackService.createFeedback(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Get My Feedbacks", description = "Retrieve list of feedback submitted by the currently logged in parent.")
    public ResponseEntity<ApiResponse<List<ParentFeedbackResponse>>> getMyFeedbacks(
            @CurrentUser UserPrincipal currentUser) {
        List<ParentFeedbackResponse> responses = parentFeedbackService.getFeedbacksForParent(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Parent feedbacks retrieved", responses));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Delete Feedback", description = "Parent deletes their own feedback entry. Strictly verifies ownership.")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        parentFeedbackService.deleteFeedback(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted successfully"));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get Feedback for Teachers", description = "Teachers view feedback addressed to Teachers or Both Teachers & Administrators.")
    public ResponseEntity<ApiResponse<List<ParentFeedbackResponse>>> getTeacherFeedbacks() {
        List<ParentFeedbackResponse> responses = parentFeedbackService.getFeedbacksForTeachers();
        return ResponseEntity.ok(ApiResponse.success("Teacher feedbacks retrieved", responses));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get Feedback for Administrators", description = "Administrators view feedback addressed to Administrators or Both Teachers & Administrators.")
    public ResponseEntity<ApiResponse<List<ParentFeedbackResponse>>> getAdminFeedbacks() {
        List<ParentFeedbackResponse> responses = parentFeedbackService.getFeedbacksForAdministrators();
        return ResponseEntity.ok(ApiResponse.success("Admin feedbacks retrieved", responses));
    }
}
