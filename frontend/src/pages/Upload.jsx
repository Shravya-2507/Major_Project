import { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      setIsDone(true);
    }, 2000);
  };

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center"
      >
        {!isDone ? (
          <>
            <div className="w-20 h-20 bg-brand-light text-brand-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
              <UploadIcon size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">Upload your Resume</h1>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto">
              We'll analyze your skills and map them directly to the **VTU Placement Syllabus**.
            </p>

            <div 
              className="border-2 border-dashed border-slate-200 rounded-3xl p-10 hover:border-brand-primary hover:bg-brand-light/30 transition-all cursor-pointer group"
              onClick={handleUpload}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-brand-primary mb-4" size={32} />
                  <span className="font-semibold text-slate-700">Analyzing your skills...</span>
                </div>
              ) : (
                <>
                  <FileText className="mx-auto text-slate-300 group-hover:text-brand-primary mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Click to browse or drag & drop</p>
                  <p className="text-slate-400 text-sm mt-1">PDF or Word (Max 5MB)</p>
                </>
              )}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">Analysis Complete!</h1>
            <p className="text-slate-500 mb-8">We've identified 12 core competencies matching your syllabus.</p>
            <button className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto">
              Go to Dashboard <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;