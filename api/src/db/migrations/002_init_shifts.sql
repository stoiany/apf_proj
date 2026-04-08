CREATE TABLE IF NOT EXISTS Shifts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL CHECK(time IN ('morning', 'day', 'evening')),
    status TEXT NOT NULL CHECK(status IN ('scheduled', 'completed', 'missed', 'canceled')),
    comment TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);