package com.brightfuture.academy.dto.response;

import com.brightfuture.academy.enums.ExamStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamResponse {

    private Long id;
    private String title;
    private String description;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long teacherId;
    private String teacherName;
    private Long classId;
    private String className;
    private Integer durationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ExamStatus status;
    private Integer totalMarks;
    private Integer passingMarks;
    private String instructions;
    private String externalResourceUrl;
    private Integer questionCount;
    private Integer assignedCount;
    private Integer submissionCount;
    private List<ExamQuestionResponse> questions;
    private List<Long> assignedStudentIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
