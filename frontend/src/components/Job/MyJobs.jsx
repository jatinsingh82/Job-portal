import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import {
  Layers,
  Users,
  Briefcase,
  CheckCircle,
  Calendar,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  X,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const MyJobs = () => {
  const { user, isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  const [myJobs, setMyJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Job modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEmploymentType, setEditEmploymentType] = useState("Full-time");
  const [editWorkMode, setEditWorkMode] = useState("Hybrid");
  const [editDescription, setEditDescription] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [jobsRes, statsRes] = await Promise.all([
        axios.get("/api/v1/job/getmyjobs", { withCredentials: true }),
        axios.get("/api/v1/job/stats", { withCredentials: true }),
      ]);
      setMyJobs(jobsRes.data.myJobs || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    if (user && user.role !== "Employer") {
      toast.error("Access restricted to Employers / Recruiters");
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [isAuthorized, user?.role, navigate]);

  // Toggle active / closed status
  const handleToggleStatus = async (job) => {
    const newExpired = !job.expired;
    try {
      await axios.put(
        `/api/v1/job/update/${job._id}`,
        { expired: newExpired },
        { withCredentials: true }
      );
      toast.success(
        newExpired ? "Job closed to new applicants" : "Job reactivated!"
      );
      setMyJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, expired: newExpired } : j))
      );
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job listing? All corresponding applicant links will be affected."
      )
    )
      return;

    try {
      await axios.delete(`/api/v1/job/delete/${jobId}`, {
        withCredentials: true,
      });
      toast.success("Job deleted successfully!");
      setMyJobs((prev) => prev.filter((j) => j._id !== jobId));
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditTitle(job.title || "");
    setEditCategory(job.category || "");
    setEditLocation(job.location || "");
    setEditEmploymentType(job.employmentType || "Full-time");
    setEditWorkMode(job.workMode || "Hybrid");
    setEditDescription(job.description || "");
    setEditSalary(job.fixedSalary || job.salaryFrom || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle || !editDescription || !editCategory) {
      toast.error("Please fill required fields");
      return;
    }
    setUpdating(true);
    try {
      const payload = {
        title: editTitle,
        category: editCategory,
        location: editLocation,
        employmentType: editEmploymentType,
        workMode: editWorkMode,
        description: editDescription,
        fixedSalary: Number(editSalary) || undefined,
      };
      await axios.put(`/api/v1/job/update/${editingJob._id}`, payload, {
        withCredentials: true,
      });
      toast.success("Job details updated successfully!");
      setEditModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to update job");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Recruiter Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
            Employer Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Recruiter Dashboard & Job Listings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real-time hiring metrics, active openings, and applicant volumes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/applications/me"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Review Pipeline
          </Link>
          <Link
            to="/job/post"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Real Database Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Active Jobs
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {stats ? stats.activeJobs : myJobs.filter((j) => !j.expired).length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Closed Jobs
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {stats ? stats.closedJobs : myJobs.filter((j) => j.expired).length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Applications
          </span>
          <p className="text-2xl font-black text-blue-600 tracking-tight">
            {stats ? stats.totalApplications : 0}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            New / Unreviewed
          </span>
          <p className="text-2xl font-black text-amber-500 tracking-tight">
            {stats ? stats.newApplications : 0}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Shortlisted
          </span>
          <p className="text-2xl font-black text-purple-600 tracking-tight">
            {stats ? stats.shortlisted : 0}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Interviews
          </span>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">
            {stats ? stats.interviews : 0}
          </p>
        </div>
      </div>

      {/* Jobs Management Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your Posted Openings ({myJobs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage live job postings, edit requirements, or pause candidate submissions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : myJobs.length > 0 ? (
          <div className="space-y-4">
            {myJobs.map((job) => (
              <div
                key={job._id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                        job.expired
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {job.expired ? "Closed" : "Active"}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {job.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {job.workMode} • {job.employmentType}
                    </span>
                  </div>

                  <Link
                    to={`/job/${job._id}`}
                    className="block text-base font-bold text-slate-900 hover:text-blue-600 transition"
                  >
                    {job.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.city ? `${job.city}, ${job.country}` : job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Posted {new Date(job.jobPostedOn).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {job.applicantCount !== undefined
                        ? job.applicantCount
                        : 0}{" "}
                      applicants
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                  <Link
                    to={`/applications/me`}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Applicants
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(job)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(job)}
                    title={job.expired ? "Reactivate job" : "Close job"}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                      job.expired
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {job.expired ? "Reactivate" : "Pause"}
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    title="Delete Job"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              You haven't posted any jobs yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first opening to attract candidates and start receiving applications.
            </p>
            <Link
              to="/job/post"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Job Opening
            </Link>
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Job: {editingJob.title}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={editEmploymentType}
                    onChange={(e) => setEditEmploymentType(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Work Mode
                  </label>
                  <select
                    value={editWorkMode}
                    onChange={(e) => setEditWorkMode(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Salary (USD/year)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 120000"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
