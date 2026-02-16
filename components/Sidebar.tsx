import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Code, Bot, PieChart, Settings, LogOut } from 'lucide-react';
import { APP_NAME } from '../constants';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Notebook', path: '/notebook' },
    { icon: Code, label: 'Coding Ground', path: '/code' },
    { icon: Bot, label: 'AI Tutor', path: '/tutor' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
  ];

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
        console.log("User signed out");
        alert("Signed out successfully.");
        // Logic to clear token/redirect would go here
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-white/5 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <span className="text-black font-bold text-lg">N</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">{APP_NAME}</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-white/5 text-primary border border-primary/20 shadow-[0_0_15px_rgba(245,245,0,0.1)]' 
                  : 'text-subtext hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : 'text-subtext group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <NavLink 
            to="/settings"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 w-full transition-colors rounded-xl mb-1 ${
                isActive ? 'text-white bg-white/5' : 'text-subtext hover:text-white hover:bg-white/5'
            }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-subtext hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
