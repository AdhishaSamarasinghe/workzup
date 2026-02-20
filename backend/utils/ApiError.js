/**
 * Custom Error Class for standardizing API error responses
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = "") {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational; // true for predictable/handled errors (e.g. 404, 400), false for unhandled bugs (500)

        // This is a standard property to cleanly identify errors originated by our API logic
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
