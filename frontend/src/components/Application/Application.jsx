import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Context } from "../../main";
import {
  Briefcase,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
} from "lucide-react";

const Application = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthorized, user } = useContext(Context);

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeOption, setResumeOption] = useState("profile"); // 'profile' | 'new'
  const [newResumeFile, setNewResumeFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    if (user && user.role === "Employer") {
      toast.error("Employers cannot apply to job postings");
      navigate("/job/getall");
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.preferredLocation || "San Francisco, CA");
    }

    // If user has no profile resume, default to new upload
    if (!user?.resume?.url) {
      setResumeOption("new");
    }

    const fetchJob = async () => {
      setLoadingJob(true);
      try {
        const { data } = await axios.get(`/api/v1/job/${id}`);
        setJob(data.job);

        // Check if user already applied
        try {
          const appsRes = await axios.get(
            "/api/v1/application/jobseeker/getall",
            { withCredentials: true }
          );
          if (appsRes.data && appsRes.data.applications) {
            const match = appsRes.data.applications.find(
              (a) => String(a.jobId) === String(id)
            );
            if (match) {
              setAlreadyApplied(true);
            }
          }
        } catch (e) {
          // ignore
        }
      } catch (err) {
        toast.error("Job details could not be loaded");
        navigate("/job/getall");
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [id, isAuthorized, user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];
      if (!allowed.includes(file.type)) {
        toast.error("Please upload a PDF, PNG, or JPG file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size cannot exceed 10MB");
        return;
      }
      setNewResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      toast.error("Please provide all required contact details");
      return;
    }

    if (resumeOption === "new" && !newResumeFile) {
      toast.error("Please select a resume file to upload");
      return;
    }

    if (resumeOption === "profile" && !user?.resume?.url) {
      toast.error("No profile resume found. Please upload a resume file.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("jobId", id);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("coverLetter", coverLetter);

    if (resumeOption === "new" && newResumeFile) {
      formData.append("resume", newResumeFile);
    }

    try {
      const { data } = await axios.post(
        "/api/v1/application/post",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(data.message || "Application submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to submit application. Please check your inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500">Preparing application form...</p>
      </div>
    );
  }

  // Confirmation view upon successful submission
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Application Submitted!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your application for{" "}
              <strong className="text-slate-900">{job?.title}</strong> at{" "}
              <strong className="text-slate-900">
                {job?.company || "the hiring team"}
              </strong>{" "}
              has been successfully received.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-1 text-left">
            <p className="font-semibold text-slate-700">What happens next?</p>
            <p>
              1. The recruiter reviews your candidate profile and credentials.
            </p>
            <p>
              2. Status updates and interview invitations will appear in your
              Application Tracker.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/applications/me"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition text-center"
            >
              Track My Applications
            </Link>
            <Link
              to="/job/getall"
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition text-center"
            >
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Already applied warning view
  if (alreadyApplied) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Already Applied
            </h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              You have already submitted an application for{" "}
              <strong className="text-slate-800">{job?.title}</strong>. You can
              monitor your review progress in your application dashboard.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/applications/me"
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition"
            >
              View Application Status
            </Link>
            <Link
              to="/job/getall"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Browse More Roles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to={`/job/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to job details
      </Link>

      {/* Target Job Overview Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex items-start justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400">
            Applying For Position
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {job?.title}
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            {job?.company || "Hiring Organization"} •{" "}
            {job?.city ? `${job.city}, ${job.country}` : job?.location}
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 text-xs font-semibold">
            {job?.workMode || "Hybrid"}
          </span>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Review Profile & Contact Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Review Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Location / Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Resume Selection */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Select or Upload Resume
            </h2>
          </div>

          <div className="space-y-3">
            {/* Option A: Use Profile Resume */}
            {user?.resume?.url && (
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  resumeOption === "profile"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="resumeOption"
                  value="profile"
                  checked={resumeOption === "profile"}
                  onChange={() => setResumeOption("profile")}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Use Profile Resume ({user.resume.name || "Resume.pdf"})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Attached directly from your verified candidate profile.
                    </p>
                  </div>
                  <a
                    href={user.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Preview
                  </a>
                </div>
              </label>
            )}

            {/* Option B: Upload new Resume */}
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                resumeOption === "new"
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="resumeOption"
                value="new"
                checked={resumeOption === "new"}
                onChange={() => setResumeOption("new")}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Upload a Tailored Resume for this Role
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload a specialized PDF, JPEG, or PNG (max 10MB)
                  </p>
                </div>

                {resumeOption === "new" && (
                  <div className="pt-2">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    {newResumeFile && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        Selected: {newResumeFile.name} (
                        {Math.round(newResumeFile.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Step 3: Optional Cover Letter */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Cover Letter / Pitch
              </h2>
              <span className="text-xs text-slate-400 font-normal">
                (Optional)
              </span>
            </div>
          </div>

          <textarea
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce yourself, share relevant accomplishments, and explain why you are excited about this specific opportunity..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
          />
        </div>

        {/* Step 4: Submission */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            By submitting, your verified candidate details and resume will be sent directly to the hiring manager.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting Application..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Application;
