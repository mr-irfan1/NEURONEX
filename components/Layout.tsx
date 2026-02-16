import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MOCK_USER } from '../constants';
import { Bell, Search } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Load user from local storage to allow dynamic updates
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('neuronex_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  // Listen for user updates (e.g. from Settings page)
  useEffect(() => {
    const handleUserUpdate = () => {
        const saved = localStorage.getItem('neuronex_user');
        if (saved) {
            setUser(JSON.parse(saved));
        }
    };
    
    // Listen for custom event
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
        window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const term = (e.target as HTMLInputElement).value;
        if(term.trim()) {
            alert(`Searching for: "${term}"\n(Search implementation pending backend)`);
        }
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="min-h-screen bg-background text-white pl-64">
      <Sidebar />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-white/5 h-16 flex items-center justify-between px-8">
        <div className="flex items-center bg-surface border border-white/10 rounded-full px-4 py-1.5 w-96 focus-within:border-primary/50 focus-within:shadow-[0_0_10px_rgba(245,245,0,0.1)] transition-all">
          <Search size={16} className="text-subtext mr-3" />
          <input 
            type="text" 
            placeholder="Search notes, code, or ask AI... (Press Enter)" 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-subtext"
            onKeyDown={handleSearch}
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
                onClick={toggleNotifications}
                className="relative p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
            >
                <Bell size={20} className="text-subtext hover:text-white cursor-pointer transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-white/10 rounded-xl shadow-xl p-4 animate-fade-in z-50">
                    <h4 className="text-sm font-bold mb-2">Notifications</h4>
                    <div className="space-y-2">
                        <div className="text-xs p-2 bg-white/5 rounded border-l-2 border-primary">
                            <p className="font-semibold">Streak Saver!</p>
                            <p className="text-subtext">You reached a {user.streak}-day streak.</p>
                        </div>
                         <div className="text-xs p-2 bg-white/5 rounded border-l-2 border-secondary">
                            <p className="font-semibold">New Assignment</p>
                            <p className="text-subtext">Python lists quiz available.</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 pl-6 border-l border-white/10">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-primary font-mono">{user.role} MEMBER</p>
            </div>
            
            <div 
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] cursor-pointer hover:scale-105 transition-transform" 
                onClick={() => navigate('/settings')}
            >
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bold text-sm text-white">
                        {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                    </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};