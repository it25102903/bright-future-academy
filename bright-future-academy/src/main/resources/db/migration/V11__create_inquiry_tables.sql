-- ============================================================
-- V11: Inquiry / Feedback Tables
-- Bright Future Academy
-- ============================================================

-- Inquiries / Feedback / Complaints
CREATE TABLE inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submitted_by BIGINT NOT NULL,
    category ENUM('INQUIRY', 'SUGGESTION', 'COMPLAINT', 'REQUEST', 'FEEDBACK', 'OTHER') NOT NULL DEFAULT 'INQUIRY',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    assigned_to BIGINT COMMENT 'Admin assigned to handle this',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_inquiry_submitter (submitted_by),
    INDEX idx_inquiry_category (category),
    INDEX idx_inquiry_status (status),
    INDEX idx_inquiry_assigned (assigned_to),
    INDEX idx_inquiry_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inquiry responses
CREATE TABLE inquiry_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inquiry_id BIGINT NOT NULL,
    responded_by BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_internal_note BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Internal admin notes not visible to submitter',
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_inquiry_response_inquiry (inquiry_id),
    INDEX idx_inquiry_response_responder (responded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
