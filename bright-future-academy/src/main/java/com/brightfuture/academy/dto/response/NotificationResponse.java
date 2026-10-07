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
public class NotificationResponse {
    private Long id;
    private String notificationType;
    private String title;
    private String message;
    private String entityType;
    private Long entityId;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
