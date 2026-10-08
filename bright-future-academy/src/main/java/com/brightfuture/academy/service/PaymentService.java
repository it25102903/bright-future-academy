package com.brightfuture.academy.service;

import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.enums.*;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.*;

import com.brightfuture.academy.dto.response.StudentFeeAssignmentResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final StudentRepository studentRepository;
    private final StudentFeeAssignmentRepository feeAssignmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<StudentFeeAssignmentResponse> getFeeAssignments(Long studentId, FeeStatus status, String search) {
        List<StudentFeeAssignment> assignments = feeAssignmentRepository.findWithFilters(studentId, status, search);
        return assignments.stream().map(this::mapToAssignmentResponse).toList();
    }

    private StudentFeeAssignmentResponse mapToAssignmentResponse(StudentFeeAssignment a) {
        String className = null;
        if (a.getFeeStructure() != null && a.getFeeStructure().getClassEntity() != null) {
            className = a.getFeeStructure().getClassEntity().getClassName();
        }
        return StudentFeeAssignmentResponse.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getFullName())
                .studentIdNumber(a.getStudent().getStudentIdNumber())
                .className(className)
                .feeStructureId(a.getFeeStructure() != null ? a.getFeeStructure().getId() : null)
                .feeStructureName(a.getFeeStructure() != null ? a.getFeeStructure().getName() : "General Fee")
                .feeType(a.getFeeStructure() != null ? a.getFeeStructure().getFeeType() : "TUITION")
                .assignedAmount(a.getAssignedAmount())
                .discountAmount(a.getDiscountAmount())
                .discountReason(a.getDiscountReason())
                .totalPaid(a.getTotalPaid())
                .outstandingBalance(a.getOutstandingBalance())
                .dueDate(a.getDueDate())
                .feeStatus(a.getFeeStatus().name())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }


    /**
     * Record a payment — fully transactional.
     * Creates Payment → Updates Fee Balance → Generates Receipt → Audit Log.
     * ROLLBACK on any failure.
     */
    @Transactional
    public Payment recordPayment(Long studentId, BigDecimal amount, PaymentMethod paymentMethod,
                                  String referenceNumber, Long feeAssignmentId,
                                  String notes, Long recordedByUserId) {
        // Validate
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        User recordedBy = userRepository.findById(recordedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recordedByUserId));

        // Generate payment reference
        String paymentRef = generatePaymentReference();

        // 1. Create Payment
        Payment payment = Payment.builder()
                .paymentReference(paymentRef)
                .student(student)
                .amount(amount)
                .paymentDate(LocalDate.now())
                .paymentMethod(paymentMethod)
                .paymentReferenceNumber(referenceNumber)
                .recordedBy(recordedBy)
                .notes(notes)
                .status(PaymentStatus.COMPLETED)
                .build();
        payment = paymentRepository.save(payment);

        // 2. Update Fee Balance (if fee assignment specified)
        if (feeAssignmentId != null) {
            StudentFeeAssignment feeAssignment = feeAssignmentRepository.findById(feeAssignmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("FeeAssignment", "id", feeAssignmentId));

            BigDecimal newTotalPaid = feeAssignment.getTotalPaid().add(amount);
            feeAssignment.setTotalPaid(newTotalPaid);

            BigDecimal outstanding = feeAssignment.getAssignedAmount()
                    .subtract(feeAssignment.getDiscountAmount())
                    .subtract(newTotalPaid);

            if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
                feeAssignment.setFeeStatus(FeeStatus.PAID);
            } else {
                feeAssignment.setFeeStatus(FeeStatus.PARTIALLY_PAID);
            }
            feeAssignmentRepository.save(feeAssignment);
        }

        // 3. Generate Receipt
        String receiptNumber = generateReceiptNumber();
        Receipt receipt = Receipt.builder()
                .receiptNumber(receiptNumber)
                .payment(payment)
                .student(student)
                .amount(amount)
                .receiptDate(LocalDate.now())
                .issuedBy(recordedBy)
                .notes(notes)
                .status("ACTIVE")
                .build();
        receiptRepository.save(receipt);

        // 4. Audit Log
        auditLogService.log(recordedByUserId, "CREATE_PAYMENT", "PAYMENT", payment.getId(),
                String.format("Recorded payment %s of LKR %s for student %s",
                        paymentRef, amount, student.getStudentIdNumber()));

        return payment;
    }

    @Transactional(readOnly = true)
    public Page<Payment> getPayments(Long studentId, PaymentStatus status,
                                      LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        return paymentRepository.findWithFilters(studentId, status, dateFrom, dateTo, pageable);
    }

    @Transactional(readOnly = true)
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentBalance(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        List<StudentFeeAssignment> fees = feeAssignmentRepository.findByStudentId(studentId);

        BigDecimal totalFees = BigDecimal.ZERO;
        BigDecimal totalDiscounts = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        for (StudentFeeAssignment fee : fees) {
            totalFees = totalFees.add(fee.getAssignedAmount());
            totalDiscounts = totalDiscounts.add(fee.getDiscountAmount());
            totalPaid = totalPaid.add(fee.getTotalPaid());
        }

        BigDecimal outstandingBalance = totalFees.subtract(totalDiscounts).subtract(totalPaid);

        Map<String, Object> balance = new LinkedHashMap<>();
        balance.put("studentId", studentId);
        balance.put("studentName", student.getUser().getFullName());
        balance.put("studentIdNumber", student.getStudentIdNumber());
        balance.put("totalFees", totalFees);
        balance.put("totalDiscounts", totalDiscounts);
        balance.put("totalPaid", totalPaid);
        balance.put("outstandingBalance", outstandingBalance);
        balance.put("feeDetails", fees.stream().map(f -> {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("feeId", f.getId());
            detail.put("feeName", f.getFeeStructure().getName());
            detail.put("assignedAmount", f.getAssignedAmount());
            detail.put("discount", f.getDiscountAmount());
            detail.put("paid", f.getTotalPaid());
            detail.put("outstanding", f.getOutstandingBalance());
            detail.put("dueDate", f.getDueDate());
            detail.put("status", f.getFeeStatus().name());
            return detail;
        }).toList());

        return balance;
    }

    @Transactional(readOnly = true)
    public Receipt getReceiptByPaymentId(Long paymentId) {
        return receiptRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt", "paymentId", paymentId));
    }

    private String generatePaymentReference() {
        String year = String.valueOf(Year.now().getValue());
        Integer maxSeq = paymentRepository.findMaxPaymentSequenceForYear(year);
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        return String.format("PAY-%s-%06d", year, nextSeq);
    }

    private String generateReceiptNumber() {
        String year = String.valueOf(Year.now().getValue());
        Integer maxSeq = receiptRepository.findMaxReceiptSequenceForYear(year);
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        return String.format("RCP-%s-%06d", year, nextSeq);
    }
}
