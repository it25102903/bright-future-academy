package com.brightfuture.academy.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamStudentResponse {

    private Long id;
    private String title;
    private String description;
    private String subjectName;
    private String teacherName;
    private String className;
    private Integer durationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalMarks;
    private Integer passingMarks;
    private Integer questionCount;
    private String instructions;
    private String externalResourceUrl;

    // Student specific state
    private String studentExamStatus; // 'AVAILABLE', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'
    private Long attemptId;
    private String attemptStatus;
    private Integer score;
    private BigDecimal percentage;
    private Boolean passed;
    private LocalDateTime submittedAt;
}
