package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.request.PaymentCreateRequest;
import com.brightfuture.academy.dto.response.PaymentResponse;
import com.brightfuture.academy.entity.Payment;
import com.brightfuture.academy.entity.Student;
import com.brightfuture.academy.enums.PaymentMethod;
import com.brightfuture.academy.enums.PaymentStatus;
import com.brightfuture.academy.exception.ForbiddenException;
import com.brightfuture.academy.exception.ResourceNotFoundException;
import com.brightfuture.academy.repository.PaymentRepository;
import com.brightfuture.academy.repository.StudentRepository;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.brightfuture.academy.dto.response.StudentFeeAssignmentResponse;
import com.brightfuture.academy.enums.FeeStatus;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management operations")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    private void verifyStudentPaymentAccess(Long studentId, UserPrincipal currentUser) {
        if (currentUser.hasRole("STUDENT")) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
            if (!student.getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You are not authorized to access payment details for another student");
            }
        } else if (currentUser.hasRole("PARENT")) {
            List<Student> linkedStudents = studentRepository.findByParentUserId(currentUser.getId());
            boolean isLinked = linkedStudents.stream().anyMatch(s -> s.getId().equals(studentId));
            if (!isLinked) {
                throw new ForbiddenException("You are not authorized to access payment details for this student");
            }
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'ADMINISTRATOR')")
    @Operation(summary = "Record Payment", description = "Record a new payment.")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(
            @Valid @RequestBody PaymentCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        Payment payment = paymentService.recordPayment(
                request.getStudentId(),
                request.getAmount(),
                PaymentMethod.valueOf(request.getPaymentMethod()),
                request.getReferenceNumber(),
                request.getFeeAssignmentId(),
                request.getNotes(),
                currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment recorded successfully", mapToResponse(payment)));
    }

    @GetMapping("/fee-assignments")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER')")
    @Operation(summary = "List Fee Assignments", description = "Get list of student fee assignments with filters.")
    public ResponseEntity<ApiResponse<List<StudentFeeAssignmentResponse>>> getFeeAssignments(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) FeeStatus status,
            @RequestParam(required = false) String search) {
        List<StudentFeeAssignmentResponse> responses = paymentService.getFeeAssignments(studentId, status, search);
        return ResponseEntity.ok(ApiResponse.success("Fee assignments retrieved successfully", responses));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER', 'STUDENT', 'PARENT')")
    @Operation(summary = "List Payments", description = "Get paginated list of payments with filters.")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUser UserPrincipal currentUser) {

        Long effectiveStudentId = studentId;
        if (currentUser.hasRole("STUDENT")) {
            Student currentStudent = studentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user"));
            effectiveStudentId = currentStudent.getId();
        } else if (studentId != null) {
            verifyStudentPaymentAccess(studentId, currentUser);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> paymentPage = paymentRepository.findWithFilters(effectiveStudentId, status, dateFrom, dateTo, pageable);
        List<PaymentResponse> responses = paymentPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        ApiResponse<List<PaymentResponse>> response = ApiResponse.<List<PaymentResponse>>builder()
                .success(true)
                .message("Payments retrieved successfully")
                .data(responses)
                .pagination(ApiResponse.PageInfo.builder()
                        .page(paymentPage.getNumber())
                        .size(paymentPage.getSize())
                        .totalElements(paymentPage.getTotalElements())
                        .totalPages(paymentPage.getTotalPages())
                        .last(paymentPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get Payment", description = "Get payment details by ID.")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        verifyStudentPaymentAccess(payment.getStudent().getId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", mapToResponse(payment)));
    }

    @GetMapping("/students/{studentId}/balance")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get Student Balance", description = "Get outstanding balance for a student.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentBalance(
            @PathVariable Long studentId,
            @CurrentUser UserPrincipal currentUser) {
        verifyStudentPaymentAccess(studentId, currentUser);
        Map<String, Object> balance = paymentService.getStudentBalance(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student balance retrieved", balance));
    }

    @GetMapping("/{id}/receipt")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'FINANCE_OFFICER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get Receipt", description = "Get receipt info for a payment.")
    public ResponseEntity<ApiResponse<PaymentResponse>> getReceipt(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        verifyStudentPaymentAccess(payment.getStudent().getId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Receipt retrieved successfully", mapToResponse(payment)));
    }

    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .paymentReference(p.getPaymentReference())
                .studentId(p.getStudent().getId())
                .studentName(p.getStudent().getUser().getFullName())
                .studentIdNumber(p.getStudent().getStudentIdNumber())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod().name())
                .paymentReferenceNumber(p.getPaymentReferenceNumber())
                .recordedByName(p.getRecordedBy().getFullName())
                .notes(p.getNotes())
                .status(p.getStatus().name())
                .receiptNumber(p.getPaymentReference())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
