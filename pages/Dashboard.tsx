import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { 
    Clock, Zap, Target, ArrowUpRight, PlayCircle, Mail, 
    CheckCircle, AlertCircle, X, Calendar, Crown, Star,
    Plus, Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_USER, INITIAL_NOTEBOOKS } from '../constants';
import { subscribeToNewsletter } from '../services/newsletterService';
import { UserRole, NotebookEntry } from '../types';

const data = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 3.8 },
  { name: 'Wed', hours: 1.5 },
  { name: 'Thu', hours: 4.2 },
  { name: 'Fri', hours: 3.0 },
  { name: 'Sat', hours: 5.5 },
  { name: 'Sun', hours: 2.0 },
];

interface ScheduleItem {
    id: string;
    topic: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
}

const INITIAL_SCHEDULE: ScheduleItem[] = [
    { id: '1', topic: 'Advanced React Patterns', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:30' },
    { id: '2', topic: 'System Design Basics', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '14:00', endTime: '15:30' },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // -- State --
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('neuronex_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [notebooks, setNotebooks] = useState<NotebookEntry[]>(() => {
     try {
       const saved = localStorage.getItem('neuronex_notebooks');
       if (saved) return JSON.parse(saved);
     } catch (e) {}
     return INITIAL_NOTEBOOKS;
  });

  // Schedule State
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
      try {
          const saved = localStorage.getItem('neuronex_schedule');
          return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
      } catch (e) { return INITIAL_SCHEDULE; }
  });
  
  // Schedule Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ topic: '', date: '', startTime: '', endTime: '' });

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Modals
  const [showSchedule, setShowSchedule] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Fixed Stats to match Screenshot
  const totalXP = "900";
  const studyHours = "10.9";
  const quizAccuracy = "88%";

  // -- Effects --
  useEffect(() => {
      localStorage.setItem('neuronex_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // -- Actions --

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setStatus('error');
        setMessage('Please enter a valid email address.');
        return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const result = await subscribeToNewsletter(email);
      setStatus('success');
      setMessage(result.message);
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === 'error') {
        setStatus('idle');
        setMessage('');
    }
  };

  const handleResumeStudy = () => {
    // Find most recently modified notebook
    const sorted = [...notebooks].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    if (sorted.length > 0) {
        navigate('/notebook', { state: { noteId: sorted[0].id } });
    } else {
        navigate('/notebook');
    }
  };

  const handleUpgradeConfirm = () => {
    const updatedUser = { ...user, role: UserRole.PRO };
    setUser(updatedUser);
    localStorage.setItem('neuronex_user', JSON.stringify(updatedUser));
    setShowUpgrade(false);
    alert("Welcome to Pro! You now have unlimited access.");
  };

  const handleRecommendationClick = (path: string) => {
      navigate(path);
  };

  // Schedule Actions
  const handleAddEvent = () => {
      if (!newEvent.topic || !newEvent.date || !newEvent.startTime) {
          alert("Please fill in the topic, date, and start time.");
          return;
      }
      
      const item: ScheduleItem = {
          id: Date.now().toString(),
          topic: newEvent.topic,
          date: newEvent.date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime || newEvent.startTime
      };
      
      setSchedule([...schedule, item]);
      setIsAddingEvent(false);
      setNewEvent({ topic: '', date: '', startTime: '', endTime: '' });
  };

  const handleDeleteEvent = (id: string) => {
      setSchedule(schedule.filter(s => s.id !== id));
  };

  const formatDateDisplay = (dateStr: string) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
      return { day, month };
  };

  return (
    <div className="space-y-8 relative">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hello, {user.name} 👋</h1>
          <p className="text-subtext">You're on a 12-day learning streak. Keep it up!</p>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => setShowSchedule(true)}>VIEW SCHEDULE</Button>
            <Button variant="primary" size="md" onClick={handleResumeStudy}>RESUME STUDY</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col justify-between h-32" glowColor="primary">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Zap size={20} className="text-primary" />
            </div>
            <span className="text-xs text-black font-bold bg-primary px-2 py-1 rounded">+12%</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold">{totalXP} XP</h3>
            <p className="text-xs text-subtext">Total Gained</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-32" glowColor="secondary">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-lg">
                <Clock size={20} className="text-secondary" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold">{studyHours}h</h3>
            <p className="text-xs text-subtext">Study time</p>
          </div>
        </GlassCard>
        
        <GlassCard className="flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
            <div className="p-2 bg-white/5 rounded-lg">
                <Target size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold">{quizAccuracy}</h3>
            <p className="text-xs text-subtext">Quiz accuracy</p>
          </div>
        </GlassCard>

        <GlassCard 
            className={`flex flex-col justify-between h-32 cursor-pointer group ${user.role === UserRole.PRO ? 'border-primary/30' : ''}`}
            interactive 
            onClick={() => user.role !== UserRole.PRO && setShowUpgrade(true)}
        >
            <div className="flex justify-between items-start">
             <div className={`p-2 rounded-lg transition-colors ${user.role === UserRole.PRO ? 'bg-primary text-black' : 'bg-white/5 group-hover:bg-primary group-hover:text-black'}`}>
                {user.role === UserRole.PRO ? <Crown size={20} /> : <ArrowUpRight size={20} />}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">{user.role === UserRole.PRO ? 'Pro Active' : 'Upgrade to Pro'}</h3>
            <p className="text-xs text-subtext">{user.role === UserRole.PRO ? 'You are a legend!' : 'Unlock unlimited AI'}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
            <GlassCard className="h-full min-h-[400px]">
                <h3 className="text-lg font-semibold mb-6">Learning Activity</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#A0A0A8', fontSize: 12 }} 
                            />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#141419', border: '1px solid #333', borderRadius: '8px' }}
                            />
                            <Bar dataKey="hours" radius={[6, 6, 6, 6]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 5 ? '#F5F500' : '#2A2A35'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>

        {/* Right Column: Recommended + Newsletter */}
        <div className="lg:col-span-1 space-y-6">
            <GlassCard>
                <h3 className="text-lg font-semibold mb-4">Recommended for you</h3>
                <div className="space-y-4">
                    <div 
                        onClick={() => handleRecommendationClick('/code')}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-secondary/50 transition-colors group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded">PYTHON</span>
                            <PlayCircle size={16} className="text-subtext group-hover:text-secondary" />
                        </div>
                        <h4 className="font-medium text-white mb-1">Advanced List Comprehensions</h4>
                        <p className="text-xs text-subtext">15 min • Intermediate</p>
                    </div>

                    <div 
                        onClick={() => handleRecommendationClick('/notebook')}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-black">REACT</span>
                            <PlayCircle size={16} className="text-subtext group-hover:text-primary" />
                        </div>
                        <h4 className="font-medium text-white mb-1">Custom Hooks Deep Dive</h4>
                        <p className="text-xs text-subtext">25 min • Advanced</p>
                    </div>
                </div>
            </GlassCard>

            {/* Newsletter Widget */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Mail size={80} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Stay Updated
                </h3>
                <p className="text-xs text-subtext mb-4">
                    Get the latest coding challenges and platform updates delivered to your inbox.
                </p>
                
                {status === 'success' ? (
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3 animate-pulse-glow">
                        <CheckCircle size={24} className="text-success" />
                        <div>
                            <p className="text-sm font-bold text-success">Subscribed!</p>
                            <p className="text-xs text-subtext">Check your inbox soon.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-subtext" />
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={handleInputChange}
                                required
                                className={`w-full bg-white/5 border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors placeholder:text-subtext/50 ${
                                    status === 'error' 
                                    ? 'border-error/50 focus:border-error' 
                                    : 'border-white/10 focus:border-primary/50'
                                }`}
                            />
                        </div>
                        
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-error bg-error/10 p-2 rounded-lg text-xs animate-pulse">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <Button 
                            variant="primary" 
                            size="md" 
                            className="w-full"
                            isLoading={status === 'loading'}
                        >
                            Subscribe
                        </Button>
                    </form>
                )}
            </GlassCard>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-lg p-6 relative">
                <button onClick={() => setShowSchedule(false)} className="absolute top-4 right-4 text-subtext hover:text-white">
                    <X size={20} />
                </button>
                
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-secondary" size={24} />
                        <h2 className="text-xl font-bold">Upcoming Schedule</h2>
                    </div>
                    {!isAddingEvent && (
                        <Button variant="glass" size="sm" onClick={() => setIsAddingEvent(true)}>
                            <Plus size={16} className="mr-1" /> Add Event
                        </Button>
                    )}
                </div>

                {isAddingEvent ? (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                            <label className="text-xs text-subtext uppercase">Topic</label>
                            <input 
                                type="text" 
                                value={newEvent.topic}
                                onChange={(e) => setNewEvent({...newEvent, topic: e.target.value})}
                                placeholder="e.g., Python Basics"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-subtext uppercase">Date</label>
                                <input 
                                    type="date" 
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs text-subtext uppercase">Start Time</label>
                                <input 
                                    type="time" 
                                    value={newEvent.startTime}
                                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                             <Button variant="primary" size="md" onClick={handleAddEvent} className="flex-1">Save Event</Button>
                             <Button variant="secondary" size="md" onClick={() => setIsAddingEvent(false)} className="flex-1">Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {schedule.length === 0 ? (
                            <div className="text-center py-8 text-subtext text-sm">
                                <p>No scheduled events.</p>
                                <p>Plan your week to stay ahead!</p>
                            </div>
                        ) : (
                            schedule.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item) => {
                                const { day, month } = formatDateDisplay(item.date);
                                return (
                                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group">
                                        <div className="w-12 h-12 rounded-lg bg-surface flex flex-col items-center justify-center border border-white/10">
                                            <span className="text-xs text-subtext">{month}</span>
                                            <span className="font-bold">{day}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{item.topic}</h4>
                                            <p className="text-xs text-subtext">
                                                {item.startTime} {item.endTime ? `- ${item.endTime}` : ''}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteEvent(item.id)}
                                            className="p-2 text-subtext hover:text-red-400 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
                
                {!isAddingEvent && (
                    <div className="mt-6 flex justify-end">
                        <Button variant="secondary" onClick={() => setShowSchedule(false)}>Close</Button>
                    </div>
                )}
            </GlassCard>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-2xl p-0 relative overflow-hidden border-primary/30">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <button onClick={() => setShowUpgrade(false)} className="absolute top-4 right-4 text-subtext hover:text-white z-10">
                    <X size={20} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 bg-surface/50 flex flex-col justify-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                            <Crown className="text-primary" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
                        <p className="text-subtext text-sm mb-6">Unleash your full potential with unlimited AI power.</p>
                        <div className="space-y-3">
                            {['Unlimited AI Explanations', 'Advanced Code Debugging', 'Voice Tutor Access', 'Personalized Study Plan'].map((feat, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                    <CheckCircle size={14} className="text-primary" />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-8 bg-black/40 flex flex-col justify-center items-center text-center">
                        <span className="text-sm text-subtext uppercase tracking-widest mb-2">Limited Time Offer</span>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-bold text-white">$12</span>
                            <span className="text-subtext mb-1">/mo</span>
                        </div>
                        <Button variant="primary" size="lg" className="w-full mb-3" onClick={handleUpgradeConfirm}>
                            Get Pro Access
                        </Button>
                        <p className="text-[10px] text-subtext">Cancel anytime. Secure payment via Stripe.</p>
                    </div>
                </div>
            </GlassCard>
        </div>
      )}
    </div>
  );
};
