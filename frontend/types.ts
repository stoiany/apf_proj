export interface Shift {
    id?: string;
    date: string;
    time: "morning" | "day" | "evening";
    username: string;
    status: "scheduled" | "completed" | "missed";
    comment?: string;
}

export interface User {
    id?: string;
    username: string;
}

export interface SwapRequest {
    id?: string;
    shiftId: string;
    requester: string;
    targetUser: string;
    status?: "pending" | "approved" | "rejected";
    shiftInfo?: string;
}

export interface ValidationRule {
    required?: {
        value: boolean;
        message: string;
    };
    maxLength?: {
        value: number;
        message: string;
    };
    minLength?: {
        value: number;
        message: string;
    };
}

export interface ShiftStat {
    status: string;
    count: number;
}

export interface TopUser {
    username: string;
    count: number;
}

export type ValidationSchema = Record<string, ValidationRule>;

export const shiftSchema: ValidationSchema = {
    date: {
        required: {value: true, message: "Обов'язкове поле."}
    },
    time: {
        required: {value: true, message: "Обов'язкове поле."}
    },
    username: {
        required: {value: true, message: "Обов'язкове поле."},
        maxLength: {value: 30, message: "Не більше 30 символів."}
    },
    status: {
        required: {value: true, message: "Обов'язкове поле."}
    },
    comment: {
        maxLength: {value: 80, message: "Максимум 80 символів."}
    }
}

export const userSchema: ValidationSchema = {
    username: {
        required: {value: true, message: "Обов'язкове поле."},
        maxLength: {value: 30, message: "Не більше 30 символів."}
    }
}

export const swapRequestSchema: ValidationSchema = {
    shiftId: {
        required: {value: true, message: "Помилка: Не обрано зміну."}
    },
    requester: {
        required: {value: true, message: "Помилка: Не знайдено ініціатора."}
    },
    targetUser: {
        required: {value: true, message: "Обов'язкове поле. Оберіть користувача."}
    }
}

export const formSchemas: Record<string, ValidationSchema> = {
    shiftsForm: shiftSchema,
    usersForm: userSchema,
    swapRequestsForm: swapRequestSchema
}

export type entity = "shifts" | "users" | "swapRequests" | "stats";