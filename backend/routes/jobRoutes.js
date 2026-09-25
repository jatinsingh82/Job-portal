import express from "express";
import {
  deleteJob,
  getAllJobs,
  getMyJobs,
  getSingleJob,
  postJob,
  updateJob,
  getRecruiterStats,
  getSalaryInsights,
  getCompanies,
  reportJob,
  getAdminOverview,
} from "../controllers/jobController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall", getAllJobs);
router.get("/salary-insights", getSalaryInsights);
router.get("/companies", getCompanies);
router.get("/stats", isAuthenticated, getRecruiterStats);
router.get("/admin/overview", isAuthenticated, getAdminOverview);
router.post("/post", isAuthenticated, postJob);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.put("/update/:id", isAuthenticated, updateJob);
router.delete("/delete/:id", isAuthenticated, deleteJob);
router.post("/report/:id", isAuthenticated, reportJob);
router.get("/:id", getSingleJob);

export default router;
