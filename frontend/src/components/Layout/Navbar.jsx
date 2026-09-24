import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Briefcase,
  Bookmark,
  FileText,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Layers,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await axios.get("/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message || "Logged Out Successfully");
      setIsAuthorized(false);
      setUser({});
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition">
                Career<span className="text-blue-600">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
                Recruitment Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                isActive("/")
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Home
            </Link>

            <Link
              to="/job/getall"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                isActive("/job/getall")
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Find Jobs
            </Link>

            {isAuthorized && user?.role === "Job Seeker" && (
              <>
                <Link
                  to="/applications/me"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/applications/me")
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Applications
                </Link>

                <Link
                  to="/saved-jobs"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/saved-jobs")
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Saved Jobs
                </Link>
              </>
            )}

            {isAuthorized && user?.role === "Employer" && (
              <>
                <Link
                  to="/job/me"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/job/me")
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Dashboard & Jobs
                </Link>

                <Link
                  to="/applications/me"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/applications/me")
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Applicant Pipeline
                </Link>

                <Link
                  to="/job/post"
                  className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Job
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthorized ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-sm border border-slate-300">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">
                      {user?.role || "Member"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="mt-1.5 inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Manage Profile
                    </Link>

                    {user?.role === "Job Seeker" && (
                      <Link
                        to="/saved-jobs"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        Saved Jobs
                      </Link>
                    )}

                    {user?.role === "Employer" && (
                      <Link
                        to="/job/post"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <PlusCircle className="w-4 h-4 text-slate-400" />
                        Create New Listing
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/job/getall"
            className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Jobs
          </Link>

          {isAuthorized ? (
            <>
              {user?.role === "Job Seeker" ? (
                <>
                  <Link
                    to="/applications/me"
                    className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/saved-jobs"
                    className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Saved Jobs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/job/me"
                    className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard & Jobs
                  </Link>
                  <Link
                    to="/applications/me"
                    className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Applicant Pipeline
                  </Link>
                  <Link
                    to="/job/post"
                    className="block px-3 py-2 text-base font-medium rounded-lg text-blue-600 font-semibold hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + Post New Job
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base font-medium rounded-lg text-rose-600 hover:bg-rose-50"
              >
                Sign Out ({user?.name})
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
