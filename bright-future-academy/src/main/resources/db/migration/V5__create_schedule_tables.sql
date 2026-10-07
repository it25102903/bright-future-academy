-- ============================================================
-- V5: Timetable & Schedule Tables
-- Bright Future Academy
-- ============================================================

-- Timetable entries
CREATE TABLE timetables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    classroom_id BIGINT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    academic_year INT NOT NULL,
    semester VARCHAR(20) COMMENT 'e.g. SEMESTER_1, SEMESTER_2, TERM_1',
    effective_from DATE,
    effective_to DATE,
    status ENUM('ACTIVE', 'INACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE RESTRICT,
    INDEX idx_timetable_class (class_id),
    INDEX idx_timetable_teacher (teacher_id),
    INDEX idx_timetable_classroom (classroom_id),
    INDEX idx_timetable_day (day_of_week),
    INDEX idx_timetable_year (academic_year),
    INDEX idx_timetable_status (status),
    -- Ensure no overlapping schedules per teacher per day (enforced further in application logic)
    INDEX idx_timetable_teacher_day (teacher_id, day_of_week, start_time, end_time),
    INDEX idx_timetable_room_day (classroom_id, day_of_week, start_time, end_time),
    CONSTRAINT chk_time_range CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schedule exceptions (cancellations, substitutions, room changes on specific dates)
CREATE TABLE schedule_exceptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timetable_id BIGINT NOT NULL,
    exception_date DATE NOT NULL,
    exception_type ENUM('CANCELLED', 'ROOM_CHANGE', 'TEACHER_SUBSTITUTION', 'TIME_CHANGE', 'EXTRA_CLASS') NOT NULL,
    substitute_teacher_id BIGINT,
    substitute_classroom_id BIGINT,
    new_start_time TIME,
    new_end_time TIME,
    reason TEXT,
    created_by BIGINT,
    status ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_timetable_exception_date (timetable_id, exception_date),
    FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (substitute_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_schedule_exception_date (exception_date),
    INDEX idx_schedule_exception_timetable (timetable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
