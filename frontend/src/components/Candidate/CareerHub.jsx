import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import toast from "react-hot-toast";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  FileText,
  Briefcase,
  Compass,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  Layers,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";

const CareerHub = () => {
  const { user, isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("match"); // 'match' | 'analyzer' | 'interview' | 'roadmap'
  const [allJobs, setAllJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Mock Interview practice states
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practicedQuestions, setPracticedQuestions] = useState([]);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("/api/v1/job/getall");
        if (data && data.jobs) {
          setAllJobs(data.jobs);
          if (data.jobs.length > 0) {
            setSelectedJobId(data.jobs[0]._id);
          }
        }
      } catch (e) {
        console.error("Failed to load jobs", e);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [isAuthorized, navigate]);

  const candidateSkills = useMemo(() => {
    return Array.isArray(user?.skills) ? user.skills : [];
  }, [user]);

  const selectedJob = useMemo(() => {
    return allJobs.find((j) => String(j._id) === String(selectedJobId));
  }, [allJobs, selectedJobId]);

  // Real transparent Skill Gap Analysis
  const matchAnalysis = useMemo(() => {
    if (!selectedJob) return null;
    const jobSkills = Array.isArray(selectedJob.skills) ? selectedJob.skills : [];
    const normalizedUserSkills = candidateSkills.map((s) => s.toLowerCase().trim());

    const matching = [];
    const missing = [];

    jobSkills.forEach((reqSkill) => {
      const isMatch = normalizedUserSkills.some(
        (us) => us === reqSkill.toLowerCase().trim() || us.includes(reqSkill.toLowerCase().trim())
      );
      if (isMatch) {
        matching.push(reqSkill);
      } else {
        missing.push(reqSkill);
      }
    });

    const matchPercent =
      jobSkills.length > 0
        ? Math.round((matching.length / jobSkills.length) * 100)
        : 100;

    return {
      matching,
      missing,
      totalRequired: jobSkills.length,
      matchPercent,
    };
  }, [selectedJob, candidateSkills]);

  // Real Resume Completeness & Detection
  const resumeAnalysis = useMemo(() => {
    const checks = [
      {
        title: "Headline / Professional Title",
        done: Boolean(user?.title?.trim()),
        detail: user?.title || "Add a clear professional title (e.g. Senior Frontend Engineer)",
      },
      {
        title: "Professional Summary / Bio",
        done: Boolean(user?.bio && user.bio.trim().length > 30),
        detail: user?.bio ? "Well-written summary present" : "Write a 2-3 sentence overview of your domain experience",
      },
      {
        title: "Core Technical Skills",
        done: candidateSkills.length >= 3,
        detail: `${candidateSkills.length} skills listed (${candidateSkills.slice(0, 5).join(", ")})`,
      },
      {
        title: "Verified Work Experience",
        done: Array.isArray(user?.experience) && user.experience.length > 0,
        detail: `${user?.experience?.length || 0} positions documented in career history`,
      },
      {
        title: "Educational Credentials",
        done: Array.isArray(user?.education) && user.education.length > 0,
        detail: `${user?.education?.length || 0} degrees/institutions listed`,
      },
      {
        title: "Projects & Portfolio",
        done: Array.isArray(user?.projects) && user.projects.length > 0,
        detail: `${user?.projects?.length || 0} featured projects with links`,
      },
      {
        title: "Uploaded Resume (PDF/Doc)",
        done: Boolean(user?.resume?.url),
        detail: user?.resume?.name ? `Active resume file: ${user.resume.name}` : "Upload a PDF resume for 1-click recruiter applications",
      },
    ];

    const completed = checks.filter((c) => c.done).length;
    const completenessScore = Math.round((completed / checks.length) * 100);

    return {
      checks,
      completenessScore,
    };
  }, [user, candidateSkills]);

  // Questions tailored to the selected role
  const interviewQuestions = useMemo(() => {
    if (!selectedJob) return [];
    const title = selectedJob.title || "Software Engineer";
    const skillsList = selectedJob.skills?.slice(0, 3).join(", ") || "core technologies";

    return [
      {
        category: "Role-Specific",
        question: `How have your previous projects prepared you for the ${title} role at ${selectedJob.company || "our organization"}?`,
        tip: "Focus on real production accomplishments and technical challenges you overcame.",
      },
      {
        category: "Technical Stack",
        question: `Can you walk through your hands-on experience utilizing ${skillsList} in production environments?`,
        tip: "Discuss architecture choices, edge cases, error handling, and performance considerations.",
      },
      {
        category: "System & Architecture",
        question: `How do you ensure reliability, testing coverage, and clean documentation when shipping features under tight deadlines?`,
        tip: "Highlight automated testing, peer code reviews, CI/CD workflows, and cross-functional communication.",
      },
      {
        category: "Behavioral & Collaboration",
        question: `Tell me about a time you had a technical disagreement with a teammate or stakeholder. How did you resolve it?`,
        tip: "Emphasize listening, objective trade-off evaluation, and focusing on user/business impact.",
      },
    ];
  }, [selectedJob]);

  const handleSimulateAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("Please draft your answer before submitting for feedback");
      return;
    }

    const currentQ = interviewQuestions[activeQuestionIdx];
    const words = userAnswer.trim().split(/\s+/).length;

    let strength = "Moderate depth";
    let advice = "Good practice answer. Consider tying your response to quantifiable business outcomes or specific metrics.";

    if (words > 60) {
      strength = "Comprehensive & detailed";
      advice = "Strong structure! You provided clear context. Keep your pacing natural and confident in live interviews.";
    } else if (words < 25) {
      strength = "A bit brief";
      advice = "Add more specific examples: describe the situation, your concrete action, and the end result (STAR method).";
    }

    setPracticeFeedback({
      question: currentQ.question,
      strength,
      wordCount: words,
      advice,
    });

    if (!practicedQuestions.includes(activeQuestionIdx)) {
      setPracticedQuestions([...practicedQuestions, activeQuestionIdx]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="w-4 h-4" />
            Candidate Career Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Career Preparation & Skill Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze your profile against live database roles, practice targeted interview questions, and identify skill roadmaps.
          </p>
        </div>

        <Link
          to="/profile"
          className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition shrink-0"
        >
          Edit Candidate Profile →
        </Link>
      </div>

      {/* Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("match")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "match"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Target className="w-4 h-4" />
          Resume → Job Match
        </button>

        <button
          onClick={() => setActiveTab("analyzer")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "analyzer"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Profile & Resume Analyzer
        </button>

        <button
          onClick={() => setActiveTab("interview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "interview"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Interview Prep & Mock Mode
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "roadmap"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Compass className="w-4 h-4" />
          Skill Roadmap & Progression
        </button>
      </div>

      {/* Tab 1: Resume -> Job Match */}
      {activeTab === "match" && (
        <div className="space-y-6">
          {/* Target Job Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Active Opening to Compare:
              </label>
              <span className="text-xs text-slate-400">
                {allJobs.length} active opportunities available
              </span>
            </div>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {allJobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} — {job.company} ({job.city || job.location})
                </option>
              ))}
            </select>
          </div>

          {selectedJob && matchAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Match Score Card */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Role Match Readiness
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-blue-600">
                      {matchAnalysis.matchPercent}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({matchAnalysis.matching.length} of {matchAnalysis.totalRequired} required skills)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Based on verified skills listed in your profile against the technical requirements of{" "}
                    <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Role:</span>
                    <span className="font-semibold text-slate-800">{selectedJob.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Work Mode:</span>
                    <span className="font-semibold text-slate-800">{selectedJob.workMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-800">{selectedJob.experienceLevel}</span>
                  </div>
                </div>

                <Link
                  to={`/application/${selectedJob._id}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md text-center transition"
                >
                  Apply For This Position
                </Link>
              </div>

              {/* Skills Breakdown */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900 text-base">
                  Skill Gap & Alignment Analysis
                </h3>

                {/* You Have */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      You Have ({matchAnalysis.matching.length})
                    </h4>
                  </div>
                  {matchAnalysis.matching.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.matching.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      None of the required skills for this job are currently on your profile.
                    </p>
                  )}
                </div>

                {/* Skills to Improve */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Skills to Learn or Highlight ({matchAnalysis.missing.length})
                    </h4>
                  </div>
                  {matchAnalysis.missing.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.missing.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-semibold">
                      Awesome! You match all the technical skills required for this posting.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Resume Analyzer */}
      {activeTab === "analyzer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Completeness
            </span>
            <div className="text-4xl font-extrabold text-blue-600">
              {resumeAnalysis.completenessScore}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${resumeAnalysis.completenessScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              Recruiters prioritize candidates with fully completed profiles and attached resumes.
            </p>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Resume & Profile Audit
            </h3>
            <div className="space-y-3">
              {resumeAnalysis.checks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3"
                >
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interview Prep & Mock Mode */}
      {activeTab === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question List */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Practice Questions ({interviewQuestions.length})
              </h3>
              <span className="text-xs text-emerald-600 font-bold">
                {practicedQuestions.length}/{interviewQuestions.length} Practiced
              </span>
            </div>

            <div className="space-y-2">
              {interviewQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveQuestionIdx(idx);
                    setPracticeFeedback(null);
                    setUserAnswer("");
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition space-y-1 ${
                    activeQuestionIdx === idx
                      ? "border-blue-500 bg-blue-50/60 font-semibold text-slate-900"
                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {q.category}
                    </span>
                    {practicedQuestions.includes(idx) && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <p className="line-clamp-2 leading-relaxed">{q.question}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Answer & Practice Mode */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            {interviewQuestions[activeQuestionIdx] && (
              <>
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-blue-600">
                    Question {activeQuestionIdx + 1} •{" "}
                    {interviewQuestions[activeQuestionIdx].category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {interviewQuestions[activeQuestionIdx].question}
                  </h3>
                  <p className="text-xs text-slate-400 italic pt-1">
                    Tip: {interviewQuestions[activeQuestionIdx].tip}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Rehearsed Answer:
                  </label>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer using Situation, Task, Action, and Result (STAR)..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-medium"
                  />
                </div>

                <button
                  onClick={handleSimulateAnswer}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Submit for Practice Feedback
                </button>

                {practiceFeedback && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-indigo-900">
                      <span>Practice Simulation Feedback</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                        {practiceFeedback.strength} ({practiceFeedback.wordCount} words)
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {practiceFeedback.advice}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Skill Roadmap & Career Path */}
      {activeTab === "roadmap" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Engineering Progression Ladder
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              General industry benchmark skills and expectations for tech roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Level 1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Junior Developer</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Core syntax, component lifecycles, Git workflows, debugging, and receiving mentorship.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Level 2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Software Engineer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Autonomous feature delivery, REST/GraphQL APIs, unit tests, code reviews, and performance tuning.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Level 3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Senior Engineer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                System architecture, distributed state, CI/CD pipelines, mentoring juniors, and design reviews.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Level 4
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Staff / Tech Lead</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cross-team strategy, scaling infrastructure, roadmap planning, and engineering standards.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerHub;
