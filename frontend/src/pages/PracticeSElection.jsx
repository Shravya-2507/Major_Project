import { motion } from 'framer-motion';
import { Terminal, Database, Cpu, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PracticeSelection = () => {
  const navigate = useNavigate();
  
  const tracks = [
    { name: 'Data Structures', icon: Terminal, questions: 20, difficulty: 'Medium' },
    { name: 'Database Management', icon: Database, questions: 15, difficulty: 'Hard' },
    { name: 'Operating Systems', icon: Cpu, questions: 10, difficulty: 'Easy' },
    { name: 'Computer Networks', icon: Globe, questions: 12, difficulty: 'Medium' },
  ];

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      <header className="max-w-4xl mb-12">
        <h1 className="text-3xl font-bold text-slate-800">Choose Your Practice Track</h1>
        <p className="text-slate-500 mt-2">All questions are curated based on recent placement trends and the VTU curriculum.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {tracks.map((track, i) => (
          <motion.div
            key={track.name}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer"
            onClick={() => navigate('/interview')}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                <track.icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{track.name}</h3>
                <div className="flex gap-4 mt-1 text-sm text-slate-400">
                  <span>{track.questions} Questions</span>
                  <span>•</span>
                  <span>{track.difficulty}</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-light group-hover:text-brand-primary transition-all">
              <ArrowRight size={20} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PracticeSelection;