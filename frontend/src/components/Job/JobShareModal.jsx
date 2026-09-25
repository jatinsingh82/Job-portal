import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Share2,
} from "lucide-react";

const JobShareModal = ({ job, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!job) return null;

  const jobUrl = `${window.location.origin}/job/${job._id}`;
  const shareText = `Check out this opening for ${job.title} at ${job.company || "a great organization"} on CareerConnect:`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      toast.success("Job link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      jobUrl
    )}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${jobUrl}`
    )}`;
    window.open(url, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Job Opening: ${job.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI thought you might be interested in this job opportunity on CareerConnect:\n\n${job.title} at ${
        job.company || "Leading Employer"
      }\n${jobUrl}\n\nBest regards!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Share Opportunity</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Position
          </p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{job.title}</p>
          <p className="text-xs text-slate-500">
            {job.company} • {job.city ? `${job.city}, ${job.country}` : job.location}
          </p>
        </div>

        {/* Quick Social Sharing Channels */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={shareLinkedIn}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/60 text-blue-700 transition"
          >
            <svg
              className="w-5 h-5 mb-1 fill-[#0A66C2]"
              viewBox="0 0 24 24"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            <span className="text-[11px] font-semibold">LinkedIn</span>
          </button>

          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60 text-emerald-700 transition"
          >
            <MessageCircle className="w-5 h-5 mb-1 text-emerald-600" />
            <span className="text-[11px] font-semibold">WhatsApp</span>
          </button>

          <button
            onClick={shareEmail}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
          >
            <Mail className="w-5 h-5 mb-1 text-slate-600" />
            <span className="text-[11px] font-semibold">Email</span>
          </button>
        </div>

        {/* Copy Direct Link */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-600">
            Direct Job Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={jobUrl}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobShareModal;
