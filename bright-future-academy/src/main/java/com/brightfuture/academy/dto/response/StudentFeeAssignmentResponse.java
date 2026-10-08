package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeAssignmentResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private String className;
    private Long feeStructureId;
    private String feeStructureName;
    private String feeType;
    private BigDecimal assignedAmount;
    private BigDecimal discountAmount;
    private String discountReason;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;
    private LocalDate dueDate;
    private String feeStatus;
    private String notes;
    private LocalDateTime createdAt;
}
