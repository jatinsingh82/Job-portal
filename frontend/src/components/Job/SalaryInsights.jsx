import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

const SalaryInsights = () => {
  const [insights, setInsights] = useState([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await axios.get("/api/v1/job/salary-insights");
        if (data && data.insights) {
          setInsights(data.insights);
          setTotalAnalyzed(data.totalAnalyzed || 0);
        }
      } catch (err) {
        console.error("Failed to load salary insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <DollarSign className="w-4 h-4" />
            Market Compensation Data
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Industry Salary Benchmarks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculated directly from active postings in our database. Transparent compensation ranges without estimation bias.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Analyzed across {totalAnalyzed} openings</span>
        </div>
      </div>

      {/* Salary Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-6 shadow-sm transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.sampleSize} {item.sampleSize === 1 ? "role" : "roles"}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Average Annual Salary
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    ${item.avgSalary.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal"> / yr</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Min Compensation</span>
                    <span className="font-bold text-slate-800">${item.minSalary.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Max Compensation</span>
                    <span className="font-bold text-slate-800">${item.maxSalary.toLocaleString()}</span>
                  </div>
                </div>

                {item.sampleRoles && item.sampleRoles.length > 0 && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">Sample Roles: </span>
                    {item.sampleRoles.join(", ")}
                  </div>
                )}
              </div>

              <Link
                to={`/job/getall?category=${encodeURIComponent(item.category)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-100 group"
              >
                <span>View {item.category} Jobs</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Insufficient Salary Data Available
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As more employers publish transparent salary ranges, aggregated insights will automatically compile here.
          </p>
        </div>
      )}
    </div>
  );
};

export default SalaryInsights;
