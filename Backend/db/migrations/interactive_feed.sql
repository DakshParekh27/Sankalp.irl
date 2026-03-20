-- Migration script for Interactive Public Feed feature
-- Adds 'update_reactions' and 'feedback' tables

CREATE TABLE IF NOT EXISTS update_reactions (
    id SERIAL PRIMARY KEY,
    update_id INTEGER REFERENCES public_updates(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) CHECK (reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(update_id, user_id)
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    update_id INTEGER REFERENCES public_updates(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
