// Utility to wrap async route handlers and catch errors automatically
// This prevents unhandled promise rejections from crashing the server

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
