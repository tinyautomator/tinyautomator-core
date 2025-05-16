CREATE TABLE workflow (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL
        CHECK (status IN ('draft', 'active', 'archived')),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
