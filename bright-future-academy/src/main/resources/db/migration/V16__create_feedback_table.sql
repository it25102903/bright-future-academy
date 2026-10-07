-- ============================================================
-- V16: Parent Feedback Tables
-- Bright Future Academy
-- ============================================================

CREATE TABLE parent_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience ENUM('TEACHERS', 'ADMINISTRATORS', 'TEACHERS_AND_ADMINISTRATORS') NOT NULL DEFAULT 'TEACHERS_AND_ADMINISTRATORS',
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_feedback_parent (parent_user_id),
    INDEX idx_feedback_audience (target_audience),
    INDEX idx_feedback_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
