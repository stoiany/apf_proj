import {shiftResponseDto} from "../schemas/shift.schemas";
import {readShiftsRepo} from "../repositories/shifts.repo";
import {readUserByIdRepo} from "../repositories/users.repo";
import {ApiError} from "../middleware/ApiError.class";

export async function readScheduleById(targetId: string): Promise<shiftResponseDto[]> {
    const user = await readUserByIdRepo(targetId);
    if (!user) {
        throw new ApiError(404, "NOT_FOUND", "User with that ID was not found.");
    }

    return await readShiftsRepo({userId: targetId});
}