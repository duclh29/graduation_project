ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS returned_quantity INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS requested_return_quantity INT NOT NULL DEFAULT 0;
