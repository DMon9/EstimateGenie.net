-- Add quote_breakdowns column to track free usage limit
ALTER TABLE users ADD COLUMN quote_breakdowns INTEGER DEFAULT 0;