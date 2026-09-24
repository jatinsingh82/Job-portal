import React from "react";
import { X, ExternalLink } from "lucide-react";

const ResumeModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Resume Document</h3>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Resume preview"
            className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;
