import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowRight,
  DollarSign,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";

const CompareJobs = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("/api/v1/job/getall");
        if (data && data.jobs) {
          setAllJobs(data.jobs);
          if (data.jobs.length >= 2) {
            setSelectedJobIds([data.jobs[0]._id, data.jobs[1]._id]);
          } else if (data.jobs.length === 1) {
            setSelectedJobIds([data.jobs[0]._id]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch jobs for comparison", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const selectedJobs = allJobs.filter((j) => selectedJobIds.includes(j._id));

  const handleAddJob = (jobId) => {
    if (!jobId || selectedJobIds.includes(jobId)) return;
    if (selectedJobIds.length >= 3) {
      alert("You can compare up to 3 jobs side by side.");
      return;
    }
    setSelectedJobIds([...selectedJobIds, jobId]);
  };

  const handleRemoveJob = (jobId) => {
    setSelectedJobIds(selectedJobIds.filter((id) => id !== jobId));
  };

  const formatSalary = (job) => {
    if (job.fixedSalary) return `$${job.fixedSalary.toLocaleString()} / yr`;
    if (job.salaryFrom && job.salaryTo)
      return `$${job.salaryFrom.toLocaleString()} - $${job.salaryTo.toLocaleString()} / yr`;
    if (job.salaryFrom) return `From $${job.salaryFrom.toLocaleString()} / yr`;
    return "Competitive Salary";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Layers className="w-4 h-4" />
            Decision Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Compare Job Opportunities Side-by-Side
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare compensation, required skills, work modes, and benefits to choose the right career path.
          </p>
        </div>

        {selectedJobIds.length < 3 && allJobs.length > selectedJobIds.length && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                handleAddJob(e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="" disabled>
                + Add another job to compare...
              </option>
              {allJobs
                .filter((j) => !selectedJobIds.includes(j._id))
                .map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.company})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      ) : selectedJobs.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm min-w-[700px]">
            {/* Headers row */}
            <div className="grid grid-cols-4 p-6 border-b border-slate-100 bg-slate-50/70 rounded-t-3xl gap-4">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
                Attributes
              </div>
              {selectedJobs.map((job) => (
                <div key={job._id} className="relative space-y-1">
                  {selectedJobs.length > 1 && (
                    <button
                      onClick={() => handleRemoveJob(job._id)}
                      className="absolute -top-2 -right-2 p-1 text-slate-400 hover:text-rose-600 bg-white rounded-full border border-slate-200 shadow-xs"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold">{job.company}</p>
                </div>
              ))}
            </div>

            {/* Compensation */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 items-center gap-4 text-xs">
              <span className="font-bold text-slate-500">Compensation</span>
              {selectedJobs.map((j) => (
                <span key={j._id} className="font-extrabold text-slate-900">
                  {formatSalary(j)}
                </span>
              ))}
            </div>

            {/* Work Mode */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 items-center gap-4 text-xs">
              <span className="font-bold text-slate-500">Work Mode</span>
              {selectedJobs.map((j) => (
                <span
                  key={j._id}
                  className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold w-fit"
                >
                  {j.workMode || "Hybrid"}
                </span>
              ))}
            </div>

            {/* Location */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 items-center gap-4 text-xs">
              <span className="font-bold text-slate-500">Location</span>
              {selectedJobs.map((j) => (
                <span key={j._id} className="text-slate-700">
                  {j.city ? `${j.city}, ${j.country}` : j.location}
                </span>
              ))}
            </div>

            {/* Employment Type */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 items-center gap-4 text-xs">
              <span className="font-bold text-slate-500">Employment Type</span>
              {selectedJobs.map((j) => (
                <span key={j._id} className="text-slate-700 font-medium">
                  {j.employmentType || "Full-time"}
                </span>
              ))}
            </div>

            {/* Experience Level */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 items-center gap-4 text-xs">
              <span className="font-bold text-slate-500">Experience Level</span>
              {selectedJobs.map((j) => (
                <span key={j._id} className="text-slate-700 font-medium">
                  {j.experienceLevel || "Mid Level"}
                </span>
              ))}
            </div>

            {/* Skills Required */}
            <div className="grid grid-cols-4 p-4 border-b border-slate-100 items-start gap-4 text-xs">
              <span className="font-bold text-slate-500 pt-1">Required Skills</span>
              {selectedJobs.map((j) => (
                <div key={j._id} className="flex flex-wrap gap-1">
                  {j.skills && j.skills.length > 0 ? (
                    j.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Not specified</span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 p-6 items-center gap-4 text-xs bg-slate-50/50 rounded-b-3xl">
              <span className="font-bold text-slate-500">Actions</span>
              {selectedJobs.map((j) => (
                <div key={j._id} className="space-y-2">
                  <Link
                    to={`/application/${j._id}`}
                    className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center shadow-xs transition"
                  >
                    Apply Now
                  </Link>
                  <Link
                    to={`/job/${j._id}`}
                    className="block w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-center transition"
                  >
                    Full Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-2">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No jobs to compare</h3>
          <p className="text-xs text-slate-500">
            Select at least one job from the dropdown above to start comparison.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompareJobs;
