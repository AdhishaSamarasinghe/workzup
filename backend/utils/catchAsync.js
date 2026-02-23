/**
 * Async Wrapper Function
 * Wraps async Express routes/controllers to seamlessly pass rejected Promises (errors)
 * to the global error handling middleware, completely removing the need for `try-catch` blocks.
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
