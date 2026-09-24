import mongoose from "mongoose";
import { mockJob } from "../database/mockStore.js";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a job title."],
    minLength: [3, "Title must contain at least 3 characters!"],
    maxLength: [100, "Title cannot exceed 100 characters!"],
  },
  company: {
    type: String,
    default: "Technology Solutions Inc.",
  },
  description: {
    type: String,
    required: [true, "Please provide a description."],
    minLength: [20, "Description must contain at least 20 characters!"],
    maxLength: [5000, "Description cannot exceed 5000 characters!"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category."],
  },
  country: {
    type: String,
    required: [true, "Please provide a country name."],
  },
  city: {
    type: String,
    required: [true, "Please provide a city name."],
  },
  location: {
    type: String,
    required: [true, "Please provide location."],
    minLength: [3, "Location must contain at least 3 characters!"],
  },
  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    default: "Full-time",
  },
  workMode: {
    type: String,
    enum: ["Remote", "Hybrid", "On-site"],
    default: "Hybrid",
  },
  experienceLevel: {
    type: String,
    enum: ["Entry Level", "Mid Level", "Senior Level", "Lead / Director"],
    default: "Mid Level",
  },
  skills: {
    type: [String],
    default: [],
  },
  responsibilities: {
    type: String,
    default: "",
  },
  requirements: {
    type: String,
    default: "",
  },
  benefits: {
    type: [String],
    default: [],
  },
  deadline: {
    type: Date,
  },
  fixedSalary: {
    type: Number,
  },
  salaryFrom: {
    type: Number,
  },
  salaryTo: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["active", "draft", "closed"],
    default: "active",
  },
  expired: {
    type: Boolean,
    default: false,
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

const MongooseJob = mongoose.model("Job", jobSchema);

export const Job = new Proxy(MongooseJob, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    if (prop in mockJob) {
      return mockJob[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});
