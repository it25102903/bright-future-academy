-- ============================================================
-- V7: NFC Attendance Tables
-- Bright Future Academy
-- ============================================================

-- NFC/RFID reader devices
CREATE TABLE attendance_devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_identifier VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique hardware identifier',
    device_name VARCHAR(200) NOT NULL,
    location VARCHAR(255) COMMENT 'Physical location of the device',
    classroom_id BIGINT COMMENT 'If fixed to a classroom',
    device_type ENUM('NFC_READER', 'RFID_READER', 'BIOMETRIC', 'OTHER') NOT NULL DEFAULT 'NFC_READER',
    api_key_hash VARCHAR(255) NOT NULL COMMENT 'Hashed API key for device authentication',
    last_heartbeat TIMESTAMP NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
    INDEX idx_device_identifier (device_identifier),
    INDEX idx_device_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NFC credentials issued to students
CREATE TABLE nfc_credentials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    card_uid_hash VARCHAR(255) NOT NULL UNIQUE COMMENT 'Hashed NFC card UID - never store raw',
    secure_token VARCHAR(255) NOT NULL UNIQUE COMMENT 'Secure token for validation',
    card_serial VARCHAR(50) COMMENT 'Last 4 digits of card serial for display',
    issued_date DATE NOT NULL,
    expiry_date DATE,
    status ENUM('ACTIVE', 'REVOKED', 'EXPIRED', 'LOST', 'REPLACED') NOT NULL DEFAULT 'ACTIVE',
    revoked_reason VARCHAR(255),
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    INDEX idx_nfc_student (student_id),
    INDEX idx_nfc_token (secure_token),
    INDEX idx_nfc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NFC tap events (raw event log)
CREATE TABLE nfc_attendance_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    nfc_credential_id BIGINT,
    student_id BIGINT,
    attendance_record_id BIGINT COMMENT 'Created attendance record, if successful',
    raw_card_data_hash VARCHAR(255) NOT NULL COMMENT 'Hash of raw tap data for audit',
    event_type ENUM('TAP_IN', 'TAP_OUT', 'INVALID', 'DUPLICATE', 'DEVICE_ERROR') NOT NULL,
    event_status ENUM('SUCCESS', 'FAILED', 'REJECTED') NOT NULL,
    failure_reason VARCHAR(255),
    tap_timestamp TIMESTAMP NOT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES attendance_devices(id) ON DELETE RESTRICT,
    FOREIGN KEY (nfc_credential_id) REFERENCES nfc_credentials(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE SET NULL,
    INDEX idx_nfc_event_device (device_id),
    INDEX idx_nfc_event_student (student_id),
    INDEX idx_nfc_event_time (tap_timestamp),
    INDEX idx_nfc_event_type (event_type),
    INDEX idx_nfc_event_status (event_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
