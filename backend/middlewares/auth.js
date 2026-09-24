import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers?.authorization?.replace(/^Bearer\s+/, "");

  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }

  const secret = process.env.JWT_SECRET_KEY || "jobportal_secret_key_jwt_2024";
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    return next(new ErrorHandler("Session expired or invalid, please login again.", 401));
  }

  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User Not Found", 401));
  }

  next();
});
