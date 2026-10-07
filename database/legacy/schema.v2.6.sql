-- Owner replies to customer reviews.
ALTER TABLE reviews
    ADD COLUMN review_reply      TEXT,
    ADD COLUMN review_replied_at TIMESTAMPTZ;
