ALTER TABLE payments
    MODIFY COLUMN method VARCHAR(30) NOT NULL;

CREATE TABLE IF NOT EXISTS pos_payment_allocations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    order_id BIGINT NOT NULL,
    method VARCHAR(30) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    cash_received DECIMAL(12, 2) NULL,
    change_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    reference_code VARCHAR(100) NULL,
    note VARCHAR(255) NULL,
    PRIMARY KEY (id),
    KEY idx_pos_payment_allocations_order (order_id)
);

CREATE TABLE IF NOT EXISTS cashier_sessions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    cashier_name VARCHAR(100) NOT NULL,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME NULL,
    opening_cash DECIMAL(12, 2) NOT NULL,
    closing_cash DECIMAL(12, 2) NULL,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(255) NULL,
    PRIMARY KEY (id),
    KEY idx_cashier_sessions_status_opened (status, opened_at)
);

CREATE TABLE IF NOT EXISTS pos_return_exchange_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    order_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    returned_amount DECIMAL(12, 2) NOT NULL,
    exchange_amount DECIMAL(12, 2) NOT NULL,
    balance_amount DECIMAL(12, 2) NOT NULL,
    detail_json LONGTEXT NULL,
    note VARCHAR(255) NULL,
    PRIMARY KEY (id),
    KEY idx_pos_return_exchange_logs_order (order_id)
);
