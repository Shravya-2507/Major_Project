import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResumeFeedback = ({ data }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 font-black text-xl">
            8.4
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">AI Resume Score</h3>
            <p className="text-sm text-slate-500">Stronger than 82% of fresher applicants.</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4].map(s => <Star key={s} size={18} className="fill-amber-400 text-amber-400" />)}
          <Star size={18} className="text-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Improvements */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-rose-500" size={18} /> Points to Improve
          </h4>
          <ul className="space-y-3">
            <li className="text-sm text-slate-600 flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              Quantify your VTU project achievements (e.g., "Improved speed by 20%").
            </li>
            <li className="text-sm text-slate-600 flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              Missing "System Design" keywords usually expected by top recruiters.
            </li>
          </ul>
        </div>

        {/* Good Points */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={18} /> What's Working
          </h4>
          <ul className="space-y-3">
            <li className="text-sm text-slate-600 flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              Technical stack is clearly defined and modern.
            </li>
            <li className="text-sm text-slate-600 flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              Clean, single-page layout is easy for ATS to parse.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeFeedback;