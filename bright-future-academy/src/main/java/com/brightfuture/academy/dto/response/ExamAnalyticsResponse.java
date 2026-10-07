package com.brightfuture.academy.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamAnalyticsResponse {

    private Long examId;
    private String examTitle;
    private Integer totalAssigned;
    private Integer totalAttempted;
    private Integer totalSubmitted;
    private Integer totalNotAttempted;
    private BigDecimal completionRate;
    private Double averagePercentage;
    private Integer highestScore;
    private Integer lowestScore;
    private Integer totalMarks;
    private Integer passingMarks;
    private Integer passedCount;
    private Integer failedCount;
    private List<StudentSubmissionItem> submissions;
    private List<QuestionAccuracyItem> questionAnalytics;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class StudentSubmissionItem {
        private Long attemptId;
        private Long studentId;
        private String studentName;
        private String studentIdNumber;
        private String className;
        private Integer score;
        private Integer totalMarks;
        private BigDecimal percentage;
        private Boolean passed;
        private String status; // SUBMITTED, IN_PROGRESS, NOT_ATTEMPTED
        private LocalDateTime submittedAt;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class QuestionAccuracyItem {
        private Long questionId;
        private Integer questionOrder;
        private String questionText;
        private String correctOption;
        private Integer totalResponses;
        private Integer correctResponses;
        private Double accuracyPercentage;
    }
}
