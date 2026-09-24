import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import JobCard from "./JobCard";
import { Bookmark, ArrowLeft, Briefcase } from "lucide-react";

const SavedJobs = () => {
  const { isAuthorized, user } = useContext(Context);
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    const fetchSavedJobs = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/saved-jobs", {
          withCredentials: true,
        });
        if (data && data.savedJobs) {
          setSavedJobs(data.savedJobs);
        }
      } catch (err) {
        console.error("Failed to load saved jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, [isAuthorized, navigate]);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setSavedJobs((prev) => prev.filter((j) => String(j._id) !== String(jobId)));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/job/getall"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all jobs
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Saved Opportunities
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Jobs you bookmarked for review and rapid application.
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          {savedJobs.length} {savedJobs.length === 1 ? "job saved" : "jobs saved"}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No saved jobs yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Browse vacancies and click the bookmark icon on any job card to save it for later.
            </p>
          </div>
          <Link
            to="/job/getall"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Explore Available Roles
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
