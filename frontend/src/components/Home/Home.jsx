import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../main";
import JobCard from "../Job/JobCard";
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Users,
  Compass,
  FileCheck,
  CalendarCheck,
} from "lucide-react";

const Home = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("/api/v1/job/getall");
        if (data && data.jobs) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (keyword.trim()) queryParams.set("keyword", keyword.trim());
    if (location.trim()) queryParams.set("location", location.trim());
    navigate(`/job/getall?${queryParams.toString()}`);
  };

  const handleQuickSearch = (term) => {
    navigate(`/job/getall?keyword=${encodeURIComponent(term)}`);
  };

  // Derive real database statistics
  const activeJobs = jobs.filter((j) => !j.expired);
  const totalJobsCount = activeJobs.length;

  // Derive real companies from DB
  const companyCounts = activeJobs.reduce((acc, j) => {
    const name = j.company || "Leading Employer";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const companiesList = Object.entries(companyCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // Derive real categories from DB
  const categoryCounts = activeJobs.reduce((acc, j) => {
    const cat = j.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoriesList = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const popularSearches = [
    "React",
    "Node.js",
    "Remote",
    "DevOps",
    "Full-time",
    "Artificial Intelligence",
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Opportunities & Top Tech Talent
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find your next opportunity <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              with top industry leaders
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed font-normal">
            Discover roles that fit your skills and career aspirations. Direct applications, transparent salary data, and streamlined interview scheduling.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200 text-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            {/* Keyword / Title */}
            <div className="md:col-span-5 flex items-center gap-3 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skills, or keywords"
                className="w-full bg-transparent text-sm placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="hidden md:block w-px bg-slate-200 my-1"></div>

            {/* Location */}
            <div className="md:col-span-4 flex items-center gap-3 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, country, or 'Remote'"
                className="w-full bg-transparent text-sm placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full h-full min-h-[46px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
              >
                <Search className="w-4 h-4" />
                Find Jobs
              </button>
            </div>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Popular searches:</span>
            {popularSearches.map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickSearch(term)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Real Database Metrics Summary */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {totalJobsCount}
              </p>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Active Job Listings
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {companiesList.length}
              </p>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Verified Employers
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {categoriesList.length}
              </p>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Job Categories
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight flex items-center justify-center gap-1">
                <CheckCircle2 className="w-6 h-6" /> 100%
              </p>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Direct Recruiter Roles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Roles
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore highlighted vacancies with competitive compensation and verified teams.
            </p>
          </div>
          <Link
            to="/job/getall"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group shrink-0"
          >
            Browse all {totalJobsCount} jobs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
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
        ) : activeJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeJobs.slice(0, 6).map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">
              No open vacancies found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Check back soon or post a new vacancy if you are an employer.
            </p>
          </div>
        )}
      </section>

      {/* Explore by Job Categories */}
      {categoriesList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore by Job Category
            </h2>
            <p className="text-sm text-slate-500">
              Browse vacancies organized across specialized industry domains.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesList.map((cat, i) => (
              <Link
                key={i}
                to={`/job/getall?category=${encodeURIComponent(cat.name)}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm leading-snug">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {cat.count} {cat.count === 1 ? "position" : "positions"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Verified Companies Hiring */}
      {companiesList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Top Organizations Hiring Today
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Connect with companies actively recruiting top performers.
                </p>
              </div>
              <Link
                to="/job/getall"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Explore all companies →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {companiesList.map((comp, idx) => (
                <Link
                  key={idx}
                  to={`/job/getall?keyword=${encodeURIComponent(comp.name)}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                      <Building className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {comp.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {comp.count} active {comp.count === 1 ? "role" : "roles"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How CareerConnect Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Streamlined Hiring Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How CareerConnect Works
          </h2>
          <p className="text-sm text-slate-500">
            A transparent, efficient process designed for both ambitious applicants and hiring managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 relative">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-5">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Build Your Profile & Resume
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Highlight your work experience, tech skills, and portfolio. Upload your validated PDF resume once for rapid 1-click applications.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-5">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Discover & Apply Directly
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Filter by remote work, salary ranges, or experience level. Submit targeted applications directly to real hiring teams without spam.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-5">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Track & Schedule Interviews
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Follow real-time status updates through your candidate timeline. Receive scheduled interview links and notes with zero guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* Dual CTA: Candidates & Recruiters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Candidates */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                For Job Seekers
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to take your next career step?
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Create a verified profile, save your dream jobs, and submit applications in seconds.
              </p>
            </div>
            <div>
              <Link
                to={user?.role === "Job Seeker" ? "/job/getall" : "/register"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition"
              >
                {user?.role === "Job Seeker" ? "Browse Jobs Now" : "Sign Up as Candidate"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* For Recruiters */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-6 border border-slate-800">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider border border-slate-700">
                For Employers
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Hiring exceptional talent?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Post detailed job vacancies, manage candidates across hiring stages, and schedule interviews seamlessly.
              </p>
            </div>
            <div>
              <Link
                to={user?.role === "Employer" ? "/job/post" : "/register"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
              >
                {user?.role === "Employer" ? "Post a New Job" : "Start Hiring on CareerConnect"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
