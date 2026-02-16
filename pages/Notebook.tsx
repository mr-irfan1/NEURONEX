import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { INITIAL_NOTEBOOKS } from '../constants';
import { 
  Plus, Sparkles, FileText, MoreHorizontal, Search, 
  Trash2, Download, Tag, X, FileQuestion, AlignLeft, Check,
  Upload, ArrowUpDown, Calendar, Type, Save, CheckCircle
} from 'lucide-react';
import { generateExplanation, generateQuiz, summarizeNotes } from '../services/aiService';
import { NotebookEntry } from '../types';

export const Notebook: React.FC = () => {
  const location = useLocation();
  
  // Persistence Logic: Load from LocalStorage or use Default
  const [notebooks, setNotebooks] = useState<NotebookEntry[]>(() => {
    try {
      const saved = localStorage.getItem('neuronex_notebooks');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Rehydrate Dates
        return parsed.map((n: any) => ({
            ...n,
            lastModified: new Date(n.lastModified)
        }));
      }
    } catch (e) {
      console.warn("Failed to load notebooks from storage", e);
    }
    return INITIAL_NOTEBOOKS;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
     // Check if redirecting from Dashboard with a specific note
     if (location.state && location.state.noteId) {
        return location.state.noteId;
     }
     // Try to restore last selected note, else first
     return notebooks.length > 0 ? notebooks[0].id : '';
  });

  // Effect to handle location state changes if navigating while already mounted (rare but good practice)
  useEffect(() => {
    if (location.state && location.state.noteId) {
        setSelectedNoteId(location.state.noteId);
    }
  }, [location.state]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<{type: string, content: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  
  // Tag input state
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const selectedNote = notebooks.find(n => n.id === selectedNoteId);

  // Persist to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('neuronex_notebooks', JSON.stringify(notebooks));
  }, [notebooks]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // CRUD: Create
  const handleNewNotebook = () => {
    const newNote: NotebookEntry = {
        id: `n_${Date.now()}`,
        title: 'Untitled Notebook',
        content: '',
        tags: [],
        lastModified: new Date()
    };
    setNotebooks(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setAiOutput(null);
    setSearchQuery(''); 
    showToast("New notebook created");
  };

  // CRUD: Import (Create from File)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        const newNote: NotebookEntry = {
            id: `n_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
            content: content,
            tags: ['Imported'],
            lastModified: new Date()
        };
        setNotebooks(prev => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
        showToast(`Imported "${file.name}"`);
    };
    reader.onerror = () => showToast("Failed to read file", "error");
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // CRUD: Update
  const updateSelectedNote = (updates: Partial<NotebookEntry>) => {
    setNotebooks(prev => prev.map(note => 
        note.id === selectedNoteId ? { ...note, ...updates, lastModified: new Date() } : note
    ));
  };

  // CRUD: Delete
  const handleDeleteNotebook = (noteIdToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this notebook?")) {
        const remaining = notebooks.filter(n => n.id !== noteIdToDelete);
        setNotebooks(remaining);
        
        // If we deleted the currently selected note, we need to pick a new one
        if (selectedNoteId === noteIdToDelete) {
             if (remaining.length > 0) {
                setSelectedNoteId(remaining[0].id);
            } else {
                setSelectedNoteId(''); 
            }
            // Clear any AI output associated with the deleted note
            setAiOutput(null);
        }

        setShowMenu(false);
        showToast("Notebook deleted");
    }
  };

  const handleExport = () => {
    if (!selectedNote) return;
    const blob = new Blob([
        `Title: ${selectedNote.title}\nDate: ${selectedNote.lastModified.toLocaleDateString()}\n\n${selectedNote.content}`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
    showToast("Exported successfully");
  };

  const handleAIAction = async (action: 'explain' | 'quiz' | 'summarize') => {
    if (!selectedNote || !selectedNote.content) {
        showToast("Please add some content first", "error");
        return;
    }
    
    setIsGenerating(true);
    setAiOutput(null);
    
    let result = '';
    let title = '';

    try {
        if (action === 'explain') {
            title = 'AI Explanation';
            result = await generateExplanation(selectedNote.title, "Intermediate");
        } else if (action === 'quiz') {
            title = 'Generated Quiz';
            result = await generateQuiz(selectedNote.title, selectedNote.content);
        } else if (action === 'summarize') {
            title = 'Summary';
            result = await summarizeNotes(selectedNote.content);
        }
        setAiOutput({ type: title, content: result });
    } catch (e) {
        setAiOutput({ type: 'Error', content: 'Something went wrong. Please try again.' });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim() && selectedNote) {
        if (!selectedNote.tags.includes(newTagInput.trim())) {
            updateSelectedNote({ tags: [...selectedNote.tags, newTagInput.trim()] });
        }
        setNewTagInput('');
        setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (selectedNote) {
        updateSelectedNote({ tags: selectedNote.tags.filter(t => t !== tagToRemove) });
    }
  };

  // Sorting and Filtering
  const sortedNotebooks = [...notebooks].sort((a, b) => {
    if (sortBy === 'date') {
        return b.lastModified.getTime() - a.lastModified.getTime();
    } else {
        return a.title.localeCompare(b.title);
    }
  });

  const filteredNotebooks = sortedNotebooks.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 relative">
      {/* Toast Notification */}
      {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-primary text-black'}`}>
              {toast.type === 'success' ? <CheckCircleIcon size={16}/> : <XIcon size={16}/>}
              <span className="text-sm font-medium">{toast.msg}</span>
          </div>
      )}

      {/* Sidebar List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 border-r md:border-none border-white/5 pr-4 md:pr-0">
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">My Notebooks</h2>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".txt,.md,.js,.py,.json"
                        onChange={handleFileUpload}
                    />
                    <Button 
                        size="sm" 
                        variant="glass" 
                        onClick={() => fileInputRef.current?.click()} 
                        title="Import Text File"
                    >
                        <Upload size={16} />
                    </Button>
                    <Button size="sm" variant="glass" onClick={handleNewNotebook} title="Create New Notebook">
                        <Plus size={16} />
                    </Button>
                </div>
            </div>
            
            {/* Search & Sort */}
            <div className="flex gap-2">
                <div className="relative group flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-subtext group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-glass-panel border border-white/5 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-primary/30 transition-all placeholder:text-subtext/50"
                    />
                </div>
                
                <div className="relative" ref={sortMenuRef}>
                    <Button 
                        variant="glass" 
                        size="sm" 
                        className="h-full px-3"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                    >
                        <ArrowUpDown size={16} />
                    </Button>
                    {showSortMenu && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A20] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fade-in">
                            <button 
                                onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                                className={`flex items-center gap-2 w-full px-4 py-3 text-xs text-left transition-colors ${sortBy === 'date' ? 'text-primary bg-white/5' : 'text-subtext hover:text-white'}`}
                            >
                                <Calendar size={14} /> Last Modified
                            </button>
                            <button 
                                onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                                className={`flex items-center gap-2 w-full px-4 py-3 text-xs text-left transition-colors ${sortBy === 'title' ? 'text-primary bg-white/5' : 'text-subtext hover:text-white'}`}
                            >
                                <Type size={14} /> Title (A-Z)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {filteredNotebooks.length === 0 ? (
                <div className="text-center py-12 text-subtext text-sm border-2 border-dashed border-white/5 rounded-xl">
                    <p>No notebooks found.</p>
                    <button onClick={handleNewNotebook} className="text-primary hover:underline mt-2">Create one?</button>
                </div>
            ) : (
                filteredNotebooks.map(note => (
                    <div 
                        key={note.id}
                        onClick={() => { setSelectedNoteId(note.id); setAiOutput(null); setShowMenu(false); }}
                        className={`p-4 rounded-xl cursor-pointer transition-all border group relative pr-10 ${
                            selectedNoteId === note.id 
                            ? 'bg-white/10 border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.2)]' 
                            : 'bg-glass-panel border-white/5 hover:bg-white/5'
                        }`}
                    >
                        <h3 className={`font-semibold mb-1 truncate ${selectedNoteId === note.id ? 'text-white' : 'text-gray-300'}`}>
                            {note.title || "Untitled"}
                        </h3>
                        <p className="text-xs text-subtext line-clamp-2 h-8 font-light">
                            {note.content || "No content..."}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                            <div className="flex gap-1.5 overflow-hidden">
                                {note.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-subtext border border-white/5 truncate max-w-[60px]">
                                        {tag}
                                    </span>
                                ))}
                                {note.tags.length > 3 && (
                                    <span className="text-[10px] text-subtext px-1">+{note.tags.length - 3}</span>
                                )}
                            </div>
                            <span className="text-[10px] text-subtext/50">
                                {note.lastModified.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        
                        {/* Sidebar Delete Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotebook(note.id);
                            }}
                            className="absolute top-4 right-3 p-1.5 rounded-lg text-subtext/50 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Main Editor Area */}
      <GlassCard className="flex-1 flex flex-col relative overflow-hidden">
        {selectedNote ? (
        <>
            {/* Header */}
            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                <div className="flex-1 mr-4">
                    <input 
                        type="text" 
                        value={selectedNote.title}
                        onChange={(e) => updateSelectedNote({ title: e.target.value })}
                        placeholder="Untitled Notebook"
                        className="text-2xl font-bold text-white mb-2 bg-transparent border-none outline-none w-full placeholder-white/20"
                    />
                    
                    {/* Tags Section */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {selectedNote.tags.map(tag => (
                            <div key={tag} className="flex items-center gap-1 bg-white/5 text-xs text-subtext px-2 py-1 rounded-md border border-white/5 group">
                                <Tag size={10} />
                                <span>{tag}</span>
                                <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        
                        {showTagInput ? (
                            <form onSubmit={handleAddTag} className="flex items-center">
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newTagInput}
                                    onChange={e => setNewTagInput(e.target.value)}
                                    onBlur={() => { if(!newTagInput) setShowTagInput(false); }}
                                    placeholder="Tag..."
                                    className="bg-white/10 text-xs text-white px-2 py-1 rounded-l-md outline-none w-20 border-none"
                                />
                                <button type="submit" className="bg-primary/20 text-primary px-1.5 py-1 rounded-r-md hover:bg-primary/30">
                                    <Check size={10} />
                                </button>
                            </form>
                        ) : (
                            <button 
                                onClick={() => setShowTagInput(true)} 
                                className="text-xs text-subtext hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                            >
                                <Plus size={10} /> Add Tag
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex gap-2 relative">
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                        <Button 
                            variant="glass" 
                            size="sm" 
                            onClick={() => handleAIAction('explain')} 
                            disabled={isGenerating}
                            className="h-8 w-8 p-0 flex items-center justify-center group"
                            title="AI Explain"
                        >
                            <Sparkles size={16} className="text-subtext group-hover:text-primary transition-colors" />
                        </Button>
                        <Button 
                            variant="glass" 
                            size="sm" 
                            onClick={() => handleAIAction('summarize')}
                            disabled={isGenerating}
                            className="h-8 w-8 p-0 flex items-center justify-center group"
                            title="Summarize Notes"
                        >
                            <AlignLeft size={16} className="text-subtext group-hover:text-secondary transition-colors" />
                        </Button>
                        <Button 
                            variant="glass" 
                            size="sm" 
                            onClick={() => handleAIAction('quiz')}
                            disabled={isGenerating}
                            className="h-8 w-8 p-0 flex items-center justify-center group"
                            title="Generate Quiz"
                        >
                            <FileQuestion size={16} className="text-subtext group-hover:text-green-400 transition-colors" />
                        </Button>
                    </div>

                    <div ref={menuRef} className="relative">
                        <Button 
                            variant="glass" 
                            size="sm" 
                            onClick={() => setShowMenu(!showMenu)}
                            className="h-8 w-8 p-0 flex items-center justify-center"
                        >
                            <MoreHorizontal size={16} />
                        </Button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A20] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fade-in">
                                <button 
                                    onClick={handleExport}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-subtext hover:bg-white/5 hover:text-white transition-colors text-left"
                                >
                                    <Download size={14} /> Export to .txt
                                </button>
                                <div className="h-px bg-white/5 mx-2"></div>
                                <button 
                                    onClick={() => handleDeleteNotebook(selectedNoteId)}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                >
                                    <Trash2 size={14} /> Delete Notebook
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area Split */}
            <div className="flex-1 relative grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 overflow-hidden">
                {/* Editor */}
                <div className="h-full overflow-hidden flex flex-col relative">
                     {/* Auto-save indicator */}
                    <div className="absolute bottom-2 right-2 text-[10px] text-subtext/40 pointer-events-none flex items-center gap-1">
                        <Save size={10} /> Auto-saving
                    </div>
                    <textarea 
                        value={selectedNote.content}
                        onChange={(e) => updateSelectedNote({ content: e.target.value })}
                        className="w-full h-full bg-transparent text-gray-200 leading-relaxed font-light outline-none resize-none placeholder-white/10 custom-scrollbar text-base"
                        placeholder="Start typing your notes here..."
                        spellCheck={false}
                    />
                </div>

                {/* AI Output Panel */}
                <div className={`
                    absolute md:static inset-0 bg-background/95 md:bg-black/20 md:rounded-xl 
                    border-l md:border border-white/5 transition-transform duration-300 z-10 
                    flex flex-col overflow-hidden
                    ${aiOutput ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles size={16} />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {aiOutput ? aiOutput.type : 'AI Assistant'}
                            </span>
                        </div>
                        {aiOutput && (
                            <button onClick={() => setAiOutput(null)} className="text-subtext hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full text-subtext gap-3">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs animate-pulse">Thinking...</span>
                            </div>
                        ) : aiOutput ? (
                            <div className="prose prose-invert prose-sm">
                                <div className="whitespace-pre-line text-gray-300 leading-7">
                                    {aiOutput.content}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-subtext/40 text-center p-6">
                                <FileText size={48} className="mb-4 opacity-30" />
                                <p className="text-sm font-medium mb-1">AI Context Aware</p>
                                <p className="text-xs">
                                    Select "Explain", "Summarize", or "Quiz" from the toolbar to get AI insights on your notes.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
        ) : (
             <div className="h-full flex flex-col items-center justify-center text-subtext opacity-50">
                <FileText size={64} className="mb-4 opacity-20" />
                <p>Select a notebook or create a new one.</p>
                <Button variant="glass" onClick={handleNewNotebook} className="mt-4">
                    Create Notebook
                </Button>
            </div>
        )}
      </GlassCard>
    </div>
  );
};

// Icons helper
const CheckCircleIcon = CheckCircle;
const XIcon = X;
