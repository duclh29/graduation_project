CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    schedule_id BIGINT NOT NULL,
    check_in_at DATETIME NULL,
    check_out_at DATETIME NULL,
    actual_work_minutes INT NOT NULL DEFAULT 0,
    late_minutes INT NOT NULL DEFAULT 0,
    early_leave_minutes INT NOT NULL DEFAULT 0,
    overtime_minutes INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    source VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    note VARCHAR(255) NULL,
    approved_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_attendance_records_schedule (schedule_id)
);

CREATE TABLE IF NOT EXISTS open_shifts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    shift_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    planned_start_at DATETIME NOT NULL,
    planned_end_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    assigned_user_id BIGINT NULL,
    schedule_id BIGINT NULL,
    note VARCHAR(255) NULL,
    assigned_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_open_shifts_work_date_status (work_date, status)
);

CREATE TABLE IF NOT EXISTS schedule_swap_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    schedule_id BIGINT NOT NULL,
    from_user_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note VARCHAR(255) NULL,
    review_note VARCHAR(255) NULL,
    reviewed_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_schedule_swap_requests_status (status)
);

CREATE TABLE IF NOT EXISTS schedule_change_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    schedule_id BIGINT NULL,
    open_shift_id BIGINT NULL,
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(150) NULL,
    old_value_json LONGTEXT NULL,
    new_value_json LONGTEXT NULL,
    PRIMARY KEY (id),
    KEY idx_schedule_change_logs_schedule (schedule_id),
    KEY idx_schedule_change_logs_open_shift (open_shift_id)
);
