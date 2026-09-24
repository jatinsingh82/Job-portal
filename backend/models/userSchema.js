import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mockUser } from "../database/mockStore.js";

const userSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: [true, "Please enter your Phone Number!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    minLength: [6, "Password must contain at least 6 characters!"],
    maxLength: [64, "Password cannot exceed 64 characters!"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Please select a role"],
    enum: ["Job Seeker", "Employer", "Admin"],
  },
  avatar: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  company: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startYear: String,
      endYear: String,
    },
  ],
  experience: [
    {
      company: String,
      title: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String,
    },
  ],
  projects: [
    {
      title: String,
      description: String,
      link: String,
    },
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      year: String,
    },
  ],
  resume: {
    name: String,
    url: String,
    public_id: String,
    updatedAt: Date,
    size: String,
  },
  preferredLocation: {
    type: String,
    default: "",
  },
  preferredJobType: {
    type: String,
    default: "",
  },
  savedJobs: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET_KEY || "fallback_job_portal_secret",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

const MongooseUser = mongoose.model("User", userSchema);

export const User = new Proxy(MongooseUser, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    if (prop in mockUser) {
      return mockUser[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
});
