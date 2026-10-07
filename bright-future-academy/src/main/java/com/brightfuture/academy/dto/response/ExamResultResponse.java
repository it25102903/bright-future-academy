package com.brightfuture.academy.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamResultResponse {

    private Long attemptId;
    private Long examId;
    private String examTitle;
    private String subjectName;
    private String studentName;
    private String studentIdNumber;
    private Integer score;
    private Integer totalMarks;
    private BigDecimal percentage;
    private Boolean passed;
    private Integer passingMarks;
    private LocalDateTime startTime;
    private LocalDateTime submittedAt;
    private Long timeSpentSeconds;
    private Integer totalQuestions;
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer unansweredCount;
    private List<AnswerResultItem> answers;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class AnswerResultItem {
        private Long questionId;
        private Integer questionOrder;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String selectedOption;
        private String correctOption;
        private boolean isCorrect;
        private Integer marksAwarded;
        private Integer maxMarks;
        private String explanation;
    }
}
