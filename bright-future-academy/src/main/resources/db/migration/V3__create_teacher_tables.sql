-- ============================================================
-- V3: Teacher Management Tables
-- Bright Future Academy
-- ============================================================

-- Teachers table
CREATE TABLE teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_id VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. TCH-2026-001',
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    nic_number VARCHAR(20) UNIQUE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    hire_date DATE NOT NULL,
    employment_status ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'PROBATION') NOT NULL DEFAULT 'FULL_TIME',
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_teachers_user (user_id),
    INDEX idx_teachers_employee_id (employee_id),
    INDEX idx_teachers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher-Subject assignments (which subjects a teacher can teach)
CREATE TABLE teacher_subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL COMMENT 'FK added after subjects table creation',
    assigned_date DATE NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_teacher_subject (teacher_id, subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_teacher_subjects_teacher (teacher_id),
    INDEX idx_teacher_subjects_subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher-Class assignments (which classes a teacher is assigned to teach)
CREATE TABLE teacher_class_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL COMMENT 'FK added after classes table creation',
    subject_id BIGINT NOT NULL COMMENT 'FK added after subjects table creation',
    academic_year INT NOT NULL,
    is_class_teacher BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this teacher is the homeroom/class teacher',
    assigned_date DATE NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_teacher_class_subject_year (teacher_id, class_id, subject_id, academic_year),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_tca_teacher (teacher_id),
    INDEX idx_tca_class (class_id),
    INDEX idx_tca_subject (subject_id),
    INDEX idx_tca_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
