import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Building,
  MapPin,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await axios.get("/api/v1/job/companies");
        if (data && data.companies) {
          setCompanies(data.companies);
        }
      } catch (err) {
        console.error("Failed to load companies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Employer Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Verified Organizations Hiring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse companies actively recruiting on CareerConnect and explore their openings.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Company Profiles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((comp, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-sm transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{comp.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {comp.locations.length > 0
                      ? comp.locations.join(", ")
                      : "Multiple Locations"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {comp.categories.map((cat, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {comp.sampleRoles && comp.sampleRoles.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-700 block">Open Roles:</span>
                    {comp.sampleRoles.map((r, rIdx) => (
                      <Link
                        key={rIdx}
                        to={`/job/${r.id}`}
                        className="block text-blue-600 hover:underline truncate"
                      >
                        • {r.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to={`/job/getall?keyword=${encodeURIComponent(comp.name)}`}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
              >
                <span>Browse All {comp.openPositions} Openings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-2">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No organizations found</h3>
          <p className="text-xs text-slate-500">Try changing your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default Companies;
