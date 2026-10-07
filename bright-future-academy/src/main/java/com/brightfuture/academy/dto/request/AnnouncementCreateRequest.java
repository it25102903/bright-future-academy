package com.brightfuture.academy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotBlank(message = "Target audience is required")
    private String targetAudience;

    @JsonAlias({"classId", "targetClassId"})
    private Long targetClassId;

    private String priority;

    private LocalDateTime expiresAt;

    private Boolean publishImmediately;

    private String status;

    public void setClassId(Long classId) {
        if (this.targetClassId == null) {
            this.targetClassId = classId;
        }
    }

    public Long getClassId() {
        return this.targetClassId;
    }
}
