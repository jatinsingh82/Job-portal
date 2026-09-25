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
  saveJobAlert,
  getJobAlerts,
  deleteJobAlert,
  saveBookmarkNote,
  getBookmarkNotes,
  updateNotificationSettings,
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

router.post("/job-alerts", isAuthenticated, saveJobAlert);
router.get("/job-alerts", isAuthenticated, getJobAlerts);
router.delete("/job-alerts/:id", isAuthenticated, deleteJobAlert);

router.post("/bookmark-note/:jobId", isAuthenticated, saveBookmarkNote);
router.get("/bookmark-notes", isAuthenticated, getBookmarkNotes);

router.put("/notifications", isAuthenticated, updateNotificationSettings);

export default router;
