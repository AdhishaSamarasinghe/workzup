const ApiError = require("../utils/ApiError");

/**
 * Global Error Handling Middleware
 * Placed at the very end of the Express middleware stack in server.js
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Ensure error is an instance of ApiError. If not, shape it into one.
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, false, err.stack);
    }

    // Prepare standardized payload
    const response = {
        code: error.statusCode,
        status: error.status,
        message: error.message,
    };

    // Append full stack traces ONLY in development
    if (process.env.NODE_ENV !== "production") {
        response.stack = error.stack;
    } else {
        // In Production, NEVER leak details for non-operational (unhandled) bugs (e.g. 500 DB connection error)
        if (!error.isOperational) {
            console.error("CRITICAL ERROR 💥:", error); // Log to internal monitoring service
            response.message = "Internal Server Error. Please try again later.";
        }
    }

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
