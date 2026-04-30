
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;

    constructor(msg: string, statusCode: number, errorCode: string) {
        super(msg);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ConflictError extends AppError {
    constructor(msg = "Concurrency conflict") {
        super(msg, 409, "CONFLICT");
    }
}

export class BadRequestError extends AppError {
    constructor(msg = "Invalid request") {
        super(msg, 400, "BAD_REQUEST");
    }
}

export class NotFoundError extends AppError {
    constructor(msg = "Not found") {
        super(msg, 404, "NOT_FOUND");
    }

}
