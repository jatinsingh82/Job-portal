import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  FileText,
  MapPin,
  UploadCloud,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
  Save,
  Building,
} from "lucide-react";

const Profile = () => {
  const { user, setUser, isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Profile Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [preferredJobType, setPreferredJobType] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // New item modal/inline states
  const [showAddExp, setShowAddExp] = useState(false);
  const [expCompany, setExpCompany] = useState("");
  const [expTitle, setExpTitle] = useState("");
  const [expLocation, setExpLocation] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduStartYear, setEduStartYear] = useState("");
  const [eduEndYear, setEduEndYear] = useState("");

  const [showAddProj, setShowAddProj] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projLink, setProjLink] = useState("");

  const [showAddCert, setShowAddCert] = useState(false);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certYear, setCertYear] = useState("");

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setTitle(user.title || "");
      setCompany(user.company || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setPreferredLocation(user.preferredLocation || "");
      setPreferredJobType(user.preferredJobType || "Full-time");
      setSkills(user.skills || []);
      setEducation(user.education || []);
      setExperience(user.experience || []);
      setProjects(user.projects || []);
      setCertifications(user.certifications || []);
    }
  }, [user, isAuthorized, navigate]);

  // Calculate REAL profile completion percentage from actual completed fields
  const calculateCompletion = () => {
    const fields = [
      { name: "Name", done: Boolean(name?.trim()) },
      { name: "Phone", done: Boolean(phone) },
      { name: "Title", done: Boolean(title?.trim()) },
      { name: "Bio", done: Boolean(bio?.trim()) },
      { name: "Skills", done: skills.length > 0 },
      { name: "Experience", done: experience.length > 0 },
      { name: "Education", done: education.length > 0 },
      { name: "Resume", done: Boolean(user?.resume?.url) },
      { name: "Location Preference", done: Boolean(preferredLocation?.trim()) },
      { name: "Projects", done: projects.length > 0 },
    ];
    const completed = fields.filter((f) => f.done).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionRate = calculateCompletion();

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        title,
        company,
        bio,
        avatar,
        preferredLocation,
        preferredJobType,
        skills,
        experience,
        education,
        projects,
        certifications,
      };
      const { data } = await axios.put("/api/v1/user/profile", payload, {
        withCredentials: true,
      });
      setUser(data.user);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      toast.error("Skill already added");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Resume Upload Handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid PDF, PNG, or JPEG file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setResumeUploading(true);
    try {
      const { data } = await axios.post("/api/v1/user/resume", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume?")) return;
    try {
      const { data } = await axios.delete("/api/v1/user/resume", {
        withCredentials: true,
      });
      setUser(data.user);
      toast.success("Resume removed successfully.");
    } catch (err) {
      toast.error("Failed to delete resume");
    }
  };

  // Add Experience
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expCompany || !expTitle) {
      toast.error("Company and Title are required");
      return;
    }
    const newExp = {
      company: expCompany,
      title: expTitle,
      location: expLocation,
      startDate: expStartDate,
      endDate: expEndDate || "Present",
      current: !expEndDate,
      description: expDesc,
    };
    setExperience([...experience, newExp]);
    setExpCompany("");
    setExpTitle("");
    setExpLocation("");
    setExpStartDate("");
    setExpEndDate("");
    setExpDesc("");
    setShowAddExp(false);
    toast.success("Experience added. Remember to save changes.");
  };

  // Add Education
  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!eduSchool || !eduDegree) {
      toast.error("School and Degree are required");
      return;
    }
    const newEdu = {
      school: eduSchool,
      degree: eduDegree,
      fieldOfStudy: eduField,
      startYear: eduStartYear,
      endYear: eduEndYear,
    };
    setEducation([...education, newEdu]);
    setEduSchool("");
    setEduDegree("");
    setEduField("");
    setEduStartYear("");
    setEduEndYear("");
    setShowAddEdu(false);
    toast.success("Education added. Remember to save changes.");
  };

  // Add Project
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projTitle) {
      toast.error("Project title is required");
      return;
    }
    const newProj = {
      title: projTitle,
      description: projDesc,
      link: projLink,
    };
    setProjects([...projects, newProj]);
    setProjTitle("");
    setProjDesc("");
    setProjLink("");
    setShowAddProj(false);
    toast.success("Project added. Remember to save changes.");
  };

  // Add Certification
  const handleAddCert = (e) => {
    e.preventDefault();
    if (!certName) {
      toast.error("Certification name is required");
      return;
    }
    const newC = {
      name: certName,
      issuer: certIssuer,
      year: certYear,
    };
    setCertifications([...certifications, newC]);
    setCertName("");
    setCertIssuer("");
    setCertYear("");
    setShowAddCert(false);
    toast.success("Certification added. Remember to save changes.");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header & Completion Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl border border-blue-200">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {name || "Your Name"}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {user?.role}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {title || (user?.role === "Employer" ? "Talent Acquisition" : "Candidate Profile")}
              </p>
              <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving Profile..." : "Save All Changes"}
          </button>
        </div>

        {/* Profile Completion Indicator */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Profile Strength & Readiness
            </span>
            <span className="text-sm font-extrabold text-blue-600">
              Profile completion: {completionRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                completionRate >= 80
                  ? "bg-emerald-500"
                  : completionRate >= 50
                  ? "bg-blue-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {completionRate === 100
              ? "Your profile is 100% complete! Employers can review all credentials and verified experience."
              : "Complete your headline, skills, work history, and resume to stand out to verified recruiters."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Basic Info & Resume Management */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resume Management Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Resume / CV
              </h3>
              {user?.resume?.url && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </div>

            {user?.resume?.url ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                        {user.resume.name || "Resume.pdf"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {user.resume.size || "PDF document"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDeleteResume}
                    title="Remove Resume"
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  <a
                    href={user.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    View / Download
                  </a>
                  <label className="flex-1 text-center py-1.5 px-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl space-y-3 hover:border-blue-400 transition">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Upload your resume
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PDF, PNG, or JPG (max 10MB)
                  </p>
                </div>
                <label className="inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition">
                  {resumeUploading ? "Uploading..." : "Browse Files"}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={resumeUploading}
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Contact & Preferences */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Contact & Work Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Target / Preferred Location
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Preferred Job Type
                </label>
                <select
                  value={preferredJobType}
                  onChange={(e) => setPreferredJobType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio, Skills, Experience, Education, Projects */}
        <div className="lg:col-span-8 space-y-6">
          {/* Headline & Bio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Professional Headline & Bio
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Professional Headline / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer | React & Node.js Specialist"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Professional Summary
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your background, core strengths, and what you are looking for in your next role..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Skills Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Skills & Technologies ({skills.length})
              </h3>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. TypeScript, Docker, Figma)"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
              >
                Add Skill
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Work Experience ({experience.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddExp(!showAddExp)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {/* Add Exp Form */}
            {showAddExp && (
              <form
                onSubmit={handleAddExperience}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
              >
                <h4 className="font-bold text-slate-800">Add New Position</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Company name"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Job title"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Remote, Austin, TX)"
                    value={expLocation}
                    onChange={(e) => setExpLocation(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start year (e.g. 2021)"
                      value={expStartDate}
                      onChange={(e) => setExpStartDate(e.target.value)}
                      className="w-1/2 p-2 border border-slate-200 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="End year (or leave blank)"
                      value={expEndDate}
                      onChange={(e) => setExpEndDate(e.target.value)}
                      className="w-1/2 p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Summary of responsibilities and achievements..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExp(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Add Entry
                  </button>
                </div>
              </form>
            )}

            {/* Experience List */}
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-blue-600 font-semibold">
                        {exp.company}{" "}
                        {exp.location && `• ${exp.location}`}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setExperience(experience.filter((_, i) => i !== idx))
                    }
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Education ({education.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEdu(!showAddEdu)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {showAddEdu && (
              <form
                onSubmit={handleAddEducation}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
              >
                <h4 className="font-bold text-slate-800">Add Education</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Institution / School"
                    value={eduSchool}
                    onChange={(e) => setEduSchool(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Degree (e.g. B.S., M.S.)"
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Field of study"
                    value={eduField}
                    onChange={(e) => setEduField(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start year"
                      value={eduStartYear}
                      onChange={(e) => setEduStartYear(e.target.value)}
                      className="w-1/2 p-2 border border-slate-200 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="End year"
                      value={eduEndYear}
                      onChange={(e) => setEduEndYear(e.target.value)}
                      className="w-1/2 p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEdu(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {edu.school}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {edu.degree}{" "}
                        {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {edu.startYear} - {edu.endYear}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEducation(education.filter((_, i) => i !== idx))
                    }
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-600" />
                Featured Projects ({projects.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProj(!showAddProj)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {showAddProj && (
              <form
                onSubmit={handleAddProject}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
              >
                <h4 className="font-bold text-slate-800">Add Project</h4>
                <input
                  type="text"
                  required
                  placeholder="Project title"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
                <input
                  type="url"
                  placeholder="Project or GitHub Link"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Project summary and tech stack..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProj(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 relative group"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {proj.title}
                    </h4>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Link
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setProjects(projects.filter((_, i) => i !== idx))
                    }
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
