package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.*;
import com.brightfuture.academy.dto.response.*;
import com.brightfuture.academy.enums.ExamStatus;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.ExamService;
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
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "Examination, Quiz Authoring, and Attempt Evaluation System")
public class ExamController {

    private final ExamService examService;

    // =========================================================================
    // TEACHER ENDPOINTS
    // =========================================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Create Exam Draft", description = "Create a new exam in draft status.")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @Valid @RequestBody ExamCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExamResponse response = examService.createExam(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exam draft created successfully", response));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "List Teacher Exams", description = "Get exams created by the authenticated teacher.")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getTeacherExams(
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(required = false) String search,
            @CurrentUser UserPrincipal currentUser) {
        List<ExamResponse> response = examService.getTeacherExams(currentUser.getId(), status, search);
        return ResponseEntity.ok(ApiResponse.success("Teacher exams retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Get Exam Details", description = "Get full details of an exam including questions and assigned student IDs.")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        ExamResponse response = examService.getExamById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Update Exam", description = "Update exam settings and scheduling.")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExamResponse response = examService.updateExam(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Delete Exam", description = "Delete an exam if no submissions exist.")
    public ResponseEntity<ApiResponse<Void>> deleteExam(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        examService.deleteExam(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully"));
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Add Question", description = "Add a 4-option multiple-choice question to an exam.")
    public ResponseEntity<ApiResponse<ExamQuestionResponse>> addQuestion(
            @PathVariable Long id,
            @Valid @RequestBody ExamQuestionRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExamQuestionResponse response = examService.addQuestion(id, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question added successfully", response));
    }

    @PutMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Update Question", description = "Update an existing MCQ question.")
    public ResponseEntity<ApiResponse<ExamQuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @PathVariable Long questionId,
            @Valid @RequestBody ExamQuestionRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExamQuestionResponse response = examService.updateQuestion(id, questionId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", response));
    }

    @DeleteMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Delete Question", description = "Delete a question from an exam.")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long id,
            @PathVariable Long questionId,
            @CurrentUser UserPrincipal currentUser) {
        examService.deleteQuestion(id, questionId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully"));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Assign Exam", description = "Assign exam to an entire class cohort or specific student IDs.")
    public ResponseEntity<ApiResponse<ExamResponse>> assignExam(
            @PathVariable Long id,
            @RequestBody ExamAssignRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExamResponse response = examService.assignExam(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam assignments updated successfully", response));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Publish Exam", description = "Validate exam readiness and publish for assigned students.")
    public ResponseEntity<ApiResponse<ExamResponse>> publishExam(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        ExamResponse response = examService.publishExam(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", response));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Close Exam", description = "Close an exam to prevent further attempts.")
    public ResponseEntity<ApiResponse<ExamResponse>> closeExam(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        ExamResponse response = examService.closeExam(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam closed successfully", response));
    }

    @GetMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMINISTRATOR')")
    @Operation(summary = "Get Exam Results & Analytics", description = "Get student submission roster and question performance metrics.")
    public ResponseEntity<ApiResponse<ExamAnalyticsResponse>> getExamResults(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        ExamAnalyticsResponse response = examService.getExamAnalytics(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam results retrieved successfully", response));
    }

    // =========================================================================
    // STUDENT ENDPOINTS
    // =========================================================================

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get Student Assigned Exams", description = "List all exams assigned to the authenticated student.")
    public ResponseEntity<ApiResponse<List<ExamStudentResponse>>> getStudentExams(
            @CurrentUser UserPrincipal currentUser) {
        List<ExamStudentResponse> response = examService.getStudentExams(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Assigned exams retrieved successfully", response));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start Exam Attempt", description = "Initialize or resume an exam attempt and receive sanitized questions.")
    public ResponseEntity<ApiResponse<ExamTakeResponse>> startExam(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        ExamTakeResponse response = examService.startExam(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam session initialized successfully", response));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit Exam", description = "Submit answers for server-side grading and calculation.")
    public ResponseEntity<ApiResponse<ExamResultResponse>> submitExam(
            @PathVariable Long id,
            @RequestBody ExamSubmitRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExamResultResponse response = examService.submitExam(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam submitted and graded successfully", response));
    }

    @GetMapping("/{id}/my-result")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get Student Exam Result", description = "Get individual score and question review for a submitted exam.")
    public ResponseEntity<ApiResponse<ExamResultResponse>> getMyResult(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        ExamResultResponse response = examService.getStudentResult(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam result retrieved successfully", response));
    }
}
