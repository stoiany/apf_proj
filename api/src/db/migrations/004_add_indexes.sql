CREATE INDEX IF NOT EXISTS idx_shifts_date ON Shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_userId ON Shifts(userId);
CREATE INDEX IF NOT EXISTS idx_swap_shiftId ON SwapRequests(shiftId);