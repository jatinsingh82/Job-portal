class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  let message = err.message || "Internal Server Error";
  let statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    message = `Resource not found. Invalid ${err.path}`;
    statusCode = 400;
  }
  if (err.code === 11000) {
    message = `Duplicate ${Object.keys(err.keyValue || {})} Entered`;
    statusCode = 400;
  }
  if (err.name === "JsonWebTokenError") {
    message = `Json Web Token is invalid, Try again!`;
    statusCode = 400;
  }
  if (err.name === "TokenExpiredError") {
    message = `Json Web Token is expired, Try again!`;
    statusCode = 400;
  }
  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default ErrorHandler;
