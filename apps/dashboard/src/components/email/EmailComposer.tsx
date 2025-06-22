'use client';

import { useState, useRef } from 'react';
import { 
  SparklesIcon, 
  PaperAirplaneIcon, 
  ClockIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

interface EmailComposerProps {
  onSend?: (emailData: EmailData) => void;
  onSchedule?: (emailData: EmailData, scheduleAt: Date) => void;
  onSave?: (emailData: EmailData) => void;
  initialData?: Partial<EmailData>;
}

interface EmailData {
  subject: string;
  content: string;
  variables: Record<string, string>;
  recipients: Array<{
    email: string;
    name?: string;
    variables?: Record<string, any>;
  }>;
}

interface PersonalizationVariable {
  key: string;
  description: string;
  example: string;
}

const defaultVariables: PersonalizationVariable[] = [
  { key: 'name', description: 'Full name of recipient', example: 'John Doe' },
  { key: 'first_name', description: 'First name', example: 'John' },
  { key: 'company', description: 'Company name', example: 'Acme Corp' },
  { key: 'position', description: 'Job title', example: 'Marketing Manager' },
  { key: 'campaign_name', description: 'Campaign name', example: 'Summer Sale' },
];

export default function EmailComposer({ 
  onSend, 
  onSchedule, 
  onSave, 
  initialData 
}: EmailComposerProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    variables: initialData?.variables || {},
    recipients: initialData?.recipients || [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [viewMode, setViewMode] = useState<'compose' | 'preview' | 'code'>('compose');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'urgent' | 'friendly' | 'promotional'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateContent = async () => {
    if (!generationPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Mock AI generation - in real app would call tRPC endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedSubjects = [
        `Exclusive ${generationPrompt} - Don't Miss Out!`,
        `Your ${generationPrompt} Update is Here`,
        `Limited Time: ${generationPrompt} Offer`,
      ];
      
      const generatedContent = `Hi {{name}},

I hope this email finds you well!

${generationPrompt} is now live and we couldn't be more excited to share it with you. This exclusive opportunity is designed specifically for valued customers like yourself.

Here's what makes this special:
• Premium features at an unbeatable price
• Limited-time exclusive access
• Personalized recommendations just for you

{{call_to_action}}

If you have any questions, feel free to reach out. We're here to help!

Best regards,
{{sender_name}}
{{company_name}}`;

      setEmailData(prev => ({
        ...prev,
        subject: generatedSubjects[0],
        content: generatedContent
      }));
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = emailData.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `{{${variable}}}` + after;

    setEmailData(prev => ({ ...prev, content: newText }));
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
    }, 0);
  };

  const generatePreview = () => {
    let preview = emailData.content;
    
    // Replace variables with example values
    defaultVariables.forEach(variable => {
      const regex = new RegExp(`{{${variable.key}}}`, 'g');
      preview = preview.replace(regex, variable.example);
    });
    
    // Replace any remaining variables with placeholder
    preview = preview.replace(/{{([^}]+)}}/g, '[Variable: $1]');
    
    return preview;
  };

  const handleSend = () => {
    if (onSend) {
      onSend(emailData);
    }
  };

  const handleSchedule = () => {
    // In real app, would open schedule modal
    const scheduleAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    if (onSchedule) {
      onSchedule(emailData, scheduleAt);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(emailData);
    }
  };

  return (
    <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-dark-800/80 px-6 py-4 border-b border-dark-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-neon-400" />
            <h2 className="text-xl font-semibold text-white">Email Composer</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggles */}
            <div className="flex items-center bg-dark-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('compose')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'compose' 
                    ? 'bg-neon-400/20 text-neon-400 font-medium' 
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                Compose
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'preview' 
                    ? 'bg-neon-400/20 text-neon-400 font-medium' 
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'code' 
                    ? 'bg-neon-400/20 text-neon-400 font-medium' 
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* AI Generation Section */}
        <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
          <div className="flex items-center space-x-2 mb-3">
            <SparklesIcon className="h-5 w-5 text-neon-400" />
            <span className="text-neon-400 font-medium">AI Content Generator</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="urgent">Urgent</option>
                <option value="friendly">Friendly</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Length</label>
              <select 
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Campaign Theme</label>
              <input
                type="text"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="e.g., Summer Sale, Product Launch"
                className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-400 focus:ring-1 focus:ring-neon-400 placeholder-dark-400"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerateContent}
            disabled={isGenerating || !generationPrompt.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
          </button>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Subject Line</label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter email subject..."
            className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-4 py-3 text-white focus:border-neon-400 focus:ring-1 focus:ring-neon-400 placeholder-dark-400 neon-focus"
          />
        </div>

        {/* Content Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-dark-300">Email Content</label>
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="text-neon-400 hover:text-neon-300 text-sm flex items-center space-x-1"
            >
              <CogIcon className="h-4 w-4" />
              <span>Variables</span>
            </button>
          </div>

          <div className="relative">
            {viewMode === 'compose' && (
              <textarea
                ref={textareaRef}
                value={emailData.content}
                onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start typing your email content..."
                rows={15}
                className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-4 py-3 text-white focus:border-neon-400 focus:ring-1 focus:ring-neon-400 placeholder-dark-400 neon-focus resize-none font-mono text-sm"
              />
            )}
            
            {viewMode === 'preview' && (
              <div className="bg-white text-dark-900 rounded-lg p-6 min-h-[400px] font-sans">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-lg font-semibold">{emailData.subject || 'Subject Line'}</h3>
                </div>
                <div className="whitespace-pre-wrap">{generatePreview()}</div>
              </div>
            )}
            
            {viewMode === 'code' && (
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify({
                    subject: emailData.subject,
                    content: emailData.content,
                    variables: defaultVariables.reduce((acc, v) => ({ ...acc, [v.key]: v.example }), {})
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Personalization Variables Panel */}
          {showVariables && (
            <div className="bg-dark-700/30 rounded-lg p-4 border border-dark-600/50">
              <h4 className="text-white font-medium mb-3">Personalization Variables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {defaultVariables.map((variable) => (
                  <button
                    key={variable.key}
                    onClick={() => insertVariable(variable.key)}
                    className="text-left p-3 bg-dark-600/50 rounded-lg border border-dark-500/50 hover:border-neon-400/50 hover:bg-dark-600/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <code className="text-neon-400 text-sm">{"{{" + variable.key + "}}"}</code>
                    </div>
                    <p className="text-dark-300 text-xs">{variable.description}</p>
                    <p className="text-dark-400 text-xs">Example: {variable.example}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="btn-secondary flex items-center space-x-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>Save Draft</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSchedule}
              className="btn-secondary flex items-center space-x-2"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Schedule</span>
            </button>
            
            <button
              onClick={handleSend}
              className="btn-primary flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              <span>Send Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}