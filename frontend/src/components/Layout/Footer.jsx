import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Heart, ShieldCheck, Mail, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Career<span className="text-blue-500">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bridging extraordinary candidates with ambitious organizations. The modern, verified recruitment platform for tech, design, and product talent.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Employers & Applications</span>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Candidates
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/job/getall" className="hover:text-white transition">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/saved-jobs" className="hover:text-white transition">
                  Saved Opportunities
                </Link>
              </li>
              <li>
                <Link to="/applications/me" className="hover:text-white transition">
                  Application Tracking
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Candidate Profile & Resume
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/job/post" className="hover:text-white transition">
                  Post a Job Opening
                </Link>
              </li>
              <li>
                <Link to="/job/me" className="hover:text-white transition">
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link to="/applications/me" className="hover:text-white transition">
                  Applicant Pipeline
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Recruiter Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>San Francisco, CA & Global Remote</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>talent@careerconnect.dev</span>
              </li>
            </ul>
            <div className="mt-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
              Fast, privacy-first career discovery. Upload safe resumes and schedule interviews seamlessly.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CareerConnect Portal. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision for modern hiring</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
