package com.brightfuture.academy.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamQuestionResponse {

    private Long id;
    private Long examId;
    private String questionText;
    private Integer questionOrder;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private Integer marks;
    private String explanation;
    private LocalDateTime createdAt;
}
