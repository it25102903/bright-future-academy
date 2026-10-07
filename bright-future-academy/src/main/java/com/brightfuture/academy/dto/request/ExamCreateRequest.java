package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamCreateRequest {

    @NotBlank(message = "Exam title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private Long classId;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 360, message = "Duration cannot exceed 360 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Start date/time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End date/time is required")
    private LocalDateTime endTime;

    @Min(value = 0, message = "Passing marks must be positive")
    private Integer passingMarks;

    private String instructions;

    @Pattern(regexp = "^(https?://.+)?$", message = "External resource must be a valid http or https URL")
    private String externalResourceUrl;
}
