package com.brightfuture.academy.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamTakeResponse {

    private Long attemptId;
    private Long examId;
    private String title;
    private String description;
    private String subjectName;
    private String teacherName;
    private Integer durationMinutes;
    private Long remainingSeconds;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalMarks;
    private Integer questionCount;
    private String instructions;
    private String externalResourceUrl;
    private List<QuestionItem> questions;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class QuestionItem {
        private Long id;
        private Integer questionOrder;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer marks;
        private String savedAnswer; // Previously saved answer if student refreshed
    }
}
