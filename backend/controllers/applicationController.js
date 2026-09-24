import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import cloudinary from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employers cannot apply to jobs.", 403)
    );
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  if (!jobId) {
    return next(new ErrorHandler("Job ID is required.", 400));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  // Prevent duplicate applications
  const existingApps = await Application.find({
    "applicantID.user": req.user._id,
    jobId: jobId,
  });

  if (existingApps && existingApps.length > 0) {
    return next(
      new ErrorHandler("You have already submitted an application for this position.", 400)
    );
  }

  let resumeData = null;

  // Case 1: File uploaded in multipart form
  if (req.files && req.files.resume) {
    const { resume } = req.files;
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMimes.includes(resume.mimetype)) {
      return next(
        new ErrorHandler(
          "Invalid file format! Please upload a PDF, PNG, or JPEG file.",
          400
        )
      );
    }

    if (resume.size > 10 * 1024 * 1024) {
      return next(new ErrorHandler("File size exceeds 10MB limit.", 400));
    }

    const hasCloudinary =
      (process.env.CLOUDINARY_CLIENT_NAME || process.env.CLOUDINARY_CLOUD_NAME) &&
      (process.env.CLOUDINARY_CLIENT_API || process.env.CLOUDINARY_API_KEY) &&
      (process.env.CLOUDINARY_CLIENT_SECRET || process.env.CLOUDINARY_API_SECRET);

    if (hasCloudinary) {
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          resume.tempFilePath,
          { resource_type: "auto" }
        );
        if (cloudinaryResponse && cloudinaryResponse.secure_url) {
          resumeData = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
            name: resume.name || "Resume.pdf",
            size: `${Math.round(resume.size / 1024)} KB`,
          };
        }
      } catch (cErr) {
        console.warn("Cloudinary upload error, using fallback preview:", cErr.message);
      }
    }

    if (!resumeData) {
      resumeData = {
        public_id: `resume_${Date.now()}`,
        url: "/CVs/cv1.jpg",
        name: resume.name || "Resume.pdf",
        size: `${Math.round(resume.size / 1024)} KB`,
      };
    }
  } else if (req.user.resume && req.user.resume.url) {
    // Case 2: Using candidate profile resume
    resumeData = { ...req.user.resume };
  } else {
    return next(new ErrorHandler("Please upload or provide a resume.", 400));
  }

  if (!name || !email || !phone || !address) {
    return next(new ErrorHandler("Please fill in all contact information.", 400));
  }

  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };

  const application = await Application.create({
    jobId: jobDetails._id,
    jobTitle: jobDetails.title,
    company: jobDetails.company || "Hiring Company",
    name,
    email,
    coverLetter: coverLetter || "",
    phone,
    address,
    applicantID,
    employerID,
    resume: resumeData,
    status: "Applied",
    appliedAt: new Date(),
    updatedAt: new Date(),
    timeline: [
      {
        status: "Applied",
        date: new Date(),
        note: "Application submitted.",
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Application Submitted Successfully!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seekers cannot view recruiter applications.", 403)
      );
    }
    const { _id } = req.user;
    const { jobId } = req.query;

    let query = { "employerID.user": _id };
    if (jobId) {
      query.jobId = jobId;
    }

    const applications = await Application.find(query);

    // Fetch user details for each applicant to enrich recruiter view
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject ? app.toObject() : { ...app };
        const applicantUser = await User.findById(app.applicantID?.user);
        if (applicantUser) {
          appObj.candidateDetails = {
            title: applicantUser.title || "",
            skills: applicantUser.skills || [],
            experience: applicantUser.experience || [],
            education: applicantUser.education || [],
            bio: applicantUser.bio || "",
            avatar: applicantUser.avatar || "",
          };
        }
        return appObj;
      })
    );

    res.status(200).json({
      success: true,
      total: enrichedApplications.length,
      applications: enrichedApplications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employers cannot view seeker applications.", 403)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });

    // Enrich with job info if missing
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject ? app.toObject() : { ...app };
        if (!appObj.jobTitle && appObj.jobId) {
          const job = await Job.findById(appObj.jobId);
          if (job) {
            appObj.jobTitle = job.title;
            appObj.company = job.company;
            appObj.location = job.location;
          }
        }
        return appObj;
      })
    );

    res.status(200).json({
      success: true,
      total: enriched.length,
      applications: enriched,
    });
  }
);

export const updateApplicationStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seekers cannot update application statuses.", 403)
      );
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      "Applied",
      "Screening",
      "Under Review",
      "Shortlisted",
      "Interview",
      "Selected",
      "Rejected",
      "Hired",
    ];

    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status provided.", 400));
    }

    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }

    const updatedTimeline = application.timeline || [];
    updatedTimeline.push({
      status,
      date: new Date(),
      note: note || `Status updated to ${status}.`,
    });

    const updated = await Application.findByIdAndUpdate(
      id,
      {
        status,
        timeline: updatedTimeline,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Candidate moved to ${status}!`,
      application: updated,
    });
  }
);

export const scheduleInterview = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Unauthorized.", 403));
  }

  const { id } = req.params;
  const { date, time, type, link, notes } = req.body;

  if (!date || !time) {
    return next(new ErrorHandler("Please provide interview date and time.", 400));
  }

  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  const interviewData = {
    scheduled: true,
    date,
    time,
    type: type || "Video Call",
    link: link || "",
    notes: notes || "",
  };

  const updatedTimeline = application.timeline || [];
  updatedTimeline.push({
    status: "Interview",
    date: new Date(),
    note: `Interview scheduled on ${date} at ${time} (${type || "Video Call"}).`,
  });

  const updated = await Application.findByIdAndUpdate(
    id,
    {
      status: "Interview",
      interview: interviewData,
      timeline: updatedTimeline,
      updatedAt: new Date(),
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Interview scheduled successfully!",
    application: updated,
  });
});

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employers cannot delete seeker applications.", 403)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Withdrawn Successfully!",
    });
  }
);
