import { LayoutDashboard, MessageSquare, BarChart3, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Mock Interviews', path: '/interview' },
    { icon: BarChart3, label: 'Skill Analysis', path: '/analysis' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-100 flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 px-4 mb-10">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">V</div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          VTU-Prep AI
        </span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-brand-light text-brand-primary font-semibold' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors mt-auto">
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;