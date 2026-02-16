import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { SAMPLE_CODE_PYTHON, SAMPLE_CODE_JS, SAMPLE_CODE_TS } from '../constants';
import { Play, Bug, Zap, BookOpen, GitGraph, FileCode, CheckCircle, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react';
import { debugCode, simulateRun, optimizeCode, explainCode, generateLogicFlow } from '../services/aiService';

type Language = 'python' | 'javascript' | 'typescript';
type Tab = 'terminal' | 'debug' | 'explain' | 'optimize' | 'flow';

export const CodingGround: React.FC = () => {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(SAMPLE_CODE_PYTHON);
  
  const [activeTab, setActiveTab] = useState<Tab>('terminal');
  const [output, setOutput] = useState<string>(''); // For execution output
  const [aiContent, setAiContent] = useState<string>(''); // For AI Analysis results
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update code when language changes
  useEffect(() => {
    switch (language) {
      case 'python': setCode(SAMPLE_CODE_PYTHON); break;
      case 'javascript': setCode(SAMPLE_CODE_JS); break;
      case 'typescript': setCode(SAMPLE_CODE_TS); break;
    }
    setOutput('');
    setAiContent('');
    setActiveTab('terminal');
  }, [language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value; // Use value from currentTarget
      setCode(value.substring(0, start) + '  ' + value.substring(end));
      // Need to set timeout to update cursor position after render
      setTimeout(() => {
        if(textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const executeAIAction = async (action: Tab) => {
    setIsProcessing(true);
    setActiveTab(action);
    setStatusMessage('Processing...');
    
    try {
        let result = '';
        switch (action) {
            case 'terminal':
                setStatusMessage('Running simulation...');
                result = await simulateRun(code, language);
                setOutput(result);
                break;
            case 'debug':
                setStatusMessage('Analyzing code for bugs...');
                result = await debugCode(code, language);
                setAiContent(result);
                break;
            case 'optimize':
                setStatusMessage('Generating optimizations...');
                result = await optimizeCode(code, language);
                setAiContent(result);
                break;
            case 'explain':
                setStatusMessage('Generating explanation...');
                result = await explainCode(code, language);
                setAiContent(result);
                break;
            case 'flow':
                setStatusMessage('Visualizing logic flow...');
                result = await generateLogicFlow(code, language);
                setAiContent(result);
                break;
        }
    } catch (e) {
        setAiContent('Error processing request.');
    } finally {
        setIsProcessing(false);
        setStatusMessage('');
    }
  };

  // Line Numbers Logic
  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header / Toolbar */}
      <div className="flex justify-between items-center bg-surface border border-white/5 p-3 rounded-xl">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary font-bold px-2">
                <FileCode size={20} />
                <span>Coding Ground</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 cursor-pointer"
            >
                <option value="python">Python 3.11</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="typescript">TypeScript</option>
            </select>
        </div>
        <div className="flex gap-2">
             <Button 
                variant="primary" 
                size="md" 
                onClick={() => executeAIAction('terminal')} 
                isLoading={isProcessing && activeTab === 'terminal'}
                className="flex items-center gap-2"
            >
                <Play size={16} />
                Run Code
            </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Code Editor */}
        <div className="lg:col-span-2 flex flex-col h-full bg-[#0B0B0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="flex-1 flex overflow-hidden relative group">
                {/* Line Numbers */}
                <div className="w-12 bg-[#141419] border-r border-white/5 text-subtext/50 text-right pr-3 pt-4 text-sm font-mono leading-6 select-none overflow-hidden">
                    {lineNumbers.map(num => (
                        <div key={num}>{num}</div>
                    ))}
                </div>
                
                {/* Textarea */}
                <textarea 
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-full bg-transparent text-gray-200 resize-none outline-none font-mono text-sm leading-6 p-4 pl-4 custom-scrollbar whitespace-pre"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                />
            </div>
            
            {/* Status Bar */}
            <div className="bg-[#141419] border-t border-white/5 px-4 py-1 flex justify-between items-center text-xs text-subtext">
                <span>Ln {code.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length}, Col {textareaRef.current?.selectionStart || 0}</span>
                <span>UTF-8</span>
            </div>
        </div>

        {/* Right Panel: Tools & Output */}
        <div className="lg:col-span-1 flex flex-col h-full gap-4 overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
                {[
                    { id: 'terminal', icon: TerminalIcon, label: 'Output' },
                    { id: 'debug', icon: Bug, label: 'Debug' },
                    { id: 'explain', icon: BookOpen, label: 'Explain' },
                    { id: 'optimize', icon: Zap, label: 'Optimize' },
                    { id: 'flow', icon: GitGraph, label: 'Flow' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => executeAIAction(tab.id as Tab)}
                        disabled={isProcessing}
                        className={`flex-1 flex flex-col xl:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                            activeTab === tab.id 
                            ? 'bg-primary text-black shadow-lg' 
                            : 'text-subtext hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden bg-surface/50">
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <span className="font-bold text-sm text-white capitalize flex items-center gap-2">
                        {activeTab === 'terminal' && <TerminalIcon size={14} className="text-primary"/>}
                        {activeTab === 'debug' && <Bug size={14} className="text-red-400"/>}
                        {activeTab === 'explain' && <BookOpen size={14} className="text-blue-400"/>}
                        {activeTab === 'optimize' && <Zap size={14} className="text-yellow-400"/>}
                        {activeTab === 'flow' && <GitGraph size={14} className="text-purple-400"/>}
                        {activeTab === 'terminal' ? 'Console Output' : `${activeTab} Analysis`}
                    </span>
                    {statusMessage && (
                        <span className="text-xs text-primary animate-pulse">{statusMessage}</span>
                    )}
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0D0D11] font-mono text-sm">
                    {activeTab === 'terminal' ? (
                        output ? (
                            <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-subtext/40">
                                <TerminalIcon size={32} className="mb-2 opacity-50" />
                                <p>Ready to execute.</p>
                            </div>
                        )
                    ) : (
                        // AI Content
                        aiContent ? (
                            <div className="animate-fade-in text-gray-300 space-y-2 leading-relaxed whitespace-pre-wrap">
                                {aiContent}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-subtext/40 text-center px-6">
                                {activeTab === 'debug' && <Bug size={32} className="mb-2 opacity-50" />}
                                {activeTab === 'optimize' && <Zap size={32} className="mb-2 opacity-50" />}
                                {activeTab === 'explain' && <BookOpen size={32} className="mb-2 opacity-50" />}
                                {activeTab === 'flow' && <GitGraph size={32} className="mb-2 opacity-50" />}
                                <p>Select this tab to {activeTab} your code.</p>
                            </div>
                        )
                    )}
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};