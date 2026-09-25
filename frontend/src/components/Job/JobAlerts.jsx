import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import {
  Bell,
  Plus,
  Trash2,
  Search,
  MapPin,
  Briefcase,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const JobAlerts = () => {
  const { isAuthorized, user } = useContext(Context);
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const [alertsRes, jobsRes] = await Promise.all([
          axios.get("/api/v1/user/job-alerts", { withCredentials: true }),
          axios.get("/api/v1/job/getall"),
        ]);
        setAlerts(alertsRes.data.jobAlerts || []);
        if (jobsRes.data && jobsRes.data.jobs) {
          setMatchingJobs(jobsRes.data.jobs);
        }
      } catch (err) {
        console.error("Failed to load alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthorized, navigate]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!keywords && !location && category === "All" && workMode === "All") {
      toast.error("Please provide at least one alert criterion");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        keywords,
        location,
        category: category !== "All" ? category : "",
        workMode: workMode !== "All" ? workMode : "",
      };
      const { data } = await axios.post("/api/v1/user/job-alerts", payload, {
        withCredentials: true,
      });
      toast.success(data.message || "Alert created successfully!");
      setAlerts(data.jobAlerts || []);
      setKeywords("");
      setLocation("");
      setCategory("All");
      setWorkMode("All");
      setShowAddForm(false);
    } catch (err) {
      toast.error("Failed to create alert");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      const { data } = await axios.delete(`/api/v1/user/job-alerts/${alertId}`, {
        withCredentials: true,
      });
      toast.success("Alert removed.");
      setAlerts(data.jobAlerts || []);
    } catch (err) {
      toast.error("Failed to delete alert");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Bell className="w-4 h-4" />
            Personal Notification Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Job Alerts & Target Watches
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define target criteria to instantly discover relevant postings as soon as hiring managers publish them.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Create New Alert
        </button>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateAlert}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-slate-900 text-sm">
            Set Alert Watch Criteria
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Keywords / Title / Skills
              </label>
              <input
                type="text"
                placeholder="e.g. React, Full Stack, Python"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="DevOps">DevOps</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Product Management">Product Management</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
            >
              {saving ? "Saving..." : "Save Alert"}
            </button>
          </div>
        </form>
      )}

      {/* Active Alerts List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Your Configured Alerts ({alerts.length})
        </h2>

        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alt) => (
              <div
                key={alt._id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 relative space-y-2 text-xs"
              >
                <button
                  onClick={() => handleDeleteAlert(alt._id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                  title="Delete alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1 pr-6">
                  <p className="font-bold text-slate-900 text-sm">
                    {alt.keywords || "Any Keyword"}
                  </p>
                  <p className="text-slate-500">
                    Location: <strong>{alt.location || "Anywhere"}</strong>
                  </p>
                  <p className="text-slate-500">
                    Category: <strong>{alt.category || "All"}</strong> •{" "}
                    Mode: <strong>{alt.workMode || "All"}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <Link
                    to={`/job/getall?keyword=${encodeURIComponent(
                      alt.keywords || ""
                    )}&location=${encodeURIComponent(alt.location || "")}`}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Matching Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No alerts created yet</h3>
            <p className="text-xs text-slate-500">
              Set up your first alert above to stay updated on positions matching your preferred skills and location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAlerts;
