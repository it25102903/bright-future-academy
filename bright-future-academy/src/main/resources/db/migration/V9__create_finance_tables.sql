-- ============================================================
-- V9: Finance Tables
-- Bright Future Academy
-- ============================================================

-- Fee structures (defines fee types and amounts)
CREATE TABLE fee_structures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    fee_type ENUM('TUITION', 'REGISTRATION', 'EXAM', 'LIBRARY', 'LAB', 'TRANSPORT', 'SPORTS', 'UNIFORM', 'OTHER') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    frequency ENUM('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL') NOT NULL DEFAULT 'ONE_TIME',
    academic_year INT NOT NULL,
    class_id BIGINT COMMENT 'NULL = applies to all classes',
    applicable_from DATE,
    applicable_to DATE,
    status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_fee_structure_year (academic_year),
    INDEX idx_fee_structure_type (fee_type),
    INDEX idx_fee_structure_class (class_id),
    INDEX idx_fee_structure_status (status),
    CONSTRAINT chk_fee_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual fee assignments to students
CREATE TABLE student_fee_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    assigned_amount DECIMAL(12,2) NOT NULL COMMENT 'May differ from structure if discount applied',
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_reason VARCHAR(255),
    due_date DATE NOT NULL,
    fee_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WAIVED') NOT NULL DEFAULT 'UNPAID',
    total_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE RESTRICT,
    INDEX idx_sfa_student (student_id),
    INDEX idx_sfa_fee (fee_structure_id),
    INDEX idx_sfa_status (fee_status),
    INDEX idx_sfa_due_date (due_date),
    CONSTRAINT chk_sfa_amount CHECK (assigned_amount > 0),
    CONSTRAINT chk_sfa_discount CHECK (discount_amount >= 0 AND discount_amount <= assigned_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment records
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. PAY-2026-000001',
    student_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'OTHER') NOT NULL,
    payment_reference_number VARCHAR(100) COMMENT 'Bank ref, cheque number, etc.',
    recorded_by BIGINT NOT NULL COMMENT 'Finance officer who recorded',
    notes TEXT,
    status ENUM('COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    cancelled_reason VARCHAR(255),
    cancelled_by BIGINT,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_payment_student (student_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_reference (payment_reference),
    INDEX idx_payment_method (payment_method),
    INDEX idx_payment_status (status),
    INDEX idx_payment_recorded_by (recorded_by),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment allocations (how a payment is distributed across fee assignments)
CREATE TABLE payment_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    student_fee_assignment_id BIGINT NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_fee_assignment_id) REFERENCES student_fee_assignments(id) ON DELETE RESTRICT,
    INDEX idx_allocation_payment (payment_id),
    INDEX idx_allocation_fee (student_fee_assignment_id),
    CONSTRAINT chk_allocation_amount CHECK (allocated_amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Receipts
CREATE TABLE receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. RCP-2026-000001',
    payment_id BIGINT NOT NULL UNIQUE,
    student_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    receipt_date DATE NOT NULL,
    issued_by BIGINT NOT NULL,
    notes TEXT,
    status ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_receipt_payment (payment_id),
    INDEX idx_receipt_student (student_id),
    INDEX idx_receipt_date (receipt_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment adjustments (corrections, refunds, write-offs)
CREATE TABLE payment_adjustments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_fee_assignment_id BIGINT NOT NULL,
    adjustment_type ENUM('DISCOUNT', 'PENALTY', 'WAIVER', 'CORRECTION', 'REFUND') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT NOT NULL,
    approved_by BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_fee_assignment_id) REFERENCES student_fee_assignments(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_adjustment_fee (student_fee_assignment_id),
    INDEX idx_adjustment_type (adjustment_type),
    INDEX idx_adjustment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
