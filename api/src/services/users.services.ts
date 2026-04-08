import {
    createUserRepo, deleteUserRepo,
    readUserByIdRepo,
    readUserByUsername,
    readUsersRepo,
    updateUserRepo,
} from "../repositories/users.repo";
import { ApiError } from "../middleware/ApiError.class";
import {
    createUserDto,
    updateUserDto, userQueryParamsDto,
    userResponseDto,
} from "../schemas/users.schemas";
import {targetIdDto} from "../schemas/other.schemas";

export async function readUsers(dto : userQueryParamsDto) : Promise<userResponseDto[]> {
    return await readUsersRepo(dto);
}

export async function readUserById(targetId : targetIdDto) : Promise<userResponseDto> {
    const user = await readUserByIdRepo(targetId);
    if(!user){
        throw new ApiError(
            404,
            "NOT_FOUND",
            "User with that ID was not found.",
        );
    }

    return user;
}

export async function createUser(dto: createUserDto): Promise<userResponseDto> {
    const isConflict = await readUserByUsername(dto.username);
    if(isConflict){
        throw new ApiError(
            409,
            "USERNAME_CONFLICT",
            "User with that name already exists.",
        );
    }

    return await createUserRepo(dto);
}

export async function updateUser(
    dto: updateUserDto,
    targetId: string,
): Promise<userResponseDto> {
    const user = await readUserByIdRepo(targetId);
    if(!user){
        throw new ApiError(
            404,
            "NOT_FOUND",
            "User with that ID was not found.",
        );
    }

    if(user.username !== dto.username){
        const isConflict = await readUserByUsername(dto.username);
        if(isConflict){
            throw new ApiError(
                409,
                "USERNAME_CONFLICT",
                "User with that name already exists.",
            );
        }
    }

    await updateUserRepo(dto, targetId);

    return {
        id: targetId,
        username: dto.username,
    }
}

export async function removeUser(targetId : targetIdDto) {
    const deletedCount = await deleteUserRepo(targetId);
    if(deletedCount === 0){
        throw new ApiError(
            404,
            "NOT_FOUND",
            "User with that ID was not found.",
        );
    }
}
