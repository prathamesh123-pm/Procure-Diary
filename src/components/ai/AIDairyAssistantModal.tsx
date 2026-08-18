import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  MessageSquare,
  Copy,
  Check,
  X,
  Milk,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AIDairyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AIDairyAssistantModal: React.FC<AIDairyAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text:
        language === 'mr'
          ? 'नमस्कार! मी तुमचा AI डेअरी सहाय्यक आहे. दूध संकलन वाढवणे, फॅट/SNF वाढीसाठी आहार सल्ला, शेतकरी तक्रार निवारण किंवा व्हॉट्सॲप मेसेज तयार करण्यासाठी मला प्रश्न विचारा.'
          : 'Hello! I am your AI Dairy Assistant. Ask me about boosting milk collection, cattle feed recommendations, farmer complaints resolution, or drafting broadcast messages.',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const quickPrompts =
    language === 'mr'
      ? [
          'दूध फॅट व SNF वाढवण्यासाठी शेतकऱ्यांना काय आहार सल्ला द्यावा?',
          'दूध दर वाढीचा व्हॉट्सॲप मेसेज तयार करा',
          'सायलेज (Silage) व मका चाऱ्याचे फायदे सांगा',
          'दूध संकलन गळती कशी रोखावी?',
        ]
      : [
          'How to advise farmers to increase Fat & SNF naturally?',
          'Draft a WhatsApp broadcast for milk rate revision',
          'Explain silage feeding benefits for dairy cattle',
          'Strategies to reduce milk collection leakage on routes',
        ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/dairy-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, language }),
      });

      const data = await response.json();
      const aiReply = data.advice || (language === 'mr' ? 'माहिती उपलब्ध झाली आहे.' : 'Here is the response.');

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      // Fallback
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text:
            language === 'mr'
              ? 'गाई व म्हशींचे दूध फॅट वाढवण्यासाठी आहारात सुग्रास/बायपास फॅट, खनिज मिश्रण (Mineral Mixture), सुका चारा (कडबा) आणि हिरवा चारा (मका/नेपियर) यांचे योग्य संतुलन ठेवावे. जनावरांना भरपूर शुद्ध पाणी द्यावे.'
              : 'To naturally optimize milk fat & SNF, balance the ration with high-quality bypass fat, 50g daily mineral mixture, dry roughage (kadba/straw), and green fodder. Ensure ad-libitum clean drinking water.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full h-[600px] max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  {language === 'mr' ? 'AI डेअरी बुद्धिमत्ता सहाय्यक' : 'AI Dairy Intelligence Copilot'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {language === 'mr' ? 'मराठी व इंग्रजीत २४/७ डेअरी तज्ज्ञ सल्लागार' : 'Expert milk procurement & dairy cattle advisory'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="font-bold text-slate-500 whitespace-nowrap">💡 {language === 'mr' ? 'सल्ले:' : 'Quick:'}</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl space-y-1 relative group ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                  <span>{m.time}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(m.text, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-emerald-500 cursor-pointer flex items-center gap-1"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
              <span>AI सहाय्यक विचार करत आहे...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={
              language === 'mr'
                ? 'AI सहाय्यकाला कोणताही प्रश्न विचारा (उदा. म्हशीचे दूध उत्पादन कसे वाढवावे)...'
                : 'Ask AI anything about dairy operations, feed, rates...'
            }
            className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
