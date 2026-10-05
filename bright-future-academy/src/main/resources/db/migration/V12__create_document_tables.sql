-- ============================================================
-- V12: Document Management Table
-- Bright Future Academy
-- ============================================================

-- Documents (generic document/file metadata storage)
CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL COMMENT 'Size in bytes',
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    entity_type VARCHAR(50) NOT NULL COMMENT 'e.g. STUDENT, PAYMENT, RECEIPT, INQUIRY, MATERIAL',
    entity_id BIGINT NOT NULL COMMENT 'ID of the related entity',
    description TEXT,
    uploaded_by BIGINT NOT NULL,
    status ENUM('ACTIVE', 'ARCHIVED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_document_entity (entity_type, entity_id),
    INDEX idx_document_uploader (uploaded_by),
    INDEX idx_document_type (file_type),
    INDEX idx_document_status (status),
    INDEX idx_document_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
