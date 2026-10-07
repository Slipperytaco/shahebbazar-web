-- Schema v2.7
-- Stubbed vendor NID verification workflow

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS vendor_nid_reference VARCHAR(50);

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS vendor_nid_status VARCHAR(20)
    NOT NULL
    DEFAULT 'pending';

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS vendor_nid_submitted_at TIMESTAMPTZ;

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS vendor_nid_verified_at TIMESTAMPTZ;

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS vendor_nid_verified_by
    INT REFERENCES users(user_id) ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'vendors_nid_status_check'
          AND conrelid = 'vendors'::regclass
    ) THEN
        ALTER TABLE vendors
        ADD CONSTRAINT vendors_nid_status_check
        CHECK (
            vendor_nid_status IN (
                'pending',
                'verified',
                'rejected'
            )
        );
    END IF;
END
$$;

COMMENT ON COLUMN vendors.vendor_nid_reference IS
    'Prototype NID reference. Do not use genuine identity numbers in development.';

COMMENT ON COLUMN vendors.vendor_nid_status IS
    'NID identity-verification status, separate from business moderation status.';