package com.brightfuture.academy.dto.request;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamSubmitRequest {

    private List<AnswerItem> answers;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class AnswerItem {
        private Long questionId;
        private String selectedOption; // 'A', 'B', 'C', 'D' or null
    }
}
