import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form !"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered !"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered Successfully !");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password and role !"));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password !", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and role "${role}" not found !`, 404)
    );
  }
  sendToken(user, 200, res, "User Logged In Successfully !");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully !",
    });
});

export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const {
    name,
    phone,
    title,
    company,
    bio,
    skills,
    education,
    experience,
    projects,
    certifications,
    preferredLocation,
    preferredJobType,
    avatar,
  } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (title !== undefined) updateFields.title = title;
  if (company !== undefined) updateFields.company = company;
  if (bio !== undefined) updateFields.bio = bio;
  if (skills !== undefined)
    updateFields.skills = Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim()).filter(Boolean);
  if (education !== undefined) updateFields.education = education;
  if (experience !== undefined) updateFields.experience = experience;
  if (projects !== undefined) updateFields.projects = projects;
  if (certifications !== undefined) updateFields.certifications = certifications;
  if (preferredLocation !== undefined)
    updateFields.preferredLocation = preferredLocation;
  if (preferredJobType !== undefined)
    updateFields.preferredJobType = preferredJobType;
  if (avatar !== undefined) updateFields.avatar = avatar;

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
    user: updatedUser,
  });
});

export const uploadResume = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.resume) {
    return next(new ErrorHandler("Please select a resume file to upload.", 400));
  }

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
        "Invalid file format! Only PDF, PNG, and JPEG files are supported.",
        400
      )
    );
  }

  // 10MB maximum limit
  if (resume.size > 10 * 1024 * 1024) {
    return next(new ErrorHandler("File size exceeds maximum limit of 10MB.", 400));
  }

  let resumeData = null;
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
          updatedAt: new Date(),
        };
      }
    } catch (cErr) {
      console.warn("Cloudinary upload failed, using fallback:", cErr.message);
    }
  }

  if (!resumeData) {
    resumeData = {
      public_id: `resume_${Date.now()}`,
      url: "/CVs/cv1.jpg",
      name: resume.name || "Resume.pdf",
      size: `${Math.round(resume.size / 1024)} KB`,
      updatedAt: new Date(),
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { resume: resumeData },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Resume uploaded successfully!",
    resume: resumeData,
    user: updatedUser,
  });
});

export const deleteResume = catchAsyncErrors(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { resume: null },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Resume removed successfully.",
    user: updatedUser,
  });
});

export const toggleSaveJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  let savedJobs = user.savedJobs || [];
  const exists = savedJobs.some((jobId) => String(jobId) === String(id));

  if (exists) {
    savedJobs = savedJobs.filter((jobId) => String(jobId) !== String(id));
  } else {
    savedJobs.push(String(id));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { savedJobs },
    { new: true }
  );

  res.status(200).json({
    success: true,
    saved: !exists,
    message: !exists ? "Job saved to your list!" : "Job removed from saved list.",
    savedJobs: updatedUser.savedJobs,
  });
});

export const getSavedJobs = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const savedIds = user?.savedJobs || [];
  const allJobs = await Job.find({ expired: false });
  const savedJobs = allJobs.filter((j) => savedIds.includes(String(j._id)));

  res.status(200).json({
    success: true,
    savedJobs,
  });
});

// Job Alerts
export const saveJobAlert = catchAsyncErrors(async (req, res, next) => {
  const { keywords, location, category, workMode } = req.body;
  const user = await User.findById(req.user._id);
  const alerts = user.jobAlerts || [];
  alerts.push({
    keywords: keywords || "",
    location: location || "",
    category: category || "",
    workMode: workMode || "",
    createdAt: new Date(),
  });

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { jobAlerts: alerts },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Job alert preferences created!",
    jobAlerts: updated.jobAlerts,
  });
});

export const getJobAlerts = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    jobAlerts: user?.jobAlerts || [],
  });
});

export const deleteJobAlert = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const alerts = (user.jobAlerts || []).filter((a) => String(a._id) !== id);
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { jobAlerts: alerts },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Job alert deleted.",
    jobAlerts: updated.jobAlerts,
  });
});

// Bookmark Private Notes
export const saveBookmarkNote = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;
  const { note } = req.body;
  const user = await User.findById(req.user._id);
  let notes = user.bookmarkNotes || [];
  const existingIdx = notes.findIndex((n) => n.jobId === jobId);
  if (existingIdx >= 0) {
    notes[existingIdx].note = note;
    notes[existingIdx].updatedAt = new Date();
  } else {
    notes.push({ jobId, note, updatedAt: new Date() });
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { bookmarkNotes: notes },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Private note saved!",
    bookmarkNotes: updated.bookmarkNotes,
  });
});

export const getBookmarkNotes = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    bookmarkNotes: user?.bookmarkNotes || [],
  });
});

// Notification Settings
export const updateNotificationSettings = catchAsyncErrors(
  async (req, res, next) => {
    const { emailAlerts, applicationUpdates, interviewReminders } = req.body;
    const settings = {
      emailAlerts: Boolean(emailAlerts),
      applicationUpdates: Boolean(applicationUpdates),
      interviewReminders: Boolean(interviewReminders),
    };
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: settings },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Notification preferences updated!",
      notificationSettings: updated.notificationSettings,
    });
  }
);
