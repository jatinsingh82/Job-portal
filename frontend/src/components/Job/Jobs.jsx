import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import JobCard from "./JobCard";
import {
  Search,
  MapPin,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  Briefcase,
  ChevronDown,
} from "lucide-react";

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [workMode, setWorkMode] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [experienceLevel, setExperienceLevel] = useState("All");
  const [minSalary, setMinSalary] = useState(0);
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync keyword or category from URL query parameters if they change
  useEffect(() => {
    const kwParam = searchParams.get("keyword");
    const locParam = searchParams.get("location");
    const catParam = searchParams.get("category");
    if (kwParam !== null) setKeyword(kwParam);
    if (locParam !== null) setLocation(locParam);
    if (catParam !== null) setCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/v1/job/getall");
        if (data && data.jobs) {
          setAllJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Compute available categories and skills from the actual dataset
  const availableCategories = useMemo(() => {
    const cats = new Set();
    allJobs.forEach((j) => {
      if (j.category) cats.add(j.category);
    });
    return ["All", ...Array.from(cats)];
  }, [allJobs]);

  const availableSkills = useMemo(() => {
    const skillsSet = new Set();
    allJobs.forEach((j) => {
      if (Array.isArray(j.skills)) {
        j.skills.forEach((s) => skillsSet.add(s));
      }
    });
    return Array.from(skillsSet).slice(0, 12);
  }, [allJobs]);

  // Client-side filtering & sorting
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // Keyword filter (title, company, description, skills)
    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      result = result.filter((j) => {
        const titleMatch = j.title?.toLowerCase().includes(kw);
        const compMatch = j.company?.toLowerCase().includes(kw);
        const descMatch = j.description?.toLowerCase().includes(kw);
        const skillMatch =
          Array.isArray(j.skills) &&
          j.skills.some((s) => s.toLowerCase().includes(kw));
        return titleMatch || compMatch || descMatch || skillMatch;
      });
    }

    // Location filter
    if (location.trim()) {
      const loc = location.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.city?.toLowerCase().includes(loc) ||
          j.country?.toLowerCase().includes(loc) ||
          j.location?.toLowerCase().includes(loc)
      );
    }

    // Category filter
    if (category !== "All") {
      result = result.filter(
        (j) => j.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Work Mode filter
    if (workMode !== "All") {
      result = result.filter(
        (j) => j.workMode?.toLowerCase() === workMode.toLowerCase()
      );
    }

    // Employment Type filter
    if (employmentType !== "All") {
      result = result.filter(
        (j) => j.employmentType?.toLowerCase() === employmentType.toLowerCase()
      );
    }

    // Experience Level filter
    if (experienceLevel !== "All") {
      result = result.filter(
        (j) =>
          j.experienceLevel?.toLowerCase() === experienceLevel.toLowerCase()
      );
    }

    // Minimum Salary filter
    if (minSalary > 0) {
      result = result.filter((j) => {
        const sal = j.fixedSalary || j.salaryTo || j.salaryFrom || 0;
        return sal >= minSalary;
      });
    }

    // Skill chip filter
    if (selectedSkill) {
      result = result.filter(
        (j) =>
          Array.isArray(j.skills) &&
          j.skills.some(
            (s) => s.toLowerCase() === selectedSkill.toLowerCase()
          )
      );
    }

    // Sorting
    if (sortOrder === "salary_high") {
      result.sort((a, b) => {
        const salA = a.fixedSalary || a.salaryTo || a.salaryFrom || 0;
        const salB = b.fixedSalary || b.salaryTo || b.salaryFrom || 0;
        return salB - salA;
      });
    } else if (sortOrder === "salary_low") {
      result.sort((a, b) => {
        const salA = a.fixedSalary || a.salaryFrom || 0;
        const salB = b.fixedSalary || b.salaryFrom || 0;
        return salA - salB;
      });
    } else {
      // newest
      result.sort(
        (a, b) => new Date(b.jobPostedOn || 0) - new Date(a.jobPostedOn || 0)
      );
    }

    return result;
  }, [
    allJobs,
    keyword,
    location,
    category,
    workMode,
    employmentType,
    experienceLevel,
    minSalary,
    selectedSkill,
    sortOrder,
  ]);

  const handleClearFilters = () => {
    setKeyword("");
    setLocation("");
    setCategory("All");
    setWorkMode("All");
    setEmploymentType("All");
    setExperienceLevel("All");
    setMinSalary(0);
    setSelectedSkill("");
    setSortOrder("newest");
    setSearchParams({});
  };

  const hasActiveFilters =
    keyword ||
    location ||
    category !== "All" ||
    workMode !== "All" ||
    employmentType !== "All" ||
    experienceLevel !== "All" ||
    minSalary > 0 ||
    selectedSkill;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore All Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search verified jobs by title, company, skills, or target work location.
          </p>
        </div>

        {/* Dual Search Input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by job title, skill, company, or keyword"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or 'Remote'"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Skill Tags */}
        {availableSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-slate-400 mr-1">
              Popular skills:
            </span>
            {availableSkills.map((skill, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setSelectedSkill(selectedSkill === skill ? "" : skill)
                }
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  selectedSkill === skill
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Layout: Sidebar Filters + Job List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside
          className={`lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6 ${
            mobileFilterOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Filter Results
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Job Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {availableCategories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Work Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Work Mode
            </label>
            <div className="space-y-1.5">
              {["All", "Remote", "Hybrid", "On-site"].map((mode) => (
                <label
                  key={mode}
                  className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900"
                >
                  <input
                    type="radio"
                    name="workMode"
                    value={mode}
                    checked={workMode === mode}
                    onChange={() => setWorkMode(mode)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{mode === "All" ? "All Modes" : mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Employment Type
            </label>
            <div className="space-y-1.5">
              {["All", "Full-time", "Part-time", "Internship", "Contract"].map(
                (type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="radio"
                      name="employmentType"
                      value={type}
                      checked={employmentType === type}
                      onChange={() => setEmploymentType(type)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{type === "All" ? "All Types" : type}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Experience Level
            </label>
            <div className="space-y-1.5">
              {[
                "All",
                "Entry Level",
                "Mid Level",
                "Senior Level",
                "Lead / Director",
              ].map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900"
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level}
                    checked={experienceLevel === level}
                    onChange={() => setExperienceLevel(level)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{level === "All" ? "All Levels" : level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Salary Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Min Salary</span>
              <span className="text-blue-600 lowercase font-bold">
                {minSalary > 0
                  ? `$${minSalary.toLocaleString()}/yr`
                  : "Any"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$0</span>
              <span>$100k</span>
              <span>$200k+</span>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Results Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
            <div className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredJobs.length}
              </span>{" "}
              {filteredJobs.length === 1 ? "position" : "positions"}
              {hasActiveFilters && (
                <span className="text-blue-600 font-medium"> (filtered)</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Sort by:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="newest">Newest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-64 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  No matching jobs found
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Try broadening your keyword or location terms, or reset your filters to view all active vacancies.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
