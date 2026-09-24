import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  Building,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const JobCard = ({ job, onSaveToggle }) => {
  const { isAuthorized, user, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(
    user?.savedJobs ? user.savedJobs.includes(String(job._id)) : false
  );
  const [saveLoading, setSaveLoading] = useState(false);

  const formatSalary = () => {
    if (job.fixedSalary) {
      return `$${Number(job.fixedSalary).toLocaleString()} / yr`;
    }
    if (job.salaryFrom && job.salaryTo) {
      return `$${Number(job.salaryFrom).toLocaleString()} - $${Number(
        job.salaryTo
      ).toLocaleString()} / yr`;
    }
    if (job.salaryFrom) {
      return `From $${Number(job.salaryFrom).toLocaleString()} / yr`;
    }
    return null;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthorized) {
      toast.error("Please sign in to save jobs");
      navigate("/login");
      return;
    }
    if (user?.role === "Employer") {
      toast.error("Employers cannot save candidate job postings");
      return;
    }

    setSaveLoading(true);
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
      if (onSaveToggle) {
        onSaveToggle(job._id, data.saved);
      }
    } catch (err) {
      toast.error("Failed to update saved job");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/job/${job._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Job link copied to clipboard!");
    } else {
      toast.success(url);
    }
  };

  const salaryString = formatSalary();

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 flex flex-col justify-between">
      <div>
        {/* Top bar: Company & Actions */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold group-hover:border-blue-200 group-hover:bg-blue-50/50 transition">
              <Building className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600">
                {job.company || "Leading Tech Company"}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(job.jobPostedOn)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              title="Share Job"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {(!user || user.role === "Job Seeker") && (
              <button
                onClick={handleSave}
                disabled={saveLoading}
                title={isSaved ? "Remove from saved" : "Save Job"}
                className={`p-2 rounded-lg transition ${
                  isSaved
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isSaved ? "fill-blue-600" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/job/${job._id}`} className="block group-hover:text-blue-600">
          <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
            {job.title}
          </h3>
        </Link>

        {/* Key Info Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.city ? `${job.city}, ${job.country || ""}` : job.location}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            {job.employmentType || "Full-time"}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            {job.workMode || "Hybrid"}
          </span>
          {job.experienceLevel && (
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
              {job.experienceLevel}
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-400">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          {salaryString ? (
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                Compensation
              </span>
              <span className="text-sm font-bold text-slate-900">
                {salaryString}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Competitive salary
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/job/${job._id}`}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Details
          </Link>
          {(!user || user.role === "Job Seeker") && (
            <Link
              to={`/application/${job._id}`}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
            >
              Apply
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
