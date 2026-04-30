export declare class AppError extends Error {
    readonly statusCode: number;
    readonly errorCode: string;
    constructor(msg: string, statusCode: number, errorCode: string);
}
export declare class ConflictError extends AppError {
    constructor(msg?: string);
}
export declare class BadRequestError extends AppError {
    constructor(msg?: string);
}
export declare class NotFoundError extends AppError {
    constructor(msg?: string);
}
//# sourceMappingURL=AppError.d.ts.map