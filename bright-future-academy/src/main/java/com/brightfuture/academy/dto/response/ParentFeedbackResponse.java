package com.brightfuture.academy.dto.response;

import com.brightfuture.academy.enums.FeedbackAudience;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ParentFeedbackResponse {
    private Long id;
    private Long parentUserId;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String subject;
    private String message;
    private FeedbackAudience targetAudience;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
