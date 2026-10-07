package com.brightfuture.academy.entity;

import com.brightfuture.academy.enums.FeedbackAudience;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parent_feedbacks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ParentFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private User parentUser;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false)
    @Builder.Default
    private FeedbackAudience targetAudience = FeedbackAudience.TEACHERS_AND_ADMINISTRATORS;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "SUBMITTED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
