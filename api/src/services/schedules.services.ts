import { shiftResponseDto } from "../schemas/shift.schemas";
import { shifts } from "../repositories/shifts.repo";
import { users } from "../repositories/users.repo";

export type ShiftTime = "morning" | "day" | "evening";
export type ShiftStatus = "scheduled" | "completed" | "missed";

export function readScheduleById(targetId: string): shiftResponseDto[] {
    const user = users.find((u) => u.id === targetId);
    const userShifts = shifts.filter((i) => i.userId === targetId);
    return userShifts.map((i) => {
        return {
            id: i.id,
            username: user ? user.username : "User not found.",
            date: i.date,
            time: i.time as ShiftTime,
            status: i.status as ShiftStatus,
            comment: i.comment,
            createdAt: i.createdAt,
        };
    });
}
