-- ============================================================
-- V2: Student Management Tables
-- Bright Future Academy
-- ============================================================

-- Students table
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    student_id_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. BFA-2026-0001',
    date_of_birth DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    nic_number VARCHAR(20) UNIQUE COMMENT 'National ID if applicable',
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    blood_group VARCHAR(5),
    medical_notes TEXT,
    admission_date DATE NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'WITHDRAWN', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_students_student_id (student_id_number),
    INDEX idx_students_user (user_id),
    INDEX idx_students_status (status),
    INDEX idx_students_admission (admission_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guardians table (can also be parents)
CREATE TABLE guardians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE COMMENT 'If guardian has a login account (parent role)',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL COMMENT 'FATHER, MOTHER, GUARDIAN, etc.',
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    nic_number VARCHAR(20),
    occupation VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_guardians_user (user_id),
    INDEX idx_guardians_phone (phone),
    INDEX idx_guardians_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student-Guardian junction (a student can have multiple guardians, a guardian multiple students)
CREATE TABLE student_guardians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    guardian_id BIGINT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_guardian (student_id, guardian_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student enrollments
CREATE TABLE student_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL COMMENT 'FK added after classes table creation',
    academic_year INT NOT NULL,
    enrollment_date DATE NOT NULL,
    withdrawal_date DATE,
    status ENUM('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'TRANSFERRED') NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_class_year (student_id, class_id, academic_year),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_class (class_id),
    INDEX idx_enrollments_year (academic_year),
    INDEX idx_enrollments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
