CREATE TABLE IF NOT EXISTS SwapRequests (
    id TEXT PRIMARY KEY,
    requesterId TEXT NOT NULL,
    targetUserId TEXT NOT NULL,
    shiftId TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (requesterId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (targetUserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (shiftId) REFERENCES Shifts(id) ON DELETE CASCADE
);