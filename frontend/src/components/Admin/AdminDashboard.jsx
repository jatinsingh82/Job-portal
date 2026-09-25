import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import toast from "react-hot-toast";
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileText,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [reportedJobs, setReportedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/job/admin/overview", {
        withCredentials: true,
      });
      if (data) {
        setStats(data.stats);
        setReportedJobs(data.reportedJobs || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    fetchAdminData();
  }, [isAuthorized, navigate]);

  const handleDismissReport = async (jobId) => {
    try {
      await axios.put(
        `/api/v1/job/update/${jobId}`,
        { reports: [] },
        { withCredentials: true }
      );
      toast.success("Reports dismissed for this job.");
      fetchAdminData();
    } catch (e) {
      toast.error("Failed to dismiss report");
    }
  };

  const handleRemoveJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to remove this reported job from the platform?"))
      return;
    try {
      await axios.delete(`/api/v1/job/delete/${jobId}`, {
        withCredentials: true,
      });
      toast.success("Job removed by administrator.");
      fetchAdminData();
    } catch (e) {
      toast.error("Failed to remove job");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <ShieldAlert className="w-4 h-4" />
            Administrative Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Platform Operations & Moderation
          </h1>
          <p className="text-sm text-slate-300">
            Real-time platform audit metrics, user accounts, and community fraud reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/job/getall"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            Public Job Feed →
          </Link>
        </div>
      </div>

      {/* Real Platform Statistics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Total Users
            </span>
            <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Candidates
            </span>
            <p className="text-2xl font-black text-blue-600">{stats.candidates}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Recruiters
            </span>
            <p className="text-2xl font-black text-purple-600">{stats.recruiters}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Total Postings
            </span>
            <p className="text-2xl font-black text-slate-900">{stats.totalJobs}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Applications
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {stats.applications}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Reported Jobs
            </span>
            <p className="text-2xl font-black text-rose-600">
              {stats.reportedJobsCount}
            </p>
          </div>
        </div>
      )}

      {/* Reported Jobs Moderation Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Reported Postings & Fraud Review Queue ({reportedJobs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Postings flagged by job seekers for inaccurate compensation, spam, or suspicious activity.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        ) : reportedJobs.length > 0 ? (
          <div className="space-y-4">
            {reportedJobs.map((job) => (
              <div
                key={job._id}
                className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                      {job.reports?.length || 1} Community Reports
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Company: <strong>{job.company}</strong> • Location:{" "}
                      {job.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/job/${job._id}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
                    >
                      Inspect Job
                    </Link>

                    <button
                      onClick={() => handleDismissReport(job._id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition"
                    >
                      Dismiss Reports
                    </button>

                    <button
                      onClick={() => handleRemoveJob(job._id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Job
                    </button>
                  </div>
                </div>

                {/* Specific report comments */}
                {job.reports && job.reports.length > 0 && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Report Reasons:</span>
                    {job.reports.map((rep, rIdx) => (
                      <p key={rIdx} className="text-slate-600">
                        • <strong className="text-slate-900">{rep.reason}</strong>
                        {rep.details && `: "${rep.details}"`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              All Job Postings Verified & Clear
            </h3>
            <p className="text-xs text-slate-500">
              There are currently zero pending fraud or spam reports from users.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
