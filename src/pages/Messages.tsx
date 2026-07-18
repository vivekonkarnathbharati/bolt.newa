import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types & mock data (self-contained — no external deps)             */
/* ------------------------------------------------------------------ */

type Profile = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
};

type Message = { id: string; senderId: string; text: string; time: string };

type Thread = { id: string; profile: Profile; messages: Message[]; unread: number };

const PROFILES: Profile[] = [
  { id: 'u1', name: 'Maya Chen', handle: 'maya_chen', avatar: 'maya', online: true, lastSeen: 'active now' },
  { id: 'u2', name: 'Jordan Lee', handle: 'jordan_lee', avatar: 'jordan', online: true, lastSeen: 'active now' },
  { id: 'u3', name: 'Alex Rivera', handle: 'alex_rivera', avatar: 'alex', online: false, lastSeen: '2h ago' },
  { id: 'u4', name: 'Priya Sharma', handle: 'priya_s', avatar: 'priya', online: true, lastSeen: 'active now' },
  { id: 'u5', name: 'Sam Okonkwo', handle: 'sam_o', avatar: 'sam', online: false, lastSeen: '1d ago' },
  { id: 'u6', name: 'Lena Fischer', handle: 'lena_f', avatar: 'lena', online: false, lastSeen: '3d ago' },
];

const NOW = Date.now();
const min = (n: number) => new Date(NOW - n * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INITIAL_THREADS: Thread[] = [
  {
    id: 't1', profile: PROFILES[0], unread: 2,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! Did you see the new design tokens? 🎨', time: min(30) },
      { id: 'm2', senderId: 'me', text: 'Just opened them — the cyan accents are fire', time: min(22) },
      { id: 'm3', senderId: 'u1', text: 'Right? Let me know what you think of the spacing scale.', time: min(10) },
      { id: 'm4', senderId: 'u1', text: 'I pushed a v2 if you want to pull', time: min(8) },
    ],
  },
  {
    id: 't2', profile: PROFILES[1], unread: 0,
    messages: [
      { id: 'm5', senderId: 'u2', text: 'Sending over the golden hour shots now 📷', time: min(180) },
      { id: 'm6', senderId: 'me', text: 'Cant wait, the lighting looked insane yesterday', time: min(175) },
    ],
  },
  {
    id: 't3', profile: PROFILES[2], unread: 1,
    messages: [{ id: 'm7', senderId: 'u3', text: 'Coffee tomorrow morning? ☕️', time: min(400) }],
  },
  {
    id: 't4', profile: PROFILES[3], unread: 0,
    messages: [
      { id: 'm8', senderId: 'me', text: 'Loved your latest reel!', time: min(600) },
      { id: 'm9', senderId: 'u4', text: 'thank you!! means a lot 🤍', time: min(595) },
    ],
  },
  {
    id: 't5', profile: PROFILES[4], unread: 0,
    messages: [{ id: 'm10', senderId: 'u5', text: 'see you at the trailhead at 6am?', time: min(1440) }],
  },
  {
    id: 't6', profile: PROFILES[5], unread: 0,
    messages: [{ id: 'm11', senderId: 'u6', text: 'the translation review is done ✅', time: min(4320) }],
  },
];

const ME_ID = 'me';

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG — zero dependencies)                            */
/* ------------------------------------------------------------------ */

const Icon = {
  Send: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></svg>
  ),
  Search: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  Back: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="m15 18-6-6 6-6" /></svg>
  ),
  Phone: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>
  ),
  Video: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
  ),
  Info: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
  ),
  Smile: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
  ),
  Plus: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  ),
  Heart: (p: { size?: number; className?: string }) => (
    <svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Avatar — gradient circle with online dot                          */
/* ------------------------------------------------------------------ */

const GRADIENTS: Record<string, string> = {
  maya: 'from-fuchsia-500 to-cyan-400',
  jordan: 'from-amber-400 to-rose-500',
  alex: 'from-cyan-400 to-indigo-500',
  priya: 'from-emerald-400 to-teal-500',
  sam: 'from-orange-400 to-pink-500',
  lena: 'from-violet-400 to-blue-500',
};

function Avatar({ profile, size = 48, ring = false }: { profile: Profile; size?: number; ring?: boolean }) {
  const grad = GRADIENTS[profile.avatar] ?? 'from-cyan-400 to-indigo-500';
  const initials = profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className={`w-full h-full rounded-full bg-gradient-to-br ${grad} flex items-center justify-center font-bold text-white ${ring ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-950' : ''}`} style={{ fontSize: size * 0.36 }}>
        {initials}
      </div>
      {profile.online && (
        <span className="absolute bottom-0 right-0 rounded-full bg-emerald-400 border-2 border-slate-950" style={{ width: size * 0.28, height: size * 0.28 }} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeId, setActiveId] = useState<string>(INITIAL_THREADS[0].id);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeThread = threads.find((t) => t.id === activeId)!;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [activeThread.messages.length, activeId]);

  const scheduleReply = (threadId: string, profile: Profile) => {
    setTyping(true);
    const replies = ['haha totally 😄', 'love that idea!', 'let me think about it and get back to you', 'omg yes 🔥', 'sounds good to me', "wait that's actually genius", 'can we do tomorrow instead?'];
    const pick = replies[Math.floor(Math.random() * replies.length)];
    window.setTimeout(() => {
      setTyping(false);
      setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, messages: [...t.messages, { id: `r${Date.now()}`, senderId: profile.id, text: pick, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] } : t));
    }, 1400 + Math.random() * 800);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const msg: Message = { id: `m${Date.now()}`, senderId: ME_ID, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setThreads((prev) => prev.map((t) => (t.id === activeId ? { ...t, messages: [...t.messages, msg], unread: 0 } : t)));
    setDraft('');
    inputRef.current?.focus();
    scheduleReply(activeId, activeThread.profile);
  };

  const filtered = query ? threads.filter((t) => t.profile.name.toLowerCase().includes(query.toLowerCase()) || t.profile.handle.toLowerCase().includes(query.toLowerCase())) : threads;
  const lastMessage = (t: Thread) => t.messages[t.messages.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left: thread list */}
      <aside className={`flex flex-col border-r border-white/10 bg-slate-900/40 backdrop-blur-xl ${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] lg:w-[380px] shrink-0`}>
        <div className="px-5 pt-6 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-tight">Messages <span className="ml-2 text-sm font-normal text-slate-500">{threads.length}</span></h1>
            <button className="p-2 rounded-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition"><Icon.Plus size={20} /></button>
          </div>
          <div className="relative">
            <Icon.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations…" className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
          {filtered.map((t) => {
            const active = t.id === activeId;
            const last = lastMessage(t);
            return (
              <button key={t.id} onClick={() => { setActiveId(t.id); setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, unread: 0 } : x))); }} className={`group w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left ${active ? 'bg-cyan-500/10 ring-1 ring-cyan-400/30' : 'hover:bg-white/5'}`}>
                <Avatar profile={t.profile} size={52} ring={active} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-semibold truncate ${active ? 'text-cyan-300' : 'text-slate-100'}`}>{t.profile.name}</p>
                    <span className="text-[11px] text-slate-500 shrink-0">{last?.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-sm text-slate-400 truncate">{last?.senderId === ME_ID && <span className="text-slate-500">You: </span>}{last?.text}</p>
                    {t.unread > 0 && <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-bold flex items-center justify-center">{t.unread}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-sm text-slate-500 py-12">No conversations found.</p>}
        </div>
      </aside>

      {/* Right: chat thread view */}
      <main className={`flex-1 flex flex-col min-w-0 ${activeId ? 'flex' : 'hidden md:flex'}`}>
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10 glass">
          <button onClick={() => setActiveId('')} className="md:hidden p-1.5 rounded-full hover:bg-white/10 transition text-slate-300"><Icon.Back size={20} /></button>
          <Avatar profile={activeThread.profile} size={44} ring />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{activeThread.profile.name}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              {activeThread.profile.online ? (<><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{activeThread.profile.lastSeen}</>) : <span className="text-slate-500">last seen {activeThread.profile.lastSeen}</span>}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2.5 rounded-full hover:bg-white/10 transition text-slate-300 hover:text-cyan-400"><Icon.Phone /></button>
            <button className="p-2.5 rounded-full hover:bg-white/10 transition text-slate-300 hover:text-cyan-400"><Icon.Video /></button>
            <button className="p-2.5 rounded-full hover:bg-white/10 transition text-slate-300 hover:text-cyan-400"><Icon.Info /></button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-2">
          <div className="flex items-center justify-center mb-4">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 bg-white/5 px-3 py-1 rounded-full">Today</span>
          </div>
          {activeThread.messages.map((m, i) => {
            const mine = m.senderId === ME_ID;
            const prev = activeThread.messages[i - 1];
            const grouped = prev && prev.senderId === m.senderId;
            return (
              <div key={m.id} className={`flex items-end gap-2 animate-msg-in ${mine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                {!mine && <div className={`transition-opacity ${grouped ? 'opacity-0' : 'opacity-100'}`}><Avatar profile={activeThread.profile} size={28} /></div>}
                <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 text-[15px] leading-relaxed break-words ${mine ? 'bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 font-medium rounded-2xl rounded-br-md shadow-lg shadow-cyan-500/20' : 'bg-white/8 text-slate-100 rounded-2xl rounded-bl-md border border-white/5'}`}>
                    {m.text}
                  </div>
                  <span className={`text-[10px] text-slate-500 mt-1 px-1 ${mine ? 'text-right' : ''}`}>{m.time}</span>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex items-end gap-2 mt-3 animate-msg-in">
              <Avatar profile={activeThread.profile} size={28} />
              <div className="bg-white/8 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce-dot" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce-dot" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 md:px-8 py-4 border-t border-white/10 glass">
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full hover:bg-white/10 transition text-slate-400 hover:text-cyan-400 shrink-0"><Icon.Plus /></button>
            <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition">
              <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Message…" className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-slate-500" />
              <button className="p-2 rounded-full hover:bg-white/10 transition text-slate-400 hover:text-amber-400 shrink-0"><Icon.Smile /></button>
              <button className="p-2 rounded-full hover:bg-white/10 transition text-slate-400 hover:text-rose-400 shrink-0"><Icon.Heart /></button>
            </div>
            <button onClick={send} disabled={!draft.trim()} className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-30 disabled:scale-100 disabled:shadow-none" aria-label="Send message">
              <Icon.Send size={20} />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .glass { background: rgba(15, 23, 42, 0.55); backdrop-filter: saturate(180%) blur(16px); -webkit-backdrop-filter: saturate(180%) blur(16px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-msg-in { animation: msgIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes bounceDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-5px); opacity: 1; } }
        .animate-bounce-dot { animation: bounceDot 1s infinite ease-in-out; }
      `}</style>
    </div>
  );
}

export default MessagesPage;
