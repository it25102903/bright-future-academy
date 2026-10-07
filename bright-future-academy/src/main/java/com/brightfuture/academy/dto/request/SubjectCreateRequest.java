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
public class SubjectCreateRequest {

    @NotBlank(message = "Subject code is required")
    @Size(max = 20, message = "Subject code must not exceed 20 characters")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    @Size(max = 200, message = "Subject name must not exceed 200 characters")
    private String name;

    private String description;

    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;
}
