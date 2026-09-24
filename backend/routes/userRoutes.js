import express from "express";
import {
  login,
  register,
  logout,
  getUser,
  updateProfile,
  uploadResume,
  deleteResume,
  toggleSaveJob,
  getSavedJobs,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);

router.put("/profile", isAuthenticated, updateProfile);
router.post("/resume", isAuthenticated, uploadResume);
router.delete("/resume", isAuthenticated, deleteResume);
router.post("/save-job/:id", isAuthenticated, toggleSaveJob);
router.get("/saved-jobs", isAuthenticated, getSavedJobs);

export default router;
