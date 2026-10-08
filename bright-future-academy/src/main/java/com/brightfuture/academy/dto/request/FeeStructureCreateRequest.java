package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureCreateRequest {

    @NotBlank(message = "Fee name is required")
    @Size(max = 200, message = "Fee name must not exceed 200 characters")
    private String name;

    private String description;

    @NotBlank(message = "Fee type is required")
    private String feeType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    private Long classId;
    private String feeName;

    public String getName() {
        return name != null && !name.isBlank() ? name : feeName;
    }

    public String getFrequency() {
        return frequency != null && !frequency.isBlank() ? frequency : "ANNUAL";
    }
}

