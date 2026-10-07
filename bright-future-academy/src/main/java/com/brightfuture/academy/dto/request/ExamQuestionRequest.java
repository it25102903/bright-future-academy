package com.brightfuture.academy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamQuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    private Integer questionOrder;

    @NotBlank(message = "Option A is required")
    private String optionA;

    @NotBlank(message = "Option B is required")
    private String optionB;

    @NotBlank(message = "Option C is required")
    private String optionC;

    @NotBlank(message = "Option D is required")
    private String optionD;

    @NotBlank(message = "Correct option is required")
    @Pattern(regexp = "^[ABCD]$", message = "Correct option must be exactly one of: A, B, C, D")
    private String correctOption;

    @NotNull(message = "Marks value is required")
    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks;

    private String explanation;
}
