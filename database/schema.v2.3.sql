-- Shahebbazar schema v2.3: payment methods a business accepts. Run after schema.v2.2.sql.

BEGIN;

CREATE TABLE vendor_payment_methods (
    payment_method_id   SERIAL PRIMARY KEY,
    vendor_id           INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    payment_method      VARCHAR(20) NOT NULL
        CHECK (payment_method IN (
            'cash',
            'cash_on_delivery',
            'bank_transfer',
            'bkash',
            'nagad',
            'rocket',
            'card'
        )),
    -- Short qualifier only, never account or wallet numbers.
    payment_note        VARCHAR(120),
    payment_sort_order  SMALLINT NOT NULL DEFAULT 0,
    UNIQUE (vendor_id, payment_method)
);

COMMIT;
