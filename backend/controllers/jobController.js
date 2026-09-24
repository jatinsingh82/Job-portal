import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const {
    keyword,
    category,
    location,
    workMode,
    employmentType,
    experienceLevel,
    minSalary,
    sort,
  } = req.query;

  let jobs = await Job.find({ expired: false });

  // Filter in memory for maximum flexibility across both Mongo & mock store
  if (keyword) {
    const kw = keyword.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(kw) ||
        j.company?.toLowerCase().includes(kw) ||
        j.description?.toLowerCase().includes(kw) ||
        (Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(kw)))
    );
  }

  if (category && category !== "All") {
    jobs = jobs.filter(
      (j) => j.category?.toLowerCase() === category.toLowerCase()
    );
  }

  if (location) {
    const loc = location.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.city?.toLowerCase().includes(loc) ||
        j.country?.toLowerCase().includes(loc) ||
        j.location?.toLowerCase().includes(loc)
    );
  }

  if (workMode && workMode !== "All") {
    jobs = jobs.filter(
      (j) => j.workMode?.toLowerCase() === workMode.toLowerCase()
    );
  }

  if (employmentType && employmentType !== "All") {
    jobs = jobs.filter(
      (j) => j.employmentType?.toLowerCase() === employmentType.toLowerCase()
    );
  }

  if (experienceLevel && experienceLevel !== "All") {
    jobs = jobs.filter(
      (j) => j.experienceLevel?.toLowerCase() === experienceLevel.toLowerCase()
    );
  }

  if (minSalary) {
    const min = Number(minSalary);
    jobs = jobs.filter((j) => {
      const sal = j.fixedSalary || j.salaryTo || j.salaryFrom || 0;
      return sal >= min;
    });
  }

  // Sorting
  if (sort === "salary_desc") {
    jobs.sort((a, b) => {
      const salA = a.fixedSalary || a.salaryTo || a.salaryFrom || 0;
      const salB = b.fixedSalary || b.salaryTo || b.salaryFrom || 0;
      return salB - salA;
    });
  } else if (sort === "salary_asc") {
    jobs.sort((a, b) => {
      const salA = a.fixedSalary || a.salaryFrom || 0;
      const salB = b.fixedSalary || b.salaryFrom || 0;
      return salA - salB;
    });
  } else {
    // Default newest first
    jobs.sort((a, b) => new Date(b.jobPostedOn || 0) - new Date(a.jobPostedOn || 0));
  }

  res.status(200).json({
    success: true,
    total: jobs.length,
    jobs,
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }

    // Find similar jobs (same category, different id)
    const allActive = await Job.find({ expired: false });
    const similarJobs = allActive
      .filter((j) => String(j._id) !== String(id) && j.category === job.category)
      .slice(0, 3);

    res.status(200).json({
      success: true,
      job,
      similarJobs,
    });
  } catch (error) {
    return next(new ErrorHandler("Invalid Job ID", 404));
  }
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers are not allowed to post jobs.", 403)
    );
  }

  const {
    title,
    company,
    description,
    responsibilities,
    requirements,
    benefits,
    category,
    country,
    city,
    location,
    employmentType,
    workMode,
    experienceLevel,
    skills,
    fixedSalary,
    salaryFrom,
    salaryTo,
    deadline,
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide all required job fields.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler("Please provide either a fixed salary or a salary range.", 400)
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot enter fixed and ranged salary together.", 400)
    );
  }

  const postedBy = req.user._id;

  const parsedSkills = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const parsedBenefits = Array.isArray(benefits)
    ? benefits
    : typeof benefits === "string"
    ? benefits.split("\n").map((b) => b.trim()).filter(Boolean)
    : [];

  const job = await Job.create({
    title,
    company: company || req.user.company || "Hiring Company",
    description,
    responsibilities: responsibilities || "",
    requirements: requirements || "",
    benefits: parsedBenefits,
    category,
    country,
    city,
    location,
    employmentType: employmentType || "Full-time",
    workMode: workMode || "Hybrid",
    experienceLevel: experienceLevel || "Mid Level",
    skills: parsedSkills,
    fixedSalary: fixedSalary ? Number(fixedSalary) : undefined,
    salaryFrom: salaryFrom ? Number(salaryFrom) : undefined,
    salaryTo: salaryTo ? Number(salaryTo) : undefined,
    deadline: deadline ? new Date(deadline) : undefined,
    status: "active",
    expired: false,
    postedBy,
  });

  res.status(201).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot access recruiter jobs.", 403)
    );
  }

  const myJobs = await Job.find({ postedBy: req.user._id });

  // Attach applicant counts to each job
  const allApps = await Application.find({ "employerID.user": req.user._id });
  const jobsWithCount = myJobs.map((job) => {
    const jObj = job.toObject ? job.toObject() : { ...job };
    const count = allApps.filter((a) => String(a.jobId) === String(job._id)).length;
    return { ...jObj, applicantCount: count };
  });

  res.status(200).json({
    success: true,
    myJobs: jobsWithCount,
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot update jobs.", 403)
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  const updateData = { ...req.body };
  if (updateData.skills && typeof updateData.skills === "string") {
    updateData.skills = updateData.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  job = await Job.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Job Updated Successfully!",
    job,
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot delete jobs.", 403)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted Successfully!",
  });
});

export const getRecruiterStats = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Unauthorized access.", 403));
  }

  const employerId = req.user._id;
  const myJobs = await Job.find({ postedBy: employerId });
  const myApps = await Application.find({ "employerID.user": employerId });

  const activeJobs = myJobs.filter((j) => !j.expired && j.status !== "closed").length;
  const closedJobs = myJobs.filter((j) => j.expired || j.status === "closed").length;
  const totalApplications = myApps.length;
  const newApplications = myApps.filter((a) => a.status === "Applied").length;
  const shortlisted = myApps.filter((a) => a.status === "Shortlisted").length;
  const interviews = myApps.filter((a) => a.status === "Interview" || a.interview?.scheduled).length;

  res.status(200).json({
    success: true,
    stats: {
      totalJobs: myJobs.length,
      activeJobs,
      closedJobs,
      totalApplications,
      newApplications,
      shortlisted,
      interviews,
    },
  });
});
