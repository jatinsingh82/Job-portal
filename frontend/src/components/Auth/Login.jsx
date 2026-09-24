import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import {
  Briefcase,
  Mail,
  Lock,
  UserCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Job Seeker");
  const [loading, setLoading] = useState(false);

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      toast.error("Please provide email, password, and select your role");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/v1/user/login",
        { email, password, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message || "Logged In Successfully!");
      // fetch profile details
      try {
        const uRes = await axios.get("/api/v1/user/getuser", {
          withCredentials: true,
        });
        setUser(uRes.data.user);
      } catch (err) {
        // continue
      }
      setIsAuthorized(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid credentials. Please verify your email, password, and role."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (selectedRole) => {
    if (selectedRole === "Job Seeker") {
      setEmail("seeker@jobportal.com");
      setPassword("password123");
      setRole("Job Seeker");
    } else {
      setEmail("employer@jobportal.com");
      setPassword("password123");
      setRole("Employer");
    }
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-1">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500">
            Sign in to manage your job searches and applications
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-blue-800 font-medium mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick Demo Fill:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("Job Seeker")}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 transition shadow-xs text-center"
            >
              Candidate (Alex)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("Employer")}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 transition shadow-xs text-center"
            >
              Recruiter (Sarah)
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole("Job Seeker")}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  role === "Job Seeker"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole("Employer")}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  role === "Employer"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Employer / Recruiter
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in to CareerConnect"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-sm text-slate-600 pt-2 border-t border-slate-100">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
