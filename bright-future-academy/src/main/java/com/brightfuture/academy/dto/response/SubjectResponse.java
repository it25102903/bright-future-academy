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
public class SubjectResponse {
    private Long id;
    private String subjectCode;
    private String name;
    private String description;
    private Integer credits;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
