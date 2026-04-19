import { motion } from 'framer-motion';
import { Award, CheckCircle, XCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestResult() {
  return (
    <div className="ml-64 p-10 bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-3xl w-full bg-white rounded-[3rem] shadow-xl shadow-slate-200/60 p-12 border border-slate-100 text-center"
      >
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Award size={48} />
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2">Test Completed!</h1>
        <p className="text-slate-500 mb-10">AI Analysis of your Coding Round is ready.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Rating</p>
            <h2 className="text-4xl font-black text-indigo-600">8.2<span className="text-lg text-slate-400">/10</span></h2>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Taken</p>
            <h2 className="text-4xl font-black text-slate-800">14:02</h2>
          </div>
        </div>

        <div className="space-y-4 mb-10 text-left">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <CheckCircle className="text-emerald-500 mt-1" size={20} />
            <div>
              <p className="font-bold text-emerald-900 text-sm">Efficient Logic</p>
              <p className="text-emerald-700 text-xs">Your Kadane's implementation is O(n), which is optimal.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <XCircle className="text-rose-500 mt-1" size={20} />
            <div>
              <p className="font-bold text-rose-900 text-sm">Variable Naming</p>
              <p className="text-rose-700 text-xs">Consider using more descriptive names than 'arr' and 'res'.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
            <Home size={18} /> Back to Dashboard
          </Link>
          <Link to="/practice/coding" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200">
            <RefreshCw size={18} /> Try Another
          </Link>
        </div>
      </motion.div>
    </div>
  );
}