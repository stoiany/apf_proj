export class ApiError extends Error {
    // змінні створюваного об'єкту
    status: number;
    code: string;
    details: unknown;
    // змінні передаваємі в конструктор
    constructor(
        status: number,
        code: string,
        message: string,
        details: unknown = null,
    ) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
