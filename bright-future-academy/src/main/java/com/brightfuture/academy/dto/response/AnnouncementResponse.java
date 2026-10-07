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
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private Long createdById;
    private String createdByName;
    private String targetAudience;
    private Long targetClassId;
    private String targetClassName;
    private String priority;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getAuthorName() {
        return createdByName;
    }

    public Long getAuthorId() {
        return createdById;
    }

    public Long getClassId() {
        return targetClassId;
    }

    public String getClassName() {
        return targetClassName;
    }
}
