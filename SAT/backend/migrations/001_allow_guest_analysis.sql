PRAGMA foreign_keys = OFF;

BEGIN IMMEDIATE;

CREATE TABLE analysis_history_guest_migration (
    id INTEGER NOT NULL,
    user_id INTEGER,
    sentence TEXT NOT NULL,
    s_expression TEXT NOT NULL,
    tree_json JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sentence_type VARCHAR(40) NOT NULL DEFAULT 'Unknown',
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

INSERT INTO analysis_history_guest_migration (
    id, user_id, sentence, s_expression, tree_json, created_at, sentence_type
)
SELECT id, user_id, sentence, s_expression, tree_json, created_at, sentence_type
FROM analysis_history;

DROP TABLE analysis_history;
ALTER TABLE analysis_history_guest_migration RENAME TO analysis_history;
CREATE INDEX ix_analysis_history_user_id ON analysis_history (user_id);

COMMIT;

PRAGMA foreign_keys = ON;
