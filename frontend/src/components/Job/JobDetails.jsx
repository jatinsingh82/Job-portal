import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import JobCard from "./JobCard";
import JobShareModal from "./JobShareModal";
import ReportJobModal from "./ReportJobModal";
import {
  MapPin,
  Building,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Send,
  Award,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized, user, setUser } = useContext(Context);

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/v1/job/${id}`);
        setJob(data.job);
        if (data.similarJobs) {
          setSimilarJobs(data.similarJobs);
        }
      } catch (error) {
        toast.error("Job not found or no longer active");
        navigate("/job/getall");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  useEffect(() => {
    if (user?.savedJobs && job?._id) {
      setIsSaved(user.savedJobs.includes(String(job._id)));
    }
  }, [user, job]);

  const handleSave = async () => {
    if (!isAuthorized) {
      toast.error("Please sign in to save jobs");
      navigate("/login");
      return;
    }
    if (user?.role === "Employer") {
      toast.error("Employers cannot save job postings");
      return;
    }

    setSaving(true);
    try {
      const { data } = await axios.post(
        `/api/v1/user/save-job/${job._id}`,
        {},
        { withCredentials: true }
      );
      setIsSaved(data.saved);
      if (user) {
        setUser({ ...user, savedJobs: data.savedJobs });
      }
      toast.success(data.message);
    } catch (err) {
      toast.error("Failed to update saved job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) return null;

  const formatSalary = () => {
    if (job.fixedSalary) {
      return `$${Number(job.fixedSalary).toLocaleString()} per year`;
    }
    if (job.salaryFrom && job.salaryTo) {
      return `$${Number(job.salaryFrom).toLocaleString()} - $${Number(
        job.salaryTo
      ).toLocaleString()} per year`;
    }
    if (job.salaryFrom) {
      return `From $${Number(job.salaryFrom).toLocaleString()} per year`;
    }
    return "Competitive Compensation";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/job/getall"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all jobs
        </Link>

        {isAuthorized && (
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-medium transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Posting
          </button>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <Building className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-slate-700">
                  {job.company || "Hiring Company"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Employer
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.city ? `${job.city}, ${job.country}` : job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Posted {new Date(job.jobPostedOn).toLocaleDateString()}
                </span>
                {job.deadline && (
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShareModalOpen(true)}
              title="Share job"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {(!user || user.role === "Job Seeker") && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                    isSaved
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${isSaved ? "fill-blue-600" : ""}`}
                  />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>

                <Link
                  to={`/application/${job._id}`}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Apply Now
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Work Mode
            </p>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {job.workMode || "Hybrid"}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Employment
            </p>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {job.employmentType || "Full-time"}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Experience
            </p>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {job.experienceLevel || "Mid Level"}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Compensation
            </p>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {formatSalary()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              About the Position
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Key Responsibilities
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Requirements & Qualifications
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Benefits & Perks
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Skills, Summary, Sticky Apply */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">
              Job Overview
            </h4>
            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-900">
                  {job.category}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900">
                  {job.location}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Role Status:</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>

            {(!user || user.role === "Job Seeker") && (
              <div className="pt-2">
                <Link
                  to={`/application/${job._id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  Apply For This Role
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Jobs Section */}
      {similarJobs.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Similar Opportunities
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Roles in {job.category} that match your profile.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarJobs.map((simJob) => (
              <JobCard key={simJob._id} job={simJob} />
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <JobShareModal job={job} onClose={() => setShareModalOpen(false)} />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportJobModal job={job} onClose={() => setReportModalOpen(false)} />
      )}
    </div>
  );
};

export default JobDetails;
