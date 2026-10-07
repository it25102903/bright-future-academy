package com.brightfuture.academy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempt_answers", uniqueConstraints = {
    @UniqueConstraint(name = "uk_attempt_question", columnNames = {"attempt_id", "question_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExamQuestion question;

    @Column(name = "selected_option", length = 1)
    private String selectedOption; // 'A', 'B', 'C', 'D'

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect = false;

    @Column(name = "marks_awarded", nullable = false)
    private Integer marksAwarded = 0;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        answeredAt = LocalDateTime.now();
    }
}
