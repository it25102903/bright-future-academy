package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassResponse {
    private Long id;
    private String className;
    private String gradeLevel;
    private String section;
    private Integer academicYear;
    private Integer capacity;
    private String description;
    private String status;
    private long enrolledCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
