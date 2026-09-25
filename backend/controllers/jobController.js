import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const {
    keyword,
    location,
    category,
    workMode,
    employmentType,
    experienceLevel,
    minSalary,
    maxSalary,
    sortBy,
  } = req.query;

  // Auto-expire jobs whose deadline has passed
  const now = new Date();
  try {
    await Job.updateMany(
      { deadline: { $lt: now }, expired: false },
      { $set: { expired: true, status: "closed" } }
    );
  } catch (e) {
    // continue
  }

  const query = { expired: false };

  if (category && category !== "All") {
    query.category = { $regex: new RegExp(`^${category}$`, "i") };
  }
  if (workMode && workMode !== "All") {
    query.workMode = { $regex: new RegExp(`^${workMode}$`, "i") };
  }
  if (employmentType && employmentType !== "All") {
    query.employmentType = { $regex: new RegExp(`^${employmentType}$`, "i") };
  }
  if (experienceLevel && experienceLevel !== "All") {
    query.experienceLevel = { $regex: new RegExp(`^${experienceLevel}$`, "i") };
  }

  if (location) {
    query.$or = [
      { city: { $regex: location, $options: "i" } },
      { country: { $regex: location, $options: "i" } },
      { location: { $regex: location, $options: "i" } },
    ];
  }

  if (keyword) {
    const kwRegex = { $regex: keyword, $options: "i" };
    query.$or = [
      { title: kwRegex },
      { company: kwRegex },
      { description: kwRegex },
      { skills: kwRegex },
    ];
  }

  let jobs = await Job.find(query);

  if (minSalary) {
    const minVal = Number(minSalary);
    jobs = jobs.filter((j) => {
      const sal = j.fixedSalary || j.salaryTo || j.salaryFrom || 0;
      return sal >= minVal;
    });
  }

  if (maxSalary) {
    const maxVal = Number(maxSalary);
    jobs = jobs.filter((j) => {
      const sal = j.fixedSalary || j.salaryFrom || 0;
      return sal <= maxVal;
    });
  }

  // Sorting
  if (sortBy === "salary_high") {
    jobs.sort((a, b) => {
      const salA = a.fixedSalary || a.salaryTo || a.salaryFrom || 0;
      const salB = b.fixedSalary || b.salaryTo || b.salaryFrom || 0;
      return salB - salA;
    });
  } else if (sortBy === "salary_low") {
    jobs.sort((a, b) => {
      const salA = a.fixedSalary || a.salaryFrom || 0;
      const salB = b.fixedSalary || b.salaryFrom || 0;
      return salA - salB;
    });
  } else {
    // default newest
    jobs.sort(
      (a, b) => new Date(b.jobPostedOn || 0) - new Date(a.jobPostedOn || 0)
    );
  }

  res.status(200).json({
    success: true,
    total: jobs.length,
    jobs,
  });
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot post jobs on the platform.", 403)
    );
  }

  const {
    title,
    company,
    description,
    responsibilities,
    requirements,
    benefits,
    skills,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    employmentType,
    workMode,
    experienceLevel,
    deadline,
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide all required job fields.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler("Please provide either a fixed salary or ranged salary.", 400)
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot enter fixed salary and ranged salary together!", 400)
    );
  }

  let skillsArray = [];
  if (Array.isArray(skills)) {
    skillsArray = skills;
  } else if (typeof skills === "string") {
    skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  let benefitsArray = [];
  if (Array.isArray(benefits)) {
    benefitsArray = benefits;
  } else if (typeof benefits === "string") {
    benefitsArray = benefits.split("\n").map((b) => b.trim()).filter(Boolean);
  }

  const postedBy = req.user._id;

  const job = await Job.create({
    title,
    company: company || req.user.company || "Leading Employer",
    description,
    responsibilities: responsibilities || "",
    requirements: requirements || "",
    benefits: benefitsArray,
    skills: skillsArray,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    employmentType: employmentType || "Full-time",
    workMode: workMode || "Hybrid",
    experienceLevel: experienceLevel || "Mid Level",
    deadline: deadline ? new Date(deadline) : undefined,
    postedBy,
    jobPostedOn: new Date(),
    status: "active",
    expired: false,
  });

  res.status(200).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot view recruiter dashboards.", 403)
    );
  }

  const myJobs = await Job.find({ postedBy: req.user._id });

  // Enrich with applicant counts for each job
  const enrichedJobs = await Promise.all(
    myJobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({
        jobId: job._id,
      });
      const jobObj = job.toObject ? job.toObject() : { ...job };
      jobObj.applicantCount = applicantCount;
      return jobObj;
    })
  );

  res.status(200).json({
    success: true,
    myJobs: enrichedJobs,
  });
});

export const getRecruiterStats = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot view recruiter metrics.", 403)
    );
  }

  const myJobs = await Job.find({ postedBy: req.user._id });
  const activeJobs = myJobs.filter((j) => !j.expired).length;
  const closedJobs = myJobs.filter((j) => j.expired).length;

  const applications = await Application.find({
    "employerID.user": req.user._id,
  });

  const totalApplications = applications.length;
  const newApplications = applications.filter((a) => a.status === "Applied").length;
  const shortlisted = applications.filter((a) => a.status === "Shortlisted").length;
  const interviews = applications.filter((a) => a.status === "Interview").length;

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

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seekers cannot edit job postings.", 403)
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }

  // Convert skills string to array if passed as string
  if (req.body.skills && typeof req.body.skills === "string") {
    req.body.skills = req.body.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  job = await Job.findByIdAndUpdate(id, req.body, {
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
      new ErrorHandler("Job Seekers cannot delete job postings.", 403)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted Successfully!",
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }

    // Increment view count asynchronously
    try {
      await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });
    } catch (e) {
      // ignore
    }

    // Find similar jobs based on category or skills
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      category: job.category,
      expired: false,
    }).limit(3);

    res.status(200).json({
      success: true,
      job,
      similarJobs,
    });
  } catch (error) {
    return next(new ErrorHandler(`Invalid ID / Job Not Found`, 404));
  }
});

// Real aggregated Salary Insights
export const getSalaryInsights = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });

  const categoryMap = {};
  jobs.forEach((j) => {
    const cat = j.category || "General Tech";
    const sal = j.fixedSalary || (j.salaryFrom && j.salaryTo ? Math.round((j.salaryFrom + j.salaryTo) / 2) : j.salaryFrom || j.salaryTo);
    if (sal) {
      if (!categoryMap[cat]) {
        categoryMap[cat] = { salaries: [], count: 0, roles: new Set() };
      }
      categoryMap[cat].salaries.push(sal);
      categoryMap[cat].count++;
      categoryMap[cat].roles.add(j.title);
    }
  });

  const insights = Object.entries(categoryMap).map(([category, data]) => {
    const sum = data.salaries.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / data.salaries.length);
    const min = Math.min(...data.salaries);
    const max = Math.max(...data.salaries);
    return {
      category,
      avgSalary: avg,
      minSalary: min,
      maxSalary: max,
      sampleSize: data.count,
      sampleRoles: Array.from(data.roles).slice(0, 3),
    };
  });

  res.status(200).json({
    success: true,
    totalAnalyzed: jobs.length,
    insights,
  });
});

// Real aggregated Companies Directory
export const getCompanies = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });

  const companyMap = {};
  jobs.forEach((j) => {
    const name = j.company || "Independent Employer";
    if (!companyMap[name]) {
      companyMap[name] = {
        name,
        openPositions: 0,
        locations: new Set(),
        categories: new Set(),
        workModes: new Set(),
        sampleRoles: [],
      };
    }
    companyMap[name].openPositions++;
    if (j.city) companyMap[name].locations.add(j.city);
    if (j.category) companyMap[name].categories.add(j.category);
    if (j.workMode) companyMap[name].workModes.add(j.workMode);
    if (companyMap[name].sampleRoles.length < 3) {
      companyMap[name].sampleRoles.push({ id: j._id, title: j.title });
    }
  });

  const companies = Object.values(companyMap).map((c) => ({
    name: c.name,
    openPositions: c.openPositions,
    locations: Array.from(c.locations),
    categories: Array.from(c.categories),
    workModes: Array.from(c.workModes),
    sampleRoles: c.sampleRoles,
  }));

  res.status(200).json({
    success: true,
    totalCompanies: companies.length,
    companies,
  });
});

// Fraud / Spam Reporting
export const reportJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { reason, details } = req.body;

  if (!reason) {
    return next(new ErrorHandler("Please select a reason for reporting.", 400));
  }

  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  const reportItem = {
    user: req.user?._id,
    userName: req.user?.name || "Anonymous",
    userEmail: req.user?.email || "anonymous@example.com",
    reason,
    details: details || "",
    reportedAt: new Date(),
    status: "pending",
  };

  const updatedReports = job.reports || [];
  updatedReports.push(reportItem);

  await Job.findByIdAndUpdate(id, { reports: updatedReports });

  res.status(200).json({
    success: true,
    message: "Thank you. Your report has been submitted to moderators for review.",
  });
});

// Admin Overview & Moderation
export const getAdminOverview = catchAsyncErrors(async (req, res, next) => {
  const [totalUsers, candidates, recruiters, totalJobs, activeJobs, applications, reportedJobs] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Job Seeker" }),
      User.countDocuments({ role: "Employer" }),
      Job.countDocuments(),
      Job.countDocuments({ expired: false }),
      Application.countDocuments(),
      Job.find({ "reports.0": { $exists: true } }),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      candidates,
      recruiters,
      totalJobs,
      activeJobs,
      applications,
      reportedJobsCount: reportedJobs.length,
    },
    reportedJobs,
  });
});
