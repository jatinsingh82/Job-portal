import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
  Video,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Trash2,
  User,
  MapPin,
  CalendarDays,
  Briefcase,
  AlertCircle,
  X,
} from "lucide-react";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recruiter pipeline filter tab
  const [pipelineStage, setPipelineStage] = useState("All");

  // Interview scheduling modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("Video Call");
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Candidate detail drawer/modal state for recruiters
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (user?.role === "Employer") {
        const { data } = await axios.get(
          "/api/v1/application/employer/getall",
          { withCredentials: true }
        );
        setApplications(data.applications || []);
      } else {
        const { data } = await axios.get(
          "/api/v1/application/jobseeker/getall",
          { withCredentials: true }
        );
        setApplications(data.applications || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    fetchApplications();
  }, [isAuthorized, user?.role, navigate]);

  // Candidate: withdraw application
  const handleWithdrawApplication = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone."
      )
    )
      return;

    try {
      const { data } = await axios.delete(
        `/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(data.message || "Application withdrawn.");
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw application");
    }
  };

  // Recruiter: update candidate status in pipeline
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const { data } = await axios.put(
        `/api/v1/application/employer/status/${appId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message || `Candidate moved to ${newStatus}`);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
      if (selectedAppDetail && selectedAppDetail._id === appId) {
        setSelectedAppDetail({ ...selectedAppDetail, status: newStatus });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Recruiter: submit scheduled interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      toast.error("Please specify date and time");
      return;
    }
    setScheduling(true);
    try {
      const payload = {
        date: interviewDate,
        time: interviewTime,
        type: interviewType,
        link: interviewLink,
        notes: interviewNotes,
      };
      const { data } = await axios.post(
        `/api/v1/application/employer/schedule-interview/${selectedAppForInterview._id}`,
        payload,
        { withCredentials: true }
      );
      toast.success("Interview scheduled successfully!");
      setScheduleModalOpen(false);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  // Filter applications by pipeline stage for recruiters
  const stages = [
    "All",
    "Applied",
    "Screening",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
  ];

  const filteredApps =
    user?.role === "Employer" && pipelineStage !== "All"
      ? applications.filter((a) => a.status === pipelineStage)
      : applications;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Screening":
      case "Under Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Shortlisted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Interview":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Selected":
      case "Hired":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === "Employer"
              ? "Candidate Recruitment Pipeline"
              : "My Application Tracker"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === "Employer"
              ? "Screen applicants, advance candidates through hiring stages, and schedule interviews."
              : "Monitor review progress, scheduled interviews, and hiring outcomes in real-time."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            {applications.length}{" "}
            {applications.length === 1 ? "Application" : "Applications"}
          </span>
          {user?.role === "Employer" && (
            <Link
              to="/job/post"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              + Post New Job
            </Link>
          )}
        </div>
      </div>

      {/* Recruiter Pipeline Stage Tabs */}
      {user?.role === "Employer" && (
        <div className="flex flex-wrap gap-2 pb-2">
          {stages.map((stage) => {
            const count =
              stage === "All"
                ? applications.length
                : applications.filter((a) => a.status === stage).length;
            return (
              <button
                key={stage}
                onClick={() => setPipelineStage(stage)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  pipelineStage === stage
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{stage}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    pipelineStage === stage
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Application List Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm transition space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Applied{" "}
                      {new Date(
                        app.appliedAt || app.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {user?.role === "Employer" ? (
                      <span>{app.name}</span>
                    ) : (
                      <Link
                        to={`/job/${app.jobId}`}
                        className="hover:text-blue-600 transition"
                      >
                        {app.jobTitle || "Job Position"}
                      </Link>
                    )}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    {user?.role === "Employer" ? (
                      <span>
                        Applicant for <strong>{app.jobTitle}</strong>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {app.company || "Hiring Employer"}
                      </span>
                    )}
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Candidate: Withdraw */}
                  {user?.role === "Job Seeker" && (
                    <button
                      onClick={() => handleWithdrawApplication(app._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Withdraw
                    </button>
                  )}

                  {/* Employer: Status changer & Interview scheduler */}
                  {user?.role === "Employer" && (
                    <>
                      <button
                        onClick={() => setSelectedAppDetail(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                      >
                        Candidate Profile
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppForInterview(app);
                          setScheduleModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule Interview
                      </button>

                      <div className="flex items-center gap-1.5 pl-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          Stage:
                        </span>
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateStatus(app._id, e.target.value)
                          }
                          className="text-xs font-bold py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Screening">Screening</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scheduled Interview Banner (if present) */}
              {app.interview && app.interview.scheduled && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                      <Video className="w-4 h-4 text-indigo-600" />
                      Interview Scheduled
                    </div>
                    <p className="text-slate-600">
                      <strong>Date & Time:</strong> {app.interview.date} at{" "}
                      {app.interview.time} ({app.interview.type})
                    </p>
                    {app.interview.notes && (
                      <p className="text-slate-500 italic">
                        "{app.interview.notes}"
                      </p>
                    )}
                  </div>

                  {app.interview.link && (
                    <a
                      href={app.interview.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join Meeting Link
                    </a>
                  )}
                </div>
              )}

              {/* Candidate Info / Resume Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {app.name} ({app.email})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {app.address}
                  </span>
                </div>

                {app.resume?.url && (
                  <a
                    href={app.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View Attached Resume ({app.resume.name || "Resume"})
                  </a>
                )}
              </div>

              {/* Cover Letter excerpt */}
              {app.coverLetter && (
                <div className="pt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-700">Cover Letter:</strong>{" "}
                  {app.coverLetter}
                </div>
              )}

              {/* Timeline Steps */}
              {app.timeline && app.timeline.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    Activity History:
                  </span>
                  {app.timeline.map((step, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                    >
                      {step.status} (
                      {new Date(step.date).toLocaleDateString()})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {user?.role === "Employer"
                ? "No applications in this stage"
                : "No applications submitted yet"}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {user?.role === "Employer"
                ? "Switch pipeline stages or wait for incoming submissions."
                : "Browse open jobs to apply directly to verified employers."}
            </p>
          </div>
          {user?.role !== "Employer" && (
            <Link
              to="/job/getall"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              Browse Open Roles
            </Link>
          )}
        </div>
      )}

      {/* Recruiter: Schedule Interview Modal */}
      {scheduleModalOpen && selectedAppForInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Schedule Candidate Interview
                </h3>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
              Scheduling with{" "}
              <strong className="text-slate-900">
                {selectedAppForInterview.name}
              </strong>{" "}
              for role{" "}
              <strong className="text-slate-900">
                {selectedAppForInterview.jobTitle}
              </strong>
              .
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2:00 PM PST"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="Video Call">Video Call (Google Meet / Zoom)</option>
                  <option value="Phone Interview">Phone Interview</option>
                  <option value="On-site Meeting">On-site Interview</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Meeting Link or Dial-in Info
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes / Agenda for Candidate
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Technical live-coding and system design discussion with team lead."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {scheduling ? "Scheduling..." : "Confirm & Send Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recruiter: Candidate Profile Detail Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Candidate Profile Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
                  {selectedAppDetail.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedAppDetail.name}
                  </h4>
                  <p className="text-slate-500">
                    {selectedAppDetail.candidateDetails?.title || "Candidate"}
                  </p>
                  <p className="text-slate-400">
                    {selectedAppDetail.email} • {selectedAppDetail.phone}
                  </p>
                </div>
              </div>

              {selectedAppDetail.candidateDetails?.bio && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Summary:
                  </span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 leading-relaxed border border-slate-100">
                    {selectedAppDetail.candidateDetails.bio}
                  </p>
                </div>
              )}

              {selectedAppDetail.candidateDetails?.skills && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAppDetail.candidateDetails.skills.map(
                      (s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold"
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedAppDetail.resume?.url && (
                <div className="pt-2">
                  <a
                    href={selectedAppDetail.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                  >
                    <FileText className="w-4 h-4" />
                    Open Candidate Resume / CV
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
