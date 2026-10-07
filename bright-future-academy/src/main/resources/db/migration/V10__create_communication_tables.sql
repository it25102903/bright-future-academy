-- ============================================================
-- V10: Communication Tables (Announcements & Notifications)
-- Bright Future Academy
-- ============================================================

-- Announcements
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by BIGINT NOT NULL,
    target_audience ENUM('ALL', 'ADMINISTRATORS', 'TEACHERS', 'STUDENTS', 'PARENTS', 'FINANCE_OFFICERS', 'SPECIFIC_CLASS') NOT NULL DEFAULT 'ALL',
    target_class_id BIGINT COMMENT 'Only if target_audience = SPECIFIC_CLASS',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED', 'EXPIRED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (target_class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_announcement_creator (created_by),
    INDEX idx_announcement_target (target_audience),
    INDEX idx_announcement_priority (priority),
    INDEX idx_announcement_status (status),
    INDEX idx_announcement_published (published_at),
    INDEX idx_announcement_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcement read tracking
CREATE TABLE announcement_recipients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_announcement_user (announcement_id, user_id),
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_announcement_recipient_user (user_id),
    INDEX idx_announcement_recipient_read (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT COMMENT 'NULL for system notifications',
    notification_type ENUM('GENERAL', 'ATTENDANCE', 'PAYMENT', 'SCHEDULE', 'CLASS', 'ASSIGNMENT', 'SYSTEM', 'REMINDER', 'INQUIRY') NOT NULL DEFAULT 'GENERAL',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50) COMMENT 'e.g. PAYMENT, ATTENDANCE_SESSION',
    reference_id BIGINT COMMENT 'ID of related entity',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH') NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notification_recipient (recipient_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_at),
    INDEX idx_notification_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification preferences (for future email/SMS integration)
CREATE TABLE notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type ENUM('GENERAL', 'ATTENDANCE', 'PAYMENT', 'SCHEDULE', 'CLASS', 'ASSIGNMENT', 'SYSTEM', 'REMINDER', 'INQUIRY') NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_notification_type (user_id, notification_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_pref_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
