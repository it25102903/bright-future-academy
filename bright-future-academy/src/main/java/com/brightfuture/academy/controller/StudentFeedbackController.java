package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.StudentFeedbackRequest;
import com.brightfuture.academy.dto.response.StudentFeedbackResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.StudentFeedbackService;
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
@RequestMapping("/api/student-feedback")
@RequiredArgsConstructor
@Tag(name = "Student Feedback", description = "Student feedback creation, student management, and teacher retrieval")
public class StudentFeedbackController {

    private final StudentFeedbackService studentFeedbackService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit Student Feedback", description = "Student submits feedback to a targeted teacher or general faculty.")
    public ResponseEntity<ApiResponse<StudentFeedbackResponse>> createFeedback(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody StudentFeedbackRequest request) {
        StudentFeedbackResponse response = studentFeedbackService.createFeedback(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get My Feedbacks", description = "Get feedbacks submitted by the authenticated student.")
    public ResponseEntity<ApiResponse<List<StudentFeedbackResponse>>> getMyFeedbacks(
            @CurrentUser UserPrincipal currentUser) {
        List<StudentFeedbackResponse> list = studentFeedbackService.getStudentFeedbacks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Student feedbacks retrieved", list));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete My Feedback", description = "Student deletes a feedback entry owned by them.")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        studentFeedbackService.deleteFeedback(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted successfully", null));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get Feedbacks for Teacher", description = "Get feedbacks sent by students addressed to the authenticated teacher or faculty.")
    public ResponseEntity<ApiResponse<List<StudentFeedbackResponse>>> getTeacherFeedbacks(
            @CurrentUser UserPrincipal currentUser) {
        List<StudentFeedbackResponse> list = studentFeedbackService.getTeacherFeedbacks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Teacher student feedbacks retrieved", list));
    }
}
