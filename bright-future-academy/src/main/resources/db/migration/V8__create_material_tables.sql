-- ============================================================
-- V8: Academic Materials, Assignments & Marks Tables
-- Bright Future Academy
-- ============================================================

-- Study materials uploaded by teachers
CREATE TABLE study_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT COMMENT 'Size in bytes',
    external_url VARCHAR(500) COMMENT 'Optional external link',
    published_at TIMESTAMP NULL,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_material_class (class_id),
    INDEX idx_material_subject (subject_id),
    INDEX idx_material_teacher (teacher_id),
    INDEX idx_material_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    assignment_type ENUM('HOMEWORK', 'PROJECT', 'LAB_WORK', 'ESSAY', 'PRESENTATION', 'OTHER') NOT NULL DEFAULT 'HOMEWORK',
    max_marks DECIMAL(6,2) NOT NULL,
    due_date DATETIME NOT NULL,
    allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    late_penalty_percentage DECIMAL(5,2) DEFAULT 0,
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_assignment_class (class_id),
    INDEX idx_assignment_subject (subject_id),
    INDEX idx_assignment_teacher (teacher_id),
    INDEX idx_assignment_due (due_date),
    INDEX idx_assignment_status (status),
    CONSTRAINT chk_max_marks CHECK (max_marks > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment submissions by students
CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    marks_obtained DECIMAL(6,2),
    feedback TEXT,
    graded_by BIGINT,
    graded_at TIMESTAMP NULL,
    status ENUM('SUBMITTED', 'GRADED', 'RETURNED', 'RESUBMITTED') NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_assignment_student (assignment_id, student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_submission_assignment (assignment_id),
    INDEX idx_submission_student (student_id),
    INDEX idx_submission_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Academic marks (for assessments, tests, etc. — NOT online exams)
CREATE TABLE marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL COMMENT 'Teacher who recorded the mark',
    assessment_name VARCHAR(200) NOT NULL COMMENT 'e.g. Mid-Term, Quiz 1, Final',
    assessment_type ENUM('QUIZ', 'MID_TERM', 'FINAL', 'PRACTICAL', 'PROJECT', 'ASSIGNMENT', 'OTHER') NOT NULL,
    maximum_marks DECIMAL(6,2) NOT NULL,
    obtained_marks DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((obtained_marks / maximum_marks) * 100, 2)) STORED,
    academic_year INT NOT NULL,
    semester VARCHAR(20),
    remarks TEXT,
    recorded_date DATE NOT NULL,
    status ENUM('ACTIVE', 'VOID', 'CORRECTED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_marks_student (student_id),
    INDEX idx_marks_class (class_id),
    INDEX idx_marks_subject (subject_id),
    INDEX idx_marks_year (academic_year),
    INDEX idx_marks_assessment (assessment_type),
    CONSTRAINT chk_marks_range CHECK (obtained_marks >= 0 AND obtained_marks <= maximum_marks),
    CONSTRAINT chk_max_marks_positive CHECK (maximum_marks > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
