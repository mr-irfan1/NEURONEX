import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { MOCK_USER } from '../constants';
import { User, UserRole } from '../types';
import { User as UserIcon, Mail, Shield, Bell, CreditCard, Trash2, Save, CheckCircle, Upload } from 'lucide-react';

export const Settings: React.FC = () => {
  // Simulate user state from persistence or mock
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('neuronex_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [level, setLevel] = useState(user.learningLevel);
  const [avatar, setAvatar] = useState<string>(user.avatar || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preferences (mocked)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Limit file size to 2MB for local storage sanity
        if (file.size > 2 * 1024 * 1024) {
            alert("File size too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedUser: User = { ...user, name, email, learningLevel: level, avatar };
      setUser(updatedUser);
      localStorage.setItem('neuronex_user', JSON.stringify(updatedUser));
      
      // Dispatch event to update Layout header immediately
      window.dispatchEvent(new Event('userUpdated'));
      
      setIsLoading(false);
      showToast("Settings saved successfully");
    }, 800);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to permanently delete your account? All data including notebooks and settings will be lost immediately. This action cannot be undone.")) {
        setIsDeleting(true);
        
        // Simulate API Deletion Call
        setTimeout(() => {
            try {
                // Clear Application Data
                localStorage.removeItem('neuronex_user');
                localStorage.removeItem('neuronex_notebooks');
                localStorage.removeItem('neuronex_schedule');
                
                // Show feedback
                alert("Account deleted successfully. You will be redirected.");
                
                // Redirect/Reload to reset state to defaults
                window.location.href = '/';
            } catch (error) {
                console.error("Deletion failed", error);
                showToast("Failed to delete account");
                setIsDeleting(false);
            }
        }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-primary text-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in z-50">
            <CheckCircle size={16} />
            <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Profile Section */}
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
            <UserIcon className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Profile Information</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-surface border-2 border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:border-primary/50"
                >
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-subtext">{name.split(' ').map(n => n[0]).join('').substring(0,2)}</span>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                    </div>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary hover:underline"
                >
                    Change Avatar
                </button>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-subtext uppercase tracking-wider">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-subtext uppercase tracking-wider">Learning Level</label>
                        <select 
                            value={level}
                            onChange={(e) => setLevel(e.target.value as any)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs text-subtext uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-subtext" />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
            <Button onClick={handleSave} isLoading={isLoading} className="flex items-center gap-2">
                <Save size={16} /> Save Changes
            </Button>
        </div>
      </GlassCard>

      {/* Subscription Section */}
      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
            <CreditCard className="text-secondary" size={24} />
            <h2 className="text-xl font-semibold">Subscription & Billing</h2>
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded-xl p-6 border border-white/5 relative z-10">
            <div>
                <p className="text-sm text-subtext mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{user.role} Plan</span>
                    {user.role === UserRole.PRO && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded border border-primary/20">ACTIVE</span>
                    )}
                </div>
                <p className="text-xs text-subtext mt-2">Renews on Oct 24, 2024</p>
            </div>
            <div>
                {user.role === UserRole.FREE ? (
                     <Button variant="primary">Upgrade to Pro</Button>
                ) : (
                     <Button variant="secondary">Manage Billing</Button>
                )}
            </div>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-8">
         <div className="flex items-center gap-3 mb-6">
            <Bell className="text-white" size={24} />
            <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
            {[
                { label: 'Study Reminders', desc: 'Get notified when it\'s time to study', key: 'push' },
                { label: 'Weekly Progress Report', desc: 'Summary of your learning performance', key: 'email' },
                { label: 'Product Updates', desc: 'New features and improvements', key: 'updates' }
            ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                    <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-xs text-subtext">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={(notifications as any)[item.key]} 
                            onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            ))}
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="p-8 border-red-500/20">
         <div className="flex items-center gap-3 mb-6">
            <Shield className="text-red-500" size={24} />
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-medium text-white">Delete Account</h4>
                <p className="text-xs text-subtext">Permanently remove your account and all data.</p>
            </div>
            <Button 
                variant="danger" 
                onClick={handleDeleteAccount} 
                className="flex items-center gap-2"
                isLoading={isDeleting}
            >
                <Trash2 size={16} /> Delete Account
            </Button>
        </div>
      </GlassCard>
    </div>
  );
};