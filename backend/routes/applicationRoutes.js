import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  updateApplicationStatus,
  scheduleInterview,
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.put("/employer/status/:id", isAuthenticated, updateApplicationStatus);
router.post("/employer/schedule-interview/:id", isAuthenticated, scheduleInterview);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);

export default router;
