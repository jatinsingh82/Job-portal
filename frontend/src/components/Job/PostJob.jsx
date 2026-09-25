import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "../../main";
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  PlusCircle,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const PostJob = () => {
  const { isAuthorized, user } = useContext(Context);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [experienceLevel, setExperienceLevel] = useState("Mid Level");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [deadline, setDeadline] = useState("");

  const [salaryType, setSalaryType] = useState("ranged"); // 'fixed' | 'ranged'
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    if (user && user.role !== "Employer") {
      toast.error("Only Employers can post jobs");
      navigate("/job/getall");
      return;
    }
    if (user?.company) {
      setCompany(user.company);
    }
  }, [isAuthorized, user, navigate]);

  // Real-time Job Quality Checklist
  const qualityChecklist = useMemo(() => {
    return [
      { label: "Job Title defined", done: Boolean(title.trim().length >= 3) },
      { label: "Hiring Company provided", done: Boolean(company.trim().length >= 2) },
      { label: "Detailed description (20+ chars)", done: Boolean(description.trim().length >= 20) },
      { label: "Key responsibilities specified", done: Boolean(responsibilities.trim().length >= 10) },
      { label: "Requirements & qualifications specified", done: Boolean(requirements.trim().length >= 10) },
      { label: "Target tech stack / skills listed", done: Boolean(skills.trim().length > 0) },
      { label: "Location & City details complete", done: Boolean(city.trim() && location.trim()) },
      {
        label: "Clear compensation structure provided",
        done: salaryType === "fixed" ? Boolean(fixedSalary) : Boolean(salaryFrom && salaryTo),
      },
      { label: "Application deadline configured", done: Boolean(deadline) },
    ];
  }, [
    title,
    company,
    description,
    responsibilities,
    requirements,
    skills,
    city,
    location,
    salaryType,
    fixedSalary,
    salaryFrom,
    salaryTo,
    deadline,
  ]);

  const passedChecksCount = qualityChecklist.filter((c) => c.done).length;
  const qualityScore = Math.round((passedChecksCount / qualityChecklist.length) * 100);

  const handlePostJob = async (e) => {
    e.preventDefault();

    if (!title || !description || !category || !country || !city || !location) {
      toast.error("Please fill in all required job fields.");
      return;
    }

    if (salaryType === "fixed" && !fixedSalary) {
      toast.error("Please specify fixed salary amount");
      return;
    }

    if (salaryType === "ranged" && (!salaryFrom || !salaryTo)) {
      toast.error("Please specify both minimum and maximum salary range");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        company: company || user?.company || "Hiring Company",
        category,
        employmentType,
        workMode,
        experienceLevel,
        country,
        city,
        location,
        skills,
        description,
        responsibilities,
        requirements,
        benefits,
        deadline: deadline || undefined,
      };

      if (salaryType === "fixed") {
        payload.fixedSalary = Number(fixedSalary);
      } else {
        payload.salaryFrom = Number(salaryFrom);
        payload.salaryTo = Number(salaryTo);
      }

      const { data } = await axios.post("/api/v1/job/post", payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success(data.message || "Job posted successfully!");
      navigate("/job/me");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to post job. Please review fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Web Development",
    "Mobile App Development",
    "Graphics & Design",
    "DevOps",
    "Artificial Intelligence",
    "Data Science & Analytics",
    "Product Management",
    "Cybersecurity",
    "Sales & Marketing",
    "Finance & Accounting",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/job/me"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Recruiter Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form area */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="w-4 h-4" />
              Recruiter Job Creator
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Publish a New Job Listing
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Provide transparent, accurate requirements to match with vetted software engineers, designers, and tech professionals.
            </p>
          </div>

          <form onSubmit={handlePostJob} className="space-y-6 text-xs">
            {/* Section 1: Basic Information */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Role & Company Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hiring Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Technologies"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Director">Lead / Director</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Location & Compensation */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Location & Compensation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Address / Office Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Downtown Tech Center / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Compensation Structure */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-2">
                  Salary Structure *
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="salaryType"
                      checked={salaryType === "ranged"}
                      onChange={() => setSalaryType("ranged")}
                      className="text-blue-600"
                    />
                    <span>Salary Range (Min - Max)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="salaryType"
                      checked={salaryType === "fixed"}
                      onChange={() => setSalaryType("fixed")}
                      className="text-blue-600"
                    />
                    <span>Fixed Annual Salary</span>
                  </label>
                </div>

                {salaryType === "ranged" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      required
                      placeholder="Min Salary ($ USD/yr) e.g. 110000"
                      value={salaryFrom}
                      onChange={(e) => setSalaryFrom(e.target.value)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Max Salary ($ USD/yr) e.g. 150000"
                      value={salaryTo}
                      onChange={(e) => setSalaryTo(e.target.value)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    required
                    placeholder="Fixed Salary ($ USD/yr) e.g. 125000"
                    value={fixedSalary}
                    onChange={(e) => setFixedSalary(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Application Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full sm:w-1/2 p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Section 3: Detailed Job Content */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Position Details & Requirements
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Skills & Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js, Docker, AWS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Overview & Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your company culture, the core mission of this role, and the impact the candidate will have..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Responsibilities (bullet points)
                </label>
                <textarea
                  rows={3}
                  placeholder="• Architect and ship scalable frontend components&#10;• Collaborate with cross-functional product managers"
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Qualifications & Requirements (bullet points)
                </label>
                <textarea
                  rows={3}
                  placeholder="• 4+ years practical software development experience&#10;• Deep familiarity with modern React, TypeScript, and state management"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Benefits & Perks (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Full health, dental & vision insurance&#10;401(k) matching up to 5%&#10;Flexible remote work stipend"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/job/me"
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? "Publishing Opening..." : "Publish Job Opening"}
              </button>
            </div>
          </form>
        </div>

        {/* Quality Checklist Sidebar */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Job Quality Checklist
            </span>
            <span
              className={`text-xs font-black ${
                qualityScore >= 80
                  ? "text-emerald-600"
                  : qualityScore >= 50
                  ? "text-blue-600"
                  : "text-amber-500"
              }`}
            >
              {qualityScore}% Ready
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                qualityScore >= 80 ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${qualityScore}%` }}
            />
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            {qualityChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span
                  className={item.done ? "text-slate-800 font-medium" : "text-slate-400"}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
            High quality postings receive up to 3x more qualified candidate applications.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostJob;
