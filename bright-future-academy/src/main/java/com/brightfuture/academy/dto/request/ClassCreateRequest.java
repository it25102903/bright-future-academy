package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassCreateRequest {

    @NotBlank(message = "Class name is required")
    @Size(max = 100, message = "Class name must not exceed 100 characters")
    private String className;

    @Size(max = 50, message = "Grade level must not exceed 50 characters")
    private String gradeLevel;

    @Size(max = 20, message = "Section must not exceed 20 characters")
    private String section;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 200, message = "Capacity must not exceed 200")
    private Integer capacity;

    private String description;
}
