package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeAssignRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private LocalDate dueDate;

    @DecimalMin(value = "0.00", message = "Discount amount must be non-negative")
    private BigDecimal discountAmount;
    private BigDecimal discountedAmount;

    private String discountReason;
    private String notes;

    public BigDecimal getDiscountAmount() {
        return discountAmount != null ? discountAmount : (discountedAmount != null ? discountedAmount : BigDecimal.ZERO);
    }
}

