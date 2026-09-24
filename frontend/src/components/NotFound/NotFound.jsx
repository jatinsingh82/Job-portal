import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold text-xl">
          404
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500">
            The opportunity or page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
          <Link
            to="/job/getall"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
