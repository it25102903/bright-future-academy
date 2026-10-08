package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureResponse {
    private Long id;
    private String name;
    private String description;
    private String feeType;
    private BigDecimal amount;
    private String frequency;
    private Integer academicYear;
    private Long classId;
    private String className;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    public String getFeeName() {
        return name;
    }
}

