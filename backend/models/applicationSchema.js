import mongoose from "mongoose";
import validator from "validator";
import { mockApplication } from "../database/mockStore.js";

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  jobTitle: {
    type: String,
    default: "",
  },
  company: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [2, "Name must contain at least 2 Characters!"],
    maxLength: [50, "Name cannot exceed 50 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  coverLetter: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    required: [true, "Please enter your Phone Number!"],
  },
  address: {
    type: String,
    required: [true, "Please enter your Address!"],
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Resume.pdf",
    },
    size: {
      type: String,
      default: "PDF",
    },
  },
  applicantID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Job Seeker"],
      required: true,
    },
  },
  employerID: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Employer"],
      required: true,
    },
  },
  status: {
    type: String,
    enum: [
      "Applied",
      "Screening",
      "Under Review",
      "Shortlisted",
      "Interview",
      "Selected",
      "Rejected",
      "Hired",
    ],
    default: "Applied",
  },
  interview: {
    scheduled: { type: Boolean, default: false },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    type: { type: String, default: "Video Call" },
    link: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  timeline: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      note: String,
    },
  ],
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseApplication = mongoose.model("Application", applicationSchema);

export const Application = new Proxy(MongooseApplication, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    if (prop in mockApplication) {
      return mockApplication[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});
