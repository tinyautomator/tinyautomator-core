CREATE TABLE workflow (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at BIGINT,
    updated_at BIGINT
);
