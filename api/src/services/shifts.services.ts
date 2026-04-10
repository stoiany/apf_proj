import {
    checkShiftCollisionOnUpdateRepo,
    checkShiftCollisionRepo,
    createShiftRepo, deleteShiftRepo, getTop3UsersByShiftCountRepo,
    readShiftByIdRepo,
    readShiftsRepo,
    updateShiftRepo
} from "../repositories/shifts.repo";
import { ApiError } from "../middleware/ApiError.class";
import {
    createShiftDto, dateDto, shiftQueryParamsDto,
    shiftResponseDto,
    updateShiftDto,
} from "../schemas/shift.schemas";
import { targetIdDto } from "../schemas/other.schemas";

export type ShiftTime = "morning" | "day" | "evening";
export type ShiftStatus = "scheduled" | "completed" | "missed";

export async function readShifts(
    dto : shiftQueryParamsDto
): Promise<shiftResponseDto[]> {
    return await readShiftsRepo(dto);
}

export async function readShiftById(targetId : targetIdDto) : Promise<shiftResponseDto> {
    const shift = await readShiftByIdRepo(targetId);
    if(!shift){
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Shift with that ID was not found.",
        );
    }
    return shift;
}

export async function createShift(dto: createShiftDto): Promise<shiftResponseDto> {
    const isCollision = await checkShiftCollisionRepo(dto.date, dto.time);
    if(isCollision) {
        throw new ApiError(
                409,
                "TIME_CONFLICT",
                "Shift on that date and time already exists.",
        );
    }

    return await createShiftRepo(dto);
}

export async function updateShift(
    dto: updateShiftDto,
    targetId: string,
): Promise<shiftResponseDto> {
    const shift = await readShiftByIdRepo(targetId);
    if(!shift){
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Shift with that ID was not found.",
        );
    }

    const targetDate = dto.date !== undefined ? dto.date : String(shift.date);
    const targetTime = dto.time !== undefined ? dto.time : String(shift.time) as ShiftTime;

    if (dto.date !== undefined || dto.time !== undefined) {
        const isCollision = await checkShiftCollisionOnUpdateRepo(
            targetDate,
            targetTime,
            targetId
        );

        if (isCollision) {
            throw new ApiError(
                409,
                "TIME_CONFLICT",
                "Shift on that date and time already exists.",
            );
        }
    }

    return await updateShiftRepo(targetId, dto, shift);
}

export async function removeShift(targetId : targetIdDto) {
    const deletedCount = await deleteShiftRepo(targetId);
    if(deletedCount === 0){
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Shift with that ID was not found.",
        );
    }
}

import { getShiftsStatsRepo } from "../repositories/shifts.repo";

export async function getShiftsStats() {
    return await getShiftsStatsRepo();
}

export async function getTop3UsersByShiftCount(targetDateDto : dateDto){
    const date = targetDateDto.date.substring(0,7);
    return await getTop3UsersByShiftCountRepo(date);
}