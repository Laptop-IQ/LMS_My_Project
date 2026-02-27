/**
 * Wraps async route handlers and forwards errors to Express error middleware
 * Usage: router.get("/", asyncHandler(controllerFunction))
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
