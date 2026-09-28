-- Schema v2.2 (additive): vendor website and vendor_facts for the business profile page.

BEGIN;

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_website VARCHAR(255);

CREATE TABLE vendor_facts (
    fact_id         SERIAL PRIMARY KEY,
    vendor_id       INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    -- Placement: 'about' for the description panel, 'quick' for the sidebar summary grid.
    fact_group      VARCHAR(10) NOT NULL DEFAULT 'about'
        CHECK (fact_group IN ('about', 'quick')),
    fact_label      VARCHAR(60)  NOT NULL,
    fact_value      VARCHAR(120) NOT NULL,
    -- Optional icon key resolved by the frontend.
    fact_icon       VARCHAR(40),
    fact_sort_order SMALLINT NOT NULL DEFAULT 0,
    -- A label may appear only once per panel for a given vendor.
    UNIQUE (vendor_id, fact_group, fact_label)
);
CREATE INDEX idx_facts_vendor ON vendor_facts (vendor_id, fact_group, fact_sort_order);

COMMIT;
