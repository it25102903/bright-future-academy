-- ============================================================
-- V4: Academic Management Tables
-- Bright Future Academy
-- ============================================================

-- Subjects table
CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT,
    status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subjects_code (subject_code),
    INDEX idx_subjects_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes table
CREATE TABLE classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) COMMENT 'e.g. Grade 10, Year 1, Level 3',
    section VARCHAR(20) COMMENT 'e.g. A, B, C',
    academic_year INT NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_name_year (class_name, academic_year),
    INDEX idx_classes_year (academic_year),
    INDEX idx_classes_status (status),
    INDEX idx_classes_grade (grade_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Class-Subject junction (which subjects are taught in each class)
CREATE TABLE class_subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_subject (class_id, subject_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    INDEX idx_class_subjects_class (class_id),
    INDEX idx_class_subjects_subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classrooms / Physical rooms
CREATE TABLE classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100),
    building VARCHAR(100),
    floor INT,
    capacity INT NOT NULL DEFAULT 40,
    room_type ENUM('LECTURE_HALL', 'LAB', 'SEMINAR_ROOM', 'AUDITORIUM', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    facilities TEXT COMMENT 'e.g. projector, whiteboard, AC',
    status ENUM('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_classrooms_room (room_number),
    INDEX idx_classrooms_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Add foreign keys that were deferred from earlier migrations
-- ============================================================

-- student_enrollments.class_id -> classes.id
ALTER TABLE student_enrollments
    ADD CONSTRAINT fk_enrollments_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT;

-- teacher_subjects.subject_id -> subjects.id
ALTER TABLE teacher_subjects
    ADD CONSTRAINT fk_teacher_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT;

-- teacher_class_assignments.class_id -> classes.id
ALTER TABLE teacher_class_assignments
    ADD CONSTRAINT fk_tca_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT;

-- teacher_class_assignments.subject_id -> subjects.id
ALTER TABLE teacher_class_assignments
    ADD CONSTRAINT fk_tca_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT;
